/**
 * @module PeriodLogModal
 * @description Modal for creating and editing period log entries.
 */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import { cn } from '@/lib/utils';
import { FlowIntensity } from '@/types';
import type { PeriodLog } from '@/types';

const FLOW_OPTIONS = Object.values(FlowIntensity);

interface PeriodLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingLog: PeriodLog | null;
  initialStartDate: string;
  onSave: (log: PeriodLog) => Promise<void>;
}

const PeriodLogModal: React.FC<PeriodLogModalProps> = ({
  isOpen,
  onClose,
  editingLog,
  initialStartDate,
  onSave,
}) => {
  const { t } = useTranslation();
  const [logStart, setLogStart] = useState('');
  const [logEnd, setLogEnd] = useState('');
  const [logFlow, setLogFlow] = useState<FlowIntensity>(FlowIntensity.MEDIUM);
  const [logNotes, setLogNotes] = useState('');

  useEffect(() => {
    if (editingLog) {
      setLogStart(editingLog.startDate);
      setLogEnd(editingLog.endDate || '');
      setLogFlow(editingLog.flowIntensity || FlowIntensity.MEDIUM);
      setLogNotes(editingLog.notes || '');
    } else {
      setLogStart(initialStartDate);
      setLogEnd('');
      setLogFlow(FlowIntensity.MEDIUM);
      setLogNotes('');
    }
  }, [editingLog, initialStartDate, isOpen]);

  const handleSave = async () => {
    if (!logStart) return;
    await onSave({
      id: editingLog?.id || '',
      startDate: logStart,
      endDate: logEnd || undefined,
      flowIntensity: logFlow,
      notes: logNotes || undefined,
      createdAt: editingLog?.createdAt || new Date().toISOString(),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingLog ? t('periodTracker.editLog') : t('periodTracker.newLog')}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <DatePicker
            label={t('periodTracker.startDate')}
            value={logStart}
            onChange={setLogStart}
            centered
          />
          <DatePicker
            label={t('periodTracker.endDate')}
            value={logEnd}
            onChange={setLogEnd}
            minDate={logStart}
            centered
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-2">
            {t('periodTracker.flowIntensity')}
          </label>
          <div className="flex gap-2">
            {FLOW_OPTIONS.map((flow) => (
              <button
                key={flow}
                onClick={() => setLogFlow(flow)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  logFlow === flow
                    ? 'bg-pink-500/30 text-pink-200 border border-pink-500/50'
                    : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                )}
              >
                {t(`periodTracker.flow.${flow}`)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">
            {t('periodTracker.notes')}
          </label>
          <textarea
            value={logNotes}
            onChange={(e) => setLogNotes(e.target.value)}
            rows={2}
            className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none"
            placeholder={t('periodTracker.notesPlaceholder')}
          />
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <Button variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave}>
            {t('common.save')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PeriodLogModal;
