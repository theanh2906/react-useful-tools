/**
 * @module PeriodTracker
 * @description Period tracking page with cycle calendar, predictions, logging, and history.
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import PeriodCalendar from '@/components/ui/PeriodCalendar';
import PeriodLogModal from '@/components/ui/PeriodLogModal';
import PeriodHistory from '@/components/ui/PeriodHistory';
import { usePeriodStore } from '@/stores/periodStore';
import type { PeriodLog } from '@/types';
import { toast } from '@/components/ui/Toast';
import {
  Heart,
  Plus,
  Settings,
  Activity,
  Calendar as CalendarIcon,
  Droplets,
} from 'lucide-react';

const PeriodTracker: React.FC = () => {
  const { t } = useTranslation();
  const {
    periodLogs,
    cycleSettings,
    isLoading,
    subscribePeriodLogs,
    loadCycleSettings,
    addPeriodLog,
    updatePeriodLog,
    deletePeriodLog,
    updateCycleSettings,
    getPrediction,
    getAverageCycleLength,
    getCurrentCycleDay,
  } = usePeriodStore();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showLogModal, setShowLogModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingLog, setEditingLog] = useState<PeriodLog | null>(null);
  const [logStartDate, setLogStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [settingsCycle, setSettingsCycle] = useState(28);
  const [settingsPeriod, setSettingsPeriod] = useState(5);

  useEffect(() => {
    subscribePeriodLogs();
    loadCycleSettings();
  }, [subscribePeriodLogs, loadCycleSettings]);

  useEffect(() => {
    setSettingsCycle(cycleSettings.averageCycleLength);
    setSettingsPeriod(cycleSettings.averagePeriodLength);
  }, [cycleSettings]);

  const prediction = getPrediction();
  const cycleDay = getCurrentCycleDay();
  const avgCycle = getAverageCycleLength();

  const openNewLog = () => {
    setEditingLog(null);
    setLogStartDate(format(new Date(), 'yyyy-MM-dd'));
    setShowLogModal(true);
  };

  const handleSaveLog = async (logData: PeriodLog) => {
    try {
      if (logData.id) {
        await updatePeriodLog(logData.id, logData);
        toast.success(t('periodTracker.logUpdated'));
      } else {
        await addPeriodLog(logData);
        toast.success(t('periodTracker.logSaved'));
      }
      setShowLogModal(false);
    } catch {
      toast.error(t('periodTracker.error'));
    }
  };

  const handleDeleteLog = async (id: string) => {
    try {
      await deletePeriodLog(id);
      toast.success(t('periodTracker.logDeleted'));
    } catch {
      toast.error(t('periodTracker.error'));
    }
  };

  const handleSaveSettings = async () => {
    try {
      await updateCycleSettings({
        averageCycleLength: settingsCycle,
        averagePeriodLength: settingsPeriod,
      });
      toast.success(t('periodTracker.settingsSaved'));
      setShowSettingsModal(false);
    } catch {
      toast.error(t('periodTracker.error'));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto p-4 max-w-4xl space-y-6"
    >
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-xl sm:text-2xl font-bold text-white truncate">
              {t('periodTracker.title')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 truncate">{t('periodTracker.subtitle')}</p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="ghost" onClick={() => setShowSettingsModal(true)}>
            <Settings className="w-4 h-4" />
          </Button>
          <Button onClick={openNewLog}>
            <Plus className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline">{t('periodTracker.logPeriod')}</span>
          </Button>
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
            onDateClick={(date) => {
              setEditingLog(null);
              setLogStartDate(format(date, 'yyyy-MM-dd'));
              setShowLogModal(true);
            }}
          />
        </Card>

        <PeriodHistory
          periodLogs={periodLogs}
          onEdit={(log) => {
            setEditingLog(log);
            setShowLogModal(true);
          }}
          onDelete={handleDeleteLog}
        />
      </div>

      {/* Log Period Modal */}
      <PeriodLogModal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        editingLog={editingLog}
        initialStartDate={logStartDate}
        onSave={handleSaveLog}
      />

      {/* Settings Modal */}
      <Modal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title={t('periodTracker.settings')}
      >
        <div className="space-y-4">
          <Input
            label={t('periodTracker.avgCycleLength')}
            type="number"
            min={20}
            max={45}
            value={settingsCycle}
            onChange={(e) => setSettingsCycle(Number(e.target.value))}
          />
          <Input
            label={t('periodTracker.avgPeriodLength')}
            type="number"
            min={2}
            max={10}
            value={settingsPeriod}
            onChange={(e) => setSettingsPeriod(Number(e.target.value))}
          />
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" onClick={() => setShowSettingsModal(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSaveSettings}>
              {t('common.save')}
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default PeriodTracker;
