const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const OUTPUT_DIR = process.env.THEME_SCREENSHOT_DIR || path.resolve(__dirname, '../artifacts/themes');
const themes = [
  { id: 'midnight-indigo', name: 'Midnight Indigo', background: 'rgb(16, 18, 24)', dark: true },
  { id: 'graphite-teal', name: 'Graphite Teal', background: 'rgb(19, 22, 22)', dark: true },
  { id: 'cloud-blue', name: 'Cloud Blue', background: 'rgb(255, 255, 255)', dark: false },
  { id: 'warm-sand', name: 'Warm Sand', background: 'rgb(250, 247, 242)', dark: false },
];

async function isolatedContext(browser, options = {}) {
  const context = await browser.newContext({ locale: 'en-US', ...options });
  // Never read or write live application data during UI verification.
  await context.route('**/*', (route) => {
    const hostname = new URL(route.request().url()).hostname;
    const backend = hostname.endsWith('.firebaseio.com')
      || hostname.endsWith('.firebasedatabase.app')
      || hostname === 'identitytoolkit.googleapis.com'
      || hostname === 'securetoken.googleapis.com';
    return backend ? route.abort() : route.continue();
  });
  await context.routeWebSocket(/firebaseio\.com|firebasedatabase\.app/, (socket) => socket.close());
  return context;
}

function captureErrors(page) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && /hydration|hydrated|server rendered/i.test(message.text())) {
      errors.push(message.text());
    }
  });
  return errors;
}

const trigger = (page) => page.getByRole('button', { name: /^(Choose theme|Chọn giao diện)$/ });
const dialog = (page) => page.getByRole('dialog', { name: /^(Theme|Chủ đề)$/ });

async function openPicker(page) {
  await trigger(page).waitFor({ state: 'visible' });
  for (let attempt = 0; attempt < 3; attempt++) {
    await trigger(page).click();
    try {
      await dialog(page).waitFor({ state: 'visible', timeout: 3000 });
      return;
    } catch (error) {
      if (attempt === 2) throw error;
    }
  }
}

async function assertTheme(page, theme) {
  await page.waitForFunction(({ id, background, dark }) => {
    return document.documentElement.dataset.theme === id
      && document.documentElement.classList.contains('dark') === dark
      && getComputedStyle(document.body).backgroundColor === background;
  }, theme);
}

async function assertGeometry(page) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'horizontal overflow');
  const bounds = await dialog(page).boundingBox();
  const viewport = page.viewportSize();
  assert.ok(bounds && bounds.x >= 0 && bounds.y >= 0
    && bounds.x + bounds.width <= viewport.width + 1
    && bounds.y + bounds.height <= viewport.height + 1, 'theme popover fits viewport');
}

async function assertDarkPaletteHierarchy(page, choice) {
  const colors = await page.evaluate(() => {
    const input = document.querySelector('main textarea');
    const card = input.closest('.shadow-glass');
    const optionLabel = [...document.querySelectorAll('main button')]
      .find((element) => element.textContent.trim().startsWith('UPPERCASE'))?.querySelector('div');
    const background = (element) => getComputedStyle(element).backgroundColor;
    return {
      canvas: background(document.body),
      chrome: background(document.querySelector('header')),
      card: background(card),
      input: background(input),
      overlay: background(document.querySelector('[role="dialog"]')),
      muted: getComputedStyle(document.querySelector('main .text-muted')).color,
      label: getComputedStyle(optionLabel).color,
    };
  });
  const rgb = (value) => value.match(/[\d.]+/g).slice(0, 3).map(Number);
  const brightness = (value) => rgb(value).reduce((sum, channel) => sum + channel, 0);
  assert.notDeepEqual(rgb(colors.canvas), rgb(colors.chrome), 'canvas and app chrome are distinct');
  assert.notDeepEqual(rgb(colors.chrome), rgb(colors.card), 'chrome and raised cards are distinct');
  assert.ok(brightness(colors.input) < brightness(colors.card), `input is inset below its card: input=${colors.input}, card=${colors.card}`);
  assert.ok(brightness(colors.overlay) > brightness(colors.card), `popover is raised above cards: overlay=${colors.overlay}, card=${colors.card}`);
  for (const key of ['muted', 'label']) {
    const channels = rgb(colors[key]);
    assert.ok(Math.max(...channels) - Math.min(...channels) <= 22, `${key} text remains neutral`);
  }
  const previewBackground = await choice.locator('span[aria-hidden="true"]').first()
    .evaluate((element) => getComputedStyle(element).backgroundColor);
  assert.equal(previewBackground, colors.canvas, 'theme preview agrees with applied canvas');
}

async function screenshotSettled(page, filename) {
  await page.evaluate(() => window.scrollTo(0, 0));
  // Framer Motion uses JavaScript-driven staggered entrance animations.
  await page.waitForTimeout(1800);
  await page.screenshot({ path: path.join(OUTPUT_DIR, filename), fullPage: true });
}

async function verifyPaletteFlow(browser, width) {
  const context = await isolatedContext(browser, { viewport: { width, height: width < 500 ? 844 : 1000 } });
  const page = await context.newPage();
  const errors = captureErrors(page);
  try {
    await page.goto(`${BASE_URL}/change-case`);
    const input = page.getByPlaceholder('Enter or paste your text here...');
    await input.fill('Theme verification');
    for (const theme of themes) {
      await input.fill('Theme verification');
      await openPicker(page);
      const choice = dialog(page).getByRole('radio', { name: new RegExp(theme.name) });
      await choice.click();
      await assertTheme(page, theme);
      assert.equal(await choice.getAttribute('aria-checked'), 'true');
      assert.equal(await dialog(page).isVisible(), true, 'picker stays open after selection');
      assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('app-storage')).state.theme), theme.id);
      await assertGeometry(page);
      await screenshotSettled(page, `${theme.id}-${width}.png`);
      if (theme.dark) await assertDarkPaletteHierarchy(page, choice);
      await page.keyboard.press('Escape');
      if (theme.dark && width >= 1000) {
        const uppercase = page.getByRole('button', { name: /^UPPERCASE/ });
        await uppercase.click();
        await uppercase.hover();
        await screenshotSettled(page, `${theme.id}-selected-${width}.png`);
      }
      await page.reload();
      await trigger(page).waitFor();
      await assertTheme(page, theme);
      await openPicker(page);
      assert.equal(await dialog(page).getByRole('radio', { checked: true }).textContent().then((value) => value.includes(theme.name)), true);
      await page.keyboard.press('Escape');
      console.log(`PASS ${width}px ${theme.id}: colors, selection, persistence, bounds${theme.dark ? ', surface hierarchy, neutral text, preview' : ''}`);
    }

    await openPicker(page);
    await page.keyboard.press('Home');
    await assertTheme(page, themes[0]);
    await page.keyboard.press('ArrowRight');
    await assertTheme(page, themes[1]);
    await page.keyboard.press('ArrowLeft');
    await assertTheme(page, themes[0]);
    await page.keyboard.press('End');
    await assertTheme(page, themes[3]);
    await page.keyboard.press('Escape');
    assert.equal(await dialog(page).count(), 0);
    assert.equal(await trigger(page).evaluate((element) => element === document.activeElement), true);
    await openPicker(page);
    await page.keyboard.press('Tab');
    await dialog(page).waitFor({ state: 'detached' });
    await openPicker(page);
    await page.keyboard.press('Shift+Tab');
    await dialog(page).waitFor({ state: 'detached' });
    await openPicker(page);
    // The mobile popover legitimately covers the heading; click its clear outer gutter.
    await page.mouse.click(8, 100);
    await dialog(page).waitFor({ state: 'detached' });

    await input.fill('Theme verification');
    await page.getByRole('button', { name: /^UPPERCASE/ }).click();
    assert.ok(await page.locator('main').textContent().then((text) => text.includes('THEME VERIFICATION')), 'text conversion still works');
    const legacySearch = page.locator('input[aria-label="Search tools"]');
    if (await legacySearch.count()) {
      // The production toolbar and the in-progress global search use different controls.
      if (width >= 768) {
        await page.keyboard.press('Control+k');
        assert.equal(await legacySearch.evaluate((element) => element === document.activeElement), true);
        await page.keyboard.press('Escape');
      }
    } else {
      await page.keyboard.press('Control+k');
      await page.getByRole('combobox').waitFor();
      await page.keyboard.press('Escape');
      await page.getByRole('combobox').waitFor({ state: 'detached' });
    }
    await page.goto(`${BASE_URL}/auth`);
    await assertTheme(page, themes[3]);
    await page.reload();
    await assertTheme(page, themes[3]);
    assert.deepEqual(errors, [], `runtime/hydration errors at ${width}px`);
    console.log(`PASS ${width}px: all 4 palettes, computed colors, selected state, reload, keyboard, Escape/focus, Tab/outside dismissal, bounds, conversion, auth route`);
  } catch (error) {
    await page.screenshot({ path: path.join(OUTPUT_DIR, `failure-${width}.png`), fullPage: true }).catch(() => {});
    throw error;
  } finally {
    await context.close();
  }
}

async function verifyLegacyPreferences(browser) {
  for (const [preference, expected, colorScheme] of [
    ['light', themes[2], 'dark'],
    ['dark', themes[0], 'light'],
    ['system', themes[0], 'dark'],
    ['invalid-theme', themes[2], 'light'],
  ]) {
    const context = await isolatedContext(browser, { colorScheme });
    const page = await context.newPage();
    const errors = captureErrors(page);
    try {
      await page.addInitScript((theme) => {
        localStorage.setItem('app-storage', JSON.stringify({ version: 2, state: { theme } }));
      }, preference);
      await page.goto(`${BASE_URL}/change-case`);
      await trigger(page).waitFor();
      await assertTheme(page, expected);
      if (preference === 'system') {
        await page.emulateMedia({ colorScheme: 'light' });
        await assertTheme(page, themes[2]);
        await page.emulateMedia({ colorScheme: 'dark' });
        await assertTheme(page, themes[0]);
      }
      assert.deepEqual(errors, []);
    } finally {
      await context.close();
    }
  }
  console.log('PASS legacy light/dark/system, live OS preference changes, invalid stored preference fallback');
}

async function verifySettingsFixture(browser) {
  const context = await isolatedContext(browser, { viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const errors = captureErrors(page);
  try {
    // Local UI fixture only; no real account or credentials are used.
    await page.addInitScript(() => {
      localStorage.setItem('auth-storage', JSON.stringify({ version: 0, state: {
        isAuthenticated: true,
        isInitialized: true,
        isLoading: false,
        user: { id: 'theme-ui-fixture', displayName: 'Theme preview', role: 'Administrator', tokenExpirationIn: Date.now() + 3600000 },
      } }));
    });
    await page.goto(`${BASE_URL}/settings`);
    const options = page.locator('main').getByRole('radiogroup');
    await options.waitFor({ timeout: 30000 });
    await page.waitForTimeout(1800);
    const hiddenBlockers = await page.locator('.fixed.inset-0').evaluateAll((elements) => elements
      .filter((element) => getComputedStyle(element).opacity === '0' && getComputedStyle(element).pointerEvents !== 'none')
      .map((element) => ({ opacity: getComputedStyle(element).opacity, text: element.textContent })));
    assert.deepEqual(hiddenBlockers, [], 'invisible loading overlay must not intercept settings controls');
    await options.getByRole('radio', { name: /Graphite Teal/ }).click();
    await assertTheme(page, themes[1]);
    await screenshotSettled(page, 'settings-graphite-teal-1440.png');
    await openPicker(page);
    assert.equal(await dialog(page).getByRole('radio', { name: /Graphite Teal/ }).getAttribute('aria-checked'), 'true');
    await dialog(page).getByRole('radio', { name: /Warm Sand/ }).click();
    assert.equal(await options.getByRole('radio', { name: /Warm Sand/ }).getAttribute('aria-checked'), 'true');
    await page.keyboard.press('Escape');
    await screenshotSettled(page, 'settings-warm-sand-1440.png');

    const secondPage = await context.newPage();
    const secondPageErrors = captureErrors(secondPage);
    await secondPage.goto(`${BASE_URL}/settings`);
    await secondPage.locator('main').getByRole('radiogroup').waitFor();
    await openPicker(page);
    await dialog(page).getByRole('radio', { name: /Midnight Indigo/ }).click();
    await assertTheme(secondPage, themes[0]);
    await secondPage.getByRole('button', { name: 'English', exact: true }).click();
    assert.equal(await secondPage.evaluate(() => JSON.parse(localStorage.getItem('settings-storage')).state.settings.theme), themes[0].id, 'language update keeps cross-tab theme current');
    await assertTheme(secondPage, themes[0]);
    const downloadPromise = secondPage.waitForEvent('download');
    await secondPage.getByRole('button', { name: /Export JSON|Xuất JSON/ }).click();
    const download = await downloadPromise;
    const exportedSettings = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
    assert.equal(exportedSettings.theme, themes[0].id, 'export uses current cross-tab theme');
    assert.deepEqual(secondPageErrors, []);
    await secondPage.close();
    await page.keyboard.press('Escape');

    await page.evaluate(() => {
      window.__themeOriginalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function () { throw new DOMException('Storage blocked for theme test', 'QuotaExceededError'); };
    });
    await openPicker(page);
    const choice = dialog(page).getByRole('radio', { name: /Graphite Teal/ });
    await choice.click();
    await assertTheme(page, themes[1]);
    assert.equal(await choice.getAttribute('aria-checked'), 'true');
    await page.getByText(/could not|couldn.t|chưa thể/i).first().waitFor();
    await page.evaluate(() => { Storage.prototype.setItem = window.__themeOriginalSetItem; });
    assert.deepEqual(errors, []);
    console.log('PASS Settings/header synchronized, cross-tab theme survives language update, blocked storage applies theme with toast (local admin UI fixture, backend blocked)');
  } finally {
    await context.close();
  }
}

(async () => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const scope = process.env.THEME_TEST_SCOPE || 'all';
    assert.ok(['all', 'palette', 'compatibility', 'settings'].includes(scope), 'valid THEME_TEST_SCOPE');
    if (scope === 'all' || scope === 'palette') {
      await verifyPaletteFlow(browser, 1440);
      await verifyPaletteFlow(browser, 390);
    }
    if (scope === 'all' || scope === 'compatibility') await verifyLegacyPreferences(browser);
    if (scope === 'all' || scope === 'settings') await verifySettingsFixture(browser);
    console.log(`Screenshots: ${OUTPUT_DIR}`);
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
