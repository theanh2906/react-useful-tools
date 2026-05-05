/**
 * @module MealCheckIn
 * @description Meal check-in page with photo capture, daily calendar view
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
} from 'lucide-react';
import { exportCalendarToHTML } from '../utils/exportHtml';

/**
 * Meal check-in page.
 * Allows users to capture or upload meal photos, log meals for breakfast/lunch/dinner,
 * and browse past check-ins on a calendar strip.
 */
export const MealCheckIn: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const {
    checkIns,
    cycleStats,
    cycleConfig,
    isLoading,
    selectedCheckIn,
    loadCycleData,
    saveCycleConfig,
    createCheckIn,
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
    if (!cycleConfig || !cycleStats) return;
    setIsExporting(true);
    try {
      await exportCalendarToHTML(cycleConfig, cycleStats, checkIns);
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
    if (!user || !selectedDate || !selectedImage) return;

    try {
      await createCheckIn(user.id, selectedDate, selectedImage, notes);
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
    if (!cycleConfig || !cycleStats) return true;

    const dateStr = format(date, 'yyyy-MM-dd');
    const checked = hasCheckIn(dateStr);
    if (checked) return false;

    const cycleStartStr = cycleConfig.startDate;
    if (dateStr < cycleStartStr) return true;

    if (cycleStats.checkedInDays >= cycleConfig.cycleDays) return true;

    return false;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 dark:text-gray-400">
          {t('auth.pleaseLogin')}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
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
        {/* Calendar Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <CalendarIcon className="w-6 h-6" />
                {format(viewDate, 'MMMM yyyy')}
              </h2>
              {cycleConfig && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Cycle Started:{' '}
                  {format(
                    new Date(cycleConfig.startDate + 'T00:00:00'),
                    'MMM d, yyyy'
                  )}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mr-2">
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

              <div className="flex gap-2">
                <Button
                  onClick={handleExportHtml}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
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
                  className="flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('mealCheckIn.share')}</span>
                </Button>
                <Button size="sm" onClick={() => setShowNewCycleModal(true)}>
                  New cycle
                </Button>
              </div>
            </div>
          </div>

        {/* Calendar Grid */}
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

        <div className="grid grid-cols-7 gap-2">
          {/* Calendar days */}
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

              return (
                <button
                  key={dateStr}
                  onClick={() => !disabled && handleDateClick(dateStr)}
                  disabled={disabled}
                  className={`
                  aspect-square rounded-lg border-2 transition-all duration-200
                  ${today ? 'border-blue-500 dark:border-blue-400' : 'border-gray-200 dark:border-gray-700'}
                  ${checked ? 'bg-green-500 dark:bg-green-600 text-white' : 'bg-white dark:bg-gray-800'}
                  ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'}
                  ${!checked && !disabled ? 'hover:border-blue-400 dark:hover:border-blue-500' : ''}
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
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
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
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
              >
                <Camera className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-gray-600 dark:text-gray-400">
                  {t('mealCheckIn.uploadImage')}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  {t('mealCheckIn.maxSize')}
                </p>
              </button>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('mealCheckIn.notes')} ({t('mealCheckIn.optional')})
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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
              disabled={!selectedImage || isLoading}
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
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {t('mealCheckIn.date')}:{' '}
                <span className="font-semibold">{selectedCheckIn.date}</span>
              </p>
            </div>

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
          <p className="text-gray-700 dark:text-gray-300">
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
          <p className="text-sm text-gray-600 dark:text-gray-400">
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
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                <span className="text-xs text-gray-700 dark:text-gray-300 flex-1 break-all select-all">
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
          <p className="text-gray-700 dark:text-gray-300">
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

      {isLoading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <Spinner />
        </div>
      )}
    </div>
  );
};
