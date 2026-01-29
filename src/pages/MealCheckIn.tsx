import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { useMealCheckInStore } from '../stores/mealCheckInStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import { 
  ChevronLeft, 
  ChevronRight, 
  Camera, 
  X, 
  CheckCircle,
  Calendar as CalendarIcon,
  Trash2
} from 'lucide-react';

export const MealCheckIn: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { 
    checkIns, 
    currentMonthStats, 
    isLoading,
    selectedCheckIn,
    loadMonthCheckIns, 
    createCheckIn,
    deleteCheckIn,
    setSelectedCheckIn,
  } = useMealCheckInStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    if (user) {
      loadMonthCheckIns(user.id, year, month + 1);
    }
  }, [user, year, month, loadMonthCheckIns]);

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1));
  };

  const handleDateClick = (dateStr: string) => {
    const checkIn = checkIns.find(c => c.date === dateStr);
    if (checkIn) {
      setSelectedCheckIn(checkIn);
      setShowImageModal(true);
    } else {
      setSelectedDate(dateStr);
      setShowUploadModal(true);
    }
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

  const getDaysInMonth = () => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];
    
    // Add empty cells for days before the first day
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const getDateString = (day: number): string => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const hasCheckIn = (day: number): boolean => {
    const dateStr = getDateString(day);
    return checkIns.some(c => c.date === dateStr);
  };

  const isToday = (day: number): boolean => {
    const today = new Date();
    return day === today.getDate() && 
           month === today.getMonth() && 
           year === today.getFullYear();
  };

  const isFutureDate = (day: number): boolean => {
    const date = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 dark:text-gray-400">{t('auth.pleaseLogin')}</p>
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
      {currentMonthStats && (
        <Card className="p-6 mb-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {t('mealCheckIn.monthlyProgress')}
              </h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {currentMonthStats.checkedInDays} / {currentMonthStats.totalDaysInMonth}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {currentMonthStats.percentage}% {t('mealCheckIn.complete')}
              </p>
            </div>
            <div className="h-20 w-20 rounded-full border-4 border-green-600 dark:border-green-400 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-green-600 dark:bg-green-400 h-full transition-all duration-500"
              style={{ width: `${currentMonthStats.percentage}%` }}
            />
          </div>
        </Card>
      )}

      {/* Calendar */}
      <Card className='p-6'>
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePreviousMonth}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6" />
            {monthNames[month]} {year}
          </h2>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextMonth}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Week day headers */}
          {weekDays.map(day => (
            <div 
              key={day} 
              className="text-center font-semibold text-sm text-gray-600 dark:text-gray-400 py-2"
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {getDaysInMonth().map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const dateStr = getDateString(day);
            const checked = hasCheckIn(day);
            const today = isToday(day);
            const future = isFutureDate(day);

            return (
              <button
                key={day}
                onClick={() => !future && handleDateClick(dateStr)}
                disabled={future}
                className={`
                  aspect-square rounded-lg border-2 transition-all duration-200
                  ${today ? 'border-blue-500 dark:border-blue-400' : 'border-gray-200 dark:border-gray-700'}
                  ${checked ? 'bg-green-500 dark:bg-green-600 text-white' : 'bg-white dark:bg-gray-800'}
                  ${future ? 'opacity-40 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'}
                  ${!checked && !future ? 'hover:border-blue-400 dark:hover:border-blue-500' : ''}
                  relative
                `}
              >
                <span className="text-lg font-semibold">{day}</span>
                {checked && (
                  <CheckCircle className="w-4 h-4 absolute bottom-1 right-1 hidden sm:block" />
                )}
              </button>
            );
          })}
        </div>
      </Card>

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
              {t('mealCheckIn.selectedDate')}: <span className="font-semibold">{selectedDate}</span>
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
                <p className="text-gray-600 dark:text-gray-400">{t('mealCheckIn.uploadImage')}</p>
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
                {t('mealCheckIn.date')}: <span className="font-semibold">{selectedCheckIn.date}</span>
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

      {isLoading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <Spinner />
        </div>
      )}
    </div>
  );
};
