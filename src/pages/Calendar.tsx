import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Plus, Filter } from 'lucide-react';
import { Card, Button, Badge, Modal, ModalFooter, Input, TextArea } from '@/components/ui';
import { useEventsStore } from '@/stores/eventsStore';
import { useAuthStore } from '@/stores/authStore';
import { EVENT_CATEGORIES } from '@/config/constants';
import { cn } from '@/lib/utils';
import { generateId } from '@/lib/utils';
import type { EventData } from '@/types';
import { toast } from '@/components/ui/Toast';

export function CalendarPage() {
  const { events, addEvent, updateEvent, deleteEvent, categories, subscribeEvents } = useEventsStore();
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
    ? events.filter(e => e.categories?.includes(filterCategory))
    : events;

  useEffect(() => {
    subscribeEvents();
  }, [subscribeEvents, userId]);

  const calendarEvents = filteredEvents.map(event => ({
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    allDay: event.allDay ?? true,
    backgroundColor: EVENT_CATEGORIES.find(c => c.id === event.categories?.[0])?.color || '#FFD1DC',
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
      time: event.start.includes('T') ? event.start.split('T')[1]?.substring(0, 5) : '',
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
      start: formData.time ? `${formData.date}T${formData.time}` : formData.date,
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
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-white">Calendar</h1>
          <p className="text-slate-400 mt-1">Manage your appointments and events</p>
        </div>
        <Button onClick={() => {
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
        }}>
          <Plus className="w-4 h-4" />
          New Event
        </Button>
      </div>

      {/* Category Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <button
            onClick={() => setFilterCategory(null)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
              !filterCategory
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id === filterCategory ? null : cat.id)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2',
                filterCategory === cat.id
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
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

      {/* Calendar */}
      <Card className="p-4 lg:p-6">
        <div className="calendar-wrapper">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
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
              meridiem: false
            }}
          />
        </div>
      </Card>

      {/* Upcoming Events */}
      <Card className="p-6">
        <h3 className="text-lg font-display font-semibold text-white mb-4">Upcoming Events</h3>
        <div className="space-y-3">
          {events.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No events scheduled yet</p>
          ) : (
            events.slice(0, 5).map((event) => {
              const category = EVENT_CATEGORIES.find(c => c.id === event.categories?.[0]);
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedEvent(event);
                    setFormData({
                      title: event.title,
                      date: event.start.split('T')[0],
                      time: event.start.includes('T') ? event.start.split('T')[1]?.substring(0, 5) : '',
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
                    <p className="font-medium text-white truncate">{event.title}</p>
                    <p className="text-sm text-slate-400">
                      {new Date(event.start).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
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
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
            <Input
              label="Time (optional)"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {EVENT_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFormData({ ...formData, category: cat.id })}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2',
                    formData.category === cat.id
                      ? 'bg-white/20 text-white ring-2 ring-primary-500'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
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
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />

          <TextArea
            label="Notes (optional)"
            placeholder="Add any additional notes..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isImportant}
              onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary-500 focus:ring-primary-500/50"
            />
            <span className="text-sm text-slate-300">Mark as important</span>
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
