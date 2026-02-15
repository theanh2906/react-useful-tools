/**
 * @module services/eventsService
 * @description CRUD operations for calendar events.
 * Uses Firebase Realtime Database via the realtimeDb abstraction layer.
 */

import type { EventData } from '@/types';
import {
  createItem,
  deleteItem,
  listenCollection,
  updateItem,
} from './realtimeDb';

/** @internal Realtime Database path for calendar events. */
const EVENTS_PATH = 'events';

/**
 * Subscribes to real-time updates of calendar events.
 *
 * @param onChange - Callback invoked with the latest array of events.
 * @returns Unsubscribe function.
 */
export const listenEvents = (onChange: (events: EventData[]) => void) => {
  return listenCollection<EventData>(EVENTS_PATH, onChange);
};

/**
 * Creates a new calendar event.
 *
 * @param event - The event data to create (the `id` field is stripped before saving).
 * @returns The generated event key.
 */
export const createEvent = async (event: EventData) => {
  const { id, ...payload } = event;
  return createItem(EVENTS_PATH, payload);
};

/**
 * Updates an existing calendar event by ID.
 *
 * @param id - Event ID to update.
 * @param event - Updated event data.
 */
export const updateEventById = async (id: string, event: EventData) => {
  const { id: _ignore, ...payload } = event;
  return updateItem(EVENTS_PATH, id, payload);
};

/**
 * Deletes a calendar event by ID.
 *
 * @param id - Event ID to delete.
 */
export const deleteEventById = async (id: string) => {
  return deleteItem(EVENTS_PATH, id);
};
