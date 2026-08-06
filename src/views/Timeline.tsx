/**
 * @module TimelinePage
 * @description Pregnancy timeline page with categorised milestone, checkup,
 * ultrasound and note events.
 */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Calendar,
  Baby,
  Heart,
  Activity,
  Image as ImageIcon,
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
  addTimelineEvent,
  listenTimeline,
  type TimelineEvent,
} from '@/services/timelineService';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/components/ui/Toast';

/** Visual configuration for each timeline event type (label, icon, colour). */
const typeConfig = {
  checkup: {
    label: 'Checkup',
    icon: Activity,
    color: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  milestone: {
    label: 'Milestone',
    icon: Baby,
    color: 'border-primary-200 bg-primary-50 text-primary-700',
  },
  ultrasound: {
    label: 'Ultrasound',
    icon: ImageIcon,
    color: 'border-accent-200 bg-accent-50 text-accent-700',
  },
  note: {
    label: 'Note',
    icon: Heart,
    color: 'border-amber-200 bg-amber-50 text-amber-700',
  },
};

/**
 * Timeline page.
 * Displays a vertical timeline of pregnancy-related events (checkups,
 * milestones, ultrasounds, notes) synced via Firebase.
 */
export function TimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const userId = useAuthStore((state) => state.user?.id);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    type: 'milestone' as TimelineEvent['type'],
  });

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    listenTimeline((data) => setEvents(data)).then((unsub) => {
      unsubscribe = unsub;
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userId]);

  const handleAdd = async () => {
    if (!form.title.trim()) {
      toast.error('Enter a title');
      return;
    }
    await addTimelineEvent(form);
    setShowModal(false);
    toast.success('Timeline event added');
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
            Timeline
          </h1>
          <p className="mt-1 text-muted">
            Your pregnancy journey, beautifully captured
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          Add Event
        </Button>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {events.length === 0 && (
            <p className="text-sm text-muted">No timeline events yet.</p>
          )}
          {events.map((event, index) => {
            const config = typeConfig[event.type];
            const Icon = config.icon;
            return (
              <div key={event.id} className="relative pl-8">
                {index !== events.length - 1 && (
                  <div className="absolute bottom-0 left-3 top-8 w-px bg-line" />
                )}
                <div className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full border border-accent-200 bg-accent-50">
                  <Icon className="h-3.5 w-3.5 text-accent-600" />
                </div>
                <div className="rounded-lg border border-line bg-surface p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-medium text-foreground">{event.title}</h3>
                    <Badge className={config.color}>{config.label}</Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                    <Calendar className="w-3.5 h-3.5" />
                    {event.date}
                  </div>
                  <p className="mt-2 text-sm text-muted">
                    {event.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add Timeline Event"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <DatePicker
            label="Date"
            value={form.date}
            onChange={(date) => setForm({ ...form, date })}
            placeholder="Select date"
          />
          <Input
            label="Description"
            placeholder="What happened?"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Type
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(typeConfig).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() =>
                    setForm({ ...form, type: key as TimelineEvent['type'] })
                  }
                  className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    form.type === key
                      ? 'border-accent-500 bg-accent-50 text-accent-700'
                      : 'border-line bg-elevated text-muted hover:bg-surface hover:text-foreground'
                  }`}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd}>Add</Button>
        </ModalFooter>
      </Modal>
    </motion.div>
  );
}

export default TimelinePage;
