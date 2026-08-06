/**
 * @module StoragePage
 * @description Firebase Cloud Storage browser with folder navigation,
 * file upload/download and preview capabilities.
 */
import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Download,
  Trash2,
  Search,
  Eye,
  Folder,
  File,
  Image,
  Video,
  Music,
  FileText,
  Archive,
  ChevronRight,
  HardDrive,
  ArrowLeft,
} from 'lucide-react';
import { Card, Button, Modal, ModalFooter } from '@/components/ui';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/utils';
import {
  listFiles,
  uploadFile,
  deleteFile,
  resolveStoragePath,
} from '@/services/storageService';
import type { FileInfo } from '@/types';
import { toast } from '@/components/ui/Toast';
import { useAuthStore } from '@/stores/authStore';

/** Root-level folders exposed from Firebase Storage. */
const FOLDERS = [
  { name: 'rooms', label: 'Rooms' },
  { name: 'ultrasound_images', label: 'Ultrasound Images' },
];

/**
 * Cloud storage browser page.
 * Displays a folder/file tree from Firebase Storage with upload, download,
 * preview and delete operations.
 */
export function StoragePage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileInfo | null>(null);
  const [fileToDelete, setFileToDelete] = useState<FileInfo | null>(null);
  const [currentPath, setCurrentPath] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);

  const loadFiles = useCallback(async () => {
    if (!isAuthenticated) {
      setFiles([]);
      return;
    }
    setIsLoading(true);
    try {
      const data = await listFiles(resolveStoragePath(currentPath));
      setFiles(data);
    } catch (error) {
      toast.error((error as Error).message || 'Failed to load files');
    } finally {
      setIsLoading(false);
    }
  }, [currentPath, isAuthenticated]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // Check if file is previewable (image or PDF)
  const isPreviewable = (file: FileInfo) => {
    return file.type.startsWith('image') || file.type === 'application/pdf';
  };

  const handlePreview = (file: FileInfo) => {
    if (isPreviewable(file)) {
      setPreviewFile(file);
      setShowPreviewModal(true);
    }
  };

  const handleDeleteClick = (file: FileInfo, e: React.MouseEvent) => {
    e.stopPropagation();
    setFileToDelete(file);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (fileToDelete) {
      try {
        await deleteFile(fileToDelete.id);
        toast.success(`"${fileToDelete.name}" deleted`);
        setShowDeleteConfirm(false);
        setFileToDelete(null);
        loadFiles();
      } catch (error) {
        toast.error((error as Error).message || 'Delete failed');
      }
    }
  };

  const handleDownload = (file: FileInfo, e: React.MouseEvent) => {
    e.stopPropagation();
    if (file.url) {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started!');
    }
  };

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    setIsUploading(true);
    try {
      const selected = Array.from(fileList);
      await Promise.all(
        selected.map((file) =>
          uploadFile(resolveStoragePath(currentPath), file)
        )
      );
      toast.success(`${selected.length} file(s) uploaded successfully!`);
      setShowUploadModal(false);
      loadFiles();
    } catch (error) {
      toast.error((error as Error).message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (type: string) => {
    const fileType = type.split('/')[0];
    switch (fileType) {
      case 'image':
        return <Image className="h-5 w-5 text-accent-600" />;
      case 'video':
        return <Video className="h-5 w-5 text-accent-500" />;
      case 'audio':
        return <Music className="h-5 w-5 text-primary-500" />;
      case 'application':
        if (type.includes('pdf'))
          return <FileText className="w-5 h-5 text-red-400" />;
        if (type.includes('zip') || type.includes('rar'))
          return <Archive className="h-5 w-5 text-primary-500" />;
        return <File className="h-5 w-5 text-muted" />;
      default:
        return <File className="h-5 w-5 text-muted" />;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground lg:text-3xl">
            Storage
          </h1>
          <p className="mt-1 text-muted">
            Sign in to manage your personal cloud files
          </p>
        </div>
        <Card className="p-8 text-center">
          <HardDrive className="mx-auto mb-4 h-12 w-12 text-accent-500" />
          <p className="mb-2 font-semibold text-foreground">Sign in required</p>
          <p className="mb-6 text-sm text-muted">
            Storage is scoped to your account. Please sign in to continue.
          </p>
          <Link
            href="/auth?redirect=/storage"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary-500 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-primary-600"
          >
            Sign in
          </Link>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground lg:text-3xl">
            Storage
          </h1>
          <p className="mt-1 text-muted">Manage your files and documents</p>
        </div>
        <Button onClick={() => setShowUploadModal(true)}>
          <Upload className="w-4 h-4" />
          Upload
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-accent-500" />
            <div>
              <p className="text-lg font-bold text-foreground">
                {formatFileSize(totalSize)}
              </p>
              <p className="text-xs text-muted">Used</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <p className="text-lg font-bold text-foreground">{files.length}</p>
          <p className="text-xs text-muted">Files</p>
        </Card>
        <Card className="p-3">
          <p className="text-lg font-bold text-foreground">{FOLDERS.length}</p>
          <p className="text-xs text-muted">Folders</p>
        </Card>
        <Card className="p-3">
          <p className="text-lg font-bold text-emerald-600">10 GB</p>
          <p className="text-xs text-muted">Available</p>
        </Card>
      </div>

      {/* Search & Breadcrumb */}
      <Card className="p-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm flex-1">
            {currentPath && (
              <button
                onClick={() => setCurrentPath('')}
                className="rounded-md p-1.5 text-muted transition-colors hover:bg-surface hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setCurrentPath('')}
              className={cn(
                'transition-colors',
                currentPath
                  ? 'text-muted hover:text-foreground'
                  : 'font-medium text-foreground'
              )}
            >
              Storage
            </button>
            {currentPath && (
              <>
                <ChevronRight className="h-4 w-4 text-muted" />
                <span className="font-medium text-foreground">
                  {currentPath}
                </span>
              </>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-line bg-elevated py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-100 sm:w-56"
            />
          </div>
        </div>
      </Card>

      {/* File List */}
      <Card className="overflow-hidden">
        {/* Header row */}
        <div className="hidden gap-4 border-b border-line bg-surface px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted sm:grid sm:grid-cols-12">
          <div className="col-span-6">Name</div>
          <div className="col-span-2">Size</div>
          <div className="col-span-2">Modified</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="p-8 text-center">
            <div className="w-8 h-8 mx-auto mb-3 rounded-full border-2 border-primary-500/20 border-t-primary-500 animate-spin" />
            <p className="text-sm text-muted">Loading...</p>
          </div>
        )}

        {/* Folders - only at root */}
        {!isLoading && currentPath === '' && (
          <AnimatePresence>
            {FOLDERS.map((folder, i) => (
              <motion.div
                key={folder.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="grid cursor-pointer grid-cols-12 gap-4 border-b border-line px-4 py-3 transition-colors hover:bg-surface"
                onClick={() => setCurrentPath(folder.name)}
              >
                <div className="col-span-12 sm:col-span-6 flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-50">
                    <Folder className="h-5 w-5 text-accent-600" />
                  </div>
                  <span className="truncate font-medium text-foreground">
                    {folder.label}
                  </span>
                </div>
                <div className="hidden items-center text-sm text-muted sm:col-span-2 sm:flex">
                  —
                </div>
                <div className="hidden items-center text-sm text-muted sm:col-span-2 sm:flex">
                  —
                </div>
                <div className="hidden sm:flex sm:col-span-2 items-center justify-end">
                  <ChevronRight className="h-4 w-4 text-muted" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Files */}
        {!isLoading && (
          <AnimatePresence>
            {filteredFiles.map((file, i) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.02 }}
                className={cn(
                  'grid grid-cols-12 gap-4 border-b border-line px-4 py-3 transition-colors last:border-b-0 hover:bg-surface',
                  isPreviewable(file) && 'cursor-pointer'
                )}
                onClick={() => handlePreview(file)}
              >
                {/* Name */}
                <div className="col-span-12 sm:col-span-6 flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted sm:hidden">
                      {formatFileSize(file.size)} • {formatDate(file.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Size */}
                <div className="hidden items-center text-sm text-muted sm:col-span-2 sm:flex">
                  {formatFileSize(file.size)}
                </div>

                {/* Modified */}
                <div className="hidden items-center text-sm text-muted sm:col-span-2 sm:flex">
                  {formatDate(file.createdAt)}
                </div>

                {/* Actions */}
                <div className="col-span-12 sm:col-span-2 flex items-center justify-end gap-1">
                  {isPreviewable(file) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(file);
                      }}
                      className="rounded-md p-2 text-muted transition-colors hover:bg-accent-50 hover:text-accent-600"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDownload(file, e)}
                    className="rounded-md p-2 text-muted transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(file, e)}
                    className="rounded-md p-2 text-muted transition-colors hover:bg-red-50 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Empty State */}
        {!isLoading && filteredFiles.length === 0 && currentPath !== '' && (
          <div className="p-8 text-center">
            <File className="mx-auto mb-3 h-10 w-10 text-muted" />
            <p className="text-muted">No files in this folder</p>
          </div>
        )}

        {/* Empty State for root with no files (but has folders) */}
        {!isLoading &&
          filteredFiles.length === 0 &&
          currentPath === '' &&
          FOLDERS.length > 0 && (
            <div className="border-t border-line p-6 text-center">
              <p className="text-sm text-muted">No files at root level</p>
            </div>
          )}
      </Card>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Files"
        size="md"
      >
        <div className="space-y-4">
          <div className="rounded-lg border-2 border-dashed border-line bg-surface p-6 text-center transition-colors hover:border-accent-300">
            <Upload className="mx-auto mb-3 h-10 w-10 text-accent-500" />
            <p className="mb-1 font-medium text-foreground">
              Choose files to upload
            </p>
            <p className="mb-4 text-sm text-muted">
              {currentPath
                ? `Uploading to: ${currentPath}/`
                : 'Uploading to: root'}
            </p>
            <input
              type="file"
              multiple
              className="hidden"
              id="file-upload"
              onChange={(e) => handleUpload(e.target.files)}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="inline-flex items-center gap-2 rounded-md bg-primary-500 px-5 py-2.5 font-medium text-white transition-colors hover:bg-primary-600">
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Browse Files
                  </>
                )}
              </span>
            </label>
          </div>
        </div>

        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title={previewFile?.name || 'Preview'}
        size="xl"
      >
        {previewFile && (
          <div className="space-y-4">
            {/* Preview Content */}
            <div className="flex min-h-[300px] max-h-[60vh] items-center justify-center overflow-hidden rounded-lg border border-line bg-surface">
              {previewFile.type.startsWith('image') && previewFile.url ? (
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  className="max-w-full max-h-[60vh] object-contain"
                />
              ) : previewFile.type === 'application/pdf' && previewFile.url ? (
                <iframe
                  src={previewFile.url}
                  className="w-full h-[60vh]"
                  title={previewFile.name}
                />
              ) : (
                <div className="text-center p-8">
                  {getFileIcon(previewFile.type)}
                  <p className="mt-2 text-muted">Preview not available</p>
                </div>
              )}
            </div>

            {/* File Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div className="rounded-md border border-line bg-surface p-3">
                <p className="text-xs text-muted">Size</p>
                <p className="font-medium text-foreground">
                  {formatFileSize(previewFile.size)}
                </p>
              </div>
              <div className="rounded-md border border-line bg-surface p-3">
                <p className="text-xs text-muted">Type</p>
                <p className="truncate font-medium text-foreground">
                  {previewFile.type}
                </p>
              </div>
              <div className="col-span-2 rounded-md border border-line bg-surface p-3">
                <p className="text-xs text-muted">Created</p>
                <p className="font-medium text-foreground">
                  {formatDate(previewFile.createdAt)}
                </p>
              </div>
            </div>
          </div>
        )}

        <ModalFooter>
          <Button
            variant="secondary"
            onClick={() => setShowPreviewModal(false)}
          >
            Close
          </Button>
          <Button
            onClick={() =>
              previewFile &&
              handleDownload(previewFile, {
                stopPropagation: () => {},
              } as React.MouseEvent)
            }
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete File"
        size="sm"
      >
        <div className="text-center py-4">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-50">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <p className="mb-2 text-foreground">
            Are you sure you want to delete?
          </p>
          <p className="truncate px-4 text-sm text-muted">
            "{fileToDelete?.name}"
          </p>
        </div>

        <ModalFooter>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteConfirm(false)}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </motion.div>
  );
}

export default StoragePage;
