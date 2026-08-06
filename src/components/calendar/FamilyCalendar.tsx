'use client';

import { useMemo } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  BriefcaseBusiness,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  HeartPulse,
  List,
  MapPin,
  Plus,
  Stethoscope,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { EventData } from '@/types';

export type CalendarView = 'month' | 'week' | 'day';

interface FamilyCalendarProps {
  events: EventData[];
  selectedDate: Date;
  visibleMonth: Date;
  view: CalendarView;
  onSelectedDateChange: (date: Date) => void;
  onVisibleMonthChange: (date: Date) => void;
  onViewChange: (view: CalendarView) => void;
  onCreateEvent: (date: Date) => void;
  onEditEvent: (event: EventData) => void;
}

const WEEK_DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const CATEGORY_STYLE: Record<
  string,
  { dot: string; icon: string; surface: string; Icon: typeof CalendarDays }
> = {
  appointment: {
    dot: '#2f76ed',
    icon: 'text-blue-600',
    surface: 'bg-blue-50 dark:bg-blue-950/40',
    Icon: BriefcaseBusiness,
  },
  ultrasound: {
    dot: '#ef476f',
    icon: 'text-rose-600',
    surface: 'bg-rose-50 dark:bg-rose-950/40',
    Icon: HeartPulse,
  },
  checkup: {
    dot: '#13ad65',
    icon: 'text-emerald-600',
    surface: 'bg-emerald-50 dark:bg-emerald-950/40',
    Icon: Stethoscope,
  },
  other: {
    dot: '#f6a700',
    icon: 'text-amber-600',
    surface: 'bg-amber-50 dark:bg-amber-950/40',
    Icon: CalendarDays,
  },
};

const getCategoryStyle = (event: EventData) =>
  CATEGORY_STYLE[event.categories?.[0] || 'other'] || CATEGORY_STYLE.other;

const getDateKey = (date: Date) => format(date, 'yyyy-MM-dd');

const getEventTime = (event: EventData) => {
  if (event.allDay || !event.start.includes('T')) return 'Cả ngày';
  return event.start.split('T')[1]?.slice(0, 5) || 'Cả ngày';
};

export function FamilyCalendar({
  events,
  selectedDate,
  visibleMonth,
  view,
  onSelectedDateChange,
  onVisibleMonthChange,
  onViewChange,
  onCreateEvent,
  onEditEvent,
}: FamilyCalendarProps) {
  const eventsByDate = useMemo(() => {
    const map = new Map<string, EventData[]>();
    events.forEach((event) => {
      const dateKey = event.start.slice(0, 10);
      map.set(dateKey, [...(map.get(dateKey) || []), event]);
    });
    map.forEach((dateEvents) =>
      dateEvents.sort((a, b) => a.start.localeCompare(b.start))
    );
    return map;
  }, [events]);

  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(visibleMonth);
    return eachDayOfInterval({
      start: startOfWeek(monthStart, { weekStartsOn: 1 }),
      end: endOfWeek(endOfMonth(monthStart), { weekStartsOn: 1 }),
    });
  }, [visibleMonth]);

  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    return eachDayOfInterval({
      start: weekStart,
      end: endOfWeek(weekStart, { weekStartsOn: 1 }),
    });
  }, [selectedDate]);

  const selectedEvents = eventsByDate.get(getDateKey(selectedDate)) || [];

  const selectDate = (date: Date) => {
    onSelectedDateChange(date);
    if (!isSameMonth(date, visibleMonth)) {
      onVisibleMonthChange(startOfMonth(date));
    }
  };

  const goToToday = () => {
    const today = new Date();
    onSelectedDateChange(today);
    onVisibleMonthChange(startOfMonth(today));
  };

  const changeMonth = (direction: 'previous' | 'next') => {
    const nextMonth =
      direction === 'previous'
        ? subMonths(visibleMonth, 1)
        : addMonths(visibleMonth, 1);
    onVisibleMonthChange(nextMonth);
    onSelectedDateChange(startOfMonth(nextMonth));
  };

  const renderDots = (day: Date) => {
    const dayEvents = eventsByDate.get(getDateKey(day)) || [];
    const colors = Array.from(
      new Set(dayEvents.map((event) => getCategoryStyle(event).dot))
    ).slice(0, 3);

    return (
      <span className="flex h-2 items-center justify-center gap-1" aria-hidden="true">
        {colors.map((color) => (
          <span
            key={color}
            className="size-1.5 rounded-full sm:size-2"
            style={{ backgroundColor: color }}
          />
        ))}
      </span>
    );
  };

  return (
    <section className="overflow-hidden rounded-lg border border-line bg-elevated shadow-sm">
      <div className="border-b border-line px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase text-accent-600">Lịch gia đình</p>
            <h1 className="mt-1 text-xl font-bold text-foreground sm:text-2xl">
              Tháng {visibleMonth.getMonth() + 1}, {visibleMonth.getFullYear()}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => onCreateEvent(selectedDate)}
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white shadow-md transition-colors hover:bg-primary-600 sm:size-14"
            aria-label="Tạo sự kiện"
          >
            <Plus className="size-6" />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 sm:mt-5">
          <button
            type="button"
            onClick={() => changeMonth('previous')}
            className="btn-icon border border-line bg-elevated"
            aria-label="Tháng trước"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={goToToday}
            className="min-h-10 flex-1 rounded-md border border-line bg-elevated px-4 text-sm font-semibold text-foreground transition-colors hover:bg-surface sm:max-w-36"
          >
            Hôm nay
          </button>
          <button
            type="button"
            onClick={() => changeMonth('next')}
            className="btn-icon border border-line bg-elevated"
            aria-label="Tháng sau"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>

      <div className="px-2 pt-3 sm:px-5 sm:pt-5">
        {view === 'month' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-7 border-b border-line pb-2">
              {WEEK_DAYS.map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-muted sm:text-sm">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {monthDays.map((day) => {
                const selected = isSameDay(day, selectedDate);
                const inMonth = isSameMonth(day, visibleMonth);
                const eventCount = (eventsByDate.get(getDateKey(day)) || []).length;
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => selectDate(day)}
                    className={cn(
                      'flex min-h-[62px] flex-col items-center justify-center gap-1 border-b border-line text-sm transition-colors hover:bg-surface sm:min-h-[82px] sm:text-base',
                      !inMonth && 'text-slate-400',
                      inMonth && 'text-foreground'
                    )}
                    aria-label={`${format(day, 'EEEE, d MMMM yyyy', { locale: vi })}${eventCount ? `, ${eventCount} sự kiện` : ''}`}
                    aria-pressed={selected}
                  >
                    <span
                      className={cn(
                        'flex size-8 items-center justify-center rounded-full font-semibold sm:size-9',
                        selected && 'bg-primary-500 text-white shadow-sm'
                      )}
                    >
                      {day.getDate()}
                    </span>
                    {renderDots(day)}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {view === 'week' && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-7 gap-1 pb-5"
          >
            {weekDays.map((day, index) => {
              const selected = isSameDay(day, selectedDate);
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => selectDate(day)}
                  className={cn(
                    'flex min-h-24 flex-col items-center justify-center gap-2 rounded-md border text-xs transition-colors',
                    selected
                      ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950/30'
                      : 'border-line bg-elevated text-muted hover:bg-surface'
                  )}
                >
                  <span className="font-semibold">{WEEK_DAYS[index]}</span>
                  <span className="text-lg font-bold">{day.getDate()}</span>
                  {renderDots(day)}
                </button>
              );
            })}
          </motion.div>
        )}

        {view === 'day' && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex min-h-36 items-center gap-5 border-b border-line px-3 py-5"
          >
            <div className="flex size-20 shrink-0 flex-col items-center justify-center rounded-lg bg-primary-50 text-primary-700 dark:bg-primary-950/30">
              <span className="text-xs font-semibold uppercase">
                {format(selectedDate, 'EEE', { locale: vi })}
              </span>
              <span className="text-3xl font-bold">{selectedDate.getDate()}</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {format(selectedDate, 'EEEE', { locale: vi })}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {format(selectedDate, "'Ngày' d 'tháng' M, yyyy", { locale: vi })}
              </p>
              <p className="mt-2 text-sm font-medium text-accent-600">
                {selectedEvents.length} sự kiện
              </p>
            </div>
          </motion.div>
        )}
      </div>

      <div className="border-b border-line px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <CalendarDays className="size-5 shrink-0 text-accent-600" />
            <div className="min-w-0">
              <h2 className="truncate text-base font-bold text-foreground">
                {format(selectedDate, "EEEE, 'ngày' d 'tháng' M", { locale: vi })}
              </h2>
              <p className="text-xs text-muted">{selectedEvents.length} lịch trình</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onCreateEvent(selectedDate)}
            className="shrink-0 text-sm font-semibold text-accent-600 hover:text-accent-700"
          >
            Thêm lịch
          </button>
        </div>
      </div>

      <div className="divide-y divide-line">
        {selectedEvents.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <CalendarDays className="mx-auto size-9 text-slate-300" />
            <p className="mt-3 font-semibold text-foreground">Ngày này đang trống</p>
            <p className="mt-1 text-sm text-muted">Thêm một lịch trình cho gia đình.</p>
          </div>
        ) : (
          selectedEvents.map((event) => {
            const style = getCategoryStyle(event);
            const EventIcon = style.Icon;
            return (
              <button
                key={event.id}
                type="button"
                onClick={() => onEditEvent(event)}
                className="grid w-full grid-cols-[64px_1fr] gap-3 px-4 py-5 text-left transition-colors hover:bg-surface sm:grid-cols-[76px_1fr] sm:px-6"
              >
                <div className="pt-1 text-sm font-semibold text-foreground">
                  {getEventTime(event)}
                </div>
                <div className="flex min-w-0 gap-3">
                  <span
                    className="mt-2 size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: style.dot }}
                  />
                  <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-full', style.surface)}>
                    <EventIcon className={cn('size-5', style.icon)} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="truncate font-semibold text-foreground">{event.title}</span>
                      {event.isImportant && (
                        <span className="shrink-0 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700 dark:bg-amber-950/40">
                          Quan trọng
                        </span>
                      )}
                    </span>
                    {event.notes && (
                      <span className="mt-1 block line-clamp-1 text-sm text-muted">{event.notes}</span>
                    )}
                    {event.location && (
                      <span className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                        <MapPin className="size-3.5" />
                        <span className="truncate">{event.location}</span>
                      </span>
                    )}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>

      <div className="sticky bottom-0 border-t border-line bg-elevated/95 p-3 backdrop-blur sm:px-6">
        <div className="grid grid-cols-3 rounded-lg border border-line bg-background p-1">
          {([
            ['month', 'Tháng', CalendarDays],
            ['week', 'Tuần', Clock3],
            ['day', 'Ngày', List],
          ] as const).map(([viewId, label, Icon]) => (
            <button
              key={viewId}
              type="button"
              onClick={() => onViewChange(viewId)}
              className={cn(
                'flex min-h-10 items-center justify-center gap-2 rounded-md text-sm font-semibold transition-colors',
                view === viewId
                  ? 'bg-primary-50 text-primary-700 shadow-sm dark:bg-primary-950/40'
                  : 'text-muted hover:bg-surface hover:text-foreground'
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
