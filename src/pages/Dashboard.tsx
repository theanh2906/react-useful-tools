import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Calendar, FileText, Baby, Image, Apple, Clock, 
  TrendingUp, Heart, Activity, Sparkles, ArrowRight,
  Sun
} from 'lucide-react';
import { Card, CardContent, Progress, CircularProgress, Badge } from '@/components/ui';
import { useAppStore } from '@/stores/appStore';
import { useEventsStore } from '@/stores/eventsStore';
import { useNotesStore } from '@/stores/notesStore';
import { useAuthStore } from '@/stores/authStore';
import { listenUltrasounds } from '@/services/ultrasoundService';
import { listenPeanutRecords, listenSoyaRecords } from '@/services/babyService';
import { useCountdown } from '@/hooks';
import { cn } from '@/lib/utils';
import { useEffect, useMemo, useState } from 'react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

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

  const dueDate = pregnancyInfo?.dueDate || new Date();
  const countdown = useCountdown(dueDate);

  useEffect(() => {
    subscribeEvents();
    subscribeNotes();
  }, [subscribeEvents, subscribeNotes, userId]);

  useEffect(() => {
    let unsubUltrasounds: (() => void) | null = null;
    let unsubPeanut: (() => void) | null = null;
    let unsubSoya: (() => void) | null = null;

    listenUltrasounds((data) => setUltrasoundCount(data.length)).then((unsub) => {
      unsubUltrasounds = unsub;
    });
    listenPeanutRecords((data) => setPeanutCount(data.length)).then((unsub) => {
      unsubPeanut = unsub;
    });
    listenSoyaRecords((data) => setSoyaCount(data.length)).then((unsub) => {
      unsubSoya = unsub;
    });

    return () => {
      if (unsubUltrasounds) unsubUltrasounds();
      if (unsubPeanut) unsubPeanut();
      if (unsubSoya) unsubSoya();
    };
  }, [userId]);

  const stats = useMemo(() => ({
    developmentRecords: peanutCount + soyaCount,
    scheduledEvents: events.length,
    ultrasoundScans: ultrasoundCount,
    foodItems: foodCount,
  }), [peanutCount, soyaCount, events.length, ultrasoundCount, foodCount]);

  const quickActions = [
    { icon: Calendar, label: 'Calendar', path: '/calendar', color: 'from-pink-500 to-rose-500' },
    { icon: FileText, label: 'Notes', path: '/notes', color: 'from-blue-500 to-cyan-500' },
    { icon: Baby, label: 'Baby Tracker', path: '/baby', color: 'from-purple-500 to-violet-500' },
    { icon: Image, label: 'Ultrasounds', path: '/ultrasounds', color: 'from-amber-500 to-orange-500' },
    { icon: Apple, label: 'Food Guide', path: '/foods', color: 'from-emerald-500 to-teal-500' },
    { icon: Clock, label: 'Timeline', path: '/timeline', color: 'from-indigo-500 to-purple-500' },
  ];

  const trimesterInfo = [
    { trimester: 1, label: 'First Trimester', weeks: '1-12', description: 'Baby is forming' },
    { trimester: 2, label: 'Second Trimester', weeks: '13-27', description: 'Baby is growing' },
    { trimester: 3, label: 'Third Trimester', weeks: '28-40', description: 'Almost there!' },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {!pregnancyInfo && (
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-display font-semibold text-white">Quick Setup</h2>
                <p className="text-sm text-slate-400">Add key dates to personalize your dashboard</p>
              </div>
              <Badge variant="warning">Setup</Badge>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Conception Date</label>
                <input
                  type="date"
                  value={conceptionDate || ''}
                  onChange={(e) => setConceptionDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Baby Birth Date (optional)</label>
                <input
                  type="date"
                  value={babyBirthDate || ''}
                  onChange={(e) => setBabyBirthDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                className="btn-primary"
                onClick={() => saveProfile()}
              >
                Save Profile
              </button>
            </div>
          </Card>
        </motion.div>
      )}
      {/* Hero Section */}
      <motion.div variants={itemVariants} className="relative">
        <Card variant="gradient" className="overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-pink-500/10 to-accent-500/20" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <CardContent className="relative z-10 py-8 lg:py-12">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Left - Info */}
              <div className="space-y-6">
                <div>
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 mb-3"
                  >
                    <Badge variant="primary" size="lg">
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      Welcome Back
                    </Badge>
                  </motion.div>
                  <h1 className="text-3xl lg:text-4xl font-display font-bold text-white mb-2">
                    Hello, Beautiful Mom! 👋
                  </h1>
                  <p className="text-slate-300 text-lg">
                    Your journey is progressing wonderfully
                  </p>
                </div>

                {pregnancyInfo && (
                  <div className="space-y-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl lg:text-6xl font-display font-bold gradient-text pb-2 inline-block">
                        Week {pregnancyInfo.currentWeek}
                      </span>
                      <span className="text-xl text-slate-400">
                        Day {pregnancyInfo.currentDay}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Pregnancy Progress</span>
                        <span className="text-primary-400 font-medium">{Math.round(pregnancyInfo.progress)}%</span>
                      </div>
                      <Progress value={pregnancyInfo.progress} variant="gradient" size="md" />
                    </div>

                    {/* Trimester Indicator */}
                    <div className="flex gap-2 pt-2">
                      {trimesterInfo.map((t) => (
                        <div
                          key={t.trimester}
                          className={cn(
                            'flex-1 p-3 rounded-xl border transition-all',
                            pregnancyInfo.trimester === t.trimester
                              ? 'bg-primary-500/20 border-primary-500/50'
                              : 'bg-white/5 border-white/10 opacity-50'
                          )}
                        >
                          <p className="text-xs text-slate-400">{t.weeks} weeks</p>
                          <p className={cn(
                            'text-sm font-medium',
                            pregnancyInfo.trimester === t.trimester ? 'text-white' : 'text-slate-500'
                          )}>
                            {t.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right - Countdown */}
              <div className="flex flex-col items-center lg:items-end">
                <div className="glass-card p-6 lg:p-8 text-center">
                  <p className="text-sm text-slate-400 mb-4 flex items-center justify-center gap-2">
                    <Heart className="w-4 h-4 text-pink-400 animate-pulse" />
                    Time until meeting your baby
                  </p>
                  
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    {[
                      { value: countdown.days, label: 'Days' },
                      { value: countdown.hours, label: 'Hours' },
                      { value: countdown.minutes, label: 'Mins' },
                      { value: countdown.seconds, label: 'Secs' },
                    ].map((item, i) => (
                      <motion.div
                        key={item.label}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1, type: 'spring' }}
                        className="text-center"
                      >
                        <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-xl bg-gradient-to-br from-primary-500/20 to-pink-500/20 border border-primary-500/30 flex items-center justify-center mb-2">
                          <span className="text-2xl lg:text-3xl font-display font-bold text-white">
                            {String(item.value).padStart(2, '0')}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">{item.label}</span>
                      </motion.div>
                    ))}
                  </div>

                  <p className="text-slate-400">
                    <span className="text-white font-medium">{pregnancyInfo?.daysRemaining || 0}</span> days to go
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[
            { icon: Activity, label: 'Development Records', value: stats.developmentRecords, color: 'text-emerald-400' },
            { icon: Calendar, label: 'Scheduled Events', value: stats.scheduledEvents, color: 'text-blue-400' },
            { icon: Image, label: 'Ultrasound Scans', value: stats.ultrasoundScans, color: 'text-purple-400' },
            { icon: Apple, label: 'Food Items', value: stats.foodItems, color: 'text-amber-400' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card hover glow className="p-5 lg:p-6">
                <div className={cn('w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4', stat.color)}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <p className="stat-value">{stat.value}</p>
                <p className="stat-label text-xs lg:text-sm">{stat.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions & Baby Info */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-semibold text-white">Quick Actions</h2>
              <Badge variant="info">6 Tools</Badge>
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
                    to={action.path}
                    className="group flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
                  >
                    <div className={cn(
                      'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform',
                      action.color
                    )}>
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

        {/* Baby Age Card */}
        {babyAge && (
          <motion.div variants={itemVariants}>
            <Card variant="gradient" className="p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                  <Baby className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-white">Peanut's Age</h3>
                  <p className="text-xs text-slate-400">Your little one</p>
                </div>
              </div>

              <div className="flex justify-center mb-6">
                <CircularProgress value={babyAge.weeks} max={52} size={140} />
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-2xl font-display font-bold text-white">{babyAge.days}</p>
                  <p className="text-xs text-slate-400">Days</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-2xl font-display font-bold text-white">{babyAge.weeks}</p>
                  <p className="text-xs text-slate-400">Weeks</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-2xl font-display font-bold text-white">{babyAge.months}</p>
                  <p className="text-xs text-slate-400">Months</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Recent Activity & Weather */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-semibold text-white">Recent Activity</h2>
              <Link to="/timeline" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
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
              ].slice(0, 4).map((activity, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', activity.color)}>
                    <activity.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{activity.title}</p>
                    <p className="text-xs text-slate-500">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
              {events.length === 0 && notes.length === 0 && (
                <p className="text-sm text-slate-500">No recent activity yet.</p>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Today's Tip */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Sun className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-white">Today's Tip</h3>
                <p className="text-xs text-slate-400">Week {pregnancyInfo?.currentWeek || 0} advice</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                <p className="text-slate-300 leading-relaxed">
                  💡 <span className="text-white font-medium">Stay hydrated!</span> Aim for 8-10 glasses of water daily. 
                  This helps maintain amniotic fluid levels and supports your baby's development.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-white/5 text-center">
                  <TrendingUp className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm text-white font-medium">Baby Size</p>
                  <p className="text-xs text-slate-400">Like a lemon 🍋</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 text-center">
                  <Heart className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                  <p className="text-sm text-white font-medium">Heart Rate</p>
                  <p className="text-xs text-slate-400">150-160 BPM</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Dashboard;
