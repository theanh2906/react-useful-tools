import type { Note } from '@/types';
import { createItem, deleteItem, listenCollection, updateItem } from './realtimeDb';

const NOTES_PATH = 'notes';

export const listenNotes = (onChange: (notes: Note[]) => void) => {
  return listenCollection<Note>(NOTES_PATH, onChange);
};

export const createNote = async (note: Note) => {
  const { id, ...payload } = note;
  return createItem(NOTES_PATH, payload);
};

export const updateNoteById = async (id: string, note: Note) => {
  const { id: _ignore, ...payload } = note;
  return updateItem(NOTES_PATH, id, payload);
};

export const deleteNoteById = async (id: string) => {
  return deleteItem(NOTES_PATH, id);
};
