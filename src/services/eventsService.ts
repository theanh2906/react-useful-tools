import type { EventData } from '@/types';
import { createItem, deleteItem, listenCollection, updateItem } from './realtimeDb';

const EVENTS_PATH = 'events';

export const listenEvents = (onChange: (events: EventData[]) => void) => {
  return listenCollection<EventData>(EVENTS_PATH, onChange);
};

export const createEvent = async (event: EventData) => {
  const { id, ...payload } = event;
  return createItem(EVENTS_PATH, payload);
};

export const updateEventById = async (id: string, event: EventData) => {
  const { id: _ignore, ...payload } = event;
  return updateItem(EVENTS_PATH, id, payload);
};

export const deleteEventById = async (id: string) => {
  return deleteItem(EVENTS_PATH, id);
};
