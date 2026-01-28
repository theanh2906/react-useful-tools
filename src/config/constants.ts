// API URLs
const DEFAULT_API_URL = import.meta.env.PROD
  ? `${typeof window !== 'undefined' ? window.location.origin : ''}/api`
  : 'http://localhost:3000/api';

const DEFAULT_WS_ENDPOINT = import.meta.env.PROD
  ? `${typeof window !== 'undefined' ? window.location.origin : ''}`
  : 'http://localhost:3000';

export const API_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL;
export const WS_ENDPOINT = import.meta.env.VITE_WS_ENDPOINT || DEFAULT_WS_ENDPOINT;

// Visual Crossing Weather API
export const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY || 'W9ZMQH9J9C95VMW3EFA7XLNXB';
export const WEATHER_API_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

// Pregnancy constants
export const PREGNANCY_WEEKS = 40;
export const DAYS_PER_WEEK = 7;
export const TOTAL_PREGNANCY_DAYS = PREGNANCY_WEEKS * DAYS_PER_WEEK;

// Trimester ranges
export const TRIMESTER_RANGES = {
  first: { start: 1, end: 12 },
  second: { start: 13, end: 27 },
  third: { start: 28, end: 40 }
};

// BMI Categories
export const BMI_CATEGORIES = {
  underweight: { max: 18.5, label: 'Underweight', color: '#3b82f6' },
  normal: { min: 18.5, max: 24.9, label: 'Normal', color: '#22c55e' },
  overweight: { min: 25, max: 29.9, label: 'Overweight', color: '#f97316' },
  obese: { min: 30, label: 'Obese', color: '#ef4444' }
};

// Event categories with colors
export const EVENT_CATEGORIES: { id: string; name: string; color: string }[] = [
  { id: 'appointment', name: 'Appointment', color: '#FFD1DC' },
  { id: 'ultrasound', name: 'Ultrasound', color: '#AECBFA' },
  { id: 'checkup', name: 'Checkup', color: '#B5EAD7' },
  { id: 'other', name: 'Other', color: '#FFF9B1' }
];

// Popular destinations for weather
export const POPULAR_DESTINATIONS = [
  { name: 'Ho Chi Minh City', country: 'Vietnam' },
  { name: 'Hanoi', country: 'Vietnam' },
  { name: 'Da Nang', country: 'Vietnam' },
  { name: 'Singapore', country: 'Singapore' },
  { name: 'Bangkok', country: 'Thailand' },
  { name: 'Tokyo', country: 'Japan' },
  { name: 'Seoul', country: 'South Korea' },
  { name: 'Paris', country: 'France' },
  { name: 'London', country: 'United Kingdom' },
  { name: 'New York', country: 'United States' }
];

// File type icons
export const FILE_TYPE_ICONS: Record<string, string> = {
  'image': '🖼️',
  'video': '🎬',
  'audio': '🎵',
  'pdf': '📄',
  'document': '📝',
  'spreadsheet': '📊',
  'archive': '📦',
  'folder': '📁',
  'default': '📎'
};

// Max file size (10GB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024;

// Date formats
export const DATE_FORMATS = {
  display: 'MMM dd, yyyy',
  input: 'yyyy-MM-dd',
  full: 'EEEE, MMMM dd, yyyy',
  time: 'HH:mm',
  datetime: 'MMM dd, yyyy HH:mm'
};

// Animation durations
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500
};

// Navigation items
export const NAV_ITEMS = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    labelKey: 'navigation.dashboard',
    path: '/', 
    icon: 'LayoutDashboard',
    category: 'main'
  },
  { 
    id: 'calendar', 
    label: 'Calendar', 
    labelKey: 'navigation.calendar',
    path: '/calendar', 
    icon: 'Calendar',
    category: 'main'
  },
  { 
    id: 'notes', 
    label: 'Notes', 
    labelKey: 'navigation.notes',
    path: '/notes', 
    icon: 'FileText',
    category: 'productivity',
    protected: true
  },
  { 
    id: 'storage', 
    label: 'Storage', 
    labelKey: 'navigation.storage',
    path: '/storage', 
    icon: 'HardDrive',
    category: 'productivity'
  },
  { 
    id: 'baby', 
    label: 'Baby Tracker', 
    labelKey: 'navigation.babyTracker',
    path: '/baby', 
    icon: 'Baby',
    category: 'family'
  },
  { 
    id: 'ultrasounds', 
    label: 'Ultrasounds', 
    labelKey: 'navigation.ultrasounds',
    path: '/ultrasounds', 
    icon: 'Image',
    category: 'family'
  },
  { 
    id: 'foods', 
    label: 'Food Guide', 
    labelKey: 'navigation.foodGuide',
    path: '/foods', 
    icon: 'Apple',
    category: 'family'
  },
  { 
    id: 'timeline', 
    label: 'Timeline', 
    labelKey: 'navigation.timeline',
    path: '/timeline', 
    icon: 'GitBranch',
    category: 'family'
  },
  { 
    id: 'meal-checkin', 
    label: 'Meal Check-In', 
    labelKey: 'navigation.mealCheckIn',
    path: '/meal-checkin', 
    icon: 'Utensils',
    category: 'family',
    protected: true
  },
  { 
    id: 'weather', 
    label: 'Weather', 
    labelKey: 'navigation.weather',
    path: '/weather', 
    icon: 'Cloud',
    category: 'utilities'
  },
  { 
    id: 'qr-scanner', 
    label: 'QR Scanner', 
    labelKey: 'navigation.qrScanner',
    path: '/qr-scanner', 
    icon: 'Scan',
    category: 'utilities'
  },
  { 
    id: 'qr-generator', 
    label: 'QR Generator', 
    labelKey: 'navigation.qrGenerator',
    path: '/qr-generator', 
    icon: 'QrCode',
    category: 'utilities'
  },
  { 
    id: 'crypto', 
    label: 'Crypto Tools', 
    labelKey: 'navigation.cryptoTools',
    path: '/crypto', 
    icon: 'Lock',
    category: 'utilities'
  },
  { 
    id: 'time-calculator', 
    label: 'Time Calculator', 
    labelKey: 'navigation.timeCalculator',
    path: '/time-calculator', 
    icon: 'Clock',
    category: 'utilities'
  },
  { 
    id: 'change-case', 
    label: 'Change Case', 
    labelKey: 'navigation.changeCase',
    path: '/change-case', 
    icon: 'Type',
    category: 'utilities'
  },
  { 
    id: 'zip', 
    label: 'Zip Tool', 
    labelKey: 'navigation.zipTool',
    path: '/zip', 
    icon: 'Archive',
    category: 'utilities'
  },
  { 
    id: 'live-share', 
    label: 'Live Share', 
    labelKey: 'navigation.liveShare',
    path: '/live-share', 
    icon: 'Share2',
    category: 'collaboration'
  },
  { 
    id: 'monitor', 
    label: 'System Monitor', 
    labelKey: 'navigation.monitor',
    path: '/monitor', 
    icon: 'Activity',
    category: 'development'
  }
];

export const NAV_CATEGORIES = [
  { id: 'main', label: 'Main', labelKey: 'categories.main' },
  { id: 'family', label: 'Baby & Family', labelKey: 'categories.family' },
  { id: 'productivity', label: 'Productivity', labelKey: 'categories.productivity' },
  { id: 'utilities', label: 'Utilities', labelKey: 'categories.utilities' },
  { id: 'collaboration', label: 'Collaboration', labelKey: 'categories.collaboration' },
  { id: 'development', label: 'Development', labelKey: 'categories.development' }
];
