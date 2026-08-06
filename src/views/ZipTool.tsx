/**
 * @module ZipTool
 * @description ZIP archive creation tool with drag-and-drop file selection,
 * progress tracking and client-side compression via JSZip.
 */
import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Download,
  Trash2,
  X,
  CheckCircle,
  Loader2,
  FolderArchive,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Represents a file queued for inclusion in the ZIP archive.
 */
interface FileItem {
  /** Unique identifier. */
  id: string;
  /** Original `File` object. */
  file: File;
  /** Display name. */
  name: string;
  /** File size in bytes. */
  size: number;
  /** MIME type. */
  type: string;
}

/**
 * Formats a byte count into a human-readable string (e.g. `1.5 MB`).
 *
 * @param bytes - Raw byte count.
 * @returns Formatted file size string.
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Returns an emoji icon representing the given MIME type.
 *
 * @param type - File MIME type string.
 * @returns An emoji character.
 */
function getFileIcon(type: string): string {
  if (type.startsWith('image/')) return '🖼️';
  if (type.startsWith('video/')) return '🎬';
  if (type.startsWith('audio/')) return '🎵';
  if (type === 'application/pdf') return '📄';
  if (type.includes('word') || type.includes('document')) return '📝';
  if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
  if (type.includes('zip') || type.includes('archive') || type.includes('rar'))
    return '📦';
  return '📎';
}

/**
 * ZIP tool page.
 * Allows users to drag-and-drop or browse files, then compress them into
 * a downloadable `.zip` archive using JSZip.
 */
export default function ZipTool() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [zipName, setZipName] = useState('archive');
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: FileItem[] = Array.from(selectedFiles).map((file) => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setFiles([]);
    setProgress(0);
    setSuccess(false);
  }, []);

  const createZip = useCallback(async () => {
    if (files.length === 0) return;

    setIsCreating(true);
    setProgress(0);
    setSuccess(false);

    try {
      const zip = new JSZip();
      const total = files.length;

      for (let i = 0; i < files.length; i++) {
        const fileItem = files[i];
        const arrayBuffer = await fileItem.file.arrayBuffer();
        zip.file(fileItem.name, arrayBuffer);
        setProgress(Math.round(((i + 1) / total) * 80));
      }

      setProgress(90);

      const blob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      setProgress(100);

      const fileName = zipName.trim() || 'archive';
      saveAs(blob, `${fileName}.zip`);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error creating zip:', error);
    } finally {
      setIsCreating(false);
    }
  }, [files, zipName]);

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Zip Tool
          </h1>
          <p className="mt-1 text-muted">
            Create ZIP archives from multiple files
          </p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card>
            {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center
                transition-colors duration-300
                ${
                  isDragging
                    ? 'border-accent-500 bg-accent-50'
                    : 'border-line bg-surface hover:border-accent-300'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />

              <motion.div
                animate={{ scale: isDragging ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Upload
                  className={`mx-auto mb-4 h-12 w-12 ${isDragging ? 'text-accent-600' : 'text-muted'}`}
                />
              </motion.div>

              <p className="mb-2 font-medium text-foreground">
                {isDragging ? 'Drop files here...' : 'Drag & drop files here'}
              </p>
              <p className="text-sm text-muted">or click to browse</p>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-foreground">
                    Selected Files ({files.length})
                  </h3>
                  <Button variant="ghost" size="sm" onClick={clearAll}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  <AnimatePresence>
                    {files.map((file, index) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className="group flex items-center gap-3 rounded-lg border border-line bg-surface p-3 transition-colors hover:border-accent-200 hover:bg-accent-50/40"
                      >
                        <span className="text-2xl">
                          {getFileIcon(file.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {file.name}
                          </p>
                          <p className="text-xs text-muted">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(file.id);
                          }}
                          className="rounded-md p-1 text-red-600 opacity-0 transition-colors hover:bg-red-50 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="sticky top-6 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-lg bg-accent-50 p-3">
                <FolderArchive className="h-6 w-6 text-accent-600" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Create ZIP</h3>
                <p className="text-sm text-muted">Configure your archive</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="rounded-lg border border-line bg-surface p-3">
                <p className="mb-1 text-xs text-muted">Files</p>
                <p className="font-semibold text-foreground">{files.length}</p>
              </div>
              <div className="rounded-lg border border-line bg-surface p-3">
                <p className="mb-1 text-xs text-muted">Total Size</p>
                <p className="font-semibold text-foreground">
                  {formatFileSize(totalSize)}
                </p>
              </div>
            </div>

            {/* Zip Name */}
            <div className="mb-6">
              <label className="mb-2 block text-sm text-foreground">
                Archive Name
              </label>
              <div className="flex items-center gap-2">
                <Input
                  value={zipName}
                  onChange={(e) => setZipName(e.target.value)}
                  placeholder="archive"
                  className="flex-1"
                />
                <span className="text-muted">.zip</span>
              </div>
            </div>

            {/* Progress */}
            {isCreating && (
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted">Creating archive...</span>
                  <span className="text-accent-600">{progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface">
                  <motion.div
                    className="h-full bg-accent-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            {/* Success Message */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-700"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm">ZIP created successfully!</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Create Button */}
            <Button
              onClick={createZip}
              disabled={files.length === 0 || isCreating}
              className="w-full"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Create & Download ZIP
                </>
              )}
            </Button>

            {/* Info */}
            <p className="mt-4 text-center text-xs text-muted">
              Files are compressed locally in your browser
            </p>
          </Card>
        </motion.div>
      </div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Features
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: '🔒',
                title: 'Local Processing',
                desc: 'Files never leave your device',
              },
              {
                icon: '⚡',
                title: 'Fast Compression',
                desc: 'Efficient DEFLATE algorithm',
              },
              {
                icon: '📁',
                title: 'Any File Type',
                desc: 'Support all file formats',
              },
              {
                icon: '♾️',
                title: 'No Limits',
                desc: 'No file size restrictions',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="rounded-lg border border-line bg-surface p-4"
              >
                <span className="text-2xl mb-2 block">{feature.icon}</span>
                <h3 className="mb-1 font-medium text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted">{feature.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
