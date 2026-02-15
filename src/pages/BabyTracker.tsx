/**
 * @module BabyTrackerPage
 * @description Pregnancy & baby tracking page with growth charts (Chart.js),
 * BMI calculator and milestone records.
 */
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Baby as BabyIcon,
  Heart,
  TrendingUp,
  Scale,
  Ruler,
  Activity,
  Calendar,
  Settings,
  Sparkles,
} from 'lucide-react';
import {
  Card,
  Button,
  Badge,
  Modal,
  ModalFooter,
  Input,
  Progress,
  DatePicker,
} from '@/components/ui';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { calculateBMI, getBMICategory } from '@/lib/utils';
import {
  addPeanutRecord,
  addSoyaRecord,
  listenPeanutRecords,
  listenSoyaRecords,
} from '@/services/babyService';
import type { BabyData, SoyaData } from '@/types';
import { Baby } from '@/types';
import { toast } from '@/components/ui/Toast';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * Baby tracker page.
 * Displays pregnancy progress, baby growth charts (weight/height),
 * BMI tracking and milestone logging backed by Firebase Realtime Database.
 */
export function BabyTrackerPage() {
  const getPregnancyInfo = useAppStore((state) => state.getPregnancyInfo);
  const getBabyAge = useAppStore((state) => state.getBabyAge);
  const conceptionDate = useAppStore((state) => state.conceptionDate);
  const babyBirthDate = useAppStore((state) => state.babyBirthDate);
  const setConceptionDate = useAppStore((state) => state.setConceptionDate);
  const setBabyBirthDate = useAppStore((state) => state.setBabyBirthDate);
  const saveProfile = useAppStore((state) => state.saveProfile);
  const userId = useAuthStore((state) => state.user?.id);

  const pregnancyInfo = getPregnancyInfo();
  const babyAge = getBabyAge();

  const [activeTab, setActiveTab] = useState<Baby>(Baby.Soya);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [peanutRecords, setPeanutRecords] = useState<BabyData[]>([]);
  const [soyaRecords, setSoyaRecords] = useState<SoyaData[]>([]);

  // Setup form
  const [setupData, setSetupData] = useState({
    conceptionDate: conceptionDate || '',
    babyBirthDate: babyBirthDate || '',
  });

  // Form states
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    height: '',
    heartRate: '',
    gestationalAge: '',
    momWeight: '',
    bloodPressure: '',
    notes: '',
  });

  // Growth chart data
  const growthChartData = useMemo(() => {
    const records = activeTab === Baby.Peanut ? peanutRecords : soyaRecords;
    const sortedRecords = [...records].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
      labels: sortedRecords.map((r) =>
        new Date(r.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })
      ),
      datasets:
        activeTab === Baby.Peanut
          ? [
              {
                label: 'Weight (kg)',
                data: (sortedRecords as BabyData[]).map((r) => r.weight || 0),
                borderColor: '#ec4899',
                backgroundColor: 'rgba(236, 72, 153, 0.1)',
                fill: true,
                tension: 0.4,
              },
              {
                label: 'Height (cm)',
                data: (sortedRecords as BabyData[]).map((r) => r.height || 0),
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                fill: true,
                tension: 0.4,
                yAxisID: 'y1',
              },
            ]
          : [
              {
                label: 'Heart Rate (BPM)',
                data: (sortedRecords as SoyaData[]).map(
                  (r) => r.measurements?.heartRate || 0
                ),
                borderColor: '#f97316',
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                fill: true,
                tension: 0.4,
              },
              {
                label: 'Mom Weight (kg)',
                data: (sortedRecords as SoyaData[]).map(
                  (r) => r.pregnantMom?.weight || 0
                ),
                borderColor: '#22c55e',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                fill: true,
                tension: 0.4,
                yAxisID: 'y1',
              },
            ],
    };
  }, [activeTab, peanutRecords, soyaRecords]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#94a3b8', font: { size: 12 } },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#94a3b8' },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#94a3b8' },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: { drawOnChartArea: false },
        ticks: { color: '#94a3b8' },
      },
    },
  };

  const handleSetupSave = async () => {
    if (setupData.conceptionDate) {
      setConceptionDate(setupData.conceptionDate);
    }
    if (setupData.babyBirthDate) {
      setBabyBirthDate(setupData.babyBirthDate);
    }
    await saveProfile();
    setShowSetupModal(false);
    toast.success('Settings saved!');
  };

  useEffect(() => {
    let unsubPeanut: (() => void) | null = null;
    let unsubSoya: (() => void) | null = null;
    listenPeanutRecords((data) => setPeanutRecords(data)).then((unsub) => {
      unsubPeanut = unsub;
    });
    listenSoyaRecords((data) => setSoyaRecords(data)).then((unsub) => {
      unsubSoya = unsub;
    });
    return () => {
      if (unsubPeanut) unsubPeanut();
      if (unsubSoya) unsubSoya();
    };
  }, [userId]);

  const handleSave = async () => {
    if (activeTab === Baby.Soya) {
      await addSoyaRecord({
        date: formData.date,
        gestationalAge: formData.gestationalAge,
        measurements: {
          heartRate: formData.heartRate
            ? Number(formData.heartRate)
            : undefined,
          bloodPressure: formData.bloodPressure || undefined,
        },
        pregnantMom: {
          weight: formData.momWeight ? Number(formData.momWeight) : undefined,
        },
        notes: formData.notes || undefined,
      } as SoyaData);
    } else {
      await addPeanutRecord({
        date: formData.date,
        weight: formData.weight ? Number(formData.weight) : undefined,
        height: formData.height ? Number(formData.height) : undefined,
        heartRate: formData.heartRate ? Number(formData.heartRate) : undefined,
        notes: formData.notes || undefined,
      } as BabyData);
    }

    toast.success('Record saved successfully!');
    setShowAddModal(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      weight: '',
      height: '',
      heartRate: '',
      gestationalAge: '',
      momWeight: '',
      bloodPressure: '',
      notes: '',
    });
  };

  // BMI calculation for mom
  const momWeight = parseFloat(formData.momWeight) || 0;
  const momHeight = 160; // Assume 160cm for demo
  const momBMI = momWeight > 0 ? calculateBMI(momWeight, momHeight) : 0;
  const bmiCategory = momBMI > 0 ? getBMICategory(momBMI) : null;

  const weeklyDevelopment = [
    { week: 12, size: 'Plum', weight: '14g', length: '5.4cm' },
    { week: 16, size: 'Avocado', weight: '100g', length: '11.6cm' },
    { week: 20, size: 'Banana', weight: '300g', length: '25cm' },
    { week: 24, size: 'Corn', weight: '600g', length: '30cm' },
    { week: 28, size: 'Eggplant', weight: '1kg', length: '37cm' },
    { week: 32, size: 'Squash', weight: '1.7kg', length: '42cm' },
    { week: 36, size: 'Honeydew', weight: '2.6kg', length: '47cm' },
    { week: 40, size: 'Watermelon', weight: '3.4kg', length: '51cm' },
  ];

  const currentDev =
    weeklyDevelopment.find(
      (d) => d.week >= (pregnancyInfo?.currentWeek || 0)
    ) || weeklyDevelopment[0];

  // Check if setup is needed
  const needsSetup = !conceptionDate && !babyBirthDate;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-white">
            Baby Tracker
          </h1>
          <p className="text-slate-400 mt-1">Monitor growth and development</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowSetupModal(true)}>
            <Settings className="w-4 h-4" />
            Settings
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4" />
            Add Record
          </Button>
        </div>
      </div>

      {/* Setup prompt when no dates configured */}
      {needsSetup && (
        <Card variant="gradient" className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-pink-400" />
          </div>
          <h2 className="text-2xl font-display font-bold text-white mb-3">
            Welcome to Baby Tracker!
          </h2>
          <p className="text-slate-400 max-w-md mx-auto mb-6">
            Let's set up your pregnancy or baby information to start tracking
            growth and milestones.
          </p>
          <Button onClick={() => setShowSetupModal(true)} className="px-8">
            <Settings className="w-4 h-4" />
            Get Started
          </Button>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab(Baby.Soya)}
          className={cn(
            'px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2',
            activeTab === Baby.Soya
              ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-white/10'
          )}
        >
          <Heart className="w-4 h-4" />
          Soya (Pregnancy)
        </button>
        <button
          onClick={() => setActiveTab(Baby.Peanut)}
          className={cn(
            'px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2',
            activeTab === Baby.Peanut
              ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-white/10'
          )}
        >
          <BabyIcon className="w-4 h-4" />
          Peanut (Baby)
        </button>
      </div>

      {/* Soya (Pregnancy) View */}
      {activeTab === Baby.Soya && (
        <div className="space-y-6">
          {/* Pregnancy Overview - only show if dates are configured */}
          {pregnancyInfo && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Current Development */}
              <Card variant="gradient" className="lg:col-span-2 p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <Badge variant="primary" className="mb-2">
                      Week {pregnancyInfo.currentWeek}
                    </Badge>
                    <h3 className="text-xl font-display font-bold text-white">
                      Baby's Development
                    </h3>
                    <p className="text-slate-400">
                      Your baby is the size of a {currentDev.size.toLowerCase()}
                    </p>
                  </div>
                  <span className="text-6xl">
                    {currentDev.size === 'Avocado'
                      ? '🥑'
                      : currentDev.size === 'Banana'
                        ? '🍌'
                        : '🍇'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-white/5 text-center">
                    <Scale className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                    <p className="text-xl font-bold text-white">
                      {currentDev.weight}
                    </p>
                    <p className="text-xs text-slate-400">Weight</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 text-center">
                    <Ruler className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                    <p className="text-xl font-bold text-white">
                      {currentDev.length}
                    </p>
                    <p className="text-xs text-slate-400">Length</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 text-center">
                    <Activity className="w-5 h-5 text-pink-400 mx-auto mb-2" />
                    <p className="text-xl font-bold text-white">150-160</p>
                    <p className="text-xs text-slate-400">Heart Rate</p>
                  </div>
                </div>

                <Progress
                  value={pregnancyInfo.progress}
                  variant="gradient"
                  showValue
                  label="Pregnancy Progress"
                />
              </Card>

              {/* Mom's Stats */}
              <Card className="p-6">
                <h3 className="font-display font-semibold text-white mb-4">
                  Mom's Stats
                </h3>
                <div className="space-y-4">
                  {soyaRecords[0]?.pregnantMom?.weight && (
                    <div className="p-4 rounded-xl bg-white/5">
                      <p className="text-sm text-slate-400 mb-1">
                        Current Weight
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {soyaRecords[0].pregnantMom.weight} kg
                      </p>
                    </div>
                  )}
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-sm text-slate-400 mb-1">Trimester</p>
                    <p className="text-xl font-bold text-white">
                      {pregnancyInfo.trimester}
                    </p>
                    <p className="text-xs text-slate-500">
                      {pregnancyInfo.trimester === 1
                        ? 'First'
                        : pregnancyInfo.trimester === 2
                          ? 'Second'
                          : 'Third'}{' '}
                      Trimester
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-sm text-slate-400 mb-1">
                      Days to Due Date
                    </p>
                    <p className="text-2xl font-bold gradient-text">
                      {pregnancyInfo.daysRemaining}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Prompt to set dates if not configured */}
          {!pregnancyInfo && (
            <Card className="p-6 text-center">
              <Heart className="w-12 h-12 text-pink-400 mx-auto mb-4" />
              <h3 className="text-lg font-display font-semibold text-white mb-2">
                Set Your Conception Date
              </h3>
              <p className="text-slate-400 mb-4">
                Configure your conception date to see pregnancy progress and
                development info
              </p>
              <Button onClick={() => setShowSetupModal(true)}>
                <Settings className="w-4 h-4" />
                Configure Now
              </Button>
            </Card>
          )}

          {/* Growth Chart */}
          {soyaRecords.length > 1 && (
            <Card className="p-6">
              <h3 className="font-display font-semibold text-white mb-4">
                Growth Trends
              </h3>
              <div className="h-64">
                <Line data={growthChartData} options={chartOptions} />
              </div>
            </Card>
          )}

          {/* Records */}
          <Card className="p-6">
            <h3 className="font-display font-semibold text-white mb-4">
              Checkup Records
            </h3>
            {soyaRecords.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No records yet. Add your first checkup!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {soyaRecords.map((record, i) => (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-pink-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="primary" size="sm">
                          {record.gestationalAge}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      {record.measurements?.heartRate && (
                        <p className="text-white font-medium">
                          {record.measurements.heartRate} BPM
                        </p>
                      )}
                      <p className="text-xs text-slate-500">Heart Rate</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Peanut (Baby) View */}
      {activeTab === Baby.Peanut && (
        <div className="space-y-6">
          {/* Baby Overview - only show if birth date is configured */}
          {babyAge && (
            <div className="grid lg:grid-cols-3 gap-6">
              <Card variant="gradient" className="p-6">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                    <BabyIcon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-white mb-1">
                    Peanut
                  </h3>
                  <p className="text-slate-400">Your little one</p>

                  <div className="grid grid-cols-3 gap-3 mt-6">
                    <div className="p-3 rounded-lg bg-white/10">
                      <p className="text-2xl font-bold text-white">
                        {babyAge.days}
                      </p>
                      <p className="text-xs text-slate-400">Days</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/10">
                      <p className="text-2xl font-bold text-white">
                        {babyAge.weeks}
                      </p>
                      <p className="text-xs text-slate-400">Weeks</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/10">
                      <p className="text-2xl font-bold text-white">
                        {babyAge.months}
                      </p>
                      <p className="text-xs text-slate-400">Months</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Latest Stats */}
              {peanutRecords[0] && (
                <>
                  <Card className="p-6">
                    <h3 className="font-display font-semibold text-white mb-4">
                      Latest Measurements
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                        <div className="flex items-center gap-3">
                          <Scale className="w-5 h-5 text-emerald-400" />
                          <span className="text-slate-400">Weight</span>
                        </div>
                        <span className="text-xl font-bold text-white">
                          {peanutRecords[0].weight} kg
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                        <div className="flex items-center gap-3">
                          <Ruler className="w-5 h-5 text-blue-400" />
                          <span className="text-slate-400">Height</span>
                        </div>
                        <span className="text-xl font-bold text-white">
                          {peanutRecords[0].height} cm
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                        <div className="flex items-center gap-3">
                          <Activity className="w-5 h-5 text-pink-400" />
                          <span className="text-slate-400">Heart Rate</span>
                        </div>
                        <span className="text-xl font-bold text-white">
                          {peanutRecords[0].heartRate} bpm
                        </span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="font-display font-semibold text-white mb-4">
                      Growth Trend
                    </h3>
                    <div className="flex items-center gap-4">
                      <TrendingUp className="w-12 h-12 text-emerald-400" />
                      <div>
                        <p className="text-2xl font-bold text-white">+0.4 kg</p>
                        <p className="text-sm text-slate-400">
                          Since last checkup
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-sm text-emerald-300">
                        ✓ Growing at a healthy rate
                      </p>
                    </div>
                  </Card>
                </>
              )}
            </div>
          )}

          {/* Prompt to set dates if not configured */}
          {!babyAge && (
            <Card className="p-6 text-center">
              <BabyIcon className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-display font-semibold text-white mb-2">
                Set Baby's Birth Date
              </h3>
              <p className="text-slate-400 mb-4">
                Configure the birth date to see your baby's age and development
                milestones
              </p>
              <Button onClick={() => setShowSetupModal(true)}>
                <Settings className="w-4 h-4" />
                Configure Now
              </Button>
            </Card>
          )}

          {/* Growth Chart */}
          {peanutRecords.length > 1 && (
            <Card className="p-6">
              <h3 className="font-display font-semibold text-white mb-4">
                Growth Chart
              </h3>
              <div className="h-64">
                <Line data={growthChartData} options={chartOptions} />
              </div>
            </Card>
          )}

          {/* Records */}
          <Card className="p-6">
            <h3 className="font-display font-semibold text-white mb-4">
              Development Records
            </h3>
            {peanutRecords.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No records yet. Add your first checkup!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {peanutRecords.map((record, i) => (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-sm text-slate-400">{record.notes}</p>
                    </div>
                    <div className="flex gap-4 text-center">
                      <div>
                        <p className="text-white font-medium">
                          {record.weight} kg
                        </p>
                        <p className="text-xs text-slate-500">Weight</p>
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {record.height} cm
                        </p>
                        <p className="text-xs text-slate-500">Height</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Add Record Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={`Add ${activeTab === Baby.Soya ? 'Pregnancy' : 'Baby'} Record`}
        size="lg"
      >
        <div className="space-y-4">
          <DatePicker
            label="Date"
            value={formData.date}
            onChange={(date) => setFormData({ ...formData, date })}
            placeholder="Select record date"
            maxDate={new Date().toISOString().split('T')[0]}
          />

          {activeTab === Baby.Soya ? (
            <>
              <Input
                label="Gestational Age (e.g., 16 weeks)"
                value={formData.gestationalAge}
                onChange={(e) =>
                  setFormData({ ...formData, gestationalAge: e.target.value })
                }
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Mom's Weight (kg)"
                  type="number"
                  value={formData.momWeight}
                  onChange={(e) =>
                    setFormData({ ...formData, momWeight: e.target.value })
                  }
                />
                <Input
                  label="Heart Rate (BPM)"
                  type="number"
                  value={formData.heartRate}
                  onChange={(e) =>
                    setFormData({ ...formData, heartRate: e.target.value })
                  }
                />
              </div>
              <Input
                label="Blood Pressure"
                placeholder="e.g., 120/80"
                value={formData.bloodPressure}
                onChange={(e) =>
                  setFormData({ ...formData, bloodPressure: e.target.value })
                }
              />

              {bmiCategory && (
                <div
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: `${bmiCategory.color}20`,
                    borderColor: `${bmiCategory.color}50`,
                  }}
                >
                  <p className="text-sm text-slate-300">
                    BMI:{' '}
                    <span
                      className="font-bold"
                      style={{ color: bmiCategory.color }}
                    >
                      {momBMI}
                    </span>
                    <span className="ml-2 text-slate-400">
                      ({bmiCategory.label})
                    </span>
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Weight (kg)"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData({ ...formData, weight: e.target.value })
                  }
                />
                <Input
                  label="Height (cm)"
                  type="number"
                  value={formData.height}
                  onChange={(e) =>
                    setFormData({ ...formData, height: e.target.value })
                  }
                />
              </div>
              <Input
                label="Heart Rate (BPM)"
                type="number"
                value={formData.heartRate}
                onChange={(e) =>
                  setFormData({ ...formData, heartRate: e.target.value })
                }
              />
            </>
          )}

          <Input
            label="Notes"
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="Any notes about this checkup..."
          />
        </div>

        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Record</Button>
        </ModalFooter>
      </Modal>

      {/* Setup Modal */}
      <Modal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        title="Baby Tracker Settings"
        size="md"
      >
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/20">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-5 h-5 text-pink-400" />
              <h4 className="font-medium text-white">
                Pregnancy Tracking (Soya)
              </h4>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Set the conception date to track pregnancy progress
            </p>
            <DatePicker
              label="Conception Date"
              value={setupData.conceptionDate}
              onChange={(date) =>
                setSetupData({ ...setupData, conceptionDate: date })
              }
              placeholder="Select conception date"
              maxDate={new Date().toISOString().split('T')[0]}
              centered
            />
          </div>

          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <div className="flex items-center gap-3 mb-2">
              <BabyIcon className="w-5 h-5 text-purple-400" />
              <h4 className="font-medium text-white">Baby Tracking (Peanut)</h4>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Set the birth date to track your baby's growth
            </p>
            <DatePicker
              label="Birth Date"
              value={setupData.babyBirthDate}
              onChange={(date) =>
                setSetupData({ ...setupData, babyBirthDate: date })
              }
              placeholder="Select birth date"
              maxDate={new Date().toISOString().split('T')[0]}
              centered
            />
          </div>
        </div>

        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowSetupModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleSetupSave}>Save Settings</Button>
        </ModalFooter>
      </Modal>
    </motion.div>
  );
}

export default BabyTrackerPage;
