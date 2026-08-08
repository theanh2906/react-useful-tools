/**
 * @module NotesLabPage
 * @description Mobile-first notes workspace inspired by the Nhip Song prototype.
 */
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Archive,
  ArchiveRestore,
  Check,
  CheckSquare,
  Inbox,
  NotebookPen,
  Palette,
  Pin,
  Plus,
  Search,
  Square,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Modal, ModalFooter, QuillEditor } from '@/components/ui';
import { toast } from '@/components/ui/Toast';
import { cn, formatRelativeTime, generateId, stripHtml } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useNotesStore } from '@/stores/notesStore';
import type { Note, NoteChecklistItem, NoteColor } from '@/types';

const NOTE_COLORS: Array<{
  id: NoteColor;
  label: string;
  swatch: string;
  card: string;
}> = [
  {
    id: 'default',
    label: 'Trắng',
    swatch: 'bg-white',
    card: 'border-line bg-elevated',
  },
  {
    id: 'honey',
    label: 'Mật ong',
    swatch: 'bg-amber-300',
    card: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/35',
  },
  {
    id: 'sage',
    label: 'Lá non',
    swatch: 'bg-emerald-300',
    card: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/35',
  },
  {
    id: 'sky',
    label: 'Ban mai',
    swatch: 'bg-sky-300',
    card: 'border-sky-200 bg-sky-50 dark:border-sky-800 dark:bg-sky-950/35',
  },
  {
    id: 'rose',
    label: 'Cánh hoa',
    swatch: 'bg-rose-300',
    card: 'border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/35',
  },
  {
    id: 'lavender',
    label: 'Oải hương',
    swatch: 'bg-violet-300',
    card: 'border-violet-200 bg-violet-50 dark:border-violet-800 dark:bg-violet-950/35',
  },
];

const EMPTY_DRAFT = {
  title: '',
  content: '',
  categories: [] as string[],
  color: 'default' as NoteColor,
  checklist: [] as NoteChecklistItem[],
};

type WorkspaceView = 'active' | 'archived';

function getCardColor(color?: NoteColor) {
  return NOTE_COLORS.find((option) => option.id === color)?.card ?? NOTE_COLORS[0].card;
}

function getPreview(content: string) {
  return stripHtml(content).trim();
}

export function NotesLabPage() {
  const { notes, isLoading, subscribeNotes, addNote, updateNote, deleteNote } = useNotesStore();
  const userId = useAuthStore((state) => state.user?.id);
  const saveInProgressRef = useRef(false);

  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>('active');
  const [quickCapture, setQuickCapture] = useState('');
  const [isQuickSaving, setIsQuickSaving] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Note | null>(null);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [tagInput, setTagInput] = useState('');
  const [checklistInput, setChecklistInput] = useState('');

  useEffect(() => {
    subscribeNotes();
  }, [subscribeNotes, userId]);

  const tags = useMemo(
    () =>
      Array.from(new Set(notes.flatMap((note) => note.categories || []))).sort((a, b) =>
        a.localeCompare(b, 'vi')
      ),
    [notes]
  );

  const visibleNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('vi');

    return notes
      .filter((note) => Boolean(note.isArchived) === (workspaceView === 'archived'))
      .filter((note) => !selectedTag || note.categories?.includes(selectedTag))
      .filter((note) => {
        if (!normalizedQuery) return true;
        const haystack = [
          note.title,
          getPreview(note.content),
          ...(note.categories || []),
          ...(note.checklist || []).map((item) => item.text),
        ]
          .join(' ')
          .toLocaleLowerCase('vi');
        return haystack.includes(normalizedQuery);
      })
      .sort((a, b) => {
        if (Boolean(a.isPinned) !== Boolean(b.isPinned)) return a.isPinned ? -1 : 1;
        return (b.modifiedDate || b.createdDate) - (a.modifiedDate || a.createdDate);
      });
  }, [notes, query, selectedTag, workspaceView]);

  const pinnedCount = notes.filter((note) => note.isPinned && !note.isArchived).length;
  const archivedCount = notes.filter((note) => note.isArchived).length;

  const closeEditor = () => {
    if (isSaving) return;
    setIsEditorOpen(false);
    setEditingNote(null);
    setDraft(EMPTY_DRAFT);
    setTagInput('');
    setChecklistInput('');
  };

  const openCreateEditor = () => {
    setEditingNote(null);
    setDraft(EMPTY_DRAFT);
    setTagInput('');
    setChecklistInput('');
    setIsEditorOpen(true);
  };

  const openEditEditor = (note: Note) => {
    setEditingNote(note);
    setDraft({
      title: note.title,
      content: note.content,
      categories: note.categories || [],
      color: note.color || 'default',
      checklist: note.checklist || [],
    });
    setTagInput('');
    setChecklistInput('');
    setIsEditorOpen(true);
  };

  const handleQuickCapture = async () => {
    const content = quickCapture.trim();
    if (!content || isQuickSaving) return;

    setIsQuickSaving(true);
    try {
      await addNote({
        id: generateId(),
        title: content.length > 48 ? `${content.slice(0, 48).trim()}...` : content,
        content,
        categories: ['ghi nhanh'],
        createdDate: Date.now(),
        isPinned: false,
        isArchived: false,
        isQuickCapture: true,
        color: 'honey',
        checklist: [],
      });
      setQuickCapture('');
      toast.success('Đã lưu ghi nhanh');
    } catch {
      toast.error('Không thể lưu ghi nhớ');
    } finally {
      setIsQuickSaving(false);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (!tag || draft.categories.includes(tag)) return;
    setDraft((current) => ({ ...current, categories: [...current.categories, tag] }));
    setTagInput('');
  };

  const addChecklistItem = () => {
    const text = checklistInput.trim();
    if (!text) return;
    setDraft((current) => ({
      ...current,
      checklist: [...current.checklist, { id: generateId(), text, done: false }],
    }));
    setChecklistInput('');
  };

  const handleSave = async () => {
    const title = draft.title.trim();
    const content = getPreview(draft.content);
    if ((!title && !content) || saveInProgressRef.current) {
      if (!title && !content) toast.error('Nhập tiêu đề hoặc nội dung ghi nhớ');
      return;
    }

    saveInProgressRef.current = true;
    setIsSaving(true);
    try {
      if (editingNote) {
        await updateNote({
          ...editingNote,
          title: title || content.slice(0, 48),
          content: draft.content,
          categories: draft.categories,
          color: draft.color,
          checklist: draft.checklist,
          modifiedDate: Date.now(),
        });
        toast.success('Đã cập nhật ghi nhớ');
      } else {
        await addNote({
          id: generateId(),
          title: title || content.slice(0, 48),
          content: draft.content,
          categories: draft.categories,
          createdDate: Date.now(),
          isPinned: false,
          isArchived: false,
          isQuickCapture: false,
          color: draft.color,
          checklist: draft.checklist,
        });
        toast.success('Đã tạo ghi nhớ');
      }
      setIsEditorOpen(false);
      setEditingNote(null);
      setDraft(EMPTY_DRAFT);
      setTagInput('');
      setChecklistInput('');
    } catch {
      toast.error('Không thể lưu ghi nhớ');
    } finally {
      saveInProgressRef.current = false;
      setIsSaving(false);
    }
  };

  const patchNote = async (note: Note, patch: Partial<Note>) => {
    try {
      await updateNote({ ...note, ...patch, modifiedDate: Date.now() });
    } catch {
      toast.error('Không thể cập nhật ghi nhớ');
    }
  };

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await deleteNote(deleteCandidate.id);
      toast.success('Đã xóa ghi nhớ');
      setDeleteCandidate(null);
    } catch {
      toast.error('Không thể xóa ghi nhớ');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-6xl pb-24"
    >
      <header className="flex flex-col gap-5 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
            <NotebookPen className="size-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-400">
              Không gian cá nhân
            </p>
            <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Ghi nhớ
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted">
          <span>{notes.filter((note) => !note.isArchived).length} ghi nhớ</span>
          <span className="h-4 w-px bg-line" />
          <span>{pinnedCount} đã ghim</span>
        </div>
      </header>

      <section className="border-b border-line py-5" aria-label="Ghi nhanh">
        <div className="flex items-start gap-3">
          <span className="mt-2 flex size-9 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            <Zap className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <textarea
              value={quickCapture}
              onChange={(event) => setQuickCapture(event.target.value)}
              onKeyDown={(event) => {
                if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                  event.preventDefault();
                  handleQuickCapture();
                }
              }}
              rows={2}
              placeholder="Ghi nhanh điều bro vừa nghĩ tới..."
              className="w-full resize-none border-0 bg-transparent px-0 py-2 text-base text-foreground placeholder:text-muted focus:ring-0"
            />
            <div className="flex justify-end">
              <Button size="sm" onClick={handleQuickCapture} isLoading={isQuickSaving} disabled={!quickCapture.trim()}>
                <Zap className="size-4" />
                Lưu nhanh
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5" aria-label="Bộ lọc ghi nhớ">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm trong tiêu đề, nội dung hoặc checklist..."
              className="h-11 w-full rounded-md border border-line bg-elevated pl-10 pr-4 text-sm text-foreground placeholder:text-muted focus:border-accent-500"
            />
          </div>

          <div className="grid grid-cols-2 rounded-md border border-line bg-surface p-1 lg:w-auto" aria-label="Trạng thái ghi nhớ">
            <button
              type="button"
              onClick={() => setWorkspaceView('active')}
              className={cn(
                'flex min-h-9 items-center justify-center gap-2 rounded px-3 text-sm font-medium transition-colors',
                workspaceView === 'active' ? 'bg-elevated text-foreground shadow-sm' : 'text-muted'
              )}
            >
              <Inbox className="size-4" />
              Đang dùng
            </button>
            <button
              type="button"
              onClick={() => setWorkspaceView('archived')}
              className={cn(
                'flex min-h-9 items-center justify-center gap-2 rounded px-3 text-sm font-medium transition-colors',
                workspaceView === 'archived' ? 'bg-elevated text-foreground shadow-sm' : 'text-muted'
              )}
            >
              <Archive className="size-4" />
              Lưu trữ {archivedCount > 0 && `(${archivedCount})`}
            </button>
          </div>

          <Button onClick={openCreateEditor} className="hidden lg:inline-flex">
            <Plus className="size-4" />
            Ghi nhớ mới
          </Button>
        </div>

        {tags.length > 0 && (
          <div className="scrollbar-hide mt-3 flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className={cn(
                'shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                selectedTag === null
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-line bg-elevated text-muted hover:text-foreground'
              )}
            >
              Tất cả
            </button>
            {tags.map((tag) => (
              <button
                type="button"
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={cn(
                  'shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                  selectedTag === tag
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-line bg-elevated text-muted hover:text-foreground'
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </section>

      <section aria-live="polite">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4" aria-label="Đang tải ghi nhớ">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-40 animate-pulse rounded-lg border border-line bg-surface" />
            ))}
          </div>
        ) : visibleNotes.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center border-y border-dashed border-line py-12 text-center">
            <NotebookPen className="mb-4 size-10 text-slate-300 dark:text-slate-600" />
            <h2 className="font-display text-lg font-semibold text-foreground">
              {workspaceView === 'archived' ? 'Chưa có ghi nhớ lưu trữ' : 'Không tìm thấy ghi nhớ'}
            </h2>
            <p className="mt-1 max-w-sm text-sm text-muted">
              {query || selectedTag
                ? 'Thử đổi từ khóa hoặc bỏ bộ lọc đang chọn.'
                : 'Ghi lại một ý nghĩ nhỏ để bắt đầu không gian này.'}
            </p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 items-start gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {visibleNotes.map((note) => {
                const preview = getPreview(note.content);
                const completedItems = (note.checklist || []).filter((item) => item.done).length;

                return (
                  <motion.article
                    layout
                    key={note.id}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    className={cn(
                      'group min-w-0 cursor-pointer rounded-lg border p-3 shadow-sm transition-[border-color,transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md sm:p-4',
                      getCardColor(note.color)
                    )}
                    onClick={() => openEditEditor(note)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="min-w-0 flex-1 break-words font-display text-sm font-bold leading-5 text-foreground sm:text-base">
                        {note.title}
                      </h2>
                      {note.isPinned && <Pin className="size-3.5 shrink-0 fill-current text-emerald-700 dark:text-emerald-400" />}
                    </div>

                    {preview && (
                      <p className="mt-2 line-clamp-5 break-words text-xs leading-5 text-muted sm:text-sm">
                        {preview}
                      </p>
                    )}

                    {(note.checklist || []).length > 0 && (
                      <div className="mt-3 space-y-1.5 border-t border-black/5 pt-3 dark:border-white/10">
                        {(note.checklist || []).slice(0, 3).map((item) => (
                          <div key={item.id} className="flex items-start gap-1.5 text-xs text-foreground/80">
                            {item.done ? (
                              <CheckSquare className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
                            ) : (
                              <Square className="mt-0.5 size-3.5 shrink-0 text-muted" />
                            )}
                            <span className={cn('line-clamp-1 break-all', item.done && 'text-muted line-through')}>
                              {item.text}
                            </span>
                          </div>
                        ))}
                        <p className="text-[11px] font-medium text-muted">
                          {completedItems}/{note.checklist!.length} hoàn thành
                        </p>
                      </div>
                    )}

                    {note.categories?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {note.categories.slice(0, 2).map((tag) => (
                          <span key={tag} className="max-w-full truncate rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold text-muted dark:bg-white/10">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between gap-1 border-t border-black/5 pt-2 dark:border-white/10">
                      <span className="truncate text-[10px] text-muted">
                        {formatRelativeTime(note.modifiedDate || note.createdDate)}
                      </span>
                      <div className="flex shrink-0 items-center">
                        <button
                          type="button"
                          title={note.isPinned ? 'Bỏ ghim' : 'Ghim'}
                          aria-label={note.isPinned ? 'Bỏ ghim' : 'Ghim'}
                          onClick={(event) => {
                            event.stopPropagation();
                            patchNote(note, { isPinned: !note.isPinned });
                          }}
                          className="flex size-8 items-center justify-center rounded text-muted hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10"
                        >
                          <Pin className={cn('size-3.5', note.isPinned && 'fill-current text-emerald-700 dark:text-emerald-400')} />
                        </button>
                        <button
                          type="button"
                          title={note.isArchived ? 'Khôi phục' : 'Lưu trữ'}
                          aria-label={note.isArchived ? 'Khôi phục' : 'Lưu trữ'}
                          onClick={(event) => {
                            event.stopPropagation();
                            patchNote(note, { isArchived: !note.isArchived, isPinned: note.isArchived ? note.isPinned : false });
                          }}
                          className="flex size-8 items-center justify-center rounded text-muted hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10"
                        >
                          {note.isArchived ? <ArchiveRestore className="size-3.5" /> : <Archive className="size-3.5" />}
                        </button>
                        <button
                          type="button"
                          title="Xóa"
                          aria-label="Xóa"
                          onClick={(event) => {
                            event.stopPropagation();
                            setDeleteCandidate(note);
                          }}
                          className="flex size-8 items-center justify-center rounded text-muted hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-950/50"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      <button
        type="button"
        onClick={openCreateEditor}
        aria-label="Tạo ghi nhớ mới"
        title="Tạo ghi nhớ mới"
        className="fixed bottom-5 right-5 z-20 flex size-12 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg transition-transform hover:scale-105 hover:bg-primary-600 lg:hidden"
      >
        <Plus className="size-5" />
      </button>

      <Modal
        isOpen={isEditorOpen}
        onClose={closeEditor}
        title={editingNote ? 'Chỉnh sửa ghi nhớ' : 'Ghi nhớ mới'}
        description="Một nơi nhẹ nhàng cho điều cần nhớ."
        size="xl"
        closeOnOverlayClick={!isSaving}
      >
        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">Tiêu đề</label>
            <input
              value={draft.title}
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              placeholder="Điều gì đang ở trong đầu bro?"
              className="input-field"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">Nội dung</label>
            <QuillEditor
              value={draft.content}
              onChange={(content) => setDraft((current) => ({ ...current, content }))}
              placeholder="Viết tự nhiên, không cần hoàn hảo..."
            />
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Palette className="size-4" />
              Màu ghi nhớ
            </div>
            <div className="flex flex-wrap gap-2">
              {NOTE_COLORS.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  title={option.label}
                  aria-label={option.label}
                  onClick={() => setDraft((current) => ({ ...current, color: option.id }))}
                  className={cn(
                    'flex size-9 items-center justify-center rounded-md border transition-transform hover:scale-105',
                    option.swatch,
                    draft.color === option.id ? 'border-foreground ring-2 ring-accent-200' : 'border-line'
                  )}
                >
                  {draft.color === option.id && <Check className="size-4 text-slate-800" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">Nhãn</label>
            {draft.categories.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {draft.categories.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                    {tag}
                    <button
                      type="button"
                      aria-label={`Xóa nhãn ${tag}`}
                      onClick={() => setDraft((current) => ({ ...current, categories: current.categories.filter((item) => item !== tag) }))}
                      className="rounded-full p-0.5 hover:bg-emerald-100 dark:hover:bg-emerald-900"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Ví dụ: ý tưởng, gia đình"
                className="input-field min-w-0 flex-1"
              />
              <Button variant="secondary" onClick={addTag} disabled={!tagInput.trim()} aria-label="Thêm nhãn">
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground">Checklist</label>
              {draft.checklist.length > 0 && (
                <span className="text-xs text-muted">
                  {draft.checklist.filter((item) => item.done).length}/{draft.checklist.length}
                </span>
              )}
            </div>
            {draft.checklist.length > 0 && (
              <div className="mb-3 space-y-2">
                {draft.checklist.map((item) => (
                  <div key={item.id} className="flex min-h-10 items-center gap-2 rounded-md border border-line bg-surface px-3">
                    <button
                      type="button"
                      aria-label={item.done ? 'Đánh dấu chưa xong' : 'Đánh dấu hoàn thành'}
                      onClick={() => setDraft((current) => ({
                        ...current,
                        checklist: current.checklist.map((entry) => entry.id === item.id ? { ...entry, done: !entry.done } : entry),
                      }))}
                      className="text-emerald-600"
                    >
                      {item.done ? <CheckSquare className="size-4" /> : <Square className="size-4 text-muted" />}
                    </button>
                    <span className={cn('min-w-0 flex-1 break-words text-sm', item.done && 'text-muted line-through')}>{item.text}</span>
                    <button
                      type="button"
                      aria-label="Xóa checklist item"
                      onClick={() => setDraft((current) => ({ ...current, checklist: current.checklist.filter((entry) => entry.id !== item.id) }))}
                      className="text-muted hover:text-red-600"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                value={checklistInput}
                onChange={(event) => setChecklistInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    addChecklistItem();
                  }
                }}
                placeholder="Thêm việc cần nhớ..."
                className="input-field min-w-0 flex-1"
              />
              <Button variant="secondary" onClick={addChecklistItem} disabled={!checklistInput.trim()} aria-label="Thêm checklist item">
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          <ModalFooter>
            <Button variant="secondary" onClick={closeEditor} disabled={isSaving}>Hủy</Button>
            <Button onClick={handleSave} isLoading={isSaving}>Lưu ghi nhớ</Button>
          </ModalFooter>
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(deleteCandidate)}
        onClose={() => setDeleteCandidate(null)}
        title="Xóa ghi nhớ?"
        description="Thao tác này không thể hoàn tác."
        size="sm"
      >
        <p className="mb-6 break-words text-sm text-muted">{deleteCandidate?.title}</p>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setDeleteCandidate(null)}>Giữ lại</Button>
          <Button variant="danger" onClick={confirmDelete}>
            <Trash2 className="size-4" />
            Xóa
          </Button>
        </ModalFooter>
      </Modal>
    </motion.div>
  );
}

export default NotesLabPage;
