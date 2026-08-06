/**
 * @module MealCheckInShare
 * @description Public read-only view of a meal check-in page, accessible via share token.
 * No authentication required. Write operations are not available.
 */
import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameMonth,
  startOfMonth,
  subMonths,
} from 'date-fns';
import {
  CheckCircle,
  Calendar as CalendarIcon,
  Eye,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';
import { mealCheckInService } from '../services/mealCheckInService';
import type {
  MealCheckIn,
  MealCheckInCycleConfig,
  MealCheckInCycleStats,
} from '../types';
import {
  calculateMealCheckInCycleStats,
  getMealCheckInCycleForDate,
} from '../utils/mealCheckInCycles';

export default function MealCheckInShare() {
  const params = useParams();
  const shareToken = params?.shareToken as string | undefined;
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(true);
  const [isInvalid, setIsInvalid] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [checkIns, setCheckIns] = useState<MealCheckIn[]>([]);
  const [cycleConfig, setCycleConfig] =
    useState<MealCheckInCycleConfig | null>(null);
  const [cycleConfigs, setCycleConfigs] = useState<MealCheckInCycleConfig[]>([]);
  const [cycleStats, setCycleStats] =
    useState<MealCheckInCycleStats | null>(null);
  const [selectedCheckIn, setSelectedCheckIn] =
    useState<MealCheckIn | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    if (!shareToken) {
      setIsInvalid(true);
      setIsLoading(false);
      return;
    }

    const load = async () => {
      try {
        const userId =
          await mealCheckInService.getUserIdByShareToken(shareToken);
        if (!userId) {
          setIsInvalid(true);
          return;
        }

        const configs = await mealCheckInService.getCycleConfigs(userId);
        if (configs.length === 0) {
          setIsInvalid(true);
          return;
        }
        const latestConfig = configs[configs.length - 1];
        setCycleConfig(latestConfig);
        setCycleConfigs(configs);

        const records = await mealCheckInService.getCheckInsByDateRange(
          userId,
          '0000-01-01',
          '9999-12-31'
        );
        const stats = calculateMealCheckInCycleStats(configs, records);

        setCheckIns(records);
        setCycleStats(stats);
      } catch {
        setIsInvalid(true);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [shareToken]);

  const hasCheckIn = (dateStr: string): boolean =>
    checkIns.some((c) => c.date === dateStr);

  const isTodayDate = (date: Date): boolean =>
    format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  const isFutureDateObj = (date: Date): boolean =>
    format(date, 'yyyy-MM-dd') > format(new Date(), 'yyyy-MM-dd');

  const isOutsideCycleDate = (date: Date): boolean => {
    if (cycleConfigs.length === 0) return true;
    const dateStr = format(date, 'yyyy-MM-dd');
    const checked = hasCheckIn(dateStr);
    if (checked) return false;
    return getMealCheckInCycleForDate(dateStr, cycleConfigs) === null;
  };

  const currentMonthDates = useMemo(() => {
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  }, [viewDate]);

  const isCurrentMonth = useMemo(() => {
    return isSameMonth(viewDate, new Date());
  }, [viewDate]);

  const handlePrevMonth = () => {
    setViewDate((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setViewDate((prev) => addMonths(prev, 1));
  };

  const handleGoToToday = () => {
    setViewDate(new Date());
  };

  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const calendarCells = useMemo(() => {
    if (currentMonthDates.length === 0) return [] as Array<Date | null>;
    const firstDayOfWeek = currentMonthDates[0].getDay();
    const leadingEmpty = Array.from({ length: firstDayOfWeek }, () => null);
    const total = leadingEmpty.length + currentMonthDates.length;
    const trailingCount = total % 7 === 0 ? 0 : 7 - (total % 7);
    const trailingEmpty = Array.from({ length: trailingCount }, () => null);
    return [...leadingEmpty, ...currentMonthDates, ...trailingEmpty];
  }, [currentMonthDates]);

  const handleDayClick = (dateStr: string) => {
    const checkIn = checkIns.find((c) => c.date === dateStr);
    if (checkIn) {
      setSelectedCheckIn(checkIn);
      setShowImageModal(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }

  if (isInvalid) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-yellow-500" />
        <h2 className="text-xl font-semibold text-foreground">
          {t('mealCheckIn.invalidShareLink')}
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Read-only banner */}
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-accent-200 bg-accent-50 px-4 py-2 text-sm text-accent-700">
          <Eye className="w-4 h-4 shrink-0" />
          <span>{t('mealCheckIn.readOnlyDescription')}</span>
        </div>

        {/* Page header */}
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold text-foreground">
            {t('mealCheckIn.title')}
          </h1>
          <p className="text-muted">
            {t('mealCheckIn.description')}
          </p>
        </div>

        {/* Stats Card */}
        {cycleStats && (
          <Card className="mb-6 border-emerald-200 bg-emerald-50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="mb-1 text-lg font-semibold text-foreground">
                  All Cycles Progress
                </h3>
                <p className="text-3xl font-bold text-emerald-600">
                  {cycleStats.checkedInDays} / {cycleStats.totalCycleDays}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {cycleStats.percentage}% {t('mealCheckIn.complete')}
                </p>
              </div>
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-emerald-500 bg-elevated">
                <CheckCircle className="h-10 w-10 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-emerald-100">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${cycleStats.percentage}%` }}
              />
            </div>
          </Card>
        )}

        {/* Calendar */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                <CalendarIcon className="h-6 w-6 text-accent-500" />
                {format(viewDate, 'MMMM yyyy')}
              </h2>
              {cycleConfig && (
                <p className="text-xs text-muted">
                  Cycles: {cycleConfigs.length} · Latest started:{' '}
                  {format(
                    new Date(cycleConfig.startDate + 'T00:00:00'),
                    'MMM d, yyyy'
                  )}
                </p>
              )}
            </div>

            <div className="flex items-center rounded-lg border border-line bg-surface p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {!isCurrentMonth && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGoToToday}
                  className="h-8 px-2 text-xs"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Today
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNextMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Weekday labels */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekdayLabels.map((label) => (
              <div
                key={label}
                className="py-1 text-center text-xs font-semibold text-muted sm:text-sm"
              >
                {label}
              </div>
            ))}
          </div>

          {/* Calendar cells */}
          <div className="grid grid-cols-7 gap-2">
            {cycleConfigs.length > 0 &&
              calendarCells.map((dateObj, index) => {
                if (!dateObj) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="aspect-square rounded-lg border border-transparent"
                      aria-hidden="true"
                    />
                  );
                }

                const dateStr = format(dateObj, 'yyyy-MM-dd');
                const checked = hasCheckIn(dateStr);
                const today = isTodayDate(dateObj);
                const future = isFutureDateObj(dateObj);
                const outsideCycle = isOutsideCycleDate(dateObj);
                const disabled = future || outsideCycle;
                const clickable = checked && !disabled;

                return (
                  <button
                    key={dateStr}
                    onClick={() => clickable && handleDayClick(dateStr)}
                    disabled={!clickable}
                    className={`
                      aspect-square rounded-lg border-2 transition-all duration-200
                      ${today ? 'border-accent-500' : 'border-line'}
                      ${checked ? 'bg-emerald-500 text-white' : 'bg-elevated text-foreground'}
                      ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
                      ${clickable ? 'cursor-pointer hover:border-accent-400 hover:bg-accent-50 hover:shadow-md' : 'cursor-default'}
                      relative flex items-center justify-center p-2
                    `}
                  >
                    <span className="text-lg font-semibold">{dateObj.getDate()}</span>
                    {checked && (
                      <CheckCircle className="w-4 h-4 absolute bottom-1 right-1 hidden sm:block" />
                    )}
                  </button>
                );
              })}
          </div>
        </Card>

        {/* View Image Modal — read-only (no Delete button) */}
        <Modal
          isOpen={showImageModal}
          onClose={() => {
            setShowImageModal(false);
            setSelectedCheckIn(null);
          }}
          title={t('mealCheckIn.viewCheckIn')}
        >
          {selectedCheckIn && (
            <div className="space-y-4">
              <p className="text-sm text-muted">
                {t('mealCheckIn.date')}:{' '}
                <span className="font-semibold">{selectedCheckIn.date}</span>
              </p>

              {selectedCheckIn.imageUrl && (
                <img
                  src={selectedCheckIn.imageUrl}
                  alt="Check-in"
                  className="w-full rounded-lg"
                />
              )}

              {selectedCheckIn.notes && (
                <div>
                  <h4 className="mb-2 font-semibold text-foreground">
                    {t('mealCheckIn.notes')}:
                  </h4>
                  <p className="rounded-lg bg-surface p-3 text-foreground">
                    {selectedCheckIn.notes}
                  </p>
                </div>
              )}

              <Button
                onClick={() => {
                  setShowImageModal(false);
                  setSelectedCheckIn(null);
                }}
                variant="ghost"
                className="w-full"
              >
                {t('common.close')}
              </Button>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
