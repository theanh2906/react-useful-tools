'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ThemeOptions } from './ThemeOptions';
import { cn } from '@/lib/utils';

/** Non-modal toolbar popover; palette changes remain visible while choosing. */
export function ThemePicker() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 72, right: 16 });
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();
  const titleId = `${id}-title`;

  useEffect(() => {
    if (!open) return;

    const place = () => {
      const bounds = trigger.current?.getBoundingClientRect();
      if (!bounds) return;
      const width = Math.min(340, window.innerWidth - 32);
      const right = Math.min(Math.max(16, window.innerWidth - bounds.right), window.innerWidth - width - 16);
      setPosition({ top: bounds.bottom + 10, right });
    };
    const dismiss = (event: PointerEvent | FocusEvent) => {
      const target = event.target as Node;
      if (!panel.current?.contains(target) && !trigger.current?.contains(target)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Tab' && panel.current?.contains(event.target as Node)) {
        setOpen(false);
        // Continue normal tab order from the toolbar, outside the portal.
        trigger.current?.focus();
        return;
      }
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      trigger.current?.focus();
    };

    place();
    window.addEventListener('resize', place);
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('focusin', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      window.removeEventListener('resize', place);
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('focusin', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={t('settings.chooseTheme')}
        title={t('settings.chooseTheme')}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        className={cn('btn-icon shrink-0', open && 'bg-accent-50 text-accent-600')}
      >
        <Palette aria-hidden="true" className="size-5" />
      </button>
      {open && createPortal(
        <div
          ref={panel}
          id={id}
          role="dialog"
          aria-labelledby={titleId}
          className="fixed z-[100] w-[340px] max-w-[calc(100vw-32px)] overflow-y-auto rounded-xl border border-line bg-overlay p-4 text-foreground shadow-xl"
          style={{ ...position, maxHeight: `calc(100dvh - ${position.top + 16}px)` }}
        >
          <div className="mb-1 flex items-center gap-2">
            <Palette aria-hidden="true" className="size-4 text-accent-600" />
            <h2 id={titleId} className="text-sm font-semibold">{t('settings.theme')}</h2>
          </div>
          <p className="mb-4 text-xs leading-5 text-muted">{t('settings.themeHint')}</p>
          <ThemeOptions autoFocus labelledBy={titleId} />
        </div>,
        document.body
      )}
    </>
  );
}
