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
import { SHOW_PREGNANCY_UI } from '@/config/constants';
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

  const [activeTab, setActiveTab] = useState<Baby>(
    SHOW_PREGNANCY_UI ? Baby.Soya : Baby.Peanut
  );
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
                borderColor: '#ff5a52',
                backgroundColor: 'rgba(255, 90, 82, 0.1)',
                fill: true,
                tension: 0.4,
              },
              {
                label: 'Height (cm)',
                data: (sortedRecords as BabyData[]).map((r) => r.height || 0),
                borderColor: '#1768e5',
                backgroundColor: 'rgba(23, 104, 229, 0.1)',
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
                borderColor: '#ff5a52',
                backgroundColor: 'rgba(255, 90, 82, 0.1)',
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
        labels: { color: '#667085', font: { size: 12 } },
      },
    },
    scales: {
      x: {
        grid: { color: '#dce6f2' },
        ticks: { color: '#667085' },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        grid: { color: '#dce6f2' },
        ticks: { color: '#667085' },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: { drawOnChartArea: false },
        ticks: { color: '#667085' },
      },
    },
  };

  const handleSetupSave = async () => {
    if (SHOW_PREGNANCY_UI && setupData.conceptionDate) {
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
    if (SHOW_PREGNANCY_UI) {
      listenSoyaRecords((data) => setSoyaRecords(data)).then((unsub) => {
        unsubSoya = unsub;
      });
    } else {
      setSoyaRecords([]);
    }
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

  const needsSetup = SHOW_PREGNANCY_UI
    ? !conceptionDate && !babyBirthDate
    : !babyBirthDate;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground lg:text-3xl">
            Baby Tracker
          </h1>
          <p className="mt-1 text-muted">Monitor growth and development</p>
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
        <Card className="border-accent-100 bg-accent-50 p-8 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-50">
            <Sparkles className="h-10 w-10 text-primary-500" />
          </div>
          <h2 className="mb-3 font-display text-2xl font-bold text-foreground">
            Welcome to Baby Tracker!
          </h2>
          <p className="mx-auto mb-6 max-w-md text-muted">
            {SHOW_PREGNANCY_UI
              ? "Let's set up your pregnancy or baby information to start tracking growth and milestones."
              : "Add your baby's birth date to track age, growth, and milestones."}
          </p>
          <Button onClick={() => setShowSetupModal(true)} className="px-8">
            <Settings className="w-4 h-4" />
            Get Started
          </Button>
        </Card>
      )}

      {/* Tabs */}
      {SHOW_PREGNANCY_UI && (
        <div className="flex w-fit gap-2 rounded-lg border border-line bg-surface p-1">
          <button
            onClick={() => setActiveTab(Baby.Soya)}
            className={cn(
              'flex items-center gap-2 rounded-md px-6 py-2.5 font-medium transition-colors',
              activeTab === Baby.Soya
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-muted hover:bg-elevated hover:text-foreground'
            )}
          >
            <Heart className="w-4 h-4" />
            Soya (Pregnancy)
          </button>
          <button
            onClick={() => setActiveTab(Baby.Peanut)}
            className={cn(
              'flex items-center gap-2 rounded-md px-6 py-2.5 font-medium transition-colors',
              activeTab === Baby.Peanut
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-muted hover:bg-elevated hover:text-foreground'
            )}
          >
            <BabyIcon className="w-4 h-4" />
            Peanut (Baby)
          </button>
        </div>
      )}

      {/* Soya (Pregnancy) View */}
      {SHOW_PREGNANCY_UI && activeTab === Baby.Soya && (
        <div className="space-y-6">
          {/* Pregnancy Overview - only show if dates are configured */}
          {pregnancyInfo && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Current Development */}
              <Card className="border-accent-100 bg-accent-50 p-6 lg:col-span-2">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <Badge variant="primary" className="mb-2">
                      Week {pregnancyInfo.currentWeek}
                    </Badge>
                    <h3 className="font-display text-xl font-bold text-foreground">
                      Baby's Development
                    </h3>
                    <p className="text-muted">
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
                  <div className="rounded-lg bg-surface p-4 text-center">
                    <Scale className="mx-auto mb-2 h-5 w-5 text-emerald-600" />
                    <p className="text-xl font-bold text-foreground">
                      {currentDev.weight}
                    </p>
                    <p className="text-xs text-muted">Weight</p>
                  </div>
                  <div className="rounded-lg bg-surface p-4 text-center">
                    <Ruler className="mx-auto mb-2 h-5 w-5 text-accent-500" />
                    <p className="text-xl font-bold text-foreground">
                      {currentDev.length}
                    </p>
                    <p className="text-xs text-muted">Length</p>
                  </div>
                  <div className="rounded-lg bg-surface p-4 text-center">
                    <Activity className="mx-auto mb-2 h-5 w-5 text-primary-500" />
                    <p className="text-xl font-bold text-foreground">150-160</p>
                    <p className="text-xs text-muted">Heart Rate</p>
                  </div>
                </div>

                <Progress
                  value={pregnancyInfo.progress}
                  variant="success"
                  showValue
                  label="Pregnancy Progress"
                />
              </Card>

              {/* Mom's Stats */}
              <Card className="p-6">
                <h3 className="mb-4 font-display font-semibold text-foreground">
                  Mom's Stats
                </h3>
                <div className="space-y-4">
                  {soyaRecords[0]?.pregnantMom?.weight && (
                    <div className="rounded-lg bg-surface p-4">
                      <p className="mb-1 text-sm text-muted">
                        Current Weight
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {soyaRecords[0].pregnantMom.weight} kg
                      </p>
                    </div>
                  )}
                  <div className="rounded-lg bg-surface p-4">
                    <p className="mb-1 text-sm text-muted">Trimester</p>
                    <p className="text-xl font-bold text-foreground">
                      {pregnancyInfo.trimester}
                    </p>
                    <p className="text-xs text-muted">
                      {pregnancyInfo.trimester === 1
                        ? 'First'
                        : pregnancyInfo.trimester === 2
                          ? 'Second'
                          : 'Third'}{' '}
                      Trimester
                    </p>
                  </div>
                  <div className="rounded-lg bg-surface p-4">
                    <p className="mb-1 text-sm text-muted">
                      Days to Due Date
                    </p>
                    <p className="text-2xl font-bold text-primary-600">
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
              <Heart className="mx-auto mb-4 h-12 w-12 text-primary-500" />
              <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
                Set Your Conception Date
              </h3>
              <p className="mb-4 text-muted">
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
              <h3 className="mb-4 font-display font-semibold text-foreground">
                Growth Trends
              </h3>
              <div className="h-64">
                <Line data={growthChartData} options={chartOptions} />
              </div>
            </Card>
          )}

          {/* Records */}
          <Card className="p-6">
            <h3 className="mb-4 font-display font-semibold text-foreground">
              Checkup Records
            </h3>
            {soyaRecords.length === 0 ? (
              <div className="py-8 text-center text-muted">
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
                    className="flex items-center gap-4 rounded-lg border border-line bg-surface p-4 transition-colors hover:border-accent-200 hover:bg-accent-50/50"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50">
                      <Calendar className="h-6 w-6 text-primary-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="primary" size="sm">
                          {record.gestationalAge}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      {record.measurements?.heartRate && (
                        <p className="font-medium text-foreground">
                          {record.measurements.heartRate} BPM
                        </p>
                      )}
                      <p className="text-xs text-muted">Heart Rate</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Peanut (Baby) View */}
      {(!SHOW_PREGNANCY_UI || activeTab === Baby.Peanut) && (
        <div className="space-y-6">
          {/* Baby Overview - only show if birth date is configured */}
          {babyAge && (
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="border-primary-100 bg-primary-50 p-6">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary-500">
                    <BabyIcon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="mb-1 font-display text-xl font-bold text-foreground">
                    Peanut
                  </h3>
                  <p className="text-muted">Your little one</p>

                  <div className="grid grid-cols-3 gap-3 mt-6">
                    <div className="rounded-lg bg-surface p-3">
                      <p className="text-2xl font-bold text-foreground">
                        {babyAge.days}
                      </p>
                      <p className="text-xs text-muted">Days</p>
                    </div>
                    <div className="rounded-lg bg-surface p-3">
                      <p className="text-2xl font-bold text-foreground">
                        {babyAge.weeks}
                      </p>
                      <p className="text-xs text-muted">Weeks</p>
                    </div>
                    <div className="rounded-lg bg-surface p-3">
                      <p className="text-2xl font-bold text-foreground">
                        {babyAge.months}
                      </p>
                      <p className="text-xs text-muted">Months</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Latest Stats */}
              {peanutRecords[0] && (
                <>
                  <Card className="p-6">
                    <h3 className="mb-4 font-display font-semibold text-foreground">
                      Latest Measurements
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-lg bg-surface p-4">
                        <div className="flex items-center gap-3">
                          <Scale className="h-5 w-5 text-emerald-600" />
                          <span className="text-muted">Weight</span>
                        </div>
                        <span className="text-xl font-bold text-foreground">
                          {peanutRecords[0].weight} kg
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-surface p-4">
                        <div className="flex items-center gap-3">
                          <Ruler className="h-5 w-5 text-accent-500" />
                          <span className="text-muted">Height</span>
                        </div>
                        <span className="text-xl font-bold text-foreground">
                          {peanutRecords[0].height} cm
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-surface p-4">
                        <div className="flex items-center gap-3">
                          <Activity className="h-5 w-5 text-primary-500" />
                          <span className="text-muted">Heart Rate</span>
                        </div>
                        <span className="text-xl font-bold text-foreground">
                          {peanutRecords[0].heartRate} bpm
                        </span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="mb-4 font-display font-semibold text-foreground">
                      Growth Trend
                    </h3>
                    <div className="flex items-center gap-4">
                      <TrendingUp className="h-12 w-12 text-emerald-600" />
                      <div>
                        <p className="text-2xl font-bold text-foreground">+0.4 kg</p>
                        <p className="text-sm text-muted">
                          Since last checkup
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-sm text-emerald-700">
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
              <BabyIcon className="mx-auto mb-4 h-12 w-12 text-accent-500" />
              <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
                Set Baby's Birth Date
              </h3>
              <p className="mb-4 text-muted">
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
              <h3 className="mb-4 font-display font-semibold text-foreground">
                Growth Chart
              </h3>
              <div className="h-64">
                <Line data={growthChartData} options={chartOptions} />
              </div>
            </Card>
          )}

          {/* Records */}
          <Card className="p-6">
            <h3 className="mb-4 font-display font-semibold text-foreground">
              Development Records
            </h3>
            {peanutRecords.length === 0 ? (
              <div className="py-8 text-center text-muted">
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
                    className="flex items-center gap-4 rounded-lg border border-line bg-surface p-4 transition-colors hover:border-accent-200 hover:bg-accent-50/50"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-50">
                      <Calendar className="h-6 w-6 text-accent-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-sm text-muted">{record.notes}</p>
                    </div>
                    <div className="flex gap-4 text-center">
                      <div>
                        <p className="font-medium text-foreground">
                          {record.weight} kg
                        </p>
                        <p className="text-xs text-muted">Weight</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {record.height} cm
                        </p>
                        <p className="text-xs text-muted">Height</p>
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
        title={`Add ${SHOW_PREGNANCY_UI && activeTab === Baby.Soya ? 'Pregnancy' : 'Baby'} Record`}
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

          {SHOW_PREGNANCY_UI && activeTab === Baby.Soya ? (
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
                  className="rounded-lg border border-line bg-surface p-4"
                  style={{
                    backgroundColor: `${bmiCategory.color}20`,
                    borderColor: `${bmiCategory.color}50`,
                  }}
                >
                  <p className="text-sm text-foreground">
                    BMI:{' '}
                    <span
                      className="font-bold"
                      style={{ color: bmiCategory.color }}
                    >
                      {momBMI}
                    </span>
                    <span className="ml-2 text-muted">
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
          {SHOW_PREGNANCY_UI && (
            <div className="rounded-lg border border-primary-200 bg-primary-50 p-4">
              <div className="flex items-center gap-3 mb-2">
                <Heart className="h-5 w-5 text-primary-500" />
                <h4 className="font-medium text-foreground">
                  Pregnancy Tracking (Soya)
                </h4>
              </div>
              <p className="mb-4 text-sm text-muted">
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
          )}

          <div className="rounded-lg border border-accent-200 bg-accent-50 p-4">
            <div className="flex items-center gap-3 mb-2">
              <BabyIcon className="h-5 w-5 text-accent-500" />
              <h4 className="font-medium text-foreground">Baby Tracking (Peanut)</h4>
            </div>
            <p className="mb-4 text-sm text-muted">
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
