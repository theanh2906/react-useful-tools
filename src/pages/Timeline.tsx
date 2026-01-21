import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, Baby, Heart, Activity, Image as ImageIcon } from 'lucide-react';
import { Card, Button, Badge, Modal, ModalFooter, Input } from '@/components/ui';
import { addTimelineEvent, listenTimeline, type TimelineEvent } from '@/services/timelineService';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/components/ui/Toast';

const typeConfig = {
  checkup: { label: 'Checkup', icon: Activity, color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  milestone: { label: 'Milestone', icon: Baby, color: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
  ultrasound: { label: 'Ultrasound', icon: ImageIcon, color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  note: { label: 'Note', icon: Heart, color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
};

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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-white">Timeline</h1>
          <p className="text-slate-400 mt-1">Your pregnancy journey, beautifully captured</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          Add Event
        </Button>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {events.length === 0 && (
            <p className="text-sm text-slate-500">No timeline events yet.</p>
          )}
          {events.map((event, index) => {
            const config = typeConfig[event.type];
            const Icon = config.icon;
            return (
              <div key={event.id} className="relative pl-8">
                {index !== events.length - 1 && (
                  <div className="absolute left-3 top-8 bottom-0 w-px bg-white/10" />
                )}
                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-slate-300" />
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-medium text-white">{event.title}</h3>
                    <Badge className={config.color}>{config.label}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {event.date}
                  </div>
                  <p className="text-sm text-slate-400 mt-2">{event.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Timeline Event">
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Input
            label="Description"
            placeholder="What happened?"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(typeConfig).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setForm({ ...form, type: key as TimelineEvent['type'] })}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    form.type === key ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
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
