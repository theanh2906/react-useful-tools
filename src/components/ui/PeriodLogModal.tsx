/**
 * @module PeriodLogModal
 * @description Modal for creating and editing period log entries.
 */
import React, { useState, useEffect, useRef } from 'react';
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
  const [isSaving, setIsSaving] = useState(false);
  const saveInProgressRef = useRef(false);

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
    if (!logStart || saveInProgressRef.current) return;

    saveInProgressRef.current = true;
    setIsSaving(true);
    try {
      await onSave({
        id: editingLog?.id || '',
        startDate: logStart,
        endDate: logEnd || undefined,
        flowIntensity: logFlow,
        notes: logNotes || undefined,
        createdAt: editingLog?.createdAt || new Date().toISOString(),
      });
    } finally {
      saveInProgressRef.current = false;
      setIsSaving(false);
    }
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
          <label className="mb-2 block text-xs text-muted">
            {t('periodTracker.flowIntensity')}
          </label>
          <div className="flex gap-2">
            {FLOW_OPTIONS.map((flow) => (
              <button
                key={flow}
                onClick={() => setLogFlow(flow)}
                className={cn(
                  'rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                  logFlow === flow
                    ? 'border-primary-300 bg-primary-50 text-primary-700'
                    : 'border-line bg-elevated text-muted hover:bg-surface hover:text-foreground'
                )}
              >
                {t(`periodTracker.flow.${flow}`)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-muted">
            {t('periodTracker.notes')}
          </label>
          <textarea
            value={logNotes}
            onChange={(e) => setLogNotes(e.target.value)}
            rows={2}
            className="w-full resize-none rounded-md border border-line bg-elevated px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            placeholder={t('periodTracker.notesPlaceholder')}
          />
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave} isLoading={isSaving}>
            {t('common.save')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PeriodLogModal;
