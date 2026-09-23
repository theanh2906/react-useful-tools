'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale,
  LineElement, PointElement, Tooltip, Legend, Filler, type ChartOptions,
} from 'chart.js';
import {
  CalendarRange, CheckCircle2, ChevronRight,
  FileText, FilterX, LockKeyhole, Search, Trash2, UploadCloud, X,
} from 'lucide-react';
import { parseSacombankPdf } from '@/lib/sacombank-parser';
import { deleteStatement, getStatements, saveStatement } from '@/lib/spending-storage';
import {
  CATEGORIES, categoryName, compactMoney, money, sum,
  type CategoryId, type SpendingStatement, type SpendingTransaction,
} from '@/lib/spending';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend, Filler);

type PeriodMode = 'statement' | 'calendar';
type Range = '3' | '6' | '12' | 'all' | 'custom';

const monthLabel = (key: string) => `T${Number(key.slice(5))}/${key.slice(0, 4)}`;
const fullDate = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString('vi-VN');
const monthOf = (statement: SpendingStatement, tx: SpendingTransaction, mode: PeriodMode) =>
  (mode === 'statement' ? statement.statementDate : tx.transactionDate).slice(0, 7);

function allMonths(start: string, end: string): string[] {
  if (!start || !end) return [];
  const result: string[] = [];
  let [year, month] = start.split('-').map(Number);
  while (`${year}-${String(month).padStart(2, '0')}` <= end) {
    result.push(`${year}-${String(month).padStart(2, '0')}`);
    if (++month === 13) { year++; month = 1; }
  }
  return result;
}

const axisMoney = (value: string | number) => compactMoney(Number(value));

export default function SpendingAnalyzer() {
  const [statements, setStatements] = useState<SpendingStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<SpendingStatement | null>(null);
  const [mode, setMode] = useState<PeriodMode>('statement');
  const [range, setRange] = useState<Range>('6');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [category, setCategory] = useState<CategoryId | ''>('');
  const [merchant, setMerchant] = useState('');
  const [search, setSearch] = useState('');
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getStatements().then(setStatements).catch((cause) => setError(cause.message)).finally(() => setLoading(false));
  }, []);

  const entries = useMemo(() => statements.flatMap((statement) => statement.transactions.map((tx) => ({ statement, tx, month: monthOf(statement, tx, mode) }))), [statements, mode]);
  const availableMonths = useMemo(() => {
    const keys = mode === 'statement' ? statements.map((item) => item.statementDate.slice(0, 7)) : entries.map((item) => item.month);
    keys.sort();
    return keys.length ? allMonths(keys[0], keys[keys.length - 1]) : [];
  }, [entries, mode, statements]);
  const periodMonths = useMemo(() => range === 'custom'
    ? availableMonths.filter((key) => (!from || key >= from) && (!to || key <= to))
    : range === 'all' ? availableMonths : availableMonths.slice(-Number(range)), [availableMonths, range, from, to]);
  const periodSet = useMemo(() => new Set(periodMonths), [periodMonths]);
  const periodEntries = useMemo(() => entries.filter(({ tx, month }) => tx.kind === 'purchase' && periodSet.has(month)), [entries, periodSet]);
  const chartEntries = useMemo(() => periodEntries.filter(({ tx }) =>
    (!category || tx.category === category) && (!merchant || tx.merchant === merchant) &&
    (!search || `${tx.description} ${tx.merchant}`.toLocaleLowerCase().includes(search.toLocaleLowerCase()))
  ), [periodEntries, category, merchant, search]);
  const viewEntries = useMemo(() => chartEntries.filter(({ month }) => !selectedMonth || month === selectedMonth), [chartEntries, selectedMonth]);
  const selectedTotal = sum(viewEntries.map(({ tx }) => tx.amount));
  const totalsByMonth = periodMonths.map((key) => sum(chartEntries.filter((item) => item.month === key).map(({ tx }) => tx.amount)));
  const monthHasData = periodMonths.map((key) => mode === 'statement'
    ? statements.some((item) => item.statementDate.slice(0, 7) === key)
    : entries.some((entry) => entry.month === key));
  const monthsWithStatements = monthHasData.filter(Boolean).length;
  const monthlyAverage = monthsWithStatements ? Math.round(sum(totalsByMonth) / monthsWithStatements) : 0;
  const breakdown = CATEGORIES.map((item) => ({ ...item, amount: sum(viewEntries.filter(({ tx }) => tx.category === item.id).map(({ tx }) => tx.amount)) })).filter((item) => item.amount > 0).sort((a, b) => b.amount - a.amount);
  const merchantTotals = Array.from(new Set(viewEntries.map(({ tx }) => tx.merchant))).map((name) => ({ name, amount: sum(viewEntries.filter(({ tx }) => tx.merchant === name).map(({ tx }) => tx.amount)) })).sort((a, b) => b.amount - a.amount);
  const visibleEntries = [...viewEntries].sort((a, b) => b.tx.transactionDate.localeCompare(a.tx.transactionDate) || b.tx.postingDate.localeCompare(a.tx.postingDate));
  const selectedFees = sum(entries.filter(({ tx, month }) => tx.kind === 'fee' && periodSet.has(month) && (!selectedMonth || selectedMonth === month)).map(({ tx }) => tx.amount));
  const activeMonth = selectedMonth && periodSet.has(selectedMonth) ? selectedMonth : '';

  const lineOptions: ChartOptions<'line'> = {
    responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (item) => money(item.parsed.y ?? 0) } } },
    scales: { y: { beginAtZero: true, ticks: { callback: axisMoney }, grid: { color: '#e8edf4' } }, x: { grid: { display: false } } },
    onClick: (_event, elements) => { if (elements[0]) { const key = periodMonths[elements[0].index]; setSelectedMonth((current) => current === key ? '' : key); } },
  };
  const doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true, maintainAspectRatio: false, cutout: '70%',
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (item) => `${item.label}: ${money(Number(item.raw))}` } } },
    onClick: (_event, elements) => { if (elements[0]) { const key = breakdown[elements[0].index].id; setCategory((current) => current === key ? '' : key); } },
  };
  const barOptions: ChartOptions<'bar'> = {
    indexAxis: 'y', responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (item) => money(item.parsed.x ?? 0) } } },
    scales: { x: { beginAtZero: true, ticks: { callback: axisMoney }, grid: { color: '#e8edf4' } }, y: { grid: { display: false } } },
    onClick: (_event, elements) => { if (elements[0]) { const key = merchantTotals[elements[0].index].name; setMerchant((current) => current === key ? '' : key); } },
  };

  async function handleFile(file?: File) {
    if (!file) return;
    setBusy(true); setError('');
    try {
      const result = await parseSacombankPdf(file);
      setPreview(result);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể đọc file sao kê.');
    } finally { setBusy(false); }
  }

  async function importStatement() {
    if (!preview) return;
    setBusy(true); setError('');
    try {
      await saveStatement(preview);
      setStatements(await getStatements());
      setPreview(null);
      setSelectedMonth(''); setCategory(''); setMerchant('');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không lưu được sao kê.'); }
    finally { setBusy(false); }
  }

  async function changeCategory(statementId: string, transactionId: string, next: CategoryId) {
    const current = statements.find((item) => item.id === statementId);
    if (!current) return;
    const updated = { ...current, transactions: current.transactions.map((tx) => tx.id === transactionId ? { ...tx, category: next } : tx) };
    try {
      await saveStatement(updated);
      setStatements((items) => items.map((item) => item.id === statementId ? updated : item));
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không lưu được nhóm chi tiêu.'); }
  }

  async function removeStatement(id: string) {
    try {
      await deleteStatement(id);
      setStatements((items) => items.filter((item) => item.id !== id));
      setDeletingId('');
      setSelectedMonth('');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không xóa được sao kê.'); }
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    void handleFile(event.target.files?.[0]);
    event.target.value = '';
  }
  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    void handleFile(event.dataTransfer.files[0]);
  }

  return (
    <div className="space-y-6 pb-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-accent-600">SACOMBANK · PERSONAL FINANCE</p>
          <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">Chi tiêu của bạn</h1>
          <p className="mt-1 text-sm text-muted">Nhìn rõ từng kỳ sao kê, nhóm chi tiêu và nơi tiền đã đi.</p>
        </div>
        <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className="btn-primary gap-2 whitespace-nowrap">
          <UploadCloud className="size-4" /> {busy ? 'Đang đọc PDF…' : 'Nhập sao kê PDF'}
        </button>
        <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="sr-only" onChange={onFileChange} aria-label="Chọn PDF sao kê Sacombank" />
      </header>

      {error && <div role="alert" className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"><span>{error}</span><button type="button" aria-label="Đóng thông báo lỗi" onClick={() => setError('')}><X className="size-4" /></button></div>}

      {loading ? <div className="glass-card p-10 text-center text-muted">Đang tải dữ liệu…</div> : statements.length === 0 ? (
        <div onDragOver={(event) => event.preventDefault()} onDrop={onDrop} className="glass-card flex min-h-80 flex-col items-center justify-center gap-3 border-dashed p-8 text-center">
          <div className="rounded-full bg-accent-50 p-5 text-accent-600"><FileText className="size-8" /></div>
          <h2 className="text-xl font-bold">Bắt đầu từ sao kê Sacombank</h2>
          <p className="max-w-md text-sm text-muted">Chọn hoặc kéo thả PDF sao kê thẻ tín dụng. Bạn sẽ được xem lại giao dịch và nhóm chi tiêu trước khi lưu.</p>
          <button type="button" onClick={() => inputRef.current?.click()} className="btn-secondary mt-2">Chọn file PDF</button>
          <span className="flex items-center gap-1.5 text-xs text-muted"><LockKeyhole className="size-3.5" /> Xử lý trên thiết bị · Không tải file lên máy chủ</span>
        </div>
      ) : (
        <>
          <section aria-label="Bộ lọc phân tích" className="glass-card space-y-4 p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-3">
              <CalendarRange className="size-5 text-accent-500" />
              <div className="inline-flex rounded-lg bg-surface p-1 text-sm" role="group" aria-label="Cách tính tháng">
                <button type="button" onClick={() => { setMode('statement'); setSelectedMonth(''); }} className={`rounded-md px-3 py-2 ${mode === 'statement' ? 'bg-elevated font-semibold shadow-sm' : 'text-muted'}`}>Kỳ sao kê</button>
                <button type="button" onClick={() => { setMode('calendar'); setSelectedMonth(''); }} className={`rounded-md px-3 py-2 ${mode === 'calendar' ? 'bg-elevated font-semibold shadow-sm' : 'text-muted'}`}>Tháng giao dịch</button>
              </div>
              <span className="text-xs text-muted">{mode === 'statement' ? 'Theo ngày chốt sao kê; giao dịch có thể thuộc tháng trước.' : 'Theo ngày giao dịch thực tế.'}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="text-xs font-medium text-muted">Phạm vi
                <select aria-label="Phạm vi thời gian" value={range} onChange={(event) => { setRange(event.target.value as Range); setSelectedMonth(''); }} className="input-field mt-1 text-sm">
                  <option value="3">3 tháng gần nhất</option><option value="6">6 tháng gần nhất</option><option value="12">12 tháng gần nhất</option><option value="all">Toàn bộ</option><option value="custom">Chọn khoảng tháng</option>
                </select>
              </label>
              {range === 'custom' && <>
                <label className="text-xs font-medium text-muted">Từ tháng<input type="month" value={from} max={to || undefined} onChange={(event) => { setFrom(event.target.value); setSelectedMonth(''); }} className="input-field mt-1 text-sm" /></label>
                <label className="text-xs font-medium text-muted">Đến tháng<input type="month" value={to} min={from || undefined} onChange={(event) => { setTo(event.target.value); setSelectedMonth(''); }} className="input-field mt-1 text-sm" /></label>
              </>}
              <label className="text-xs font-medium text-muted">Nhóm chi tiêu
                <select value={category} onChange={(event) => setCategory(event.target.value as CategoryId | '')} className="input-field mt-1 text-sm">
                  <option value="">Tất cả nhóm</option>{CATEGORIES.filter((item) => item.id !== 'fees').map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
              <label className="text-xs font-medium text-muted">Tìm merchant / giao dịch
                <span className="relative mt-1 block"><Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Ví dụ: Green SM" className="input-field pl-9 text-sm" /></span>
              </label>
            </div>
            {(activeMonth || category || merchant || search) && <div className="flex flex-wrap items-center gap-2 text-xs">
              {activeMonth && <button type="button" className="badge-primary gap-1" onClick={() => setSelectedMonth('')}>{monthLabel(activeMonth)} <X className="size-3" /></button>}
              {category && <button type="button" className="badge-primary gap-1" onClick={() => setCategory('')}>{categoryName(category)} <X className="size-3" /></button>}
              {merchant && <button type="button" className="badge-primary gap-1" onClick={() => setMerchant('')}>{merchant} <X className="size-3" /></button>}
              {search && <button type="button" className="badge-primary gap-1" onClick={() => setSearch('')}>“{search}” <X className="size-3" /></button>}
              <button type="button" className="inline-flex items-center gap-1 text-muted underline" onClick={() => { setSelectedMonth(''); setCategory(''); setMerchant(''); setSearch(''); }}><FilterX className="size-3.5" /> Xóa bộ lọc</button>
            </div>}
          </section>

          <section aria-label="Tổng quan chi tiêu" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label={activeMonth ? `Chi tiêu ${monthLabel(activeMonth)}` : 'Chi tiêu trong phạm vi'} value={money(selectedTotal)} subtitle={`${visibleEntries.length} giao dịch · chưa gồm phí`} accent />
            <Metric label="Trung bình / kỳ có giao dịch" value={money(monthlyAverage)} subtitle={`${monthsWithStatements} tháng có dữ liệu`} />
            <Metric label="Nhóm chi nhiều nhất" value={breakdown[0]?.name ?? '—'} subtitle={breakdown[0] ? `${money(breakdown[0].amount)} · ${selectedTotal ? Math.round(breakdown[0].amount / selectedTotal * 100) : 0}%` : 'Chưa có giao dịch'} />
            <Metric label="Phí trong phạm vi" value={money(selectedFees)} subtitle="Tách riêng khỏi chi tiêu" />
          </section>

          <div className="grid gap-4 xl:grid-cols-5">
            <section className="glass-card p-4 sm:p-6 xl:col-span-3">
              <div className="flex items-baseline justify-between gap-2"><h2 className="text-lg font-bold">Xu hướng theo tháng</h2><span className="text-xs text-muted">Chạm cột để lọc tháng</span></div>
              <p className="mt-1 text-xs text-muted">{mode === 'statement' ? 'Theo kỳ chốt sao kê' : 'Theo ngày giao dịch'} · không gồm phí và thanh toán dư nợ</p>
              <div className="mt-5 h-64 sm:h-72"><Line data={{ labels: periodMonths.map(monthLabel), datasets: [{ label: 'Chi tiêu', data: totalsByMonth.map((value, index) => monthHasData[index] ? value : null), spanGaps: false, borderColor: '#4f6fe8', backgroundColor: 'rgba(79,111,232,0.12)', fill: true, tension: 0.3, pointRadius: periodMonths.map((key) => key === activeMonth ? 7 : 4), pointBackgroundColor: periodMonths.map((key) => key === activeMonth ? '#ea7954' : '#4f6fe8') }] }} options={lineOptions} /></div>
              <div className="mt-3 flex flex-wrap gap-2">{periodMonths.map((key, index) => <button key={key} type="button" disabled={!monthHasData[index]} onClick={() => setSelectedMonth(activeMonth === key ? '' : key)} className={`rounded-full px-3 py-1.5 text-xs disabled:cursor-default disabled:opacity-50 ${activeMonth === key ? 'bg-accent-100 font-semibold text-accent-700' : 'bg-surface text-muted hover:text-foreground'}`}>{monthLabel(key)} · {monthHasData[index] ? compactMoney(totalsByMonth[index]) : 'Chưa có dữ liệu'}</button>)}</div>
            </section>
            <section className="glass-card p-4 sm:p-6 xl:col-span-2">
              <h2 className="text-lg font-bold">Chi tiêu theo nhóm</h2><p className="mt-1 text-xs text-muted">Chạm vào nhóm để lọc chi tiết</p>
              {breakdown.length ? <><div className="mx-auto mt-4 h-48 max-w-64"><Doughnut data={{ labels: breakdown.map((item) => item.name), datasets: [{ data: breakdown.map((item) => item.amount), backgroundColor: breakdown.map((item) => item.color), borderWidth: 0 }] }} options={doughnutOptions} /></div>
                <div className="mt-4 max-h-64 space-y-2 overflow-y-auto pr-1">{breakdown.map((item) => <button type="button" onClick={() => setCategory(category === item.id ? '' : item.id)} key={item.id} className="flex w-full items-center gap-2 rounded-md px-1 py-1.5 text-left text-sm hover:bg-surface"><span className="size-2.5 shrink-0 rounded-full" style={{ background: item.color }} /><span className="min-w-0 flex-1 truncate">{item.name}</span><span className="text-xs text-muted">{Math.round(item.amount / selectedTotal * 100)}%</span><strong className="min-w-[95px] text-right text-xs">{money(item.amount)}</strong></button>)}</div>
              </> : <EmptyChart />}
            </section>
          </div>

          <div className="grid gap-4 xl:grid-cols-5">
            <section className="glass-card p-4 sm:p-6 xl:col-span-3">
              <h2 className="text-lg font-bold">Nơi chi nhiều nhất</h2><p className="mt-1 text-xs text-muted">Top 8 merchant · chạm vào thanh để lọc</p>
              {merchantTotals.length ? <div className="mt-5" style={{ height: `${Math.max(190, Math.min(8, merchantTotals.length) * 42)}px` }}><Bar data={{ labels: merchantTotals.slice(0, 8).map((item) => item.name), datasets: [{ data: merchantTotals.slice(0, 8).map((item) => item.amount), backgroundColor: '#63b3a9', borderRadius: 5 }] }} options={barOptions} /></div> : <EmptyChart />}
            </section>
            <section className="glass-card p-4 sm:p-6 xl:col-span-2">
              <h2 className="text-lg font-bold">Các kỳ đã nhập</h2><p className="mt-1 text-xs text-muted">Cùng một kỳ nhập lại sẽ cập nhật dữ liệu.</p>
              <div className="mt-4 space-y-2">{[...statements].reverse().map((statement) => <div key={statement.id} className="flex items-center gap-3 rounded-lg border border-line px-3 py-3"><FileText className="size-5 shrink-0 text-accent-500" /><div className="min-w-0 flex-1"><div className="font-semibold">{monthLabel(statement.statementDate.slice(0, 7))}</div><div className="text-xs text-muted">Chốt {fullDate(statement.statementDate)} · •••• {statement.cardLast4}</div><div className="text-xs text-muted">{money(statement.purchases)} chi tiêu · {statement.transactions.length} dòng</div></div>{deletingId === statement.id ? <span className="flex shrink-0 gap-1"><button type="button" className="text-xs text-red-600 underline" onClick={() => void removeStatement(statement.id)}>Xác nhận xóa</button><button type="button" className="btn-icon size-8" onClick={() => setDeletingId('')} aria-label="Hủy xóa"><X className="size-4" /></button></span> : <button type="button" onClick={() => setDeletingId(statement.id)} className="btn-icon shrink-0" aria-label={`Xóa kỳ ${monthLabel(statement.statementDate.slice(0, 7))}`}><Trash2 className="size-4" /></button>}</div>)}</div>
              <p className="mt-4 flex items-start gap-2 text-xs text-muted"><LockKeyhole className="mt-0.5 size-4 shrink-0" /> Giao dịch chỉ lưu trong trình duyệt này; xóa dữ liệu trình duyệt sẽ xóa lịch sử. Không đồng bộ giữa thiết bị.</p>
            </section>
          </div>

          <section className="glass-card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line p-4 sm:px-6"><div><h2 className="text-lg font-bold">Giao dịch</h2><p className="text-xs text-muted">{visibleEntries.length} khoản mua · bấm nhóm để sửa phân loại</p></div><span className="text-xs text-muted">Sắp xếp theo ngày giao dịch</span></div>
            {visibleEntries.length ? <>
              <div className="hidden overflow-x-auto md:block"><table className="w-full text-left text-sm"><thead className="bg-surface text-xs text-muted"><tr><th className="px-5 py-3">Ngày</th><th className="px-5 py-3">Merchant / diễn giải</th><th className="px-5 py-3">Nhóm</th><th className="px-5 py-3 text-right">Số tiền</th></tr></thead><tbody className="divide-y divide-line">{visibleEntries.slice(0, showAllTransactions ? undefined : 20).map(({ statement, tx }) => <tr key={`${statement.id}-${tx.id}`} className="hover:bg-surface/60"><td className="whitespace-nowrap px-5 py-3 text-muted">{fullDate(tx.transactionDate)}</td><td className="max-w-80 px-5 py-3"><div className="font-semibold">{tx.merchant}</div><div className="truncate text-xs text-muted" title={tx.description}>{tx.description}</div></td><td className="px-5 py-3"><CategorySelect value={tx.category} onChange={(value) => void changeCategory(statement.id, tx.id, value)} /></td><td className="whitespace-nowrap px-5 py-3 text-right font-semibold">{money(tx.amount)}</td></tr>)}</tbody></table></div>
              <div className="divide-y divide-line md:hidden">{visibleEntries.slice(0, showAllTransactions ? undefined : 20).map(({ statement, tx }) => <div key={`${statement.id}-${tx.id}`} className="p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="font-semibold">{tx.merchant}</div><div className="mt-0.5 truncate text-xs text-muted" title={tx.description}>{fullDate(tx.transactionDate)} · {tx.description}</div></div><strong className="shrink-0 text-sm">{money(tx.amount)}</strong></div><div className="mt-2"><CategorySelect value={tx.category} onChange={(value) => void changeCategory(statement.id, tx.id, value)} /></div></div>)}</div>
              {visibleEntries.length > 20 && <button type="button" className="flex w-full items-center justify-center gap-1 border-t border-line py-3 text-sm font-semibold text-accent-600" onClick={() => setShowAllTransactions(!showAllTransactions)}>{showAllTransactions ? 'Thu gọn' : `Xem thêm ${visibleEntries.length - 20} giao dịch`} <ChevronRight className={`size-4 ${showAllTransactions ? '-rotate-90' : 'rotate-90'}`} /></button>}
            </> : <p className="p-8 text-center text-sm text-muted">Không có giao dịch nào trong phạm vi đã chọn.</p>}
          </section>
        </>
      )}

      {preview && <div role="dialog" aria-modal="true" aria-label="Xem lại sao kê trước khi nhập" className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) setPreview(null); }}>
        <div className="flex max-h-[95dvh] w-full max-w-3xl flex-col rounded-t-xl bg-elevated shadow-xl sm:max-h-[90dvh] sm:rounded-xl">
          <div className="flex items-start justify-between border-b border-line p-5"><div><p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600"><CheckCircle2 className="size-4" /> Đã đối chiếu khớp sao kê</p><h2 className="mt-1 text-xl font-bold">Kỳ {monthLabel(preview.statementDate.slice(0, 7))}</h2><p className="text-sm text-muted">Chốt {fullDate(preview.statementDate)} · •••• {preview.cardLast4}</p></div><button type="button" aria-label="Đóng" className="btn-icon" onClick={() => setPreview(null)}><X className="size-5" /></button></div>
          <div className="grid grid-cols-2 gap-2 border-b border-line bg-surface p-4 text-sm sm:grid-cols-4"><div><span className="text-xs text-muted">Chi tiêu</span><strong className="block">{money(preview.purchases)}</strong></div><div><span className="text-xs text-muted">Phí</span><strong className="block">{money(preview.fees)}</strong></div><div><span className="text-xs text-muted">Đã thanh toán</span><strong className="block">{money(preview.credits)}</strong></div><div><span className="text-xs text-muted">Dư nợ cuối kỳ</span><strong className="block">{money(preview.outstandingBalance)}</strong></div></div>
          <div className="overflow-y-auto p-4"><p className="mb-3 text-sm font-semibold">{preview.transactions.filter((tx) => tx.kind === 'purchase').length} khoản mua · {preview.transactions.filter((tx) => tx.kind === 'fee').length} dòng phí · {preview.transactions.filter((tx) => tx.kind === 'credit').length} dòng thanh toán</p>{preview.transactions.some((tx) => tx.kind === 'purchase' && tx.category === 'other') && <p className="mb-2 rounded-md bg-amber-50 p-2 text-xs text-amber-800">Có giao dịch chưa phân loại. Xem và chỉnh nhóm trước khi lưu để biểu đồ chính xác hơn.</p>}<div className="divide-y divide-line">{preview.transactions.filter((tx) => tx.kind === 'purchase').map((tx) => <div key={tx.id} className="flex flex-wrap items-center gap-2 py-2.5 text-sm"><span className="w-16 text-xs text-muted">{tx.transactionDate.slice(5)}</span><span className="min-w-32 flex-1 truncate" title={tx.description}>{tx.merchant}</span><CategorySelect value={tx.category} onChange={(value) => setPreview((current) => current ? { ...current, transactions: current.transactions.map((entry) => entry.id === tx.id ? { ...entry, category: value } : entry) } : current)} /><strong className="min-w-24 text-right">{money(tx.amount)}</strong></div>)}</div></div>
          <div className="flex flex-col gap-2 border-t border-line p-4 sm:flex-row sm:items-center sm:justify-between"><span className="text-xs text-muted">PDF không được lưu. Bạn có thể sửa nhóm sau khi nhập.</span><div className="flex gap-2"><button type="button" className="btn-secondary" onClick={() => setPreview(null)}>Hủy</button><button type="button" disabled={busy} className="btn-primary" onClick={() => void importStatement()}>{statements.some((item) => item.id === preview.id) ? 'Cập nhật kỳ này' : 'Lưu và xem thống kê'}</button></div></div>
        </div>
      </div>}
    </div>
  );
}

function Metric({ label, value, subtitle, accent }: { label: string; value: string; subtitle: string; accent?: boolean }) {
  return <div className={`rounded-lg border p-4 shadow-sm sm:p-5 ${accent ? 'border-accent-200 bg-accent-50/50 dark:bg-elevated' : 'border-line bg-elevated'}`}><p className="text-xs font-medium text-muted">{label}</p><strong className="mt-2 block break-words text-xl font-bold sm:text-2xl">{value}</strong><p className="mt-2 text-xs text-muted">{subtitle}</p></div>;
}

function CategorySelect({ value, onChange }: { value: CategoryId; onChange: (value: CategoryId) => void }) {
  return <select aria-label="Nhóm chi tiêu" value={value} onChange={(event) => onChange(event.target.value as CategoryId)} className="max-w-full rounded-md border border-line bg-elevated px-2 py-1.5 text-xs text-foreground">{CATEGORIES.filter((item) => item.id !== 'fees').map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>;
}

function EmptyChart() { return <div className="flex h-48 items-center justify-center text-sm text-muted">Không có dữ liệu phù hợp.</div>; }
