import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

// Transpile the two dependency-free modules with the project's TypeScript,
// so these tests also run on the README's supported Node 18+ runtimes.
async function loadTypeScript(relativePath) {
  const source = await readFile(new URL(relativePath, import.meta.url), 'utf8');
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
const { filterCheatsheetGroups, normalizeCheatsheetQuery } =
  await loadTypeScript('../src/lib/cheatsheets.ts');

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
