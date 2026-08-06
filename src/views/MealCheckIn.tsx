/**
 * @module MealCheckIn
 * @description Meal check-in page with optional photo capture, daily calendar view
 * and Firestore-backed meal logging.
 */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { useMealCheckInStore } from '../stores/mealCheckInStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import { Input } from '../components/ui/Input';
import { DatePicker } from '../components/ui/DatePicker';
import {
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  isSameMonth,
} from 'date-fns';
import { mealCheckInService } from '../services/mealCheckInService';
import { getMealCheckInCycleForDate } from '../utils/mealCheckInCycles';

import {
  Camera,
  X,
  CheckCircle,
  Calendar as CalendarIcon,
  Trash2,
  Share2,
  Copy,
  Check,
  LinkIcon,
  Download,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Plus,
  AlertTriangle,
  UploadCloud,
  Image as ImageIcon,
} from 'lucide-react';
import { exportCalendarToHTML } from '../utils/exportHtml';
import { extractImageCaptureDate } from '../utils/imageMetadata';

interface QuickUploadItem {
  id: string;
  file: File;
  previewUrl: string;
  date: string;
  notes: string;
}

/**
 * Meal check-in page.
 * Allows users to describe meals, optionally upload meal photos,
 * and browse past check-ins on a calendar strip.
 */
export const MealCheckIn: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const {
    checkIns,
    cycleStats,
    cycleConfig,
    cycleConfigs,
    isLoading,
    error,
    selectedCheckIn,
    loadCycleData,
    saveCycleConfig,
    createCheckIn,
    createMultipleCheckIns,
    deleteCheckIn,
    setSelectedCheckIn,
  } = useMealCheckInStore();

  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showNewCycleModal, setShowNewCycleModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Quick Multi-Upload states
  const [showQuickUploadModal, setShowQuickUploadModal] = useState(false);
  const [quickUploadItems, setQuickUploadItems] = useState<QuickUploadItem[]>([]);
  const [isProcessingMetadata, setIsProcessingMetadata] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const quickFileInputRef = useRef<HTMLInputElement>(null);

  const [newCycleStartDate, setNewCycleStartDate] = useState('');
  const [newCycleDays, setNewCycleDays] = useState(30);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      loadCycleData(user.id);
    }
  }, [user, loadCycleData]);

  // Sync shareToken from loaded cycleConfig
  useEffect(() => {
    if (cycleConfig?.shareToken) {
      setShareToken(cycleConfig.shareToken);
    } else {
      setShareToken(null);
    }
  }, [cycleConfig]);

  const handleGenerateToken = async () => {
    if (!user) return;
    setIsGeneratingToken(true);
    try {
      const token = await mealCheckInService.generateShareToken(user.id);
      setShareToken(token);
    } catch (error) {
      console.error('Error generating share token:', error);
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const handleRevokeToken = async () => {
    if (!user || !shareToken) return;
    try {
      await mealCheckInService.revokeShareToken(user.id, shareToken);
      setShareToken(null);
      setShowRevokeConfirm(false);
    } catch (error) {
      console.error('Error revoking share token:', error);
    }
  };

  const handleExportHtml = async () => {
    if (cycleConfigs.length === 0 || !cycleStats) return;
    setIsExporting(true);
    try {
      await exportCalendarToHTML(cycleConfigs, cycleStats, checkIns);
    } catch (error) {
      console.error('Error exporting HTML:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareToken) return;
    const url = `${window.location.origin}/meal-checkin/share/${shareToken}`;
    await navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleSaveCycle = async () => {
    if (!user || !newCycleStartDate || newCycleDays < 1) return;
    try {
      await saveCycleConfig(user.id, newCycleStartDate, newCycleDays);
      setShowNewCycleModal(false);
    } catch (error) {
      console.error('Error saving cycle config:', error);
    }
  };

  const handleDateClick = (dateStr: string) => {
    const checkIn = checkIns.find((c) => c.date === dateStr);
    if (checkIn) {
      setSelectedCheckIn(checkIn);
      setShowImageModal(true);
    } else {
      setSelectedDate(dateStr);
      setShowUploadModal(true);
    }
  };

  const handlePrevMonth = () => {
    setViewDate((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setViewDate((prev) => addMonths(prev, 1));
  };

  const handleGoToToday = () => {
    setViewDate(new Date());
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert(t('mealCheckIn.imageTooLarge'));
        return;
      }
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmitCheckIn = async () => {
    const trimmedNotes = notes.trim();
    if (!user || !selectedDate || (!selectedImage && !trimmedNotes)) return;

    try {
      await createCheckIn(user.id, selectedDate, selectedImage, trimmedNotes);
      setShowUploadModal(false);
      resetUploadForm();
    } catch (error) {
      console.error('Error submitting check-in:', error);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCheckIn) return;

    try {
      await deleteCheckIn(selectedCheckIn);
      setShowDeleteConfirm(false);
      setShowImageModal(false);
    } catch (error) {
      console.error('Error deleting check-in:', error);
    }
  };

  const resetUploadForm = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setNotes('');
    setSelectedDate(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetQuickUploadForm = () => {
    quickUploadItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setQuickUploadItems([]);
    setDragActive(false);
    setIsProcessingMetadata(false);
    if (quickFileInputRef.current) {
      quickFileInputRef.current.value = '';
    }
  };

  const handleQuickFiles = async (files: FileList | File[]) => {
    setIsProcessingMetadata(true);
    const newItems: QuickUploadItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name}: ${t('mealCheckIn.imageTooLarge')}`);
        continue;
      }

      const parsedDate = await extractImageCaptureDate(file);
      const previewUrl = URL.createObjectURL(file);

      newItems.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        previewUrl,
        date: parsedDate,
        notes: '',
      });
    }

    setQuickUploadItems((prev) => [...prev, ...newItems]);
    setIsProcessingMetadata(false);
  };

  const handleQuickDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleQuickDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleQuickFiles(e.dataTransfer.files);
    }
  };

  const handleQuickItemDateChange = (id: string, date: string) => {
    setQuickUploadItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, date } : item))
    );
  };

  const handleQuickItemNotesChange = (id: string, notes: string) => {
    setQuickUploadItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, notes } : item))
    );
  };

  const handleRemoveQuickItem = (id: string) => {
    setQuickUploadItems((prev) => {
      const itemToRemove = prev.find((item) => item.id === id);
      if (itemToRemove) {
        URL.revokeObjectURL(itemToRemove.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleSubmitQuickUpload = async () => {
    if (!user || quickUploadItems.length === 0) return;

    try {
      const uploadPayload = quickUploadItems.map((item) => ({
        date: item.date,
        imageFile: item.file,
        notes: item.notes.trim() || undefined,
      }));

      await createMultipleCheckIns(user.id, uploadPayload);
      setShowQuickUploadModal(false);
      resetQuickUploadForm();
    } catch (error) {
      console.error('Error in multi check-in:', error);
    }
  };

  const duplicateDatesInUpload = useMemo(() => {
    const dates = quickUploadItems.map((item) => item.date);
    return dates.filter((date, index) => dates.indexOf(date) !== index);
  }, [quickUploadItems]);

  const hasDuplicateDatesInUpload = useMemo(() => {
    return duplicateDatesInUpload.length > 0;
  }, [duplicateDatesInUpload]);

  const hasCheckIn = (dateStr: string): boolean => {
    return checkIns.some((c) => c.date === dateStr);
  };

  const isTodayDate = (date: Date): boolean => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const dateStr = format(date, 'yyyy-MM-dd');
    return dateStr === todayStr;
  };

  const isFutureDateObj = (date: Date): boolean => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const dateStr = format(date, 'yyyy-MM-dd');
    return dateStr > todayStr;
  };

  const currentMonthDates = useMemo(() => {
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);

    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  }, [viewDate]);

  const isCurrentMonth = useMemo(() => {
    return isSameMonth(viewDate, new Date());
  }, [viewDate]);

  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const calendarCells = useMemo(() => {
    if (currentMonthDates.length === 0) return [] as Array<Date | null>;

    const firstDayOfWeek = currentMonthDates[0].getDay();
    const leadingEmptyCells = Array.from({ length: firstDayOfWeek }, () => null);
    const totalCellsBeforeTrailing =
      leadingEmptyCells.length + currentMonthDates.length;
    const trailingCellCount =
      totalCellsBeforeTrailing % 7 === 0 ? 0 : 7 - (totalCellsBeforeTrailing % 7);
    const trailingEmptyCells = Array.from(
      { length: trailingCellCount },
      () => null
    );

    return [...leadingEmptyCells, ...currentMonthDates, ...trailingEmptyCells];
  }, [currentMonthDates]);

  const isOutsideCycleDate = (date: Date): boolean => {
    if (cycleConfigs.length === 0) return true;

    const dateStr = format(date, 'yyyy-MM-dd');
    const checked = hasCheckIn(dateStr);
    if (checked) return false;

    return getMealCheckInCycleForDate(dateStr, cycleConfigs) === null;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted">
          {t('auth.pleaseLogin')}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold text-foreground">
          {t('mealCheckIn.title')}
        </h1>
        <p className="text-muted">
          {t('mealCheckIn.description')}
        </p>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      )}

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
      <Card className="p-4 sm:p-6 overflow-hidden">
        {/* Calendar Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                <CalendarIcon className="h-6 w-6 text-accent-500" />
                {format(viewDate, 'MMMM yyyy')}
              </h2>
              {cycleConfigs.length > 0 && cycleConfig && (
                <p className="text-xs text-muted">
                  Cycles: {cycleConfigs.length} · Latest started:{' '}
                  {format(
                    new Date(cycleConfig.startDate + 'T00:00:00'),
                    'MMM d, yyyy'
                  )}
                </p>
              )}
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
              <div className="flex w-full items-center justify-between rounded-lg border border-line bg-surface p-1 sm:w-auto sm:justify-start">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevMonth}
                  className="h-10 w-10 p-0 sm:h-8 sm:w-8"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {!isCurrentMonth && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGoToToday}
                    className="h-10 px-3 text-xs sm:h-8 sm:px-2"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Today
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNextMonth}
                  className="h-10 w-10 p-0 sm:h-8 sm:w-8"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid w-full grid-cols-4 gap-2 sm:flex sm:w-auto">
                <Button
                  onClick={handleExportHtml}
                  variant="ghost"
                  size="sm"
                  className="h-10 min-w-0 px-2 sm:h-8 sm:px-3 flex items-center gap-2"
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <Spinner size="sm" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">Export</span>
                </Button>
                <Button
                  onClick={() => setShowShareModal(true)}
                  variant="ghost"
                  size="sm"
                  className="h-10 min-w-0 px-2 sm:h-8 sm:px-3 flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('mealCheckIn.share')}</span>
                </Button>
                <Button
                  onClick={() => setShowQuickUploadModal(true)}
                  variant="secondary"
                  size="sm"
                  className="h-10 min-w-0 px-2 sm:h-8 sm:px-3 flex items-center gap-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('mealCheckIn.quickUpload')}</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowNewCycleModal(true)}
                  className="h-10 min-w-0 px-2 sm:h-8 sm:px-3"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New cycle</span>
                </Button>
              </div>
            </div>
          </div>

        {/* Calendar Grid */}
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

        <div className="grid grid-cols-7 gap-2">
          {/* Calendar days */}
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

              return (
                <button
                  key={dateStr}
                  onClick={() => !disabled && handleDateClick(dateStr)}
                  disabled={disabled}
                  className={`
                  aspect-square rounded-lg border-2 transition-all duration-200
                  ${today ? 'border-accent-500' : 'border-line'}
                  ${checked ? 'bg-emerald-500 text-white' : 'bg-elevated text-foreground'}
                  ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'}
                  ${!checked && !disabled ? 'hover:border-accent-400 hover:bg-accent-50' : ''}
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

      {/* New Cycle Modal */}
      <Modal
        isOpen={showNewCycleModal}
        onClose={() => setShowNewCycleModal(false)}
        title="Add new cycle"
      >
        <div className="space-y-4">
          <DatePicker
            label="Cycle Start Date"
            value={newCycleStartDate}
            onChange={setNewCycleStartDate}
            centered
          />
          <Input
            label="Number of Cycle Days"
            type="number"
            min={1}
            max={365}
            value={newCycleDays}
            onChange={(e) => setNewCycleDays(parseInt(e.target.value) || 0)}
          />
          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => setShowNewCycleModal(false)}
              variant="ghost"
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSaveCycle}
              disabled={isLoading || !newCycleStartDate || newCycleDays < 1}
              className="flex-1"
            >
              Save Cycle
            </Button>
          </div>
        </div>
      </Modal>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          resetUploadForm();
        }}
        title={t('mealCheckIn.addCheckIn')}
      >
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm text-muted">
              {t('mealCheckIn.selectedDate')}:{' '}
              <span className="font-semibold">{selectedDate}</span>
            </p>
          </div>

          {/* Image Upload */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setPreviewUrl(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute right-2 top-2 rounded-md bg-red-600 p-2 text-white hover:bg-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex h-64 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-line bg-surface transition-colors hover:border-accent-400 hover:bg-accent-50"
              >
                <Camera className="mb-2 h-12 w-12 text-accent-400" />
                <p className="text-muted">
                  {t('mealCheckIn.uploadImage')}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {t('mealCheckIn.maxSize')}
                </p>
              </button>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              {t('mealCheckIn.notes')}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-line bg-elevated px-3 py-2 text-foreground placeholder:text-muted focus:border-accent-500 focus:ring-2 focus:ring-accent-100"
              placeholder={t('mealCheckIn.notesPlaceholder')}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={() => {
                setShowUploadModal(false);
                resetUploadForm();
              }}
              variant="ghost"
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSubmitCheckIn}
              disabled={(!selectedImage && !notes.trim()) || isLoading}
              className="flex-1"
            >
              {isLoading ? <Spinner size="sm" /> : t('mealCheckIn.submit')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Image Modal */}
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
            <div>
              <p className="mb-2 text-sm text-muted">
                {t('mealCheckIn.date')}:{' '}
                <span className="font-semibold">{selectedCheckIn.date}</span>
              </p>
            </div>

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

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowImageModal(false);
                  setSelectedCheckIn(null);
                }}
                variant="ghost"
                className="flex-1"
              >
                {t('common.close')}
              </Button>
              <Button
                onClick={handleDeleteClick}
                variant="danger"
                className="flex-1"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('common.delete')}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title={t('mealCheckIn.confirmDelete')}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-foreground">
            {t('mealCheckIn.deleteWarning')}
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowDeleteConfirm(false)}
              variant="ghost"
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleConfirmDelete}
              variant="danger"
              className="flex-1"
            >
              {t('common.delete')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={t('mealCheckIn.shareTitle')}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            {t('mealCheckIn.shareDescription')}
          </p>

          {!shareToken ? (
            <Button
              onClick={handleGenerateToken}
              disabled={isGeneratingToken}
              className="w-full"
            >
              {isGeneratingToken ? (
                <><Spinner size="sm" />&nbsp;{t('mealCheckIn.generating')}</>
              ) : (
                <><LinkIcon className="w-4 h-4 mr-2" />{t('mealCheckIn.generateLink')}</>
              )}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-lg border border-line bg-surface p-3">
                <span className="flex-1 select-all break-all text-xs text-foreground">
                  {`${window.location.origin}/meal-checkin/share/${shareToken}`}
                </span>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCopyLink} className="flex-1 flex items-center justify-center gap-2">
                  {linkCopied ? (
                    <><Check className="w-4 h-4" />{t('mealCheckIn.linkCopied')}</>
                  ) : (
                    <><Copy className="w-4 h-4" />{t('mealCheckIn.copyLink')}</>
                  )}
                </Button>
                <Button
                  onClick={() => setShowRevokeConfirm(true)}
                  variant="danger"
                  className="flex-1"
                >
                  {t('mealCheckIn.revokeLink')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Revoke Confirmation Modal */}
      <Modal
        isOpen={showRevokeConfirm}
        onClose={() => setShowRevokeConfirm(false)}
        title={t('mealCheckIn.revokeLink')}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-foreground">
            {t('mealCheckIn.revokeConfirm')}
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowRevokeConfirm(false)}
              variant="ghost"
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleRevokeToken}
              variant="danger"
              className="flex-1"
            >
              {t('mealCheckIn.revokeLink')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Quick Upload Modal */}
      <Modal
        isOpen={showQuickUploadModal}
        onClose={() => {
          setShowQuickUploadModal(false);
          resetQuickUploadForm();
        }}
        title={t('mealCheckIn.quickUploadTitle')}
        size="lg"
      >
        <div className="space-y-6">
          {/* Drag and Drop Zone */}
          <div
            onDragEnter={handleQuickDrag}
            onDragOver={handleQuickDrag}
            onDragLeave={handleQuickDrag}
            onDrop={handleQuickDrop}
            className={`
              relative flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-all duration-200
              ${dragActive ? 'border-accent-500 bg-accent-50' : 'border-line bg-surface hover:border-accent-400 hover:bg-accent-50'}
            `}
          >
            <input
              ref={quickFileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={async (e) => {
                if (e.target.files && e.target.files.length > 0) {
                  await handleQuickFiles(e.target.files);
                }
              }}
              className="hidden"
            />
            <UploadCloud className="mb-3 h-12 w-12 text-accent-400" />
            <p className="text-center font-medium text-foreground">
              {t('mealCheckIn.dragDropMulti')}
            </p>
            <p className="mt-2 text-xs text-muted">
              {t('mealCheckIn.maxSize')}
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-4"
              onClick={() => quickFileInputRef.current?.click()}
            >
              Browse Files
            </Button>
          </div>

          {/* Processing State */}
          {isProcessingMetadata && (
            <div className="flex items-center justify-center gap-3 rounded-lg bg-surface p-4">
              <Spinner size="sm" />
              <span className="text-sm text-muted">
                {t('mealCheckIn.processingMetadata')}
              </span>
            </div>
          )}

          {/* Warnings (Duplicate Dates) */}
          {hasDuplicateDatesInUpload && (
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <span className="text-sm text-amber-800">
                {t('mealCheckIn.duplicateDateWarning')}
              </span>
            </div>
          )}

          {/* Preview Grid */}
          {quickUploadItems.length > 0 && (
            <div className="space-y-4">
              <h4 className="flex items-center gap-2 font-semibold text-foreground">
                <ImageIcon className="w-5 h-5" />
                Selected Meals ({quickUploadItems.length})
              </h4>
              <div className="max-h-[350px] space-y-4 divide-y divide-line overflow-y-auto pr-1">
                {quickUploadItems.map((item, index) => {
                  const isDuplicate = duplicateDatesInUpload.includes(item.date);
                  const isExisting = hasCheckIn(item.date);

                  return (
                    <div
                      key={item.id}
                      className={`
                        pt-4 first:pt-0 flex flex-col md:flex-row gap-4 relative group
                        ${isDuplicate ? '-mx-2 rounded-lg bg-amber-50 px-2' : ''}
                      `}
                    >
                      {/* Image Thumbnail */}
                      <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-lg border border-line bg-surface md:w-32">
                        <img
                          src={item.previewUrl}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveQuickItem(item.id)}
                          className="absolute right-1 top-1 rounded-md bg-red-600 p-1 text-white shadow-md hover:bg-red-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Inputs */}
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1 block text-xs font-semibold uppercase text-muted">
                              {t('mealCheckIn.photoDate')}
                            </label>
                            <DatePicker
                              value={item.date}
                              onChange={(date) => handleQuickItemDateChange(item.id, date)}
                            />
                            {isDuplicate && (
                              <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Duplicate upload date
                              </p>
                            )}
                            {isExisting && !isDuplicate && (
                              <p className="mt-1 text-xs text-accent-600">
                                Will overwrite existing check-in
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-semibold uppercase text-muted">
                            {t('mealCheckIn.photoNotes')}
                          </label>
                          <input
                            type="text"
                            value={item.notes}
                            onChange={(e) => handleQuickItemNotesChange(item.id, e.target.value)}
                            placeholder={t('mealCheckIn.notesPlaceholder')}
                            className="w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted focus:border-accent-500 focus:ring-2 focus:ring-accent-100"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 border-t border-line pt-4">
            <Button
              onClick={() => {
                setShowQuickUploadModal(false);
                resetQuickUploadForm();
              }}
              variant="ghost"
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSubmitQuickUpload}
              disabled={quickUploadItems.length === 0 || isLoading || isProcessingMetadata}
              className="flex-1"
            >
              {isLoading ? (
                <Spinner size="sm" />
              ) : (
                t('mealCheckIn.confirmMultipleCheckIn', { count: quickUploadItems.length })
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25">
          <Spinner />
        </div>
      )}
    </div>
  );
};
