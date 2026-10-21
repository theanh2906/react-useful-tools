export const APP_THEMES = [
  {
    id: 'midnight-indigo', name: 'Midnight Indigo', mode: 'dark',
    colors: { background: '#101218', surface: '#151820', elevated: '#1b1e27', chrome: '#151820', overlay: '#20232d', inset: '#14171e', foreground: '#e7e9ef', muted: '#a0a6b3', border: '#2d313d', primary: '#6366df', accent: '#b5b9f7' },
  },
  {
    id: 'graphite-teal', name: 'Graphite Teal', mode: 'dark',
    colors: { background: '#131616', surface: '#181c1c', elevated: '#202525', chrome: '#181c1c', overlay: '#242a2a', inset: '#171b1b', foreground: '#e6e9e8', muted: '#9fa9a6', border: '#323939', primary: '#257b70', accent: '#8fcabd' },
  },
  {
    id: 'cloud-blue', name: 'Cloud Blue', mode: 'light',
    colors: { background: '#ffffff', surface: '#f4f8ff', elevated: '#ffffff', chrome: '#ffffff', overlay: '#ffffff', inset: '#ffffff', foreground: '#172033', muted: '#667085', border: '#dce6f2', primary: '#ff5a52', accent: '#1768e5' },
  },
  {
    id: 'warm-sand', name: 'Warm Sand', mode: 'light',
    colors: { background: '#faf7f2', surface: '#f2eae0', elevated: '#fffdf9', chrome: '#fffdf9', overlay: '#fffdf9', inset: '#fffdf9', foreground: '#332b25', muted: '#786859', border: '#e4d8c8', primary: '#b45309', accent: '#9a5b27' },
  },
] as const;

export type ThemeId = typeof APP_THEMES[number]['id'];
export type ThemePreference = ThemeId | 'light' | 'dark' | 'system';

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system'
    || APP_THEMES.some((theme) => theme.id === value);
}

/** Keep settings exported by earlier versions compatible with the new palettes. */
export function resolveThemeId(theme: ThemePreference, prefersDark = false): ThemeId {
  if (theme === 'dark' || (theme === 'system' && prefersDark)) return 'midnight-indigo';
  return APP_THEMES.find((option) => option.id === theme)?.id ?? 'cloud-blue';
}

export function applyTheme(theme: ThemePreference) {
  const id = resolveThemeId(theme, window.matchMedia('(prefers-color-scheme: dark)').matches);
  const palette = APP_THEMES.find((option) => option.id === id)!;
  document.documentElement.dataset.theme = id;
  document.documentElement.classList.toggle('dark', palette.mode === 'dark');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', palette.colors.background);
}

/** Runs before the body paints; only static palette IDs are written to the DOM. */
export const THEME_BOOTSTRAP_SCRIPT = `(() => {
  let theme = 'light';
  try {
    const saved = JSON.parse(localStorage.getItem('app-storage') || 'null');
    if (saved?.version >= 2) theme = saved.state?.theme || 'light';
  } catch {}
  const palettes = ${JSON.stringify(APP_THEMES.map(({ id, mode }) => ({ id, mode })))};
  if (theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)) theme = 'midnight-indigo';
  const palette = palettes.find((option) => option.id === theme) || palettes.find((option) => option.id === 'cloud-blue');
  document.documentElement.dataset.theme = palette.id;
  document.documentElement.classList.toggle('dark', palette.mode === 'dark');
})();`;
