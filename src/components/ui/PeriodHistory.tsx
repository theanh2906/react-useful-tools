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
  onEdit: (log: PeriodLog) => void;
  onDelete: (id: string) => void;
}

const PeriodHistory: React.FC<PeriodHistoryProps> = ({
  periodLogs,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();

  return (
    <Card className="bg-white/10 backdrop-blur-sm border border-white/10 p-5">
      <h3 className="font-display font-semibold text-white text-lg mb-4">
        {t('periodTracker.history')}
      </h3>
      {periodLogs.length === 0 ? (
        <p className="text-slate-500 text-sm">{t('periodTracker.noLogs')}</p>
      ) : (
        <ul className="space-y-3 max-h-80 overflow-y-auto scrollbar-hide">
          {periodLogs.slice(0, 10).map((log) => (
            <motion.li
              key={log.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 group"
            >
              <div>
                <p className="text-sm font-medium text-white">
                  {format(parseISO(log.startDate), 'MMM d, yyyy')}
                  {log.endDate && ` — ${format(parseISO(log.endDate), 'MMM d')}`}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {log.flowIntensity && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300">
                      {t(`periodTracker.flow.${log.flowIntensity}`)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEdit(log)}
                  className="p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDelete(log.id)}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export default PeriodHistory;
