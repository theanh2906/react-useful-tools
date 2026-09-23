export const CATEGORIES = [
  { id: 'subscriptions', name: 'Dịch vụ số', color: '#6558d3' },
  { id: 'transport', name: 'Di chuyển', color: '#149b9b' },
  { id: 'food', name: 'Ăn uống', color: '#ed8c45' },
  { id: 'coffee', name: 'Cà phê', color: '#a8724b' },
  { id: 'convenience', name: 'Cửa hàng tiện lợi', color: '#e6b34a' },
  { id: 'groceries', name: 'Thực phẩm', color: '#67a766' },
  { id: 'shopping', name: 'Mua sắm', color: '#e3819e' },
  { id: 'health', name: 'Y tế', color: '#e26767' },
  { id: 'family', name: 'Gia đình & bé', color: '#6b98dc' },
  { id: 'entertainment', name: 'Giải trí', color: '#9b73c8' },
  { id: 'games', name: 'Trò chơi', color: '#8a8fe0' },
  { id: 'transfers', name: 'Thanh toán khác', color: '#778ca6' },
  { id: 'fees', name: 'Phí', color: '#a7a9b3' },
  { id: 'other', name: 'Chưa phân loại', color: '#bac2ce' },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];
export type EntryKind = 'purchase' | 'fee' | 'credit';
export type SpendingTransaction = {
  id: string;
  transactionDate: string;
  postingDate: string;
  description: string;
  merchant: string;
  cardLast4: string;
  amount: number;
  kind: EntryKind;
  category: CategoryId;
};
export type SpendingStatement = {
  id: string;
  statementDate: string;
  cardLast4: string;
  previousBalance: number;
  purchases: number;
  fees: number;
  credits: number;
  outstandingBalance: number;
  transactions: SpendingTransaction[];
};

export const money = (amount: number) => `${new Intl.NumberFormat('vi-VN').format(amount)} ₫`;
export const compactMoney = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { notation: 'compact', maximumFractionDigits: 1 }).format(amount) + ' ₫';
export const categoryName = (id: CategoryId) => CATEGORIES.find((item) => item.id === id)?.name ?? id;

const merchantRules: { test: RegExp; name: string; category: CategoryId }[] = [
  { test: /GREEN\s*SM|\bBE\s*(?:GROUP|TRANSPORT|BIKE|CAR)\b|GRAB|GOJEK|XANH\s*SM/i, name: 'Green SM', category: 'transport' },
  { test: /OPENAI|CHATGPT/i, name: 'ChatGPT', category: 'subscriptions' },
  { test: /NETFLIX/i, name: 'Netflix', category: 'subscriptions' },
  { test: /OBSIDIAN/i, name: 'Obsidian', category: 'subscriptions' },
  { test: /GITHUB/i, name: 'GitHub', category: 'subscriptions' },
  { test: /CONTABO/i, name: 'Contabo', category: 'subscriptions' },
  { test: /JETBRAINS|GOOGLE\s*ONE|GOOGLE\s*STORAGE|SPOTIFY|APPLE\.COM\/BILL/i, name: 'Dịch vụ số', category: 'subscriptions' },
  { test: /HIGHLANDS/i, name: 'Highlands', category: 'coffee' },
  { test: /PHUC\s*LONG|PHUCLONG/i, name: 'Phúc Long', category: 'coffee' },
  { test: /7ELEVEN|7-ELEVEN|CIRCLE\s*K|FAMILY\s*MART/i, name: 'Cửa hàng tiện lợi', category: 'convenience' },
  { test: /PHARMACITY|LONG\s*CHAU|NH[AÀ]\s*THUOC/i, name: 'Nhà thuốc', category: 'health' },
  { test: /BIBOMART|MY\s*KINGDOM|CON\s*CUNG/i, name: 'Đồ cho bé', category: 'family' },
  { test: /GALAXY\s*CINEMA|GLX\*|\bCGV\b|CINEMA/i, name: 'Rạp phim', category: 'entertainment' },
  { test: /VOLAM|V[ÕO]\s*L[ÂA]M/i, name: 'Võ Lâm', category: 'games' },
  { test: /STEAM(GAMES|PURCHASE)?/i, name: 'Steam', category: 'games' },
  { test: /SHOPEE|LAZADA|TIKI\b|THISO\s*RETAIL/i, name: 'Mua sắm', category: 'shopping' },
  { test: /KFOOD|SUPERMARKET|COOPMART|BACH\s*HOA|WINMART/i, name: 'Siêu thị', category: 'groceries' },
  { test: /FOODY|SHOPEEFOOD|PIZZA|BREADTALK|DON\s*DON|RESTAURANT|KFC|MCDONALD/i, name: 'Ăn uống', category: 'food' },
];

export function classify(description: string): { merchant: string; category: CategoryId } {
  const rule = merchantRules.find(({ test }) => test.test(description));
  if (!rule) return { merchant: description.trim().replace(/\s{2,}/g, ' '), category: /^\d{8,}\s|\bVI PAY\b/i.test(description) ? 'transfers' : 'other' };
  if (rule.category === 'transport' && /\bBE\s*(GROUP|TRANSPORT|BIKE|CAR)\b/i.test(description)) return { merchant: 'BE', category: 'transport' };
  return { merchant: rule.name, category: rule.category };
}

export const sum = (numbers: number[]) => numbers.reduce((total, value) => total + value, 0);
