/**
 * @module NotesPage
 * @description Rich-text notes page with tagging, pinning, search and Quill editor.
 */
import {
  Badge,
  Button,
  Card,
  Input,
  Modal,
  ModalFooter,
  QuillEditor,
} from '@/components/ui';
import { toast } from '@/components/ui/Toast';
import {
  cn,
  formatRelativeTime,
  generateId,
  stripHtml,
  truncateText,
} from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useNotesStore } from '@/stores/notesStore';
import type { Note } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Clock,
  Edit,
  Pin,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Notes management page.
 * Supports creating, editing, pinning, tagging and deleting notes
 * with a rich-text editor. Data synced to Firebase in real-time.
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
          <h1 className="font-display text-2xl font-bold text-foreground lg:text-3xl">
            Notes
          </h1>
          <p className="mt-1 text-muted">Capture your thoughts and ideas</p>
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
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-line bg-elevated py-2.5 pl-10 pr-4 text-foreground placeholder:text-muted focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-100"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                !selectedCategory
                  ? 'bg-accent-50 text-accent-700'
                  : 'border border-line bg-elevated text-muted hover:bg-surface hover:text-foreground'
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
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  selectedCategory === cat
                    ? 'bg-accent-50 text-accent-700'
                    : 'border border-line bg-elevated text-muted hover:bg-surface hover:text-foreground'
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
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-accent-50">
                  <Edit className="h-8 w-8 text-accent-500" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  No notes yet
                </h3>
                <p className="mb-4 text-muted">
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
                    note.isPinned && 'border-accent-300 bg-accent-50/40'
                  )}
                  onClick={() => {
                    setEditingNote(note);
                    setShowEditor(true);
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="line-clamp-1 flex-1 font-semibold text-foreground">
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
                            ? 'bg-accent-50 text-accent-600'
                            : 'text-muted hover:bg-surface hover:text-foreground'
                        )}
                      >
                        <Pin className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(note);
                        }}
                        className="rounded-md p-1.5 text-muted transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="mb-4 line-clamp-3 flex-1 text-sm text-muted">
                    {truncateText(stripHtml(note.content), 150) || 'No content'}
                  </p>

                  <div className="flex items-center justify-between border-t border-line pt-3">
                    <div className="flex items-center gap-1 text-xs text-muted">
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
            <label className="mb-2 block text-sm font-medium text-foreground">
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
                    className="ml-1 hover:text-foreground"
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
                className="flex-1 rounded-md border border-line bg-elevated px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-100"
              />
              <Button variant="secondary" size="sm" onClick={handleAddCategory}>
                <Tag className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Rich Text Editor */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Content
            </label>
            <div>
              <QuillEditor
                value={content}
                onChange={setContent}
                placeholder="Start writing your note..."
              />
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
