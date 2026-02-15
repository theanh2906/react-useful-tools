/**
 * @module types
 * @description Core TypeScript type definitions for the Useful Tools application.
 * Contains all shared interfaces, enums, and type aliases used across the project.
 */

// ─── Auth Types ──────────────────────────────────────────────────────────────

/** Supported authentication methods for user login. */
export enum LoginMethod {
  /** No authentication method selected. */
  NONE = 0,
  /** Email/password credential login. */
  CREDENTIAL = 1,
  /** Google OAuth login. */
  GOOGLE = 2,
  /** Azure AD (Microsoft) login. */
  AZURE = 3,
}

/** Represents an authenticated user in the application. */
export interface User {
  /** Unique user identifier (Firebase UID). */
  id: string;
  /** User's email address. */
  email: string;
  /** User's display name (optional). */
  displayName?: string;
  /** URL to user's profile photo (optional). */
  photoURL?: string;
  /** Firebase ID token for API authentication. */
  token: string;
  /** Token expiration timestamp in milliseconds. */
  tokenExpirationIn: number;
}

/** Represents the authentication state of the application. */
export interface AuthState {
  /** Currently authenticated user, or `null` if logged out. */
  user: User | null;
  /** Whether the user is currently authenticated. */
  isAuthenticated: boolean;
  /** Whether an auth operation is in progress. */
  isLoading: boolean;
  /** Error message from the last auth operation, or `null`. */
  error: string | null;
}

// ─── Event Types ─────────────────────────────────────────────────────────────

/** Recurrence cycle options for recurring calendar events. */
export enum RecurrenceCycle {
  /** No recurrence (one-time event). */
  NONE = 'NONE',
  /** Repeats every month. */
  MONTHLY = 'MONTHLY',
  /** Repeats every 3 months. */
  QUARTERLY = 'QUARTERLY',
  /** Repeats every year. */
  YEARLY = 'YEARLY',
  /** Repeats every 2 years. */
  BIENNIAL = 'BIENNIAL',
  /** Custom recurrence interval. */
  CUSTOM = 'CUSTOM',
}

/** A category for grouping and color-coding calendar events. */
export interface EventCategory {
  /** Unique category identifier. */
  id: string;
  /** Display name of the category. */
  name: string;
  /** Hex color code for visual representation. */
  color: string;
}

/** A tag label for filtering calendar events. */
export interface EventTag {
  /** Unique tag identifier. */
  id: string;
  /** Display name of the tag. */
  name: string;
}

/** Configuration for a recurring event's repeat pattern. */
export interface RecurringEventPattern {
  /** The recurrence cycle type. */
  cycle: RecurrenceCycle;
  /** Number of years for custom recurrence (only when cycle is `CUSTOM`). */
  customYears?: number;
}

/** Represents a calendar event with optional recurrence and metadata. */
export interface EventData {
  /** Unique event identifier. */
  id: string;
  /** Event title/name. */
  title: string;
  /** Event start date/time as ISO string. */
  start: string;
  /** Event end date/time as ISO string (optional). */
  end?: string;
  /** Whether the event spans the entire day. */
  allDay?: boolean;
  /** Background color for calendar display. */
  backgroundColor?: string;
  /** Whether the event is marked as important. */
  isImportant?: boolean;
  /** List of category IDs this event belongs to. */
  categories?: string[];
  /** List of tag IDs attached to this event. */
  tags?: string[];
  /** Whether this event recurs. */
  isRecurring?: boolean;
  /** Recurrence pattern configuration. */
  recurringPattern?: RecurringEventPattern;
  /** ID of the parent event (for recurring instances). */
  parentEventId?: string;
  /** Event location or venue. */
  location?: string;
  /** Additional notes for the event. */
  notes?: string;
  /** Whether a reminder is set for this event. */
  reminder?: boolean;
  /** ISO timestamp of when the event was created. */
  createdAt?: string;
}

// ─── Note Types ──────────────────────────────────────────────────────────────

/** Represents a text note with categories and pin support. */
export interface Note {
  /** Unique note identifier. */
  id: string;
  /** Note title. */
  title: string;
  /** Note content (may contain HTML). */
  content: string;
  /** Creation timestamp in milliseconds. */
  createdDate: number;
  /** Last modification timestamp in milliseconds (optional). */
  modifiedDate?: number;
  /** List of category labels assigned to this note. */
  categories: string[];
  /** Whether the note is pinned to the top. */
  isPinned?: boolean;
}

// ─── Baby Types ──────────────────────────────────────────────────────────────

/** Identifiers for tracked babies in the family. */
export enum Baby {
  /** First child (Peanut). */
  Peanut = 'peanut',
  /** Second child / pregnancy (Soya). */
  Soya = 'soya',
}

/** Development tracking record for Peanut (postnatal). */
export interface BabyData {
  /** Unique record identifier. */
  id: string;
  /** Date of the record (ISO string or timestamp). */
  date: string | number;
  /** Baby's weight in kg (optional). */
  weight?: number;
  /** Baby's height in cm (optional). */
  height?: number;
  /** Baby's heart rate in bpm (optional). */
  heartRate?: number;
  /** Additional observations (optional). */
  notes?: string;
}

/** Prenatal tracking record for Soya (pregnancy). */
export interface SoyaData {
  /** Unique record identifier. */
  id: string;
  /** ISO timestamp of record creation (optional). */
  createdAt?: string;
  /** Date of the record (ISO string or timestamp). */
  date: string | number;
  /** Gestational age string, e.g. "12W3D" (optional). */
  gestationalAge?: string;
  /** URL of ultrasound image (optional). */
  ultrasoundImageUrl?: string;
  /** Prenatal measurement data (optional). */
  measurements?: {
    /** Crown-rump length in mm. */
    crownRumpLength?: number;
    /** Blood pressure reading, e.g. "120/80". */
    bloodPressure?: string;
    /** Fetal heart rate in bpm. */
    heartRate?: number;
  };
  /** Mother's health data (optional). */
  pregnantMom?: {
    /** Mother's weight in kg. */
    weight?: number;
  };
  /** Additional notes (optional). */
  notes?: string;
}

/** Calculated pregnancy information based on conception date. */
export interface PregnancyInfo {
  /** Date of conception. */
  conceptionDate: Date;
  /** Estimated due date. */
  dueDate: Date;
  /** Current week of pregnancy (1-40). */
  currentWeek: number;
  /** Current day within the week (1-7). */
  currentDay: number;
  /** Number of days remaining until due date. */
  daysRemaining: number;
  /** Current trimester (1, 2, or 3). */
  trimester: 1 | 2 | 3;
  /** Pregnancy progress percentage (0-100). */
  progress: number;
}

// ─── File Types ──────────────────────────────────────────────────────────────

/** Represents a file or folder in Firebase Storage. */
export interface FileInfo {
  /** Unique file identifier (full storage path). */
  id: string;
  /** File name with extension. */
  name: string;
  /** File size in bytes. */
  size: number;
  /** MIME type or file category. */
  type: string;
  /** Full storage path. */
  path: string;
  /** Download URL (optional). */
  url?: string;
  /** ISO timestamp of file creation. */
  createdAt: string;
  /** Whether this entry represents a folder. */
  isFolder?: boolean;
  /** Child files/folders (for directory entries). */
  children?: FileInfo[];
}

// ─── Weather Types ───────────────────────────────────────────────────────────

/** Current weather conditions from Visual Crossing API. */
export interface CurrentWeatherCondition {
  /** Current temperature in configured unit. */
  temp: number;
  /** Feels-like temperature. */
  feelslike: number;
  /** Humidity percentage (0-100). */
  humidity: number;
  /** Wind speed in configured unit. */
  windspeed: number;
  /** Weather condition description. */
  conditions: string;
  /** Weather icon code. */
  icon: string;
  /** Sunrise time string. */
  sunrise: string;
  /** Sunset time string. */
  sunset: string;
}

/** Daily weather forecast data. */
export interface DayWeatherInfo {
  /** Date string (YYYY-MM-DD). */
  datetime: string;
  /** Maximum temperature for the day. */
  tempmax: number;
  /** Minimum temperature for the day. */
  tempmin: number;
  /** Average temperature for the day. */
  temp: number;
  /** Average humidity percentage. */
  humidity: number;
  /** Average wind speed. */
  windspeed: number;
  /** Weather condition description. */
  conditions: string;
  /** Weather icon code. */
  icon: string;
}

/** Complete weather information for a location. */
export interface WeatherInfo {
  /** Resolved location address. */
  resolvedAddress: string;
  /** Location timezone identifier. */
  timezone: string;
  /** Weather summary description. */
  description: string;
  /** Array of daily forecast data. */
  days: DayWeatherInfo[];
  /** Current weather conditions. */
  currentConditions: CurrentWeatherCondition;
}

// ─── Live Share Types ────────────────────────────────────────────────────────

/** A text message in a Live Share room. */
export interface RoomMessage {
  /** Unique message identifier. */
  id: string;
  /** Message text content. */
  content: string;
  /** Timestamp in milliseconds. */
  timestamp: number;
  /** Message type (always 'text'). */
  type: 'text';
}

/** A shared file in a Live Share room. */
export interface RoomFile {
  /** Unique file identifier. */
  id: string;
  /** File name. */
  name: string;
  /** Download URL. */
  url: string;
  /** File size in bytes. */
  size: number;
  /** Upload timestamp in milliseconds. */
  timestamp: number;
  /** Entry type (always 'file'). */
  type: 'file';
}

/** Represents a Live Share collaboration room. */
export interface Room {
  /** Unique room identifier. */
  id: string;
  /** Room creation timestamp in milliseconds. */
  createdAt: number;
  /** Messages in the room. */
  messages: RoomMessage[];
  /** Files shared in the room. */
  files: RoomFile[];
}

// ─── Meal Check-in Types ─────────────────────────────────────────────────────

/** A daily meal check-in record with photo proof. */
export interface MealCheckIn {
  /** Unique check-in identifier (format: `{userId}_{date}`). */
  id: string;
  /** ID of the user who checked in. */
  userId: string;
  /** Check-in date in `YYYY-MM-DD` format. */
  date: string;
  /** Download URL of the meal photo. */
  imageUrl: string;
  /** Firebase Storage path of the meal photo. */
  imageStoragePath: string;
  /** Optional notes about the meal. */
  notes?: string;
  /** Creation timestamp in milliseconds. */
  createdAt: number;
  /** Last update timestamp in milliseconds (optional). */
  updatedAt?: number;
}

/** Monthly statistics for meal check-ins. */
export interface MealCheckInStats {
  /** Total number of days in the month. */
  totalDaysInMonth: number;
  /** Number of days with a check-in. */
  checkedInDays: number;
  /** Check-in completion percentage (0-100). */
  percentage: number;
}

// ─── Device Monitoring Types ─────────────────────────────────────────────────

/** Raw device monitoring data from system agents. */
export interface DeviceData {
  /** Used memory percentage (optional). */
  used_memory?: number;
  /** CPU usage percentage (optional). */
  cpu_usage?: number;
  /** Disk usage percentage (optional). */
  disk_usage?: number;
  /** Network upload/download speeds (optional). */
  network_stats?: { upload: number; download: number };
  /** Additional system information (optional). */
  system_info?: Record<string, unknown>;
  /** Data collection timestamp (optional). */
  timestamp?: number;
}

/** A monitored device with its current status and metrics. */
export interface Device {
  /** Device display name. */
  device_name: string;
  /** Current device status. */
  status: 'up' | 'down';
  /** Last update timestamp in milliseconds. */
  last_update: number;
  /** Memory usage percentage. */
  memory_percentage: number;
  /** Full raw monitoring data. */
  raw_data: DeviceData;
}

// ─── Dashboard Types ─────────────────────────────────────────────────────────

/** Aggregate statistics displayed on the dashboard. */
export interface DashboardStats {
  /** Total number of baby development records. */
  developmentRecords: number;
  /** Number of upcoming scheduled events. */
  scheduledEvents: number;
  /** Total number of ultrasound scans. */
  ultrasoundScans: number;
}

// ─── State Management Types ──────────────────────────────────────────────────

/** Action types for tracking CRUD operations in state management. */
export enum ActionType {
  /** Fetching data from the server. */
  FETCH = 'FETCH',
  /** Adding a new item. */
  ADD = 'ADD',
  /** Removing an existing item. */
  REMOVE = 'REMOVE',
  /** Syncing data with the server. */
  SYNC = 'SYNC',
  /** Editing an existing item. */
  EDIT = 'EDIT',
  /** Cancelling an in-progress edit. */
  CANCEL_EDITING = 'CANCEL_EDITING',
  /** No action / idle state. */
  NONE = 'NONE',
}

// ─── Common Types ────────────────────────────────────────────────────────────

/**
 * Generic API response wrapper.
 * @typeParam T - The type of the response payload.
 */
export interface ApiResponse<T> {
  /** Response payload data. */
  data: T;
  /** Whether the request was successful. */
  success: boolean;
  /** Optional message (usually for errors). */
  message?: string;
}

/** Theme mode options for the application. */
export type ThemeMode = 'light' | 'dark' | 'system';

/** Global application settings. */
export interface AppSettings {
  /** Current theme mode. */
  theme: ThemeMode;
  /** Current language locale. */
  language: 'en' | 'vi';
  /** Whether push notifications are enabled. */
  notifications: boolean;
}
