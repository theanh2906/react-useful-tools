

/**
 * SYSTEM MONITOR SERVICE
 * 
 * Architecture Note:
 * This module requires a backend proxy to securely fetch data from internal network services
 * (Jenkins, Kafka, Device Agents) because browsers block direct calls to non-CORS enabled 
 * internal IPs and socket connections.
 * 
 * Recommended Backend Stack:
 * - Node.js / Express
 * - Socket.io for realtime push
 * - Jenkins API Client
 * - KafkaJS
 * 
 * Current Implementation:
 * Uses SIMULATED data for demonstration purposes since the backend is not present.
 * To enable real data, implement endpoints in your backend and set VITE_USE_MOCK_DATA=false.
 */

export type DeviceMonitor = {
  device_name: string;
  status: 'up' | 'down';
  last_update: number;
  memory_percentage: number;
  cpu_usage: number;
  disk_usage: number;
};

export type JenkinsSummary = {
  total: number;
  success: number;
  failed: number;
  unstable: number;
  queue: number;
  executors: number;
};

export type KafkaSummary = {
  brokers: number;
  topics: number;
  partitions: number;
  consumerGroups: number;
  state: 'online' | 'offline' | 'degraded';
};

// Simulation Helpers
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

const simulateDevices = (): DeviceMonitor[] => [
  {
    device_name: 'Main Server (Ubuntu)',
    status: 'up',
    last_update: Date.now(),
    memory_percentage: randomInt(40, 80),
    cpu_usage: randomInt(10, 60),
    disk_usage: 45
  },
  {
    device_name: 'Worker Node 1',
    status: 'up',
    last_update: Date.now() - 1000,
    memory_percentage: randomInt(30, 90),
    cpu_usage: randomInt(20, 95),
    disk_usage: 62
  },
  {
    device_name: 'Worker Node 2',
    status: Math.random() > 0.9 ? 'down' : 'up', // Occasional flicker
    last_update: Date.now() - randomInt(0, 10000),
    memory_percentage: randomInt(20, 50),
    cpu_usage: randomInt(5, 30),
    disk_usage: 28
  },
  {
    device_name: 'Database Backup',
    status: 'up',
    last_update: Date.now(),
    memory_percentage: randomInt(10, 20),
    cpu_usage: randomInt(0, 5),
    disk_usage: 88
  }
];

export const fetchDevices = async () => {
  // If real backend exists:
  // return apiRequest<DeviceMonitor[]>('/monitor/devices');
  
  // Simulate network delay
  await new Promise(r => setTimeout(r, 500));
  return simulateDevices();
};

export const fetchJenkinsSummary = async () => {
  // return apiRequest<JenkinsSummary>('/monitor/jenkins/summary');
  
  await new Promise(r => setTimeout(r, 300));
  return {
    total: 45,
    success: randomInt(35, 40),
    failed: randomInt(0, 5),
    unstable: randomInt(0, 2),
    queue: randomInt(0, 10),
    executors: 8
  } as JenkinsSummary;
};

export const fetchKafkaSummary = async () => {
  // return apiRequest<KafkaSummary>('/monitor/kafka/summary');
  
  await new Promise(r => setTimeout(r, 300));
  return {
    brokers: 3,
    topics: 56,
    partitions: 128,
    consumerGroups: 15,
    state: Math.random() > 0.95 ? 'degraded' : 'online'
  } as KafkaSummary;
};
