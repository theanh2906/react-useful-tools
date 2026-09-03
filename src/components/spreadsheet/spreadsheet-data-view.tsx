import type { SpreadsheetGrid } from '@/types';
import { Button } from '@/components/ui';
import { Plus, Rows3 } from 'lucide-react';

interface SpreadsheetDataViewProps {
  data: SpreadsheetGrid | null;
  isLoading: boolean;
  canAddRecord: boolean;
  onAddRecord: () => void;
  emptyLabel: string;
  addLabel: string;
}

export function SpreadsheetDataView({
  data,
  isLoading,
  canAddRecord,
  onAddRecord,
  emptyLabel,
  addLabel,
}: SpreadsheetDataViewProps) {
  if (isLoading) {
    return (
      <div className="space-y-3" aria-label="Loading spreadsheet rows">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-16 animate-pulse rounded-md bg-elevated" />
        ))}
      </div>
    );
  }

  if (!data || data.headers.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-line bg-elevated px-4 py-8 text-center">
        <Rows3 className="mx-auto size-7 text-muted" />
        <p className="mt-2 text-sm text-muted">{emptyLabel}</p>
      </div>
    );
  }

  const desktopRows = data.rows.slice(-8).map((row, index, rows) => ({
    row,
    sourceIndex: data.rows.length - rows.length + index,
  })).reverse();
  const mobileRows = data.rows.slice(-4).map((row, index, rows) => ({
    row,
    sourceIndex: data.rows.length - rows.length + index,
  })).reverse();

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-md border border-line bg-elevated">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead className="bg-surface text-xs font-semibold uppercase tracking-wide text-muted">
              <tr>
                {data.headers.map((header, index) => (
                  <th key={`${header}-${index}`} className="whitespace-nowrap px-4 py-3">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {desktopRows.map(({ row, sourceIndex }) => (
                <tr key={sourceIndex} className="hover:bg-surface/70">
                  {data.headers.map((header, columnIndex) => (
                    <td key={`${header}-${columnIndex}`} className="max-w-64 truncate px-4 py-3 text-foreground">
                      {row[columnIndex] || <span className="text-muted">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-line md:hidden">
          {mobileRows.map(({ row, sourceIndex }) => (
            <div key={sourceIndex} className="space-y-2 px-4 py-3">
              {data.headers.slice(0, 4).map((header, columnIndex) => (
                <div key={`${header}-${columnIndex}`} className="flex items-start justify-between gap-4 text-sm">
                  <span className="shrink-0 text-muted">{header}</span>
                  <span className="line-clamp-2 text-right font-medium text-foreground">{row[columnIndex] || '—'}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {data.rows.length === 0 && <p className="text-sm text-muted">{emptyLabel}</p>}
      {data.rows.length > 4 && <p className="text-xs text-muted md:hidden">Đang hiển thị 4 bản ghi mới nhất.</p>}
      {data.rows.length > 8 && <p className="hidden text-xs text-muted md:block">Đang hiển thị 8 bản ghi mới nhất.</p>}
      {data.truncated && <p className="text-xs text-muted">Đã tải 100 bản ghi gần nhất từ trang tính.</p>}
      <Button onClick={onAddRecord} disabled={!canAddRecord} leftIcon={<Plus className="size-4" />}>
        {addLabel}
      </Button>
    </div>
  );
}
