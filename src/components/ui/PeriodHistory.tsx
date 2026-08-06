/**
 * @module PeriodHistory
 * @description Period log history list with edit/delete actions.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { Card } from '@/components/ui/Card';
import type { PeriodLog } from '@/types';
import { Settings, Trash2 } from 'lucide-react';

interface PeriodHistoryProps {
  periodLogs: PeriodLog[];
  onEdit?: (log: PeriodLog) => void;
  onDelete?: (id: string) => void;
  readOnly?: boolean;
}

const PeriodHistory: React.FC<PeriodHistoryProps> = ({
  periodLogs,
  onEdit,
  onDelete,
  readOnly = false,
}) => {
  const { t } = useTranslation();

  return (
    <Card className="border border-line bg-elevated p-5">
      <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
        {t('periodTracker.history')}
      </h3>
      {periodLogs.length === 0 ? (
        <p className="text-sm text-muted">{t('periodTracker.noLogs')}</p>
      ) : (
        <ul className="space-y-3 max-h-80 overflow-y-auto scrollbar-hide">
          {periodLogs.slice(0, 10).map((log) => (
            <motion.li
              key={log.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="group flex items-center justify-between rounded-lg border border-line bg-surface p-3"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {format(parseISO(log.startDate), 'MMM d, yyyy')}
                  {log.endDate && ` — ${format(parseISO(log.endDate), 'MMM d')}`}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {log.flowIntensity && (
                    <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs text-primary-700">
                      {t(`periodTracker.flow.${log.flowIntensity}`)}
                    </span>
                  )}
                </div>
              </div>
              {!readOnly && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit?.(log)}
                    className="rounded-md p-1.5 text-muted transition-colors hover:bg-elevated hover:text-accent-600"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete?.(log.id)}
                    className="rounded-md p-1.5 text-muted transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </motion.li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export default PeriodHistory;
