import type { NAV_ITEMS } from './constants';

export const SPREADSHEET_NAV_ITEM: (typeof NAV_ITEMS)[number] = {
  id: 'spreadsheets',
  label: 'Spreadsheets',
  labelKey: 'navigation.spreadsheets',
  path: '/spreadsheets',
  icon: 'TableProperties',
  category: 'productivity',
};
