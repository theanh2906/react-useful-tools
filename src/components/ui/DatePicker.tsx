/**
 * @module DatePicker
 * @description Custom date picker component with calendar dropdown, year/month navigation,
 * and portal-based positioning.
 */
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Props for the {@link DatePicker} component.
 */
interface DatePickerProps {
  /** Optional label displayed above the input. */
  label?: string;
  /** Currently selected date in ISO format (YYYY-MM-DD). */
  value?: string;
  /** Callback fired when the user selects a date. Receives an ISO date string. */
  onChange: (date: string) => void;
  /** Placeholder text when no date is selected. */
  placeholder?: string;
  /** Error message shown below the input. */
  error?: string;
  /** Earliest selectable date (ISO format). */
  minDate?: string;
  /** Latest selectable date (ISO format). */
  maxDate?: string;
  /** Force the calendar dropdown to open upward. */
  dropUp?: boolean;
  /** Show the calendar centred on screen instead of anchored to the input. */
  centered?: boolean;
}

/** Abbreviated day-of-week headers for the calendar grid. */
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
/** Full month names for display in the calendar header. */
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * Formats a `Date` object into an ISO date string (`YYYY-MM-DD`).
 *
 * @param date - The date to format.
 * @returns ISO date string.
 */

const formatDateToISO = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Custom date picker with a calendar dropdown.
 * Supports min/max date constraints, year/month navigation, and portal-based positioning.
 *
 * @param props - {@link DatePickerProps}
 */
export const DatePicker = ({
  label,
  value,
  onChange,
  placeholder = 'Select date',
  error,
  minDate,
  maxDate,
  dropUp: forceDropUp,
  centered = false,
}: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropUp, setDropUp] = useState(forceDropUp ?? true); // Default to drop up for better UX in modals
  const [viewDate, setViewDate] = useState(() => {
    if (value) return new Date(value);
    return new Date();
  });
  const [calendarPosition, setCalendarPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto detect drop direction based on available space
  useEffect(() => {
    if (forceDropUp !== undefined) {
      setDropUp(forceDropUp);
      return;
    }

    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const calendarHeight = 400; // Approximate calendar height

      // If not enough space below but enough above, drop up
      if (spaceBelow < calendarHeight && spaceAbove > calendarHeight) {
        setDropUp(true);
      } else if (spaceBelow >= calendarHeight) {
        setDropUp(false);
      } else {
        // Default to drop up in tight spaces (better for modals)
        setDropUp(true);
      }
    }
  }, [isOpen, forceDropUp]);

  // Update calendar position when opened
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCalendarPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        (!contentRef.current || !contentRef.current.contains(e.target as Node))
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedDate = value ? new Date(value) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Get days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // Get previous month days to fill
  const prevMonthDays = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleSelectDate = (day: number) => {
    const date = new Date(year, month, day);
    const dateStr = formatDateToISO(date);

    // Check min/max constraints
    if (minDate && dateStr < minDate) return;
    if (maxDate && dateStr > maxDate) return;

    onChange(dateStr);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  const handleToday = () => {
    const todayStr = formatDateToISO(new Date());
    onChange(todayStr);
    setViewDate(new Date());
    setIsOpen(false);
  };

  const isDateDisabled = (day: number) => {
    const dateStr = formatDateToISO(new Date(year, month, day));
    if (minDate && dateStr < minDate) return true;
    if (maxDate && dateStr > maxDate) return true;
    return false;
  };

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Generate calendar grid
  const calendarDays = [];

  // Previous month days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
      isPrevMonth: true,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: true,
      isPrevMonth: false,
    });
  }

  // Next month days to fill remaining
  const remainingDays = 42 - calendarDays.length;
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: false,
      isPrevMonth: false,
    });
  }

  return (
    <div className="space-y-2" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-slate-300">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-left',
            'flex items-center justify-between gap-2',
            'focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20',
            'transition-all duration-200',
            isOpen && 'border-primary-500/50 ring-2 ring-primary-500/20',
            error && 'border-red-500/50'
          )}
        >
          <span className={cn(value ? 'text-white' : 'text-slate-400')}>
            {value ? formatDisplayDate(value) : placeholder}
          </span>
          <div className="flex items-center gap-2">
            {value && (
              <div
                role="button"
                onClick={handleClear}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-400 hover:text-white" />
              </div>
            )}
            <Calendar className="w-5 h-5 text-slate-400" />
          </div>
        </button>

        {createPortal(
          <AnimatePresence>
            {isOpen && (
              <>
                {centered && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                    style={{ zIndex: 9998 }}
                    onClick={() => setIsOpen(false)}
                  />
                )}
                <motion.div
                  ref={contentRef}
                  initial={
                    centered
                      ? { opacity: 0, scale: 0.95, x: '-50%', y: '-40%' }
                      : { opacity: 0, scale: 0.95, y: dropUp ? 10 : -10 }
                  }
                  animate={
                    centered
                      ? { opacity: 1, scale: 1, x: '-50%', y: '-50%' }
                      : { opacity: 1, scale: 1, y: 0 }
                  }
                  exit={
                    centered
                      ? { opacity: 0, scale: 0.95, x: '-50%', y: '-40%' }
                      : { opacity: 0, scale: 0.95, y: dropUp ? 10 : -10 }
                  }
                  transition={{ duration: centered ? 0.2 : 0.15 }}
                  style={
                    centered
                      ? {
                          position: 'fixed',
                          top: '50%',
                          left: '50%',
                          zIndex: 9999,
                          width: '90%',
                          maxWidth: '340px',
                        }
                      : {
                          position: 'absolute',
                          top: dropUp
                            ? 'auto'
                            : `${calendarPosition.top + 8}px`,
                          bottom: dropUp
                            ? `${document.documentElement.scrollHeight - calendarPosition.top + 8}px`
                            : 'auto',
                          left: `${Math.min(calendarPosition.left, window.innerWidth - 310)}px`,
                          minWidth: Math.max(calendarPosition.width, 300),
                          zIndex: 9999,
                        }
                  }
                  className={cn(
                    'p-4 bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl'
                  )}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-slate-400" />
                    </button>

                    <h3 className="text-lg font-semibold text-white">
                      {MONTHS[month]} {year}
                    </h3>

                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>

                  {/* Day names */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {DAYS.map((day) => (
                      <div
                        key={day}
                        className="text-center text-xs font-medium text-slate-500 py-2"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((item, index) => {
                      const isSelected =
                        selectedDate &&
                        item.isCurrentMonth &&
                        selectedDate.getDate() === item.day &&
                        selectedDate.getMonth() === month &&
                        selectedDate.getFullYear() === year;

                      const isToday =
                        item.isCurrentMonth &&
                        today.getDate() === item.day &&
                        today.getMonth() === month &&
                        today.getFullYear() === year;

                      const disabled =
                        item.isCurrentMonth && isDateDisabled(item.day);

                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() =>
                            item.isCurrentMonth &&
                            !disabled &&
                            handleSelectDate(item.day)
                          }
                          disabled={!item.isCurrentMonth || disabled}
                          className={cn(
                            'relative aspect-square flex items-center justify-center text-sm rounded-xl transition-all duration-200',
                            item.isCurrentMonth
                              ? 'text-white hover:bg-white/10'
                              : 'text-slate-600',
                            isSelected &&
                              'bg-gradient-to-br from-primary-500 to-pink-500 text-white font-semibold shadow-lg shadow-primary-500/25',
                            isToday &&
                              !isSelected &&
                              'ring-2 ring-primary-500/50',
                            disabled &&
                              'opacity-30 cursor-not-allowed hover:bg-transparent'
                          )}
                        >
                          {item.day}
                        </button>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={handleClear}
                      className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={handleToday}
                      className="px-3 py-1.5 text-sm font-medium text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"
                    >
                      Today
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
};
