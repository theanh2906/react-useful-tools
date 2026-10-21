'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { APP_THEMES, resolveThemeId, type ThemeId } from '@/config/themes';
import { useAppStore } from '@/stores/appStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

interface ThemeOptionsProps {
  autoFocus?: boolean;
  className?: string;
  labelledBy?: string;
}

/** Shared palette choices for the toolbar and appearance settings. */
export function ThemeOptions({ autoFocus = false, className, labelledBy }: ThemeOptionsProps) {
  const { t } = useTranslation();
  const theme = useAppStore((state) => state.theme);
  const updateSettings = useSettingsStore((state) => state.updateSettings);
  const [prefersDark, setPrefersDark] = useState(false);
  const choices = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedId = resolveThemeId(theme, prefersDark);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => setPrefersDark(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (autoFocus) {
      const current = resolveThemeId(useAppStore.getState().theme, window.matchMedia('(prefers-color-scheme: dark)').matches);
      choices.current[APP_THEMES.findIndex((option) => option.id === current)]?.focus();
    }
  }, [autoFocus]);

  const choose = (id: ThemeId) => {
    void updateSettings({ theme: id }).catch(() => {
      toast.error(t('settings.themeSaveError'));
    });
  };

  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : t('settings.theme')}
      className={cn('grid grid-cols-2 gap-3', className)}
    >
      {APP_THEMES.map((option, index) => {
        const selected = selectedId === option.id;
        const Icon = option.mode === 'dark' ? Moon : Sun;
        const colors = option.colors;

        return (
          <button
            key={option.id}
            ref={(element) => { choices.current[index] = element; }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => choose(option.id)}
            onKeyDown={(event) => {
              let next: number;
              if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % APP_THEMES.length;
              else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + APP_THEMES.length - 1) % APP_THEMES.length;
              else if (event.key === 'Home') next = 0;
              else if (event.key === 'End') next = APP_THEMES.length - 1;
              else return;
              event.preventDefault();
              choose(APP_THEMES[next].id);
              choices.current[next]?.focus();
            }}
            className={cn(
              'relative min-w-0 rounded-lg border p-2.5 text-left transition-colors',
              selected
                ? 'border-accent-500 bg-accent-50 ring-1 ring-accent-500'
                : 'border-line bg-elevated hover:border-accent-300 hover:bg-surface'
            )}
          >
            <span
              aria-hidden="true"
              className="mb-2.5 flex h-16 overflow-hidden rounded-md border"
              style={{ backgroundColor: colors.background, borderColor: colors.border }}
            >
              <span className="flex w-1/4 flex-col gap-1.5 border-r p-2" style={{ backgroundColor: colors.chrome, borderColor: colors.border }}>
                <span className="mb-1 size-2.5 rounded-sm" style={{ backgroundColor: colors.primary }} />
                <span className="h-1 rounded-full" style={{ backgroundColor: colors.accent }} />
                <span className="h-1 rounded-full opacity-40" style={{ backgroundColor: colors.muted }} />
                <span className="h-1 rounded-full opacity-40" style={{ backgroundColor: colors.muted }} />
              </span>
              <span className="flex flex-1 flex-col gap-2 p-2">
                <span className="h-1 w-1/2 rounded-full" style={{ backgroundColor: colors.foreground }} />
                <span className="flex flex-1 gap-1.5">
                  <span className="flex-1 rounded-sm border" style={{ backgroundColor: colors.elevated, borderColor: colors.border }} />
                  <span className="flex-1 rounded-sm" style={{ backgroundColor: colors.surface }} />
                </span>
                <span className="h-1 w-2/3 rounded-full opacity-60" style={{ backgroundColor: colors.accent }} />
              </span>
            </span>
            {selected && (
              <span className="absolute right-4 top-4 flex size-5 items-center justify-center rounded-full bg-accent-500 text-white shadow-sm">
                <Check aria-hidden="true" className="size-3" />
              </span>
            )}
            <span className="block text-xs font-semibold leading-5 text-foreground">{option.name}</span>
            <span className="mt-0.5 flex items-center gap-1 text-[11px] text-muted">
              <Icon aria-hidden="true" className="size-3" />
              {t(option.mode === 'dark' ? 'settings.dark' : 'settings.light')}
            </span>
          </button>
        );
      })}
    </div>
  );
}
