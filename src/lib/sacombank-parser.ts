import { classify, type SpendingStatement, type SpendingTransaction, sum } from './spending';

// pdfjs is loaded only when the user selects a PDF; no bank data is sent to a server.
export async function parseSacombankPdf(file: File): Promise<SpendingStatement> {
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) throw new Error('Vui lòng chọn file PDF.');
  if (file.size > 15 * 1024 * 1024) throw new Error('File PDF vượt quá 15 MB.');

  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
  let pdf;
  try {
    pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  } catch {
    throw new Error('Không đọc được PDF. Kiểm tra file hoặc mật khẩu của sao kê.');
  }
  try {
    const lines: string[] = [];
    for (let number = 1; number <= pdf.numPages; number++) {
      const content = await (await pdf.getPage(number)).getTextContent();
      const rows: { y: number; items: { x: number; text: string }[] }[] = [];
      for (const item of content.items) {
        if (!('str' in item) || !item.str.trim()) continue;
        const y = item.transform[5];
        let row = rows.find((entry) => Math.abs(entry.y - y) <= 2);
        if (!row) { row = { y, items: [] }; rows.push(row); }
        row.items.push({ x: item.transform[4], text: item.str.trim() });
      }
      lines.push(...rows.sort((a, b) => b.y - a.y).map((row) => row.items.sort((a, b) => a.x - b.x).map((item) => item.text).join(' ').replace(/\s+/g, ' ').trim()));
    }
    if (!lines.some((line) => /SACOMBANK/i.test(line)) || !lines.some((line) => /Card Statement|Thông Báo Giao Dịch Thẻ/i.test(line))) {
      throw new Error('File này không phải sao kê thẻ Sacombank được hỗ trợ.');
    }
    const header = lines.find((line) => /\b\d{2}-\d{2}-\d{4}\b/.test(line) && /\b\d{3,4}\s+\d{3}\s+\d{3}\b/.test(line));
    const dateMatch = header?.match(/\b(\d{2})-(\d{2})-(\d{4})\b/);
    if (!dateMatch) throw new Error('Không tìm thấy ngày sao kê.');
    const statementDate = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
    const summaryStart = lines.findIndex((line) => /Previous Balance/.test(line) && /Purchases & Debits/.test(line));
    if (summaryStart < 0) throw new Error('Không tìm thấy bảng tổng kết sao kê.');
    const numeric = /\b\d{1,3}(?:\.\d{3})+\b|\b\d+\b/g;
    let totals: number[] | undefined;
    for (const line of lines.slice(summaryStart + 1, summaryStart + 8)) {
      const matches = line.match(numeric);
      if (matches?.length === 5) { totals = matches.map((value) => Number(value.replace(/\./g, ''))); break; }
    }
    if (!totals) throw new Error('Không đọc được năm số tổng kết của sao kê.');

    const transactions: SpendingTransaction[] = [];
    const transactionPattern = /^(\d{2}-\d{2}-\d{4})\s+(\d{2}-\d{2}-\d{4})\s+(\d{4})\s+(.+?)\s+(\d{1,3}(?:\.\d{3})*|\d+)\s*(CR)?$/i;
    for (const line of lines) {
      const match = line.match(transactionPattern);
      if (!match) continue;
      const [, transactionDate, postingDate, cardLast4, description, amountText, credit] = match;
      const amount = Number(amountText.replace(/\./g, ''));
      if (!amount || !validDate(transactionDate) || !validDate(postingDate)) continue;
      const kind = credit ? 'credit' : /Phi GD nuoc ngoai|Cross border fee|\b(?:FEE|INTEREST)\b/i.test(description) ? 'fee' : 'purchase';
      const merchant = kind === 'fee' ? { merchant: 'Phí giao dịch', category: 'fees' as const } : classify(description);
      const toIso = (date: string) => `${date.slice(6)}-${date.slice(3, 5)}-${date.slice(0, 2)}`;
      transactions.push({ id: `${statementDate}-${transactions.length}`, transactionDate: toIso(transactionDate), postingDate: toIso(postingDate), cardLast4, description, merchant: merchant.merchant, category: merchant.category, amount, kind });
    }
    if (!transactions.length) throw new Error('Không tìm thấy giao dịch trong file PDF.');
    const cardLast4 = transactions[0].cardLast4;
    const [previousBalance, purchases, fees, credits, outstandingBalance] = totals;
    const parsedPurchases = sum(transactions.filter((tx) => tx.kind === 'purchase').map((tx) => tx.amount));
    const parsedFees = sum(transactions.filter((tx) => tx.kind === 'fee').map((tx) => tx.amount));
    const parsedCredits = sum(transactions.filter((tx) => tx.kind === 'credit').map((tx) => tx.amount));
    if (parsedPurchases !== purchases || parsedFees !== fees || parsedCredits !== credits || previousBalance + purchases + fees - credits !== outstandingBalance) {
      throw new Error(`Dữ liệu chưa khớp sao kê: giao dịch ${parsedPurchases.toLocaleString('vi-VN')} / ${purchases.toLocaleString('vi-VN')} ₫, phí ${parsedFees.toLocaleString('vi-VN')} / ${fees.toLocaleString('vi-VN')} ₫, thanh toán ${parsedCredits.toLocaleString('vi-VN')} / ${credits.toLocaleString('vi-VN')} ₫. File chưa được nhập.`);
    }
    return { id: `sacombank-${statementDate}-${cardLast4}`, statementDate, cardLast4, previousBalance, purchases, fees, credits, outstandingBalance, transactions };
  } finally {
    await pdf.destroy();
  }
}

function validDate(date: string): boolean {
  const [day, month, year] = date.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  return parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day;
}
