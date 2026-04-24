/**
 * @module components/ui/PeriodCalendar
 * @description Mini calendar component for the Period Tracker page.
 * Renders a month view with color-coded cells for period, fertile window, and ovulation days.
 */
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  getDay,
  isSameMonth,
  isWithinInterval,
  parseISO,
  addMonths,
  subMonths,
  isSameDay,
} from 'date-fns';
import { cn } from '@/lib/utils';
import type { PeriodLog, CyclePrediction } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PeriodCalendarProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  periodLogs: PeriodLog[];
  prediction: CyclePrediction | null;
  onDateClick?: (date: Date) => void;
}

/** Day type for calendar cell coloring. */
type DayType = 'period' | 'predicted-period' | null;

const PeriodCalendar: React.FC<PeriodCalendarProps> = ({
  currentMonth,
  onMonthChange,
  periodLogs,
  prediction,
  onDateClick,
}) => {
  const { t } = useTranslation();

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  }, [currentMonth]);

  const startDayOffset = getDay(startOfMonth(currentMonth));

  const getDayType = (date: Date): DayType => {
    for (const log of periodLogs) {
      const start = parseISO(log.startDate);
      const end = log.endDate ? parseISO(log.endDate) : start;
      if (isWithinInterval(date, { start, end }) || isSameDay(date, start) || isSameDay(date, end)) {
        return 'period';
      }
    }

    if (prediction) {
      const predStart = parseISO(prediction.nextPeriodStart);
      const predEnd = parseISO(prediction.nextPeriodEnd);
      if (isWithinInterval(date, { start: predStart, end: predEnd })) return 'predicted-period';
    }

    return null;
  };

  const dayTypeStyles: Record<string, string> = {
    period: 'bg-pink-500/80 text-white',
    'predicted-period': 'bg-pink-500/30 text-pink-300 border border-pink-500/40 border-dashed',
  };

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onMonthChange(subMonths(currentMonth, 1))}
          className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="font-display font-semibold text-white text-lg">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button
          onClick={() => onMonthChange(addMonths(currentMonth, 1))}
          className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-slate-500 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startDayOffset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map((date) => {
          const dayType = getDayType(date);
          const isToday = isSameDay(date, new Date());

          return (
            <motion.button
              key={format(date, 'yyyy-MM-dd')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDateClick?.(date)}
              className={cn(
                'aspect-square flex items-center justify-center rounded-lg text-sm transition-all relative',
                !isSameMonth(date, currentMonth) && 'opacity-30',
                isToday && !dayType && 'ring-1 ring-primary-500 text-white',
                dayType ? dayTypeStyles[dayType] : 'text-slate-400 hover:bg-white/5',
              )}
            >
              {format(date, 'd')}
              {isToday && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-primary-400" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-white/5">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-3 h-3 rounded-sm bg-pink-500/80" />
          {t('periodTracker.period')}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-3 h-3 rounded-sm bg-pink-500/30 border border-pink-500/40 border-dashed" />
          {t('periodTracker.predicted')}
        </div>
      </div>
    </div>
  );
};

export default PeriodCalendar;
