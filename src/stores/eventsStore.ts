import { create } from 'zustand';
import type { EventData, EventCategory, EventTag } from '@/types';
import { EVENT_CATEGORIES } from '@/config/constants';
import { createEvent, deleteEventById, listenEvents, updateEventById } from '@/services/eventsService';

interface EventsState {
  events: EventData[];
  categories: EventCategory[];
  tags: EventTag[];
  isLoading: boolean;
  error: string | null;
  selectedDate: string | null;
  unsubscribe?: () => void;
  
  // Actions
  setEvents: (events: EventData[]) => void;
  addEvent: (event: EventData) => Promise<void>;
  updateEvent: (event: EventData) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  deleteEvents: (eventIds: string[]) => Promise<void>;
  subscribeEvents: () => Promise<void>;
  
  setCategories: (categories: EventCategory[]) => void;
  setTags: (tags: EventTag[]) => void;
  setSelectedDate: (date: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed
  getEventsByDate: (date: string) => EventData[];
  getEventsByCategory: (categoryId: string) => EventData[];
  getUpcomingEvents: (days?: number) => EventData[];
}

export const useEventsStore = create<EventsState>((set, get) => ({
  events: [],
  categories: EVENT_CATEGORIES,
  tags: [],
  isLoading: false,
  error: null,
  selectedDate: null,
  unsubscribe: undefined,

  setEvents: (events) => set({ events }),
  
  addEvent: async (event) => {
    await createEvent(event);
  },
  
  updateEvent: async (event) => {
    if (!event.id) return;
    await updateEventById(event.id, event);
  },
  
  deleteEvent: async (eventId) => {
    await deleteEventById(eventId);
  },
  
  deleteEvents: async (eventIds) => {
    await Promise.all(eventIds.map((id) => deleteEventById(id)));
  },

  subscribeEvents: async () => {
    const current = get().unsubscribe;
    if (current) current();
    set({ isLoading: true });
    const unsubscribe = await listenEvents((events) => {
      set({ events, isLoading: false, error: null });
    });
    set({ unsubscribe });
  },

  setCategories: (categories) => set({ categories }),
  setTags: (tags) => set({ tags }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  getEventsByDate: (date) => {
    const { events } = get();
    return events.filter((e) => e.start.startsWith(date));
  },

  getEventsByCategory: (categoryId) => {
    const { events } = get();
    return events.filter((e) => e.categories?.includes(categoryId));
  },

  getUpcomingEvents: (days = 30) => {
    const { events } = get();
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);
    
    return events
      .filter((e) => {
        const eventDate = new Date(e.start);
        return eventDate >= today && eventDate <= futureDate;
      })
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }
}));
