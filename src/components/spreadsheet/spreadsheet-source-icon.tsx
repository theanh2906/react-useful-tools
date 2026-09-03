import type { SpreadsheetSource } from '@/types';
import { FileSpreadsheet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpreadsheetSourceIconProps {
  source: SpreadsheetSource;
  className?: string;
}

export function SpreadsheetSourceIcon({ source, className }: SpreadsheetSourceIconProps) {
  return (
    <span
      className={cn(
        'flex size-11 shrink-0 items-center justify-center rounded-md text-white shadow-sm',
        source === 'google-sheets' ? 'bg-emerald-600' : 'bg-green-700',
        className
      )}
      aria-hidden="true"
    >
      <FileSpreadsheet className="size-6" />
    </span>
  );
}
