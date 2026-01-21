import { create } from 'zustand';
import type { Note } from '@/types';
import { createNote, deleteNoteById, listenNotes, updateNoteById } from '@/services/notesService';

interface NotesState {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: string | null;
  editingNote: Note | null;
  unsubscribe?: () => void;
  
  // Actions
  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => Promise<void>;
  updateNote: (note: Note) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  togglePin: (noteId: string) => Promise<void>;
  subscribeNotes: () => Promise<void>;
  
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setEditingNote: (note: Note | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed
  getFilteredNotes: () => Note[];
  getCategories: () => string[];
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedCategory: null,
  editingNote: null,
  unsubscribe: undefined,

  setNotes: (notes) => set({ notes }),
  
  addNote: async (note) => {
    await createNote(note);
  },
  
  updateNote: async (note) => {
    if (!note.id) return;
    await updateNoteById(note.id, { ...note, modifiedDate: Date.now() });
  },
  
  deleteNote: async (noteId) => {
    await deleteNoteById(noteId);
  },

  togglePin: async (noteId) => {
    const note = get().notes.find((n) => n.id === noteId);
    if (!note) return;
    await updateNoteById(noteId, { ...note, isPinned: !note.isPinned });
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setEditingNote: (editingNote) => set({ editingNote }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  subscribeNotes: async () => {
    const current = get().unsubscribe;
    if (current) current();
    set({ isLoading: true });
    const unsubscribe = await listenNotes((notes) => {
      set({ notes, isLoading: false, error: null });
    });
    set({ unsubscribe });
  },

  getFilteredNotes: () => {
    const { notes, searchQuery, selectedCategory } = get();
    
    return notes
      .filter((note) => {
        const matchesSearch = !searchQuery || 
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesCategory = !selectedCategory || 
          note.categories.includes(selectedCategory);
        
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        // Pinned notes first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        // Then by date
        return b.createdDate - a.createdDate;
      });
  },

  getCategories: () => {
    const { notes } = get();
    const categories = new Set<string>();
    notes.forEach((note) => {
      note.categories.forEach((cat) => categories.add(cat));
    });
    return Array.from(categories);
  }
}));
