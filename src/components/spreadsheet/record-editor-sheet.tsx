'use client';

import { Button, Input } from '@/components/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

interface RecordEditorSheetProps {
  isOpen: boolean;
  headers: string[];
  isSaving: boolean;
  onClose: () => void;
  onSave: (values: string[]) => Promise<void>;
}

function inputType(header: string) {
  const normalized = header.toLocaleLowerCase('vi');
  if (/ngày|date/.test(normalized)) return 'date';
  if (/email|e-mail/.test(normalized)) return 'email';
  if (/số tiền|amount|price|giá|chi phí/.test(normalized)) return 'number';
  if (/điện thoại|phone|mobile/.test(normalized)) return 'tel';
  return 'text';
}

export function RecordEditorSheet({
  isOpen,
  headers,
  isSaving,
  onClose,
  onSave,
}: RecordEditorSheetProps) {
  const [values, setValues] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) setValues(headers.map(() => ''));
  }, [headers, isOpen]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onSave(values);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isSaving ? undefined : onClose}
            className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-[2px]"
          />
          <div className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6">
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="record-sheet-title"
              initial={{ opacity: 0, y: 56 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 56 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="pointer-events-auto flex max-h-[88vh] w-full flex-col rounded-t-xl border border-line bg-elevated shadow-2xl md:max-w-xl md:rounded-xl"
            >
              <div className="mx-auto mt-2 h-1 w-12 rounded-full bg-slate-300 md:hidden" />
              <header className="flex items-start justify-between border-b border-line px-5 py-4 sm:px-6">
                <div>
                  <h2 id="record-sheet-title" className="font-display text-xl font-bold text-foreground">Thêm bản ghi</h2>
                  <p className="mt-1 text-sm text-muted">Các trường được tạo từ hàng tiêu đề của trang tính.</p>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSaving} aria-label="Đóng">
                  <X className="size-5" />
                </Button>
              </header>

              <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                <div className="space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
                  {headers.map((header, index) => (
                    <Input
                      key={`${header}-${index}`}
                      label={header}
                      type={inputType(header)}
                      value={values[index] ?? ''}
                      onChange={(event) =>
                        setValues((current) => current.map((value, itemIndex) => itemIndex === index ? event.target.value : value))
                      }
                      placeholder={`Nhập ${header.toLocaleLowerCase('vi')}`}
                      disabled={isSaving}
                    />
                  ))}
                </div>
                <footer className="safe-bottom border-t border-line bg-surface px-5 py-4 sm:px-6">
                  <p className="mb-3 flex items-center gap-2 text-xs text-muted">
                    <CheckCircle2 className="size-4 text-accent-500" />
                    Bản ghi sẽ được thêm vào hàng tiếp theo.
                  </p>
                  <div className="grid grid-cols-[auto_1fr] gap-3">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>Hủy</Button>
                    <Button type="submit" isLoading={isSaving}>Lưu vào Sheets</Button>
                  </div>
                </footer>
              </form>
            </motion.section>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
