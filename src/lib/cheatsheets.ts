import type { CheatsheetCommand, CheatsheetGroup } from '@/data/cheatsheets';

/** Makes English and Vietnamese queries work with or without accents. */
export function normalizeCheatsheetQuery(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .trim();
}

const searchTextCache = new WeakMap<CheatsheetCommand, string>();

/** Normalize each immutable reference entry once, rather than on every keystroke. */
function getCommandSearchText(command: CheatsheetCommand): string {
  const cached = searchTextCache.get(command);
  if (cached !== undefined) return cached;
  const text = normalizeCheatsheetQuery(
    [
      command.title,
      command.command,
      command.description,
      command.example,
      command.canonicalCommand ?? '',
      ...command.tags,
      ...(command.options ?? []).flatMap((option) => [
        option.flag,
        option.description,
        option.example ?? '',
      ]),
    ].join(' ')
  );
  searchTextCache.set(command, text);
  return text;
}

/** Every search word must match; category and search filters compose. */
export function filterCheatsheetGroups(
  groups: CheatsheetGroup[],
  query: string,
  category: string = 'all'
): CheatsheetGroup[] {
  const words = normalizeCheatsheetQuery(query).split(/\s+/).filter(Boolean);
  return groups
    .filter((group) => category === 'all' || group.id === category)
    .map((group) => ({
      ...group,
      commands: group.commands.filter((command) => {
        const searchable = `${normalizeCheatsheetQuery(group.title)} ${getCommandSearchText(command)}`;
        return words.every((word) => searchable.includes(word));
      }),
    }))
    .filter((group) => group.commands.length > 0);
}

export const CHEATSHEET_PAGE_SIZE = 48;

/** Page through matches without restricting the underlying searchable inventory. */
export function paginateCheatsheetGroups(
  groups: CheatsheetGroup[],
  page: number,
  pageSize = CHEATSHEET_PAGE_SIZE
): CheatsheetGroup[] {
  if (!Number.isInteger(pageSize) || pageSize < 1) return [];
  const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
  const start = (safePage - 1) * pageSize;
  const end = start + pageSize;
  let offset = 0;
  return groups.flatMap((group) => {
    const groupStart = offset;
    offset += group.commands.length;
    const from = Math.max(0, start - groupStart);
    const to = Math.min(group.commands.length, end - groupStart);
    return from < to
      ? [{ ...group, commands: group.commands.slice(from, to) }]
      : [];
  });
}
