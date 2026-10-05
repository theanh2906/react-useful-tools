import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { gunzipSync } from 'node:zlib';
import ts from 'typescript';

// Transpile the two dependency-free modules with the project's TypeScript,
// so these tests also run on the README's supported Node 18+ runtimes.
async function loadTypeScript(relativePath) {
  const sourceUrl = new URL(relativePath, import.meta.url);
  let source = await readFile(sourceUrl, 'utf8');
  // Resolve the reference's small static JSON modules without a runtime test dependency.
  for (const match of [
    ...source.matchAll(/^import (\w+) from '([^']+\.json)';$/gm),
  ]) {
    const json = JSON.parse(
      await readFile(new URL(match[2], sourceUrl), 'utf8')
    );
    source = source.replace(
      match[0],
      `const ${match[1]} = ${JSON.stringify(json)};`
    );
  }
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2020,
    },
  });
  return import(
    `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
  );
}
const { cheatsheets } = await loadTypeScript('../src/data/cheatsheets.ts');
const {
  CHEATSHEET_PREVIEW_SIZE,
  filterCheatsheetGroups,
  normalizeCheatsheetQuery,
  previewCheatsheetGroups,
} = await loadTypeScript('../src/lib/cheatsheets.ts');

test('all three references have unique groups, commands, examples, and official sources', () => {
  assert.deepEqual(cheatsheets.map((sheet) => sheet.id).sort(), [
    'gh',
    'git',
    'twg',
  ]);
  const commandIds = new Set();
  for (const sheet of cheatsheets) {
    assert.ok(sheet.groups.length > 0);
    assert.equal(
      new Set(sheet.groups.map((group) => group.id)).size,
      sheet.groups.length
    );
    assert.match(sheet.verifiedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(sheet.sources.length > 0);
    for (const group of sheet.groups) {
      assert.ok(group.commands.length > 0);
      for (const command of group.commands) {
        assert.ok(
          !commandIds.has(command.id),
          `Duplicate command: ${command.id}`
        );
        commandIds.add(command.id);
        for (const key of [
          'title',
          'command',
          'description',
          'example',
          'sourceUrl',
        ]) {
          assert.ok(
            command[key].trim().length > 0,
            `${command.id}: missing ${key}`
          );
        }
        assert.ok(['read', 'write', 'destructive'].includes(command.risk));
        if (command.risk === 'destructive')
          assert.ok(command.warning?.length > 0);
        assert.equal(new URL(command.sourceUrl).protocol, 'https:');
        if (command.canonicalCommand)
          assert.ok(command.canonicalCommand.trim());
        if (command.status)
          assert.ok(['preview', 'deprecated'].includes(command.status));
        for (const option of command.options ?? []) {
          assert.ok(option.flag.trim());
          assert.ok(option.description.trim());
        }
      }
    }
  }
});

test('Vietnamese search normalizes accents, case, and whitespace', () => {
  assert.equal(normalizeCheatsheetQuery('  ĐĂNG NHẬP  '), 'dang nhap');
  const gh = cheatsheets.find((sheet) => sheet.id === 'gh');
  const results = filterCheatsheetGroups(gh.groups, 'dang nhap');
  assert.ok(
    results.some((group) =>
      group.commands.some((command) => command.id === 'gh-auth-login')
    )
  );
});

test('search matches example flags and requires all query words', () => {
  const gh = cheatsheets.find((sheet) => sheet.id === 'gh');
  const results = filterCheatsheetGroups(gh.groups, 'gh --web');
  assert.ok(results.length > 0);
  assert.ok(
    results
      .flatMap((group) => group.commands)
      .every((command) =>
        normalizeCheatsheetQuery(
          [
            command.title,
            command.command,
            command.description,
            command.example,
            ...command.tags,
            ...(command.options ?? []).flatMap((option) => [
              option.flag,
              option.description,
              option.example ?? '',
            ]),
          ].join(' ')
        ).includes('--web')
      )
  );
  assert.deepEqual(
    filterCheatsheetGroups(gh.groups, 'gh impossible-keyword-92837'),
    []
  );
});

test('category and query compose without modifying source data', () => {
  const sheet = cheatsheets[0];
  const before = JSON.stringify(sheet);
  const group = sheet.groups[0];
  const all = filterCheatsheetGroups(sheet.groups, '');
  assert.equal(all.length, sheet.groups.length);
  const filtered = filterCheatsheetGroups(sheet.groups, '', group.id);
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, group.id);
  assert.deepEqual(
    filterCheatsheetGroups(sheet.groups, '', 'not-a-category'),
    []
  );
  assert.equal(JSON.stringify(sheet), before);
});

test('TWG enriched commands disclose billing implications', () => {
  const twg = cheatsheets.find((sheet) => sheet.id === 'twg');
  assert.ok(twg.billingNote);
  assert.ok(
    twg.groups
      .flatMap((group) => group.commands)
      .some((command) => command.billingNote)
  );
});

test('overview includes every topic with at most four entries and preserves source data', () => {
  assert.equal(CHEATSHEET_PREVIEW_SIZE, 4);
  for (const sheet of cheatsheets) {
    const before = JSON.stringify(sheet);
    const previews = previewCheatsheetGroups(sheet.groups);
    assert.deepEqual(
      previews.map((group) => group.id),
      sheet.groups.map((group) => group.id)
    );
    previews.forEach((preview, index) => {
      const original = sheet.groups[index];
      assert.equal(
        preview.commands.length,
        Math.min(CHEATSHEET_PREVIEW_SIZE, original.commands.length)
      );
      assert.deepEqual(preview.commands, original.commands.slice(0, 4));
      assert.equal(preview.level, original.level);
      assert.notEqual(preview.commands, original.commands);
    });
    assert.equal(JSON.stringify(sheet), before);
  }
  assert.deepEqual(previewCheatsheetGroups([]), []);
});

test('opening a preview topic and searching reveal commands outside the preview', () => {
  for (const sheet of cheatsheets) {
    const group = sheet.groups.find((item) => item.commands.length > 4);
    assert.ok(group, `${sheet.id}: fixture needs a nontrivial topic`);
    const hidden = group.commands.at(-1);
    const previews = previewCheatsheetGroups(sheet.groups);
    assert.ok(!previews.flatMap((item) => item.commands).includes(hidden));
    const selected = filterCheatsheetGroups(sheet.groups, '', group.id);
    assert.equal(selected.length, 1);
    assert.deepEqual(selected[0].commands, group.commands);
    const search = filterCheatsheetGroups(sheet.groups, hidden.command);
    assert.ok(search.flatMap((item) => item.commands).includes(hidden));
  }
});

test('pagination preserves grouping and searches still cover off-page entries', async () => {
  const { CHEATSHEET_PAGE_SIZE, paginateCheatsheetGroups } =
    await loadTypeScript('../src/lib/cheatsheets.ts');
  const groups = Array.from({ length: 3 }, (_, groupIndex) => ({
    id: `fixture-${groupIndex}`,
    title: `Fixture ${groupIndex}`,
    level: groupIndex === 2 ? 'plumbing' : 'core',
    commands: Array.from({ length: 40 }, (_, index) => ({
      id: `fixture-${groupIndex}-${index}`,
      title: `Command ${groupIndex}-${index}`,
      command: `tool action-${groupIndex}-${index}`,
      example: `tool action-${groupIndex}-${index} --value example`,
      description: 'A test command',
      risk: 'read',
      tags: ['fixture'],
      sourceUrl: 'https://example.com/',
      options: [
        { flag: '--advanced-filter', description: 'Unique searchable option' },
      ],
    })),
  }));
  const before = JSON.stringify(groups);
  const count = (items) =>
    items.reduce((sum, group) => sum + group.commands.length, 0);
  const first = paginateCheatsheetGroups(groups, 1);
  const second = paginateCheatsheetGroups(groups, 2);
  const third = paginateCheatsheetGroups(groups, 3);
  assert.equal(count(first), CHEATSHEET_PAGE_SIZE);
  assert.equal(first[1].commands.length, 8);
  assert.equal(second[0].commands[0].id, 'fixture-1-8');
  assert.equal(count(second), CHEATSHEET_PAGE_SIZE);
  assert.equal(count(third), 24);
  assert.equal(third[0].level, 'plumbing');
  assert.equal(
    new Set(
      [...first, ...second, ...third].flatMap((group) =>
        group.commands.map((command) => command.id)
      )
    ).size,
    120
  );
  assert.equal(count(filterCheatsheetGroups(groups, 'action-2-39')), 1);
  assert.equal(count(filterCheatsheetGroups(groups, '--advanced-filter')), 120);
  assert.deepEqual(paginateCheatsheetGroups(groups, 4), []);
  assert.deepEqual(paginateCheatsheetGroups(groups, 1, 0), []);
  assert.deepEqual(paginateCheatsheetGroups(groups, 0), first);
  assert.equal(JSON.stringify(groups), before);
});

test('declared coverage exactly matches pinned inventories, independently of recipe counts', async () => {
  const manifest = JSON.parse(
    await readFile(
      new URL('../docs/cheatsheets-coverage.json', import.meta.url),
      'utf8'
    )
  );
  assert.equal(manifest.schemaVersion, 1);
  assert.deepEqual(manifest.tools.map((tool) => tool.id).sort(), [
    'gh',
    'git',
    'twg',
  ]);
  for (const reference of manifest.tools) {
    const sheet = cheatsheets.find((tool) => tool.id === reference.id);
    const entries = sheet.groups.flatMap((group) => group.commands);
    const actual = [
      ...new Set(entries.map((command) => command.canonicalCommand)),
    ].sort();
    assert.ok(
      actual.every(
        (command) => typeof command === 'string' && command.length > 0
      )
    );
    const expected = [...reference.canonicalCommands].sort();
    assert.equal(
      new Set(expected).size,
      expected.length,
      `${sheet.id}: duplicate inventory entry`
    );
    assert.deepEqual(
      actual,
      expected,
      `${sheet.id}: missing or unexplained canonical command`
    );
    assert.equal(sheet.coverage.totalCommands, expected.length);
    assert.equal(sheet.coverage.coveredCommands, actual.length);
    assert.equal(reference.displayEntries, entries.length);
    assert.equal(sheet.coverage.inventoryVersion, reference.inventoryVersion);
    assert.equal(new URL(reference.referenceUrl).protocol, 'https:');
    const sourceBytes = await readFile(
      new URL(`../docs/${reference.sourceManifest}`, import.meta.url)
    );
    const sourceManifest = JSON.parse(
      (reference.sourceManifest.endsWith('.gz')
        ? gunzipSync(sourceBytes)
        : sourceBytes
      ).toString('utf8')
    );
    assert.equal(sourceManifest.tool, reference.id);
    assert.ok(sourceManifest.inventory?.length > 0);
    for (const command of entries) {
      if (command.exampleKind)
        assert.ok(
          ['usage', 'template', 'discovery'].includes(command.exampleKind)
        );
      if (
        command.exampleKind === 'template' ||
        command.exampleKind === 'discovery'
      ) {
        assert.ok(
          command.warning?.length > 0,
          `${command.id}: a partial template must explain required input`
        );
      }
    }
  }
});
