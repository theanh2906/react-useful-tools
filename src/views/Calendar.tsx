/**
 * @module CalendarPage
 * @description Full-featured calendar page built on FullCalendar with event CRUD,
 * category filtering and recurrence support.
 */
import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Plus, Filter } from 'lucide-react';
import {
  Card,
  Button,
  Badge,
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
import { CalendarAiAssistant } from '@/components/calendar/CalendarAiAssistant';

/**
 * Calendar page with day/week/month views, drag-and-drop event management
 * and real-time sync via Firestore.
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

  const calendarEvents = filteredEvents.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    allDay: event.allDay ?? true,
    backgroundColor:
      EVENT_CATEGORIES.find((c) => c.id === event.categories?.[0])?.color ||
      '#FFD1DC',
    borderColor: 'transparent',
    extendedProps: event,
  }));

  const handleDateClick = useCallback((arg: { dateStr: string }) => {
    setSelectedEvent(null);
    // setSelectedDate(arg.dateStr);
    setFormData({
      title: '',
      date: arg.dateStr,
      time: '',
      category: 'appointment',
      location: '',
      notes: '',
      isImportant: false,
    });
    setShowEventModal(true);
  }, []);

  const handleEventClick = useCallback((arg: any) => {
    const event = arg.event.extendedProps;
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
  }, []);

  const handleSaveEvent = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter an event title');
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
      toast.success('Event updated successfully');
    } else {
      await addEvent(eventData);
      toast.success('Event created successfully');
    }

    setShowEventModal(false);
    setSelectedEvent(null);
  };

  const handleDeleteEvent = async () => {
    if (selectedEvent) {
      await deleteEvent(selectedEvent.id);
      toast.success('Event deleted');
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground lg:text-3xl">
            Calendar
          </h1>
          <p className="mt-1 text-muted">
            Manage your appointments and events
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedEvent(null);
            // setSelectedDate(new Date().toISOString().split('T')[0]);
            setFormData({
              title: '',
              date: new Date().toISOString().split('T')[0],
              time: '',
              category: 'appointment',
              location: '',
              notes: '',
              isImportant: false,
            });
            setShowEventModal(true);
          }}
        >
          <Plus className="w-4 h-4" />
          New Event
        </Button>
      </div>

      {/* Grid Layout: Responsive on mobile/desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Mobile AI Assistant: Visible only on mobile screens at the top */}
        <div className="lg:hidden col-span-1">
          <CalendarAiAssistant />
        </div>

        {/* Left Column: Calendar view */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          <Card className="p-4 lg:p-6">
            <div className="calendar-wrapper">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay',
                }}
                events={calendarEvents}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                eventDrop={async (info) => {
                  try {
                    const data = info.event.extendedProps as EventData;
                    await updateEvent({
                      ...data,
                      id: info.event.id,
                      start: info.event.start?.toISOString() || data.start,
                      end: info.event.end?.toISOString(),
                    });
                    toast.success('Event updated');
                  } catch (error) {
                    toast.error((error as Error).message || 'Update failed');
                    info.revert();
                  }
                }}
                eventResize={async (info) => {
                  try {
                    const data = info.event.extendedProps as EventData;
                    await updateEvent({
                      ...data,
                      id: info.event.id,
                      start: info.event.start?.toISOString() || data.start,
                      end: info.event.end?.toISOString(),
                    });
                    toast.success('Event updated');
                  } catch (error) {
                    toast.error((error as Error).message || 'Update failed');
                    info.revert();
                  }
                }}
                editable={true}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={3}
                weekends={true}
                height="auto"
                eventDisplay="block"
                eventTimeFormat={{
                  hour: '2-digit',
                  minute: '2-digit',
                  meridiem: false,
                }}
              />
            </div>
          </Card>
        </div>

        {/* Right Column: AI Assistant (Desktop) + Filters + Upcoming Events */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
          {/* Desktop AI Assistant: Hidden on mobile screens */}
          <div className="hidden lg:block">
            <CalendarAiAssistant />
          </div>

          {/* Category Filters */}
          <Card className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-accent-500" />
              <button
                onClick={() => setFilterCategory(null)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  !filterCategory
                    ? 'bg-accent-500 text-white'
                    : 'bg-surface text-muted hover:bg-accent-50 hover:text-accent-600'
                )}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() =>
                    setFilterCategory(cat.id === filterCategory ? null : cat.id)
                  }
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    filterCategory === cat.id
                      ? 'bg-accent-500 text-white'
                      : 'bg-surface text-muted hover:bg-accent-50 hover:text-accent-600'
                  )}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.name}
                </button>
              ))}
            </div>
          </Card>

          {/* Upcoming Events */}
          <Card className="p-6">
            <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
              Upcoming Events
            </h3>
            <div className="space-y-3">
              {events.length === 0 ? (
                <p className="py-8 text-center text-muted">
                  No events scheduled yet
                </p>
              ) : (
                events.slice(0, 5).map((event) => {
                  const category = EVENT_CATEGORIES.find(
                    (c) => c.id === event.categories?.[0]
                  );
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex cursor-pointer items-center gap-4 rounded-lg border border-line bg-surface p-4 transition-colors hover:border-accent-200 hover:bg-accent-50/50"
                      onClick={() => {
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
                      }}
                    >
                      <div
                        className="w-1 h-12 rounded-full"
                        style={{ backgroundColor: category?.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {event.title}
                        </p>
                        <p className="text-sm text-muted">
                          {new Date(event.start).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                          {event.location && ` • ${event.location}`}
                        </p>
                      </div>
                      {event.isImportant && (
                        <Badge variant="warning">Important</Badge>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>


      {/* Event Modal */}
      <Modal
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false);
          setSelectedEvent(null);
        }}
        title={selectedEvent ? 'Edit Event' : 'New Event'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Event Title"
            placeholder="e.g., Doctor appointment"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />

          <div className="grid grid-cols-2 gap-4">
            <DatePicker
              label="Date"
              value={formData.date}
              onChange={(date) => setFormData({ ...formData, date })}
              placeholder="Select date"
            />
            <Input
              label="Time (optional)"
              type="time"
              value={formData.time}
              onChange={(e) =>
                setFormData({ ...formData, time: e.target.value })
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Category
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
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Location (optional)"
            placeholder="e.g., City Hospital"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
          />

          <TextArea
            label="Notes (optional)"
            placeholder="Add any additional notes..."
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
            <span className="text-sm text-foreground">Mark as important</span>
          </label>
        </div>

        <ModalFooter>
          {selectedEvent && (
            <Button variant="danger" onClick={handleDeleteEvent}>
              Delete
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowEventModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveEvent}>
            {selectedEvent ? 'Update' : 'Create'} Event
          </Button>
        </ModalFooter>
      </Modal>
    </motion.div>
  );
}

export default CalendarPage;
