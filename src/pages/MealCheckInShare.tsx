/**
 * @module MealCheckInShare
 * @description Public read-only view of a meal check-in page, accessible via share token.
 * No authentication required. Write operations are not available.
 */
import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { addDays, eachDayOfInterval, format, isWithinInterval } from 'date-fns';
import { CheckCircle, Calendar as CalendarIcon, Eye, AlertTriangle } from 'lucide-react';

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

export default function MealCheckInShare() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(true);
  const [isInvalid, setIsInvalid] = useState(false);
  const [checkIns, setCheckIns] = useState<MealCheckIn[]>([]);
  const [cycleConfig, setCycleConfig] = useState<MealCheckInCycleConfig | null>(null);
  const [cycleStats, setCycleStats] = useState<MealCheckInCycleStats | null>(null);
  const [selectedCheckIn, setSelectedCheckIn] = useState<MealCheckIn | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    if (!shareToken) {
      setIsInvalid(true);
      setIsLoading(false);
      return;
    }

    const load = async () => {
      try {
        const userId = await mealCheckInService.getUserIdByShareToken(shareToken);
        if (!userId) {
          setIsInvalid(true);
          return;
        }

        const config = await mealCheckInService.getCycleConfig(userId);
        if (!config) {
          setIsInvalid(true);
          return;
        }
        setCycleConfig(config);

        const endDate = format(
          addDays(new Date(config.startDate + 'T00:00:00'), config.cycleDays - 1),
          'yyyy-MM-dd'
        );

        const [records, stats] = await Promise.all([
          mealCheckInService.getCheckInsByDateRange(userId, config.startDate, endDate),
          mealCheckInService.getCycleStats(userId, config.startDate, endDate, config.cycleDays),
        ]);

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
    if (!cycleConfig) return true;
    const cycleStart = new Date(cycleConfig.startDate + 'T00:00:00');
    const cycleEnd = addDays(cycleStart, cycleConfig.cycleDays - 1);
    return !isWithinInterval(date, { start: cycleStart, end: cycleEnd });
  };

  const currentMonthDates = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  }, []);

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Spinner />
      </div>
    );
  }

  if (isInvalid) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-900 p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-yellow-500" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          {t('mealCheckIn.invalidShareLink')}
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Read-only banner */}
        <div className="mb-4 flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-lg px-4 py-2 text-sm">
          <Eye className="w-4 h-4 shrink-0" />
          <span>{t('mealCheckIn.readOnlyDescription')}</span>
        </div>

        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('mealCheckIn.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('mealCheckIn.description')}
          </p>
        </div>

        {/* Stats Card */}
        {cycleStats && (
          <Card className="p-6 mb-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Cycle Progress
                </h3>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {cycleStats.checkedInDays} / {cycleStats.totalCycleDays}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {cycleStats.percentage}% {t('mealCheckIn.complete')}
                </p>
              </div>
              <div className="h-20 w-20 rounded-full border-4 border-green-600 dark:border-green-400 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-green-600 dark:bg-green-400 h-full transition-all duration-500"
                style={{ width: `${cycleStats.percentage}%` }}
              />
            </div>
          </Card>
        )}

        {/* Calendar */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="w-6 h-6" />
              {cycleConfig && (
                <>
                  Current Cycle:{' '}
                  {format(
                    new Date(cycleConfig.startDate + 'T00:00:00'),
                    'MMM d, yyyy'
                  )}{' '}
                  -{' '}
                  {format(
                    addDays(
                      new Date(cycleConfig.startDate + 'T00:00:00'),
                      cycleConfig.cycleDays - 1
                    ),
                    'MMM d, yyyy'
                  )}
                </>
              )}
            </h2>
          </div>

          {/* Weekday labels */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekdayLabels.map((label) => (
              <div
                key={label}
                className="text-center text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 py-1"
              >
                {label}
              </div>
            ))}
          </div>

          {/* Calendar cells */}
          <div className="grid grid-cols-7 gap-2">
            {cycleConfig &&
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
                      ${today ? 'border-blue-500 dark:border-blue-400' : 'border-gray-200 dark:border-gray-700'}
                      ${checked ? 'bg-green-500 dark:bg-green-600 text-white' : 'bg-white dark:bg-gray-800'}
                      ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
                      ${clickable ? 'hover:shadow-md cursor-pointer hover:border-blue-400 dark:hover:border-blue-500' : 'cursor-default'}
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
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('mealCheckIn.date')}:{' '}
                <span className="font-semibold">{selectedCheckIn.date}</span>
              </p>

              <img
                src={selectedCheckIn.imageUrl}
                alt="Check-in"
                className="w-full rounded-lg"
              />

              {selectedCheckIn.notes && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {t('mealCheckIn.notes')}:
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
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
