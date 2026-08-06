/**
 * @module UltrasoundGalleryPage
 * @description Ultrasound image gallery with upload, preview and date-tagged management
 * backed by Firebase Cloud Storage.
 */
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Calendar,
  Eye,
} from 'lucide-react';
import {
  Card,
  Button,
  Badge,
  Modal,
  ModalFooter,
  Input,
  DatePicker,
} from '@/components/ui';
import {
  deleteUltrasound,
  listenUltrasounds,
  uploadUltrasound,
  type UltrasoundRecord,
} from '@/services/ultrasoundService';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/components/ui/Toast';

/**
 * Ultrasound gallery page.
 * Allows uploading, viewing and deleting ultrasound images with date and
 * week metadata. Images are stored in Firebase Cloud Storage.
 */
export function UltrasoundGalleryPage() {
  const [items, setItems] = useState<UltrasoundRecord[]>([]);
  const [selected, setSelected] = useState<UltrasoundRecord | null>(null);
  const userId = useAuthStore((state) => state.user?.id);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    listenUltrasounds((data) => setItems(data)).then((unsub) => {
      unsubscribe = unsub;
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userId]);

  const handleUpload = async (file: File) => {
    if (!isAuthenticated) {
      toast.error('Sign in to upload images to your personal gallery.');
      return;
    }
    try {
      await uploadUltrasound(file, date, notes);
      setNotes('');
      toast.success('Ultrasound added');
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Upload failed. Try signing in again.'
      );
    }
  };

  const handleDelete = async (record: UltrasoundRecord) => {
    await deleteUltrasound(record);
    toast.success('Deleted');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground lg:text-3xl">
            Ultrasound Gallery
          </h1>
          <p className="mt-1 text-muted">
            Save and revisit precious moments
          </p>
        </div>
        <Button
          disabled={!isAuthenticated}
          onClick={() => fileInputRef.current?.click()}
          title={
            !isAuthenticated ? 'Sign in to upload' : undefined
          }
        >
          <Upload className="w-4 h-4" />
          Upload
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
        />
      </div>

      <Card className="p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <DatePicker
            label="Scan Date"
            value={date}
            onChange={(date) => setDate(date)}
            placeholder="Select scan date"
          />
          <Input
            label="Notes"
            placeholder="Week 20 scan..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <div className="text-sm text-muted">
          Upload an ultrasound image to add it to your gallery.
        </div>
      </Card>

      {items.length === 0 ? (
        <Card className="p-12 text-center">
          <ImageIcon className="mx-auto mb-4 h-12 w-12 text-accent-300" />
          <h3 className="mb-2 text-lg font-medium text-foreground">
            No ultrasounds yet
          </h3>
          <p className="text-muted">Upload your first ultrasound image</p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="p-3">
                  <img
                    src={item.url}
                    alt="ultrasound"
                    className="h-48 w-full rounded-lg object-cover"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.date}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelected(item)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                  {item.notes && (
                    <p className="mt-2 text-xs text-muted">{item.notes}</p>
                  )}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Ultrasound Preview"
        size="lg"
      >
        {selected && (
          <div className="space-y-4">
            <img
              src={selected.url}
              alt="ultrasound"
              className="max-h-[480px] w-full rounded-lg object-contain"
            />
            <div className="flex items-center gap-2">
              <Badge variant="primary">{selected.date}</Badge>
              {selected.notes && (
                <Badge variant="default">{selected.notes}</Badge>
              )}
            </div>
          </div>
        )}
        <ModalFooter>
          <Button variant="secondary" onClick={() => setSelected(null)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </motion.div>
  );
}

export default UltrasoundGalleryPage;
