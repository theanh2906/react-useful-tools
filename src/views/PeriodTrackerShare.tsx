/**
 * @module PeriodTrackerShare
 * @description Public read-only view of a period tracking page, accessible via share token.
 * No authentication required. Write operations are not available.
 */
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { format, parseISO, differenceInDays, addDays } from 'date-fns';
import { Heart, Calendar as CalendarIcon, Eye, AlertTriangle, Activity, Droplets } from 'lucide-react';
import { motion } from 'framer-motion';

import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import PeriodCalendar from '@/components/ui/PeriodCalendar';
import PeriodHistory from '@/components/ui/PeriodHistory';
import {
  getUserIdByShareToken,
  fetchSharedPeriodLogs,
  fetchSharedCycleSettings,
} from '@/services/periodService';
import type { PeriodLog, CycleSettings, CyclePrediction } from '@/types';

export default function PeriodTrackerShare() {
  const params = useParams();
  const shareToken = params?.shareToken as string | undefined;
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(true);
  const [isInvalid, setIsInvalid] = useState(false);
  const [periodLogs, setPeriodLogs] = useState<PeriodLog[]>([]);
  const [cycleSettings, setCycleSettings] = useState<CycleSettings | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (!shareToken) {
      setIsInvalid(true);
      setIsLoading(false);
      return;
    }

    const loadSharedData = async () => {
      try {
        const userId = await getUserIdByShareToken(shareToken);
        if (!userId) {
          setIsInvalid(true);
          return;
        }

        const settings = await fetchSharedCycleSettings(userId);
        if (!settings) {
          setIsInvalid(true);
          return;
        }
        setCycleSettings(settings);

        const logs = await fetchSharedPeriodLogs(userId);
        const sorted = [...logs].sort(
          (a, b) => parseISO(b.startDate).getTime() - parseISO(a.startDate).getTime()
        );
        setPeriodLogs(sorted);
      } catch (error) {
        console.error('Error loading shared period tracker data:', error);
        setIsInvalid(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadSharedData();
  }, [shareToken]);

  // Pure calculation helpers matching periodStore
  const getAverageCycleLength = () => {
    if (!cycleSettings) return 28;
    if (periodLogs.length < 2) return cycleSettings.averageCycleLength;

    const sorted = [...periodLogs].sort(
      (a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime()
    );

    let totalDays = 0;
    let count = 0;
    for (let i = 1; i < sorted.length; i++) {
      const gap = differenceInDays(
        parseISO(sorted[i].startDate),
        parseISO(sorted[i - 1].startDate)
      );
      if (gap > 15 && gap < 60) {
        totalDays += gap;
        count++;
      }
    }

    return count > 0 ? Math.round(totalDays / count) : cycleSettings.averageCycleLength;
  };

  const getPrediction = (avgCycle: number): CyclePrediction | null => {
    if (!cycleSettings || periodLogs.length === 0) return null;

    const lastLog = periodLogs[0];
    const avgPeriod = cycleSettings.averagePeriodLength;

    const nextStart = addDays(parseISO(lastLog.startDate), avgCycle);
    const nextEnd = addDays(nextStart, avgPeriod - 1);

    return {
      nextPeriodStart: format(nextStart, 'yyyy-MM-dd'),
      nextPeriodEnd: format(nextEnd, 'yyyy-MM-dd'),
    };
  };

  const getCurrentCycleDay = () => {
    if (periodLogs.length === 0) return null;

    const lastLog = periodLogs[0];
    const today = new Date();
    const daysSinceStart = differenceInDays(today, parseISO(lastLog.startDate));

    return daysSinceStart >= 0 ? daysSinceStart + 1 : null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Spinner />
      </div>
    );
  }

  if (isInvalid || !cycleSettings) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-950 p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-yellow-500" />
        <h2 className="text-xl font-semibold text-white">
          {t('periodTracker.invalidShareLink')}
        </h2>
      </div>
    );
  }

  const avgCycle = getAverageCycleLength();
  const prediction = getPrediction(avgCycle);
  const cycleDay = getCurrentCycleDay();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto p-4 max-w-4xl space-y-6"
      >
        {/* Read-only banner */}
        <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-lg px-4 py-2 text-sm">
          <Eye className="w-4 h-4 shrink-0" />
          <span>{t('periodTracker.readOnlyDescription')}</span>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-white">
              {t('periodTracker.title')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">{t('periodTracker.subtitle')}</p>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-white/10 backdrop-blur-sm border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-5 h-5 text-pink-400" />
              <div>
                <p className="text-xs text-slate-400">{t('periodTracker.cycleDay')}</p>
                <p className="text-xl font-bold text-white">
                  {cycleDay ? `${t('periodTracker.day')} ${cycleDay}` : '—'}
                </p>
              </div>
            </div>
          </Card>
          <Card className="bg-white/10 backdrop-blur-sm border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-xs text-slate-400">{t('periodTracker.avgCycle')}</p>
                <p className="text-xl font-bold text-white">
                  {avgCycle} {t('periodTracker.days')}
                </p>
              </div>
            </div>
          </Card>
          <Card className="bg-white/10 backdrop-blur-sm border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <Droplets className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-xs text-slate-400">{t('periodTracker.nextPeriod')}</p>
                <p className="text-lg font-bold text-white">
                  {prediction
                    ? format(parseISO(prediction.nextPeriodStart), 'MMM d')
                    : '—'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Calendar + History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/10 backdrop-blur-sm border border-white/10 p-5">
            <PeriodCalendar
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              periodLogs={periodLogs}
              prediction={prediction}
            />
          </Card>

          <PeriodHistory
            periodLogs={periodLogs}
            readOnly={true}
          />
        </div>
      </motion.div>
    </div>
  );
}
