/**
 * @module CalendarPage
 * @description Custom family calendar with event CRUD, category filtering,
 * month/week/day views, and AI-assisted scheduling.
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { format, startOfMonth } from 'date-fns';
import { ChevronDown, Filter, Sparkles } from 'lucide-react';
import {
  Card,
  Button,
  Modal,
  ModalFooter,
  Input,
  TextArea,
  DatePicker,
} from '@/components/ui';
import { useEventsStore } from '@/stores/eventsStore';
import { useAuthStore } from '@/stores/authStore';
import { EVENT_CATEGORIES } from '@/config/constants';
import { cn } from '@/lib/utils';
import { generateId } from '@/lib/utils';
import type { EventData } from '@/types';
import { toast } from '@/components/ui/Toast';
import {
  FamilyCalendar,
  type CalendarView,
} from '@/components/calendar/FamilyCalendar';

const CalendarAiAssistant = dynamic(
  () =>
    import('@/components/calendar/CalendarAiAssistant').then(
      (module) => module.CalendarAiAssistant
    ),
  { ssr: false }
);

const CATEGORY_LABELS: Record<string, string> = {
  appointment: 'Cuộc hẹn',
  ultrasound: 'Siêu âm',
  checkup: 'Khám sức khỏe',
  other: 'Khác',
};

/**
 * Calendar page with custom day/week/month views and real-time sync.
 */
export function CalendarPage() {
  const {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    categories,
    subscribeEvents,
  } = useEventsStore();
  const userId = useAuthStore((state) => state.user?.id);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const [calendarView, setCalendarView] = useState<CalendarView>('month');
  const [showAiAssistant, setShowAiAssistant] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    category: 'appointment',
    location: '',
    notes: '',
    isImportant: false,
  });

  const filteredEvents = filterCategory
    ? events.filter((e) => e.categories?.includes(filterCategory))
    : events;

  useEffect(() => {
    subscribeEvents();
  }, [subscribeEvents, userId]);

  const openNewEvent = (date: Date) => {
    setSelectedEvent(null);
    setFormData({
      title: '',
      date: format(date, 'yyyy-MM-dd'),
      time: '',
      category: 'appointment',
      location: '',
      notes: '',
      isImportant: false,
    });
    setShowEventModal(true);
  };

  const openEvent = (event: EventData) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      date: event.start.split('T')[0],
      time: event.start.includes('T')
        ? event.start.split('T')[1]?.substring(0, 5)
        : '',
      category: event.categories?.[0] || 'appointment',
      location: event.location || '',
      notes: event.notes || '',
      isImportant: event.isImportant || false,
    });
    setShowEventModal(true);
  };

  const handleSaveEvent = async () => {
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tên sự kiện');
      return;
    }

    const eventData: EventData = {
      id: selectedEvent?.id || generateId(),
      title: formData.title,
      start: formData.time
        ? `${formData.date}T${formData.time}`
        : formData.date,
      allDay: !formData.time,
      categories: [formData.category],
      location: formData.location,
      notes: formData.notes,
      isImportant: formData.isImportant,
      createdAt: selectedEvent?.createdAt || new Date().toISOString(),
    };

    if (selectedEvent) {
      await updateEvent(eventData);
      toast.success('Đã cập nhật sự kiện');
    } else {
      await addEvent(eventData);
      toast.success('Đã tạo sự kiện');
    }

    setShowEventModal(false);
    setSelectedEvent(null);
  };

  const handleDeleteEvent = async () => {
    if (selectedEvent) {
      await deleteEvent(selectedEvent.id);
      toast.success('Đã xóa sự kiện');
      setShowEventModal(false);
      setSelectedEvent(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <FamilyCalendar
          events={filteredEvents}
          selectedDate={selectedDate}
          visibleMonth={visibleMonth}
          view={calendarView}
          onSelectedDateChange={setSelectedDate}
          onVisibleMonthChange={setVisibleMonth}
          onViewChange={setCalendarView}
          onCreateEvent={openNewEvent}
          onEditEvent={openEvent}
        />

        <aside className="space-y-4">
          <button
            type="button"
            onClick={() => setShowAiAssistant((open) => !open)}
            className="flex min-h-12 w-full items-center justify-between rounded-lg border border-line bg-elevated px-4 text-left shadow-sm transition-colors hover:bg-surface"
            aria-expanded={showAiAssistant}
          >
            <span className="flex items-center gap-3">
              <Sparkles className="size-5 text-accent-600" />
              <span>
                <span className="block text-sm font-semibold text-foreground">Trợ lý Lịch</span>
                <span className="block text-xs text-muted">Tạo lịch bằng AI</span>
              </span>
            </span>
            <ChevronDown
              className={cn(
                'size-5 text-muted transition-transform',
                showAiAssistant && 'rotate-180'
              )}
            />
          </button>

          {showAiAssistant && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <CalendarAiAssistant />
            </motion.div>
          )}

          <Card className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <Filter className="size-4 text-accent-600" />
              <h2 className="text-sm font-semibold text-foreground">Lọc lịch</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFilterCategory(null)}
                className={cn(
                  'min-h-9 rounded-md px-3 text-sm font-medium transition-colors',
                  !filterCategory
                    ? 'bg-accent-500 text-white'
                    : 'bg-surface text-muted hover:bg-accent-50 hover:text-accent-600'
                )}
              >
                Tất cả
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    setFilterCategory(cat.id === filterCategory ? null : cat.id)
                  }
                  className={cn(
                    'flex min-h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors',
                    filterCategory === cat.id
                      ? 'bg-accent-500 text-white'
                      : 'bg-surface text-muted hover:bg-accent-50 hover:text-accent-600'
                  )}
                >
                  <span
                    className="size-2 rounded-full border border-black/10"
                    style={{ backgroundColor: cat.color }}
                  />
                  {CATEGORY_LABELS[cat.id] || cat.name}
                </button>
              ))}
            </div>
          </Card>
        </aside>
      </div>


      {/* Event Modal */}
      <Modal
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false);
          setSelectedEvent(null);
        }}
        title={selectedEvent ? 'Chỉnh sửa sự kiện' : 'Tạo sự kiện'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Tên sự kiện"
            placeholder="Ví dụ: Khám sức khỏe"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DatePicker
              label="Ngày"
              value={formData.date}
              onChange={(date) => setFormData({ ...formData, date })}
              placeholder="Chọn ngày"
            />
            <Input
              label="Giờ (không bắt buộc)"
              type="time"
              value={formData.time}
              onChange={(e) =>
                setFormData({ ...formData, time: e.target.value })
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Danh mục
            </label>
            <div className="flex flex-wrap gap-2">
              {EVENT_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFormData({ ...formData, category: cat.id })}
                  className={cn(
                    'flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors',
                    formData.category === cat.id
                      ? 'border-accent-500 bg-accent-50 text-accent-700 ring-1 ring-accent-500'
                      : 'border-line bg-elevated text-muted hover:bg-surface hover:text-foreground'
                  )}
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  {CATEGORY_LABELS[cat.id] || cat.name}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Địa điểm (không bắt buộc)"
            placeholder="Ví dụ: Bệnh viện thành phố"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
          />

          <TextArea
            label="Ghi chú (không bắt buộc)"
            placeholder="Thêm ghi chú cho sự kiện..."
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
          />

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isImportant}
              onChange={(e) =>
                setFormData({ ...formData, isImportant: e.target.checked })
              }
              className="h-4 w-4 rounded border-line bg-elevated text-primary-500 focus:ring-primary-500"
            />
            <span className="text-sm text-foreground">Đánh dấu quan trọng</span>
          </label>
        </div>

        <ModalFooter>
          {selectedEvent && (
            <Button variant="danger" onClick={handleDeleteEvent}>
              Xóa
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowEventModal(false)}>
            Hủy
          </Button>
          <Button onClick={handleSaveEvent}>
            {selectedEvent ? 'Cập nhật' : 'Tạo sự kiện'}
          </Button>
        </ModalFooter>
      </Modal>
    </motion.div>
  );
}

export default CalendarPage;
