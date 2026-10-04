import type { CheatsheetGroup } from '@/data/cheatsheets';

/** Makes English and Vietnamese queries work with or without accents. */
export function normalizeCheatsheetQuery(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .trim();
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
        const searchable = normalizeCheatsheetQuery(
          [
            group.title,
            command.title,
            command.command,
            command.description,
            command.example,
            ...command.tags,
          ].join(' ')
        );
        return words.every((word) => searchable.includes(word));
      }),
    }))
    .filter((group) => group.commands.length > 0);
}
