// Auth types
export enum LoginMethod {
  NONE = 0,
  CREDENTIAL = 1,
  GOOGLE = 2,
  AZURE = 3
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  token: string;
  tokenExpirationIn: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Event types
export enum RecurrenceCycle {
  NONE = 'NONE',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
  BIENNIAL = 'BIENNIAL',
  CUSTOM = 'CUSTOM'
}

export interface EventCategory {
  id: string;
  name: string;
  color: string;
}

export interface EventTag {
  id: string;
  name: string;
}

export interface RecurringEventPattern {
  cycle: RecurrenceCycle;
  customYears?: number;
}

export interface EventData {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  backgroundColor?: string;
  isImportant?: boolean;
  categories?: string[];
  tags?: string[];
  isRecurring?: boolean;
  recurringPattern?: RecurringEventPattern;
  parentEventId?: string;
  location?: string;
  notes?: string;
  reminder?: boolean;
  createdAt?: string;
}

// Note types
export interface Note {
  id: string;
  title: string;
  content: string;
  createdDate: number;
  modifiedDate?: number;
  categories: string[];
  isPinned?: boolean;
}

// Baby types
export enum Baby {
  Peanut = 'peanut',
  Soya = 'soya'
}

export interface BabyData {
  id: string;
  date: string | number;
  weight?: number;
  height?: number;
  heartRate?: number;
  notes?: string;
}

export interface SoyaData {
  id: string;
  createdAt?: string;
  date: string | number;
  gestationalAge?: string;
  ultrasoundImageUrl?: string;
  measurements?: {
    crownRumpLength?: number;
    bloodPressure?: string;
    heartRate?: number;
  };
  pregnantMom?: {
    weight?: number;
  };
  notes?: string;
}

export interface PregnancyInfo {
  conceptionDate: Date;
  dueDate: Date;
  currentWeek: number;
  currentDay: number;
  daysRemaining: number;
  trimester: 1 | 2 | 3;
  progress: number;
}

// File types
export interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  path: string;
  url?: string;
  createdAt: string;
  isFolder?: boolean;
  children?: FileInfo[];
}

// Weather types
export interface CurrentWeatherCondition {
  temp: number;
  feelslike: number;
  humidity: number;
  windspeed: number;
  conditions: string;
  icon: string;
  sunrise: string;
  sunset: string;
}

export interface DayWeatherInfo {
  datetime: string;
  tempmax: number;
  tempmin: number;
  temp: number;
  humidity: number;
  windspeed: number;
  conditions: string;
  icon: string;
}

export interface WeatherInfo {
  resolvedAddress: string;
  timezone: string;
  description: string;
  days: DayWeatherInfo[];
  currentConditions: CurrentWeatherCondition;
}

// Live Share types
export interface RoomMessage {
  id: string;
  content: string;
  timestamp: number;
  type: 'text';
}

export interface RoomFile {
  id: string;
  name: string;
  url: string;
  size: number;
  timestamp: number;
  type: 'file';
}

export interface Room {
  id: string;
  createdAt: number;
  messages: RoomMessage[];
  files: RoomFile[];
}

// Food types
export type FoodCategory = 'safe' | 'forbidden' | 'limited';

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  description?: string;
  reason?: string;
  alternatives?: string[];
}

// Meal Check-in types
export interface MealCheckIn {
  id: string;
  userId: string;
  date: string; // Format: YYYY-MM-DD
  imageUrl: string;
  imageStoragePath: string;
  notes?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface MealCheckInStats {
  totalDaysInMonth: number;
  checkedInDays: number;
  percentage: number;
}

// Device monitoring types
export interface DeviceData {
  used_memory?: number;
  cpu_usage?: number;
  disk_usage?: number;
  network_stats?: { upload: number; download: number };
  system_info?: Record<string, unknown>;
  timestamp?: number;
}

export interface Device {
  device_name: string;
  status: 'up' | 'down';
  last_update: number;
  memory_percentage: number;
  raw_data: DeviceData;
}

// Dashboard stats
export interface DashboardStats {
  developmentRecords: number;
  scheduledEvents: number;
  ultrasoundScans: number;
  foodItems: number;
}

// Action types for state management
export enum ActionType {
  FETCH = 'FETCH',
  ADD = 'ADD',
  REMOVE = 'REMOVE',
  SYNC = 'SYNC',
  EDIT = 'EDIT',
  CANCEL_EDITING = 'CANCEL_EDITING',
  NONE = 'NONE'
}

// Common types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppSettings {
  theme: ThemeMode;
  language: 'en' | 'vi';
  notifications: boolean;
}
