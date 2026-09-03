import { Badge, Button, Card } from '@/components/ui';
import { SpreadsheetSourceIcon } from './spreadsheet-source-icon';
import type { SpreadsheetConnection, SpreadsheetGrid } from '@/types';
import { cn } from '@/lib/utils';
import { ChevronDown, MoreVertical, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { SpreadsheetDataView } from './spreadsheet-data-view';

interface SpreadsheetFileCardProps {
  file: SpreadsheetConnection;
  data: SpreadsheetGrid | null;
  isSelected: boolean;
  isLoading: boolean;
  hasGoogleAccess: boolean;
  onSelect: () => void;
  onSelectSheet: (sheetId: number) => void;
  onRefresh: () => void;
  onConnect: () => void;
  onAddRecord: () => void;
  onRemove: () => void;
}

function relativeSync(timestamp?: number) {
  if (!timestamp) return 'Chưa đồng bộ';
  const minutes = Math.floor((Date.now() - timestamp) / 60000);
  if (minutes < 1) return 'Vừa đồng bộ';
  if (minutes < 60) return `Đồng bộ ${minutes} phút trước`;
  return `Đồng bộ ${new Date(timestamp).toLocaleDateString('vi-VN')}`;
}

export function SpreadsheetFileCard(props: SpreadsheetFileCardProps) {
  const { file, data, isSelected, isLoading, hasGoogleAccess } = props;
  const [menuOpen, setMenuOpen] = useState(false);
  const selectedSheet = file.sheets.find((sheet) => sheet.id === file.selectedSheetId) ?? file.sheets[0];

  return (
    <Card className={cn(
      'overflow-hidden transition-colors',
      isSelected && file.source === 'google-sheets' && 'border-accent-500 ring-1 ring-accent-500/20'
    )}>
      <div className="flex items-start gap-3 p-4 sm:items-center sm:p-5">
        <SpreadsheetSourceIcon source={file.source} />
        <button type="button" onClick={props.onSelect} className="min-w-0 flex-1 text-left">
          <span className="block truncate text-base font-bold text-foreground sm:text-lg">{file.title}</span>
          <span className="mt-1 block text-xs text-muted sm:text-sm">
            {file.source === 'google-sheets' ? `${file.sheets.length} trang tính · ${relativeSync(file.lastSyncedAt)}` : 'Microsoft Excel'}
          </span>
          <span className="mt-2 block">
            {file.source === 'google-sheets' ? (
              <Badge variant={file.status === 'connected' ? 'success' : 'danger'} size="sm">
                {file.status === 'connected' ? 'Đã kết nối' : file.statusMessage ?? 'Cần kết nối lại'}
              </Badge>
            ) : (
              <Badge variant="warning" size="sm">Chỉ đọc · Link này chưa hỗ trợ cập nhật</Badge>
            )}
          </span>
        </button>

        <div className="relative flex items-center gap-1">
          <Button type="button" variant="ghost" size="sm" onClick={() => setMenuOpen((open) => !open)} aria-label="Tùy chọn bảng tính">
            <MoreVertical className="size-5" />
          </Button>
          {file.source === 'google-sheets' && (
            <Button type="button" variant="ghost" size="sm" onClick={props.onSelect} aria-label={isSelected ? 'Thu gọn' : 'Mở bảng tính'}>
              <ChevronDown className={cn('size-5 transition-transform', isSelected && 'rotate-180')} />
            </Button>
          )}
          {menuOpen && (
            <div className="absolute right-0 top-11 z-20 w-44 rounded-md border border-line bg-elevated p-1.5 shadow-xl">
              <Button type="button" variant="ghost" size="sm" onClick={() => { setMenuOpen(false); props.onRemove(); }} className="w-full justify-start text-red-600">
                <Trash2 className="size-4" /> Xóa khỏi danh sách
              </Button>
            </div>
          )}
        </div>
      </div>

      {isSelected && file.source === 'google-sheets' && (
        <div className="border-t border-line bg-surface p-4 sm:p-5">
          {!hasGoogleAccess ? (
            <div className="rounded-md border border-accent-100 bg-elevated p-5 text-center">
              <p className="text-sm text-muted">Kết nối lại Google để tải và cập nhật dữ liệu an toàn.</p>
              <Button onClick={props.onConnect} className="mt-4">Kết nối Google</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="scrollbar-hide flex min-w-0 flex-1 gap-2 overflow-x-auto">
                  {file.sheets.map((sheet) => (
                    <Button
                      key={sheet.id}
                      type="button"
                      variant={sheet.id === selectedSheet?.id ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => props.onSelectSheet(sheet.id)}
                      className={sheet.id === selectedSheet?.id ? 'bg-accent-500 hover:bg-accent-600' : ''}
                    >
                      {sheet.title}
                    </Button>
                  ))}
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={props.onRefresh} isLoading={isLoading} aria-label="Làm mới">
                  <RefreshCw className="size-4" />
                </Button>
              </div>
              <SpreadsheetDataView
                data={data}
                isLoading={isLoading}
                canAddRecord={Boolean(data?.headers.length)}
                onAddRecord={props.onAddRecord}
                emptyLabel="Trang tính chưa có hàng tiêu đề hoặc dữ liệu."
                addLabel="Thêm bản ghi"
              />
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
