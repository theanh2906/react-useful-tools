/**
 * @module services/notesService
 * @description CRUD operations for user notes.
 * Uses Firebase Realtime Database via the realtimeDb abstraction layer.
 */

import type { Note } from '@/types';
import {
  createItem,
  deleteItem,
  listenCollection,
  updateItem,
} from './realtimeDb';

/** @internal Realtime Database path for notes. */
const NOTES_PATH = 'notes';

/**
 * Subscribes to real-time updates of user notes.
 *
 * @param onChange - Callback invoked with the latest array of notes.
 * @returns Unsubscribe function.
 */
export const listenNotes = (onChange: (notes: Note[]) => void) => {
  return listenCollection<Note>(NOTES_PATH, onChange);
};

/**
 * Creates a new note.
 *
 * @param note - The note data to create (the `id` field is stripped).
 * @returns The generated note key.
 */
export const createNote = async (note: Note) => {
  const { id, ...payload } = note;
  return createItem(NOTES_PATH, payload);
};

/**
 * Updates an existing note by ID.
 *
 * @param id - Note ID to update.
 * @param note - Updated note data.
 */
export const updateNoteById = async (id: string, note: Note) => {
  const { id: _ignore, ...payload } = note;
  return updateItem(NOTES_PATH, id, payload);
};

/**
 * Deletes a note by ID.
 *
 * @param id - Note ID to delete.
 */
export const deleteNoteById = async (id: string) => {
  return deleteItem(NOTES_PATH, id);
};
