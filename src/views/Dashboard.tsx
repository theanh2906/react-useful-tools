/**
 * @module Dashboard
 * @description Landing dashboard with pregnancy overview, upcoming events,
 * recent notes and quick-action cards.
 */
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Calendar,
  FileText,
  Baby,
  Image,
  Apple,
  Clock,
  Heart,
  Activity,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
  Card,
  CircularProgress,
  Badge,
  DatePicker,
} from '@/components/ui';
import { useAppStore } from '@/stores/appStore';
import { useEventsStore } from '@/stores/eventsStore';
import { useNotesStore } from '@/stores/notesStore';
import { useAuthStore } from '@/stores/authStore';
import { listenUltrasounds } from '@/services/ultrasoundService';
import { listenPeanutRecords, listenSoyaRecords } from '@/services/babyService';
import { cn } from '@/lib/utils';
import { useEffect, useMemo, useState } from 'react';
import { SHOW_PREGNANCY_UI } from '@/config/constants';

import { useSettingsStore } from '@/stores/settingsStore';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Main dashboard page.
 * Aggregates pregnancy info, upcoming calendar events, recent notes,
 * ultrasound gallery previews and baby growth stats into a single view.
 */
export function Dashboard() {
  const getPregnancyInfo = useAppStore((state) => state.getPregnancyInfo);
  const getBabyAge = useAppStore((state) => state.getBabyAge);
  const conceptionDate = useAppStore((state) => state.conceptionDate);
  const babyBirthDate = useAppStore((state) => state.babyBirthDate);
  const setConceptionDate = useAppStore((state) => state.setConceptionDate);
  const setBabyBirthDate = useAppStore((state) => state.setBabyBirthDate);
  const saveProfile = useAppStore((state) => state.saveProfile);

  const pregnancyInfo = getPregnancyInfo();
  const babyAge = getBabyAge();

  const { events, subscribeEvents } = useEventsStore();
  const { notes, subscribeNotes } = useNotesStore();
  const userId = useAuthStore((state) => state.user?.id);
  const [ultrasoundCount, setUltrasoundCount] = useState(0);
  const [peanutCount, setPeanutCount] = useState(0);
  const [soyaCount, setSoyaCount] = useState(0);

  const dashboardLayout = useSettingsStore((state) => state.settings.dashboardLayout) || [];
  const sortedLayout = [...dashboardLayout].sort((a, b) => a.order - b.order);

  useEffect(() => {
    subscribeEvents();
    subscribeNotes();
  }, [subscribeEvents, subscribeNotes, userId]);

  useEffect(() => {
    let unsubUltrasounds: (() => void) | null = null;
    let unsubPeanut: (() => void) | null = null;
    let unsubSoya: (() => void) | null = null;

    if (SHOW_PREGNANCY_UI) {
      listenUltrasounds((data) => setUltrasoundCount(data.length)).then(
        (unsub) => {
          unsubUltrasounds = unsub;
        }
      );
      listenSoyaRecords((data) => setSoyaCount(data.length)).then((unsub) => {
        unsubSoya = unsub;
      });
    } else {
      setUltrasoundCount(0);
      setSoyaCount(0);
    }
    listenPeanutRecords((data) => setPeanutCount(data.length)).then((unsub) => {
      unsubPeanut = unsub;
    });

    return () => {
      if (unsubUltrasounds) unsubUltrasounds();
      if (unsubPeanut) unsubPeanut();
      if (unsubSoya) unsubSoya();
    };
  }, [userId]);

  const stats = useMemo(
    () => ({
      developmentRecords: peanutCount + soyaCount,
      scheduledEvents: events.length,
      ultrasoundScans: ultrasoundCount,
    }),
    [peanutCount, soyaCount, events.length, ultrasoundCount]
  );

  const statCards = useMemo(() => {
    if (SHOW_PREGNANCY_UI) {
      return [
        {
          icon: Activity,
          label: 'Development Records',
          value: stats.developmentRecords,
          color: 'text-emerald-400',
        },
        {
          icon: Calendar,
          label: 'Scheduled Events',
          value: stats.scheduledEvents,
          color: 'text-blue-400',
        },
        {
          icon: Image,
          label: 'Ultrasound Scans',
          value: stats.ultrasoundScans,
          color: 'text-purple-400',
        },
      ];
    }
    return [
      {
        icon: Activity,
        label: 'Development Records',
        value: peanutCount,
        color: 'text-emerald-400',
      },
      {
        icon: Calendar,
        label: 'Scheduled Events',
        value: stats.scheduledEvents,
        color: 'text-blue-400',
      },
    ];
  }, [stats, peanutCount]);

  const quickActions = useMemo(() => {
    const all: {
      icon: typeof Calendar;
      label: string;
      path: string;
      color: string;
      pregnancyOnly?: boolean;
    }[] = [
      {
        icon: Calendar,
        label: 'Calendar',
        path: '/calendar',
        color: 'from-pink-500 to-rose-500',
      },
      {
        icon: FileText,
        label: 'Notes',
        path: '/notes',
        color: 'from-blue-500 to-cyan-500',
      },
      {
        icon: Baby,
        label: 'Baby Tracker',
        path: '/baby',
        color: 'from-purple-500 to-violet-500',
      },
      {
        icon: Image,
        label: 'Ultrasounds',
        path: '/ultrasounds',
        color: 'from-amber-500 to-orange-500',
        pregnancyOnly: true,
      },
      {
        icon: Apple,
        label: 'Food Guide',
        path: '/foods',
        color: 'from-emerald-500 to-teal-500',
        pregnancyOnly: true,
      },
      {
        icon: Clock,
        label: 'Timeline',
        path: '/timeline',
        color: 'from-indigo-500 to-purple-500',
        pregnancyOnly: true,
      },
    ];
    return all.filter((a) => SHOW_PREGNANCY_UI || !a.pregnancyOnly);
  }, []);

  const renderSection = (id: string) => {
    switch (id) {
      case 'quick-setup':
        if (!(SHOW_PREGNANCY_UI ? !pregnancyInfo : !babyBirthDate)) return null;
        return (
          <motion.div key={id} variants={itemVariants}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-display font-semibold text-white">
                    Quick Setup
                  </h2>
                  <p className="text-sm text-slate-400">
                    {SHOW_PREGNANCY_UI
                      ? 'Add key dates to personalize your dashboard'
                      : "Add your baby's birth date to personalize the dashboard"}
                  </p>
                </div>
                <Badge variant="warning">Setup</Badge>
              </div>
              <div
                className={cn(
                  'grid gap-4',
                  SHOW_PREGNANCY_UI ? 'sm:grid-cols-2' : 'sm:grid-cols-1'
                )}
              >
                {SHOW_PREGNANCY_UI && (
                  <DatePicker
                    label="Conception Date"
                    value={conceptionDate || ''}
                    onChange={(date) => setConceptionDate(date)}
                    placeholder="Select conception date"
                    maxDate={new Date().toISOString().split('T')[0]}
                  />
                )}
                <DatePicker
                  label={
                    SHOW_PREGNANCY_UI
                      ? 'Baby Birth Date (optional)'
                      : 'Baby Birth Date'
                  }
                  value={babyBirthDate || ''}
                  onChange={(date) => setBabyBirthDate(date)}
                  placeholder="Select birth date"
                  maxDate={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="mt-4 flex justify-end">
                <button className="btn-primary" onClick={() => saveProfile()}>
                  Save Profile
                </button>
              </div>
            </Card>
          </motion.div>
        );

      case 'stats-grid':
        return (
          <motion.div key={id} variants={itemVariants}>
            <div
              className={cn(
                'grid gap-4 lg:gap-6',
                statCards.length === 3 ? 'grid-cols-3' : 'grid-cols-2'
              )}
            >
              {statCards.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card hover glow className="p-5 lg:p-6">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4',
                        stat.color
                      )}
                    >
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <p className="stat-value">{stat.value}</p>
                    <p className="stat-label text-xs lg:text-sm">{stat.label}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case 'quick-actions':
        return (
          <motion.div key={id} variants={itemVariants}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-display font-semibold text-white">
                  Quick Actions
                </h2>
                <Badge variant="info">{quickActions.length} Tools</Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {quickActions.map((action, i) => (
                  <motion.div
                    key={action.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={action.path}
                      className="group flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
                    >
                      <div
                        className={cn(
                          'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform',
                          action.color
                        )}
                      >
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                        {action.label}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        );

      case 'baby-age':
        if (!babyAge) return null;
        return (
          <motion.div key={id} variants={itemVariants}>
            <Card variant="gradient" className="p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                  <Baby className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-white">
                    Peanut's Age
                  </h3>
                  <p className="text-xs text-slate-400">Your little one</p>
                </div>
              </div>

              <div className="flex justify-center mb-6">
                <CircularProgress value={babyAge.weeks} max={52} size={140} />
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-2xl font-display font-bold text-white">
                    {babyAge.days}
                  </p>
                  <p className="text-xs text-slate-400">Days</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-2xl font-display font-bold text-white">
                    {babyAge.weeks}
                  </p>
                  <p className="text-xs text-slate-400">Weeks</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-2xl font-display font-bold text-white">
                    {babyAge.months}
                  </p>
                  <p className="text-xs text-slate-400">Months</p>
                </div>
              </div>
            </Card>
          </motion.div>
        );

      case 'recent-activity':
        return (
          <motion.div key={id} variants={itemVariants}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-display font-semibold text-white">
                  Recent Activity
                </h2>
                {SHOW_PREGNANCY_UI ? (
                  <Link
                    href="/timeline"
                    className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
                  >
                    View All <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <Link
                    href="/calendar"
                    className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
                  >
                    Calendar <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
              <div className="space-y-4">
                {[
                  ...events.slice(0, 2).map((event) => ({
                    icon: Calendar,
                    title: event.title,
                    time: new Date(event.start).toLocaleString(),
                    color: 'bg-blue-500/20 text-blue-400',
                  })),
                  ...notes.slice(0, 2).map((note) => ({
                    icon: FileText,
                    title: note.title,
                    time: new Date(note.createdDate).toLocaleString(),
                    color: 'bg-amber-500/20 text-amber-400',
                  })),
                ]
                  .slice(0, 4)
                  .map((activity, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div
                        className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          activity.color
                        )}
                      >
                        <activity.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-slate-500">{activity.time}</p>
                      </div>
                    </motion.div>
                  ))}
                {events.length === 0 && notes.length === 0 && (
                  <p className="text-sm text-slate-500">
                    No recent activity yet.
                  </p>
                )}
              </div>
            </Card>
          </motion.div>
        );

      case 'todays-tip':
        return (
          <motion.div key={id} variants={itemVariants}>
            <Card className="p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-white">
                    Today's Tip
                  </h3>
                  <p className="text-xs text-slate-400">
                    {SHOW_PREGNANCY_UI
                      ? `Week ${pregnancyInfo?.currentWeek || 0} advice`
                      : 'Newborn care'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {SHOW_PREGNANCY_UI ? (
                  <>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                      <p className="text-slate-300 leading-relaxed">
                        💡{' '}
                        <span className="text-white font-medium">
                          Stay hydrated!
                        </span>{' '}
                        Aim for 8-10 glasses of water daily. This helps maintain
                        amniotic fluid levels and supports your baby's
                        development.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 rounded-xl bg-white/5 text-center">
                        <Activity className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                        <p className="text-sm text-white font-medium">
                          Baby Size
                        </p>
                        <p className="text-xs text-slate-400">Like a lemon 🍋</p>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 text-center">
                        <Heart className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                        <p className="text-sm text-white font-medium">
                          Heart Rate
                        </p>
                        <p className="text-xs text-slate-400">150-160 BPM</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                      <p className="text-slate-300 leading-relaxed">
                        💡{' '}
                        <span className="text-white font-medium">Rest when baby rests.</span>{' '}
                        Short naps help you recover, especially in the first
                        weeks. Ask for help with meals or chores when you can.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 rounded-xl bg-white/5 text-center">
                        <Heart className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                        <p className="text-sm text-white font-medium">
                          Safe sleep
                        </p>
                        <p className="text-xs text-slate-400">
                          Alone, on back, in crib
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 text-center">
                        <Activity className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                        <p className="text-sm text-white font-medium">Feeding</p>
                        <p className="text-xs text-slate-400">
                          Follow pediatric guidance
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {sortedLayout.filter(item => item.visible).map(item => renderSection(item.id))}
    </motion.div>
  );
}

export default Dashboard;
