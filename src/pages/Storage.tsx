/**
 * @module StoragePage
 * @description Firebase Cloud Storage browser with folder navigation,
 * file upload/download and preview capabilities.
 */
import { useState, useCallback, useEffect } from 'react';
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
import { listFiles, uploadFile, deleteFile } from '@/services/storageService';
import type { FileInfo } from '@/types';
import { toast } from '@/components/ui/Toast';

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
    setIsLoading(true);
    try {
      const data = await listFiles(currentPath);
      setFiles(data);
    } catch (error) {
      toast.error((error as Error).message || 'Failed to load files');
    } finally {
      setIsLoading(false);
    }
  }, [currentPath]);

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
      await Promise.all(selected.map((file) => uploadFile(currentPath, file)));
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
        return <Image className="w-5 h-5 text-purple-400" />;
      case 'video':
        return <Video className="w-5 h-5 text-blue-400" />;
      case 'audio':
        return <Music className="w-5 h-5 text-pink-400" />;
      case 'application':
        if (type.includes('pdf'))
          return <FileText className="w-5 h-5 text-red-400" />;
        if (type.includes('zip') || type.includes('rar'))
          return <Archive className="w-5 h-5 text-amber-400" />;
        return <File className="w-5 h-5 text-slate-400" />;
      default:
        return <File className="w-5 h-5 text-slate-400" />;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-white">
            Storage
          </h1>
          <p className="text-slate-400 mt-1">Manage your files and documents</p>
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
            <HardDrive className="w-4 h-4 text-primary-400" />
            <div>
              <p className="text-lg font-bold text-white">
                {formatFileSize(totalSize)}
              </p>
              <p className="text-xs text-slate-500">Used</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <p className="text-lg font-bold text-white">{files.length}</p>
          <p className="text-xs text-slate-500">Files</p>
        </Card>
        <Card className="p-3">
          <p className="text-lg font-bold text-white">{FOLDERS.length}</p>
          <p className="text-xs text-slate-500">Folders</p>
        </Card>
        <Card className="p-3">
          <p className="text-lg font-bold text-emerald-400">10 GB</p>
          <p className="text-xs text-slate-500">Available</p>
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
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setCurrentPath('')}
              className={cn(
                'transition-colors',
                currentPath
                  ? 'text-slate-400 hover:text-white'
                  : 'text-white font-medium'
              )}
            >
              Storage
            </button>
            {currentPath && (
              <>
                <ChevronRight className="w-4 h-4 text-slate-600" />
                <span className="text-white font-medium">{currentPath}</span>
              </>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-56 pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500/50"
            />
          </div>
        </div>
      </Card>

      {/* File List */}
      <Card className="overflow-hidden">
        {/* Header row */}
        <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-4 py-3 bg-white/5 text-xs font-medium text-slate-400 uppercase tracking-wider">
          <div className="col-span-6">Name</div>
          <div className="col-span-2">Size</div>
          <div className="col-span-2">Modified</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="p-8 text-center">
            <div className="w-8 h-8 mx-auto mb-3 rounded-full border-2 border-primary-500/20 border-t-primary-500 animate-spin" />
            <p className="text-slate-400 text-sm">Loading...</p>
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
                className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5"
                onClick={() => setCurrentPath(folder.name)}
              >
                <div className="col-span-12 sm:col-span-6 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                    <Folder className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className="font-medium text-white truncate">
                    {folder.label}
                  </span>
                </div>
                <div className="hidden sm:flex sm:col-span-2 items-center text-sm text-slate-500">
                  —
                </div>
                <div className="hidden sm:flex sm:col-span-2 items-center text-sm text-slate-500">
                  —
                </div>
                <div className="hidden sm:flex sm:col-span-2 items-center justify-end">
                  <ChevronRight className="w-4 h-4 text-slate-500" />
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
                  'grid grid-cols-12 gap-4 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0',
                  isPreviewable(file) && 'cursor-pointer'
                )}
                onClick={() => handlePreview(file)}
              >
                {/* Name */}
                <div className="col-span-12 sm:col-span-6 flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500 sm:hidden">
                      {formatFileSize(file.size)} • {formatDate(file.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Size */}
                <div className="hidden sm:flex sm:col-span-2 items-center text-sm text-slate-400">
                  {formatFileSize(file.size)}
                </div>

                {/* Modified */}
                <div className="hidden sm:flex sm:col-span-2 items-center text-sm text-slate-400">
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
                      className="p-2 rounded-lg text-slate-400 hover:text-primary-400 hover:bg-primary-500/10 transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDownload(file, e)}
                    className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(file, e)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
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
            <File className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No files in this folder</p>
          </div>
        )}

        {/* Empty State for root with no files (but has folders) */}
        {!isLoading &&
          filteredFiles.length === 0 &&
          currentPath === '' &&
          FOLDERS.length > 0 && (
            <div className="p-6 text-center border-t border-white/5">
              <p className="text-slate-500 text-sm">No files at root level</p>
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
          <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-primary-500/50 transition-colors">
            <Upload className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p className="text-white font-medium mb-1">
              Choose files to upload
            </p>
            <p className="text-sm text-slate-400 mb-4">
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
              <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-all">
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
            <div className="bg-black/30 rounded-xl overflow-hidden flex items-center justify-center min-h-[300px] max-h-[60vh]">
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
                  <p className="text-slate-400 mt-2">Preview not available</p>
                </div>
              )}
            </div>

            {/* File Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-slate-500 text-xs">Size</p>
                <p className="text-white font-medium">
                  {formatFileSize(previewFile.size)}
                </p>
              </div>
              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-slate-500 text-xs">Type</p>
                <p className="text-white font-medium truncate">
                  {previewFile.type}
                </p>
              </div>
              <div className="p-3 bg-white/5 rounded-lg col-span-2">
                <p className="text-slate-500 text-xs">Created</p>
                <p className="text-white font-medium">
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
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-400" />
          </div>
          <p className="text-white mb-2">Are you sure you want to delete?</p>
          <p className="text-slate-400 text-sm truncate px-4">
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
