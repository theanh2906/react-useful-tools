/**
 * @module services/monitorService
 * @description System monitoring service for devices, Jenkins CI, and Kafka clusters.
 *
 * **Architecture Note:**
 * This module requires a backend proxy to securely fetch data from internal network services
 * (Jenkins, Kafka, Device Agents) because browsers block direct calls to non-CORS enabled
 * internal IPs and socket connections.
 *
 * **Current Implementation:**
 * Uses SIMULATED data for demonstration purposes since the backend is not present.
 * To enable real data, implement endpoints in your backend and set `VITE_USE_MOCK_DATA=false`.
 */

/** Monitoring data for a single server/device. */
export type DeviceMonitor = {
  /** Device display name. */
  device_name: string;
  /** Current status. */
  status: 'up' | 'down';
  /** Last heartbeat timestamp in milliseconds. */
  last_update: number;
  /** Memory usage percentage. */
  memory_percentage: number;
  /** CPU usage percentage. */
  cpu_usage: number;
  /** Disk usage percentage. */
  disk_usage: number;
};

/** Aggregated Jenkins CI/CD pipeline summary. */
export type JenkinsSummary = {
  /** Total number of jobs. */
  total: number;
  /** Number of successful builds. */
  success: number;
  /** Number of failed builds. */
  failed: number;
  /** Number of unstable builds. */
  unstable: number;
  /** Jobs currently in the build queue. */
  queue: number;
  /** Available build executors. */
  executors: number;
};

/** Aggregated Kafka cluster health summary. */
export type KafkaSummary = {
  /** Number of active brokers. */
  brokers: number;
  /** Total number of topics. */
  topics: number;
  /** Total number of partitions. */
  partitions: number;
  /** Number of consumer groups. */
  consumerGroups: number;
  /** Overall cluster health state. */
  state: 'online' | 'offline' | 'degraded';
};

/** @internal Generates a random integer between `min` and `max` (inclusive). */
const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min);

/** @internal Generates simulated device monitoring data. */
const simulateDevices = (): DeviceMonitor[] => [
  {
    device_name: 'Main Server (Ubuntu)',
    status: 'up',
    last_update: Date.now(),
    memory_percentage: randomInt(40, 80),
    cpu_usage: randomInt(10, 60),
    disk_usage: 45,
  },
  {
    device_name: 'Worker Node 1',
    status: 'up',
    last_update: Date.now() - 1000,
    memory_percentage: randomInt(30, 90),
    cpu_usage: randomInt(20, 95),
    disk_usage: 62,
  },
  {
    device_name: 'Worker Node 2',
    status: Math.random() > 0.9 ? 'down' : 'up', // Occasional flicker
    last_update: Date.now() - randomInt(0, 10000),
    memory_percentage: randomInt(20, 50),
    cpu_usage: randomInt(5, 30),
    disk_usage: 28,
  },
  {
    device_name: 'Database Backup',
    status: 'up',
    last_update: Date.now(),
    memory_percentage: randomInt(10, 20),
    cpu_usage: randomInt(0, 5),
    disk_usage: 88,
  },
];

/**
 * Fetches current device monitoring data.
 * Currently returns simulated data with a 500ms delay.
 *
 * @returns Array of `DeviceMonitor` entries.
 */
export const fetchDevices = async () => {
  // If real backend exists:
  // return apiRequest<DeviceMonitor[]>('/monitor/devices');

  // Simulate network delay
  await new Promise((r) => setTimeout(r, 500));
  return simulateDevices();
};

/**
 * Fetches Jenkins CI/CD pipeline summary.
 * Currently returns simulated data with a 300ms delay.
 *
 * @returns `JenkinsSummary` object.
 */
export const fetchJenkinsSummary = async () => {
  // return apiRequest<JenkinsSummary>('/monitor/jenkins/summary');

  await new Promise((r) => setTimeout(r, 300));
  return {
    total: 45,
    success: randomInt(35, 40),
    failed: randomInt(0, 5),
    unstable: randomInt(0, 2),
    queue: randomInt(0, 10),
    executors: 8,
  } as JenkinsSummary;
};

/**
 * Fetches Kafka cluster health summary.
 * Currently returns simulated data with a 300ms delay.
 *
 * @returns `KafkaSummary` object.
 */
export const fetchKafkaSummary = async () => {
  // return apiRequest<KafkaSummary>('/monitor/kafka/summary');

  await new Promise((r) => setTimeout(r, 300));
  return {
    brokers: 3,
    topics: 56,
    partitions: 128,
    consumerGroups: 15,
    state: Math.random() > 0.95 ? 'degraded' : 'online',
  } as KafkaSummary;
};
