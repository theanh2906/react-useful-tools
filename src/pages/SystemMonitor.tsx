import { motion } from 'framer-motion';
import { Activity, Server, Wifi, Cpu, HardDrive, MemoryStick, AlertTriangle } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { fetchDevices, fetchJenkinsSummary, fetchKafkaSummary, type DeviceMonitor, type JenkinsSummary, type KafkaSummary } from '@/services/monitorService';

const fallbackDevices = [
  { device_name: 'Home PC', status: 'up', cpu_usage: 42, memory_percentage: 68, disk_usage: 55, last_update: Date.now() - 10000 },
  { device_name: 'Office Server', status: 'up', cpu_usage: 31, memory_percentage: 52, disk_usage: 63, last_update: Date.now() - 18000 },
  { device_name: 'NAS Storage', status: 'down', cpu_usage: 0, memory_percentage: 0, disk_usage: 0, last_update: Date.now() - 180000 },
];

const fallbackJenkins = {
  total: 32,
  success: 24,
  failed: 3,
  unstable: 2,
  queue: 3,
  executors: 8,
};

const fallbackKafka = {
  brokers: 3,
  topics: 42,
  partitions: 128,
  consumerGroups: 12,
  state: 'online',
} as KafkaSummary;

export function SystemMonitorPage() {
  const [devices, setDevices] = useState<DeviceMonitor[]>(fallbackDevices as DeviceMonitor[]);
  const [jenkinsJobs, setJenkinsJobs] = useState<JenkinsSummary>(fallbackJenkins);
  const [kafkaStatus, setKafkaStatus] = useState<KafkaSummary>(fallbackKafka);

  useEffect(() => {
    const load = () => {
      fetchDevices().then(setDevices).catch(() => undefined);
      fetchJenkinsSummary().then(setJenkinsJobs).catch(() => undefined);
      fetchKafkaSummary().then(setKafkaStatus).catch(() => undefined);
    };
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-white">System Monitor</h1>
        <p className="text-slate-400 mt-1">Real-time device, Jenkins, and Kafka overview</p>
      </div>

      {/* Overview */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Wifi className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{devices.filter((d) => d.status === 'up').length}</p>
              <p className="text-xs text-slate-400">Devices Up</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Server className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{jenkinsJobs.total}</p>
              <p className="text-xs text-slate-400">Jenkins Jobs</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{kafkaStatus.topics}</p>
              <p className="text-xs text-slate-400">Kafka Topics</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Devices */}
      <Card className="p-6">
        <h3 className="text-lg font-display font-semibold text-white mb-4">Devices</h3>
        <div className="space-y-3">
          {devices.map((device) => (
            <div
              key={device.device_name}
              className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-3 h-3 rounded-full',
                    device.status === 'up' ? 'bg-emerald-400' : 'bg-red-400'
                  )}
                />
                <div>
                  <p className="text-white font-medium">{device.device_name}</p>
                  <p className="text-xs text-slate-500">
                    {Math.max(0, Math.floor((Date.now() - device.last_update) / 1000))}s ago
                  </p>
                </div>
              </div>

              {device.status === 'up' ? (
                <div className="grid grid-cols-3 gap-3 flex-1">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Cpu className="w-4 h-4 text-blue-400" />
                    {device.cpu_usage}%
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <MemoryStick className="w-4 h-4 text-purple-400" />
                    {device.memory_percentage}%
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <HardDrive className="w-4 h-4 text-amber-400" />
                    {device.disk_usage}%
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                  No data received
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Jenkins + Kafka */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-display font-semibold text-white mb-4">Jenkins</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5">
              <p className="text-sm text-slate-400">Success</p>
              <p className="text-2xl font-bold text-emerald-400">{jenkinsJobs.success}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5">
              <p className="text-sm text-slate-400">Failed</p>
              <p className="text-2xl font-bold text-red-400">{jenkinsJobs.failed}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5">
              <p className="text-sm text-slate-400">Unstable</p>
              <p className="text-2xl font-bold text-amber-400">{jenkinsJobs.unstable}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5">
              <p className="text-sm text-slate-400">Queue</p>
              <p className="text-2xl font-bold text-blue-400">{jenkinsJobs.queue}</p>
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-500">Executors: {jenkinsJobs.executors}</div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-display font-semibold text-white mb-4">Kafka</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <span className="text-slate-400">State</span>
              <Badge variant={kafkaStatus.state === 'online' ? 'success' : 'danger'}>
                {kafkaStatus.state}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <span className="text-slate-400">Brokers</span>
              <span className="text-white font-medium">{kafkaStatus.brokers}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <span className="text-slate-400">Topics</span>
              <span className="text-white font-medium">{kafkaStatus.topics}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <span className="text-slate-400">Partitions</span>
              <span className="text-white font-medium">{kafkaStatus.partitions}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <span className="text-slate-400">Consumer Groups</span>
              <span className="text-white font-medium">{kafkaStatus.consumerGroups}</span>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

export default SystemMonitorPage;
