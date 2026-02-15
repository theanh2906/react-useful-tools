/**
 * @module NotesPage
 * @description Rich-text notes page with tagging, pinning, search and ReactQuill editor.
 */
import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Pin,
  Trash2,
  Edit,
  X,
  Tag,
  Clock,
  Type,
} from 'lucide-react';
import {
  Card,
  Button,
  Badge,
  Modal,
  ModalFooter,
  Input,
} from '@/components/ui';
import { useNotesStore } from '@/stores/notesStore';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import {
  generateId,
  formatRelativeTime,
  stripHtml,
  truncateText,
} from '@/lib/utils';
import type { Note } from '@/types';
import { toast } from '@/components/ui/Toast';

// Lazy load ReactQuill for better performance
const ReactQuill = lazy(() => import('react-quill'));
import 'react-quill/dist/quill.snow.css';

/**
 * Notes management page.
 * Supports creating, editing, pinning, tagging and deleting notes
 * with a rich-text editor (ReactQuill). Data synced to Firestore in real-time.
 */
export function NotesPage() {
  const {
    addNote,
    updateNote,
    deleteNote,
    togglePin,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    getFilteredNotes,
    getCategories,
    subscribeNotes,
  } = useNotesStore();
  const userId = useAuthStore((state) => state.user?.id);

  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [noteCategories, setNoteCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');

  const filteredNotes = getFilteredNotes();
  const categories = getCategories();

  useEffect(() => {
    subscribeNotes();
  }, [subscribeNotes, userId]);

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      setContent(editingNote.content);
      setNoteCategories(editingNote.categories);
    } else {
      setTitle('');
      setContent('');
      setNoteCategories([]);
    }
  }, [editingNote]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (editingNote) {
      await updateNote({
        ...editingNote,
        title,
        content,
        categories: noteCategories,
        modifiedDate: Date.now(),
      });
      toast.success('Note updated');
    } else {
      await addNote({
        id: generateId(),
        title,
        content,
        categories: noteCategories,
        createdDate: Date.now(),
        isPinned: false,
      });
      toast.success('Note created');
    }

    setShowEditor(false);
    setEditingNote(null);
  };

  const handleDelete = async (note: Note) => {
    await deleteNote(note.id);
    toast.success('Note deleted');
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !noteCategories.includes(newCategory.trim())) {
      setNoteCategories([...noteCategories, newCategory.trim()]);
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (cat: string) => {
    setNoteCategories(noteCategories.filter((c) => c !== cat));
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
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-white">
            Notes
          </h1>
          <p className="text-slate-400 mt-1">Capture your thoughts and ideas</p>
        </div>
        <Button
          onClick={() => {
            setEditingNote(null);
            setShowEditor(true);
          }}
        >
          <Plus className="w-4 h-4" />
          New Note
        </Button>
      </div>

      {/* Search & Filter */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary-500/50"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                'px-3 py-2 rounded-xl text-sm font-medium transition-all',
                !selectedCategory
                  ? 'bg-primary-500/20 text-primary-300'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              )}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() =>
                  setSelectedCategory(cat === selectedCategory ? null : cat)
                }
                className={cn(
                  'px-3 py-2 rounded-xl text-sm font-medium transition-all',
                  selectedCategory === cat
                    ? 'bg-primary-500/20 text-primary-300'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Notes Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredNotes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full"
            >
              <Card className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                  <Edit className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  No notes yet
                </h3>
                <p className="text-slate-400 mb-4">
                  Start capturing your thoughts and ideas
                </p>
                <Button onClick={() => setShowEditor(true)}>
                  <Plus className="w-4 h-4" />
                  Create your first note
                </Button>
              </Card>
            </motion.div>
          ) : (
            filteredNotes.map((note, i) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  hover
                  className={cn(
                    'p-5 h-full flex flex-col cursor-pointer group',
                    note.isPinned && 'ring-1 ring-primary-500/50'
                  )}
                  onClick={() => {
                    setEditingNote(note);
                    setShowEditor(true);
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium text-white line-clamp-1 flex-1">
                      {note.title}
                    </h3>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePin(note.id);
                        }}
                        className={cn(
                          'p-1.5 rounded-lg transition-colors',
                          note.isPinned
                            ? 'text-primary-400 bg-primary-500/20'
                            : 'text-slate-400 hover:text-white hover:bg-white/10'
                        )}
                      >
                        <Pin className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(note);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-slate-400 line-clamp-3 flex-1 mb-4">
                    {truncateText(stripHtml(note.content), 150) || 'No content'}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      {formatRelativeTime(
                        note.modifiedDate || note.createdDate
                      )}
                    </div>
                    {note.categories.length > 0 && (
                      <div className="flex gap-1">
                        {note.categories.slice(0, 2).map((cat) => (
                          <Badge key={cat} size="sm" variant="default">
                            {cat}
                          </Badge>
                        ))}
                        {note.categories.length > 2 && (
                          <Badge size="sm" variant="default">
                            +{note.categories.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Note Editor Modal */}
      <Modal
        isOpen={showEditor}
        onClose={() => {
          setShowEditor(false);
          setEditingNote(null);
        }}
        title={editingNote ? 'Edit Note' : 'New Note'}
        size="xl"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            placeholder="Enter note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Categories
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {noteCategories.map((cat) => (
                <Badge
                  key={cat}
                  variant="primary"
                  className="flex items-center gap-1"
                >
                  {cat}
                  <button
                    onClick={() => handleRemoveCategory(cat)}
                    className="ml-1 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add category..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500/50"
              />
              <Button variant="secondary" size="sm" onClick={handleAddCategory}>
                <Tag className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Rich Text Editor */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Content
            </label>
            <div className="quill-dark">
              <Suspense
                fallback={
                  <div className="h-64 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                    <Type className="w-8 h-8 text-slate-500 animate-pulse" />
                  </div>
                }
              >
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  placeholder="Start writing your note..."
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ list: 'ordered' }, { list: 'bullet' }],
                      [{ color: [] }, { background: [] }],
                      ['link', 'code-block'],
                      ['clean'],
                    ],
                  }}
                  className="rounded-xl overflow-hidden"
                />
              </Suspense>
            </div>
          </div>
        </div>

        <ModalFooter>
          <Button
            variant="secondary"
            onClick={() => {
              setShowEditor(false);
              setEditingNote(null);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {editingNote ? 'Update' : 'Save'} Note
          </Button>
        </ModalFooter>
      </Modal>
    </motion.div>
  );
}

export default NotesPage;
