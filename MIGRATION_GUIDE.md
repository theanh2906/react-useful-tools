# Useful Tools - Tài liệu Migration chi tiết

## 📋 Mục lục

1. [Tổng quan Project](#1-tổng-quan-project)
2. [Technology Stack](#2-technology-stack)
3. [Cấu trúc Project](#3-cấu-trúc-project)
4. [Authentication & Authorization](#4-authentication--authorization)
5. [State Management](#5-state-management)
6. [Services & API Integration](#6-services--api-integration)
7. [Models & Data Types](#7-models--data-types)
8. [Routing](#8-routing)
9. [Components & Pages](#9-components--pages)
10. [Real-time Features](#10-real-time-features)
11. [Storage & File Management](#11-storage--file-management)
12. [Internationalization (i18n)](#12-internationalization-i18n)
13. [Environment Configuration](#13-environment-configuration)
14. [Deployment](#14-deployment)
15. [Feature Migration Checklist](#15-feature-migration-checklist)

---

## 1. Tổng quan Project

### Mục đích

**Useful Tools** là một ứng dụng web đa chức năng bao gồm:

- 📅 **Calendar & Event Management**: Quản lý sự kiện với FullCalendar
- 📝 **Notes**: Ghi chú với rich text editor (Quill)
- 💾 **File Storage**: Upload/download files qua Firebase Storage hoặc Backend API
- 🌤️ **Weather**: Xem thông tin thời tiết qua Visual Crossing API
- 👶 **Baby Tracker**: Theo dõi thai kỳ và phát triển em bé
- 📊 **System Monitor**: Giám sát hệ thống với realtime updates (Kafka, Jenkins, Devices)
- 🔐 **Authentication**: Đăng nhập qua Firebase, Google OAuth, Azure AD
- 🔗 **Live Share**: Chia sẻ realtime qua WebSocket

### Technical Highlights

- **Framework**: Angular 18.2.7 (Standalone Components)
- **State Management**: NgRx Store + NgRx Signals
- **UI Libraries**: PrimeNG 17, Angular Material 18
- **Backend Integration**: REST API, Firebase Realtime Database, Firebase Storage
- **Real-time**: Socket.io, Server-Sent Events (SSE), STOMP/RabbitMQ

---

## 2. Technology Stack

### Frontend Dependencies (Quan trọng cho migration)

```json
{
  "core": {
    "@angular/core": "~18.2.7",
    "@angular/router": "~18.2.7",
    "@angular/forms": "~18.2.7",
    "@angular/common": "~18.2.7"
  },
  "state-management": {
    "@ngrx/store": "^18.1.0",
    "@ngrx/effects": "^18.1.0",
    "@ngrx/signals": "^18.1.0",
    "@ngrx/router-store": "^18.1.0"
  },
  "ui-libraries": {
    "primeng": "17.18.11",
    "primeflex": "^3.3.1",
    "@angular/material": "^18.2.7",
    "@angular/cdk": "^18.2.7"
  },
  "firebase": {
    "@angular/fire": "^18.0.1",
    "firebase": "(peer dependency)"
  },
  "calendar": {
    "@fullcalendar/angular": "^6.1.15",
    "@fullcalendar/core": "^6.1.15",
    "@fullcalendar/daygrid": "^6.1.15",
    "@fullcalendar/interaction": "^6.1.15",
    "@fullcalendar/timegrid": "^6.1.15"
  },
  "charts": {
    "chart.js": "^4.4.7",
    "fusioncharts": "^4.1.2"
  },
  "real-time": {
    "socket.io-client": "^4.8.1",
    "@stomp/stompjs": "^7.1.1",
    "sockjs-client": "^1.6.1"
  },
  "utilities": {
    "rxjs": "~7.8.1",
    "uuid": "^10.0.0",
    "crypto-js": "^4.2.0",
    "jszip": "^3.10.1",
    "jsqr": "^1.4.0",
    "quill": "^2.0.2",
    "downloadjs": "^1.4.7",
    "file-saver": "^2.0.5"
  },
  "azure": {
    "@azure/msal-angular": "^3.0.25",
    "@azure/msal-browser": "^3.26.1",
    "@azure/service-bus": "^7.9.5"
  },
  "i18n": {
    "@ngx-translate/core": "^17.0.0",
    "@ngx-translate/http-loader": "^17.0.0"
  }
}
```

---

## 3. Cấu trúc Project

```
src/
├── app/
│   ├── actions/                 # NgRx Actions
│   │   └── app.action.ts
│   ├── animations/              # Angular Animations
│   │   └── fade.animation.ts
│   ├── auth/                    # Authentication Module
│   │   ├── auth.guard.ts        # Route Guard
│   │   ├── auth.service.ts      # Auth Service
│   │   ├── live-share.guard.ts  # Live Share Guard
│   │   └── user.model.ts        # User Model
│   ├── components/              # Shared Components
│   │   └── mock-mode-banner.component.ts
│   ├── config/                  # App Configuration
│   ├── directives/              # Custom Directives
│   │   ├── autoscale.directive.ts
│   │   └── mobile.directive.ts
│   ├── effects/                 # NgRx Effects
│   │   ├── index.ts
│   │   ├── notes.effect.ts
│   │   └── storage.effect.ts
│   ├── general-components/      # Reusable Components
│   │   ├── dialogs/
│   │   ├── menu-bar/
│   │   └── prime-menu-bar/
│   ├── helpers/                 # Utility Helpers
│   ├── interceptors/            # HTTP Interceptors
│   │   ├── fshare-token.interceptor.ts
│   │   └── loading.interceptor.ts
│   ├── models/                  # TypeScript Models
│   │   ├── device.model.ts
│   │   ├── jenkins.model.ts
│   │   ├── kafka.model.ts
│   │   └── live-share.model.ts
│   ├── pages/                   # Page Components (101 files)
│   │   ├── authentication/
│   │   ├── baby/
│   │   ├── calendar/
│   │   ├── change-case/
│   │   ├── crypto/
│   │   ├── dashboard/
│   │   ├── event-calendar/
│   │   ├── food-management/
│   │   ├── live-share/
│   │   ├── live-share-room/
│   │   ├── monitor/
│   │   ├── notes/
│   │   ├── qr-generator/
│   │   ├── qr-scanner/
│   │   ├── storage/
│   │   ├── terminal/
│   │   ├── time-calculator/
│   │   ├── timeline/
│   │   ├── ultrasound-gallery/
│   │   ├── weather/
│   │   └── zip/
│   ├── pipes/                   # Custom Pipes
│   │   ├── file-size.pipe.ts
│   │   └── i18n.pipe.ts
│   ├── reducers/                # NgRx Reducers
│   │   ├── index.ts
│   │   ├── change-case.reducer.ts
│   │   ├── data.reducer.ts
│   │   ├── events.reducer.ts
│   │   ├── notes.reducer.ts
│   │   └── notification.reducer.ts
│   ├── services/                # Business Logic Services (29 files)
│   │   ├── baby.service.ts
│   │   ├── barcode.service.ts
│   │   ├── base.service.ts
│   │   ├── event.service.ts
│   │   ├── firebase.service.ts
│   │   ├── jenkins.service.ts
│   │   ├── kafka.service.ts
│   │   ├── live-share.service.ts
│   │   ├── notes.service.ts
│   │   ├── socket.service.ts
│   │   ├── storage.service.ts
│   │   ├── utils.service.ts
│   │   ├── weather.service.ts
│   │   └── ...more
│   ├── shared/                  # Shared Utilities
│   │   ├── constants.ts
│   │   ├── types.ts
│   │   └── calendar-models.ts
│   ├── signals/                 # NgRx Signal Stores
│   │   └── store/
│   │       ├── dashboard.store.ts
│   │       ├── events.store.ts
│   │       ├── files.store.ts
│   │       ├── notes.store.ts
│   │       └── system.store.ts
│   ├── app.component.ts         # Root Component
│   ├── app.config.ts            # App Configuration
│   ├── app.routing.ts           # Routing Configuration
│   ├── base.component.ts        # Base Component
│   └── azure.config.ts          # Azure AD Configuration
├── assets/
│   ├── i18n/                    # Translation Files
│   │   ├── en.json
│   │   └── vi.json
│   └── icons/
├── commons/
│   └── interfaces.ts            # Global Interfaces
├── environments/
│   ├── environment.ts           # Development
│   ├── environment.prod.ts      # Production
│   └── environment.remote.ts    # Remote Dev
└── styles/                      # Global Styles
    ├── theme.style.scss
    ├── components.style.scss
    └── responsive-enhancements.scss
```

---

## 4. Authentication & Authorization

### 4.1 Auth Service (`src/app/auth/auth.service.ts`)

```typescript
// Các phương thức chính
class AuthService {
  // Login với email/password (Firebase Auth)
  login(config: LoginConfig): Observable<AuthResponseData>;

  // Đăng ký tài khoản mới
  signup(email: string, password: string): Observable<AuthResponseData>;

  // Auto login từ session storage
  autoLogin(expiredIn: number): Observable<boolean>;

  // Logout
  logout(): void;

  // Azure AD SSO Login
  azureLogin(): void;

  // Google OAuth Login
  // Handled via gapi.auth2
}
```

### 4.2 User Model (`src/app/auth/user.model.ts`)

```typescript
interface User {
  id: string;
  email: string;
  _token: string;
  tokenExpirationIn: number;

  get token(): string | null;
  get tokenDuration(): number;
}
```

### 4.3 Auth Data Types (`src/app/shared/types.ts`)

```typescript
enum LoginMethod {
  NONE = 0,
  CREDENTIAL = 1,
  GOOGLE = 2,
  AZURE = 3,
}

interface AuthResponseData {
  kind?: string;
  idToken: string;
  email: string;
  refreshToken?: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

interface AuthData {
  email: string;
  token: string;
  expiresIn: number;
  userId: string;
}

interface LoginConfig {
  email?: string;
  password?: string;
  method?: LoginMethod;
  googleUser?: GoogleUser;
  expiredIn: number;
}
```

### 4.4 Route Guards

```typescript
// AuthGuard - Bảo vệ các route cần đăng nhập
@Injectable()
class AuthGuard implements CanActivate {
  canActivate(route, state): Observable<boolean> {
    // Check isAuthenticated
    // Redirect to /auth?ref=<route> nếu chưa đăng nhập
  }
}

// LiveShareGuard - Kiểm tra user đã login cho Live Share
@Injectable()
class LiveShareGuard implements CanActivate {
  // Redirect đến admin room nếu đã login
}
```

### 4.5 Migration Notes

Khi migrate sang framework khác, cần implement:

- Firebase Authentication integration
- Google OAuth 2.0 flow
- Azure AD MSAL flow
- Session storage management
- Auto-logout with token expiration

---

## 5. State Management

### 5.1 NgRx Store Structure

#### App State (`src/app/reducers/index.ts`)

```typescript
interface AppState {
  changeCase: TextState;
  notes: NoteState;
  events: EventState;
  notification: NotificationState;
  data: DataState;
}

const reducers = {
  changeCase: changeCaseReducer,
  notes: notesReducer,
  events: eventsReducer,
  notification: notificationReducer,
  data: dataReducer,
};
```

#### Notes Reducer Example

```typescript
interface NoteState {
  refreshNotes?: boolean;
  cancelNoteIds?: string;
}

// Actions: FETCH, ADD, REMOVE, SYNC, EDIT
// Trigger refreshNotes: true when any action occurs
```

#### Events Reducer

```typescript
interface EventState {
  data?: any;
  action?: ActionType;
}

// Actions: ADD, REMOVE, EDIT
// Returns { action: ActionType, data: eventData }
```

### 5.2 NgRx Signal Stores (Modern approach)

Project sử dụng NgRx Signals cho các features mới:

#### Events Store (`src/app/signals/store/events.store.ts`)

```typescript
type EventState = {
  action: ActionType;
  events: EnhancedEvent[];
  categories: EventCategory[];
  tags: EventTag[];
  success: boolean;
  detail: string;
  dateToNavigate: number;
  timestamp: number;
  upcomingEventsRange: number;
};

const EventStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, eventService, snackBar) => ({
    getEvents: rxMethod<void>(...),
    getCategories: rxMethod<void>(...),
    getTags: rxMethod<void>(...),
    addEvent: rxMethod<EventData>(...),
    editEvent: rxMethod<EventData>(...),
    deleteEvents: rxMethod<string[]>(...),
    navigate: (date: string) => void,
    // ... more methods
  })),
  withHooks({
    onInit(store) {
      store.getEvents();
      store.getCategories();
      store.getTags();
    }
  })
);
```

#### Dashboard Store (`src/app/signals/store/dashboard.store.ts`)

- Computed values cho pregnancy tracking
- Live countdown timer
- Chart data preparation
- Stats aggregation

#### Files Store, Notes Store, System Store

- Similar pattern với signalStore

### 5.3 Action Types

```typescript
enum ActionType {
  FETCH = 'FETCH',
  ADD = 'ADD',
  REMOVE = 'REMOVE',
  SYNC = 'SYNC',
  EDIT = 'EDIT',
  CANCEL_EDITING = 'CANCEL_EDITING',
  NONE = 'NONE',
}
```

### 5.4 Migration Notes

- Redux, Zustand, Pinia, hoặc MobX là các alternatives
- Cần maintain reactive updates khi state thay đổi
- Effect system để handle side effects (API calls)

---

## 6. Services & API Integration

### 6.1 Base Service (`src/app/services/base.service.ts`)

```typescript
class BaseService {
  // Injected dependencies
  protected utils = inject(UtilsService);
  protected http = inject(HttpClient);
  protected router = inject(Router);
  protected activatedRoute = inject(ActivatedRoute);
  protected store = inject(Store);
  protected spinner = inject(NgxSpinnerService);

  // Observable subject for data
  public _subject = new BehaviorSubject<any>(null);

  get apiUrl() {
    return this.utils.getApiUrl(); // Cloud hoặc Remote
  }
}
```

### 6.2 Notes Service

```typescript
interface Note {
  id: string;
  title: string;
  content: string;
  createdDate: number;
  modifiedDate?: number;
  isEdit?: boolean;
  categories: string[];
}

class NotesService {
  addNote(note: Note): Observable<Note>;
  getAllNotes(): Observable<Note[]>;
  deleteNote(id: string): Observable<void>;
  editNote(note: Note): Observable<void>;
  syncNotes(): Observable<Note[]>; // Sync từ Firebase
}
```

### 6.3 Event Service

```typescript
interface EventData {
  id?: string;
  title: string;
  date: string; // ISO string
  time?: string; // HH:mm
  category: 'Appointment' | 'Ultrasound' | 'Checkup' | 'Other';
  notes?: string;
  recurring?: boolean;
  recurringType?: 'weekly' | 'monthly' | 'none';
  location?: string;
  reminder?: boolean;
  createdAt?: string;
}

class EventService {
  getEventEntries(): Observable<EventData[]>;
  getEventsByCategory(category: string): Observable<EventData[]>;
  getEventsInDateRange(start, end): Observable<EventData[]>;
  getUpcomingEvents(): Observable<EventData[]>; // Next 30 days
  addEvent(entry: EventData): Observable<void>;
  updateEvent(entry: EventData): Observable<void>;
  deleteEvent(entryId: string): Observable<void>;
  formatEventsForCalendar(events): FullCalendarEvent[];
  getCategories(): Observable<EventCategory[]>;
  getTags(): Observable<EventTag[]>;
}
```

### 6.4 Baby Service

```typescript
interface BabyData {
  id?: string;
  date: string | number;
  weight?: number;
  height?: number;
  heartRate?: number;
  notes?: string;
}

interface SoyaData {
  id?: string;
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

// Baby enum
enum Baby {
  Peanut = 'peanut',
  Soya = 'soya',
}

class BabyService {
  getBabyDataEntries(baby: Baby): Observable<BabyData[]>;
  addBabyData(entry: BabyData, baby: Baby): Observable<void>;
  updateBabyData(entry: BabyData, baby: Baby): Observable<void>;
  deleteBabyData(entryId: string, baby: Baby): Observable<void>;
  getSoyaDataEntries(): Observable<SoyaData[]>;
  calculateBMI(weight, height): number;
  getBMICategory(bmi): string;
  uploadUltrasoundImage(file: File): Observable<string>; // Returns URL
}
```

### 6.5 Storage Service

```typescript
interface FileFolder {
  id: string;
  linkcode: string;
  name: string;
  type: string;
  path: string;
  size: string;
  mimetype: string;
  created: string;
  children: FileFolder[];
}

class StorageService {
  upload(formData: FormData): Observable<UploadResult>;
  getAllFiles(): Observable<FileInfo[]>;
  downloadFile(path: string): void;
  deleteFiles(paths: string[]): Observable<void>;
  editFileName(oldPath, newName): Observable<void>;
  editFolderName(oldPath, newName): Observable<void>;
  createZip(formData: FormData): Observable<Blob>;

  // Firebase Storage methods (private)
  uploadToFirebase(formData): Observable<UploadResult>;
  getAllFilesFromFirebase(): Observable<FileInfo[]>;
}
```

### 6.6 Weather Service

```typescript
class WeatherService {
  buildQuery(place: string): void;
  buildCoordsQuery(lat: number, lng: number): void;
  forecast(): Observable<WeatherInfo>;
  getPlaceWeather(place: string): Observable<WeatherInfo>;
}
```

### 6.7 Jenkins Service

```typescript
class JenkinsService {
  // SSE Monitoring
  startSSEMonitoring(): void;
  stopSSEMonitoring(): void;

  // Observable streams
  jobs$: Observable<JenkinsJob[]>;
  status$: Observable<JenkinsStatus>;
  health$: Observable<JenkinsHealth>;
  queue$: Observable<JenkinsQueue>;
  connectionStatus$: Observable<'connected' | 'disconnected' | 'error'>;

  // API Methods
  getJobs(): Observable<JenkinsJob[]>;
  getJobDetails(jobName): Observable<JenkinsJobDetails>;
  getJobBuilds(jobName, limit): Observable<JenkinsBuild[]>;
  triggerBuild(jobName, parameters?): Observable<BuildResponse>;
  getBuildConsoleOutput(jobName, buildNumber): Observable<ConsoleOutput>;
  streamBuildLog(jobName, buildNumber): Observable<LogData>;
  stopBuild(jobName, buildNumber): Observable<void>;
  getMetricCards(status, jobs): JenkinsMetricCard[];
}
```

### 6.8 Live Share Service

```typescript
interface Room {
  id: string;
  createdAt: number;
  messages: RoomMessage[];
  files: RoomFile[];
}

interface RoomMessage {
  id: string;
  content: string;
  timestamp: number;
  type: 'text';
}

interface RoomFile {
  id: string;
  name: string;
  url: string;
  size: number;
  timestamp: number;
  type: 'file';
}

class LiveShareService {
  createRoom(): Observable<{ roomId: string }>;
  getRoom(roomId): Observable<Room>;
  getRoomContent(roomId): Observable<RoomContent[]>;
  addMessage(roomId, content): Observable<RoomMessage>;
  uploadFile(roomId, file): Observable<RoomFile>;
  deleteRoom(roomId): Observable<void>;
  getOrCreateAdminRoom(): Observable<{ roomId: string }>;
  clearHistory(roomId): Observable<void>;
}
```

### 6.9 Socket Service

```typescript
class SocketService {
  connect(): void;
  disconnect(): void;
  emit(eventName: string, body?: any): void;
  emitWithAck(eventName, body): Observable<any>;
  on<T>(event: string): Observable<T>;
  sendMessage(message: string): void;
}
```

### 6.10 Utils Service

```typescript
class UtilsService {
  get isMobile(): boolean;
  mediaMatch(maxWidth: number): boolean;
  getApiUrl(): string;
  getRemoteApiUrl(): string;
  isCloud(): boolean;
  isProduction(): boolean;
  showErrorMessage(message: string): void;
  showSuccessMessage(message: string): void;
  replacePlaceHolder(template, values): string;
  formatUrlFragment<T>(fragment): T;
  sortAscBy<T>(arr, field, order): T[];
  cssClassParsing(elementRef, renderer): void;
  sleep(ms): Promise<void>;
  // ... more utilities
}
```

---

## 7. Models & Data Types

### 7.1 Device Monitor Models

```typescript
interface DeviceMessage {
  device_name: string;
  data: string;
  timestamp: number;
}

interface DeviceData {
  used_memory?: number;
  cpu_usage?: number;
  disk_usage?: number;
  network_stats?: { upload: number; download: number };
  system_info?: any;
  timestamp?: number;
  [key: string]: any;
}

interface Device {
  device_name: string;
  status: 'up' | 'down';
  last_update: number;
  memory_percentage: number;
  raw_data: DeviceData;
  data_string: string;
}
```

### 7.2 Jenkins Models

```typescript
interface JenkinsJob {
  name: string;
  url: string;
  color: string; // blue, red, yellow, grey, disabled, aborted
  buildable: boolean;
  lastBuild?: JenkinsBuild;
  healthReport?: JenkinsHealthReport[];
  inQueue: boolean;
  description?: string;
  statusInfo?: JenkinsStatusInfo;
}

interface JenkinsBuild {
  number: number;
  url: string;
  timestamp: number;
  result: 'SUCCESS' | 'FAILURE' | 'UNSTABLE' | 'ABORTED' | 'NOT_BUILT' | null;
  duration: number;
  displayName: string;
  building?: boolean;
}

interface JenkinsStatus {
  server: JenkinsHealth;
  queue: JenkinsQueueSummary;
  system: JenkinsSystemSummary;
  timestamp: number;
}
```

### 7.3 Kafka Models

```typescript
interface KafkaTopicInfo {
  name: string;
  partitions: KafkaPartitionInfo[];
  totalPartitions: number;
  replicationFactor: number;
  totalSize?: number;
  messageCount?: number;
}

interface KafkaConsumerGroupInfo {
  groupId: string;
  state: string;
  members: Array<{
    memberId: string;
    clientId: string;
    clientHost: string;
    assignment: string[];
  }>;
  lag: number;
}

interface KafkaMonitorReport {
  timestamp: Date;
  status: 'online' | 'offline' | 'degraded';
  cluster: KafkaClusterInfo;
  topics: KafkaTopicInfo[];
  consumerGroups: KafkaConsumerGroupInfo[];
  performance: KafkaPerformanceMetrics;
}
```

### 7.4 Weather Models

```typescript
interface WeatherInfo {
  queryCost: number;
  latitude: number;
  longitude: number;
  resolvedAddress: string;
  timezone: string;
  description: string;
  days: DayWeatherInfo[];
  alerts: string[];
  currentConditions: CurrentWeatherCondition;
}

interface DayWeatherInfo {
  datetime: string;
  tempmax: number;
  tempmin: number;
  temp: number;
  humidity: number;
  windspeed: number;
  conditions: string;
  icon: string;
  hours: HourWeatherInfo[];
}

interface CurrentWeatherCondition {
  temp: number;
  feelslike: number;
  humidity: number;
  windspeed: number;
  conditions: string;
  icon: string;
  sunrise: string;
  sunset: string;
}
```

### 7.5 Calendar Models

```typescript
enum RecurrenceCycle {
  NONE = 'NONE',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
  BIENNIAL = 'BIENNIAL',
  CUSTOM = 'CUSTOM',
}

interface EventCategory {
  id: string;
  name: string;
  color: string;
}

interface EventTag {
  id: string;
  name: string;
}

interface RecurringEventPattern {
  cycle: RecurrenceCycle;
  customYears: number;
}

interface EnhancedEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  backgroundColor?: string;
  isImportant?: boolean;
  categories?: string[];
  tags?: string[];
  isRecurring?: boolean;
  recurringPattern: RecurringEventPattern;
  parentEventId?: string;
}
```

---

## 8. Routing

### Routes Configuration (`src/app/app.routing.ts`)

```typescript
const routes: Routes = [
  // Public Routes
  { path: '', component: DashboardComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'change-cases', component: ChangeCaseComponent },
  { path: 'qr-scanner', component: QrScannerComponent },
  { path: 'auth', component: AuthenticationComponent },
  { path: 'storage', component: StorageComponent },
  { path: 'time-calculator', component: TimeCalculatorComponent },
  { path: 'weather', component: WeatherComponent },
  { path: 'barcode', component: QrGeneratorComponent },
  { path: 'zipping', component: ZipComponent },
  { path: 'baby', component: BabyComponent },
  { path: 'foods', component: FoodManagementComponent },
  { path: 'calendar', component: EventCalendarComponent },
  { path: 'ultrasounds', component: UltrasoundGalleryComponent },
  { path: 'timeline', component: TimelineComponent },
  { path: 'monitor', component: MonitorComponent },
  { path: 'terminal', component: TerminalComponent },
  { path: 'crypto', component: CryptoComponent },

  // Protected Routes (require AuthGuard)
  { path: 'invoice', component: InvoiceComponent, canActivate: [AuthGuard] },
  { path: 'notes', component: NotesComponent, canActivate: [AuthGuard] },

  // Live Share Routes
  {
    path: 'live-share',
    component: LiveShareComponent,
    canActivate: [LiveShareGuard],
  },
  { path: 'live-share/room/:roomId', component: LiveShareRoomComponent },

  // Fallback/Dynamic Route
  { path: ':token', component: ChangeCaseComponent },
];
```

### Route Guards Implementation

```typescript
// AuthGuard
canActivate(route, state) {
  return this.authService.isAuthenticated.pipe(
    take(1),
    switchMap(isAuth => {
      if (!isAuth) return this.authService.autoLogin(0);
      return of(isAuth);
    }),
    tap(isAuth => {
      if (!isAuth) {
        this.router.navigateByUrl(`/auth?ref=${route.url}`);
      }
    })
  );
}
```

---

## 9. Components & Pages

### 9.1 Base Component Pattern

```typescript
@Component({
  selector: 'app-base',
  standalone: true,
  template: '',
})
class BaseComponent {
  protected messageService = inject(MessageService);
  protected authService = inject(AuthService);
  protected snackBar = inject(MatSnackBar);
  protected utils = inject(UtilsService);
  protected store = inject(Store<AppState>);
  protected data = signal<any | any[]>([]);
}
```

### 9.2 Dashboard Component

- Pregnancy progress tracking
- Live countdown to EDD
- Stats: baby records, events, ultrasounds, foods
- Chart.js visualization
- Quick navigation cards

### 9.3 Calendar Component (FullCalendar integration)

- Month/Week/Day views
- Event CRUD operations
- Category/Tag filtering
- Recurring events
- Drag & drop support
- Mobile responsive sidebar

### 9.4 Storage Component

- File upload (drag & drop)
- Firebase Storage integration
- File preview (images, PDFs, Office docs)
- Folder navigation
- Bulk delete
- File rename

### 9.5 Notes Component

- Rich text editor (Quill)
- Categories support
- Search & filter
- CRUD operations

### 9.6 Monitor Component

- Device monitoring via STOMP/RabbitMQ
- Jenkins jobs monitoring via SSE
- Kafka cluster monitoring
- Real-time updates

### 9.7 Weather Component

- Visual Crossing API integration
- Location search
- 7-day forecast
- Geolocation support

### 9.8 Baby Tracking Components

- Peanut & Soya tracking
- BMI calculator
- Growth charts
- Ultrasound gallery

---

## 10. Real-time Features

### 10.1 Socket.io Integration

```typescript
// Connection
this._socket = io(environment.wsEndpoint, {
  query: { userId: uuid() },
  ackTimeout: 10000,
  retries: 3
});

// Events
socket.emit('message', data);
socket.on<T>('event', (data: T) => { ... });
```

### 10.2 Server-Sent Events (SSE)

```typescript
// Jenkins Monitoring
const eventSource = new EventSource(`${sseUrl}/jenkins-monitoring`);

eventSource.addEventListener('jenkins-monitoring', (event) => {
  const data = JSON.parse(event.data);
  // Update stores
});

eventSource.addEventListener('jenkins-monitoring-error', (event) => {
  // Handle error
});

eventSource.onerror = (error) => {
  // Reconnect logic
};
```

### 10.3 STOMP/RabbitMQ

```typescript
class StompService {
  connect(): void;
  publish(destination: string, body: any): void;
  subscribe(destination: string): Observable<Message>;
}
```

---

## 11. Storage & File Management

### 11.1 Firebase Storage

```typescript
// Upload
const fileRef = storageRef(storage, filePath);
const uploadResult = await uploadBytes(fileRef, file);
const downloadURL = await getDownloadURL(uploadResult.ref);

// List files
const listResult = await listAll(folderRef);
// Process items and prefixes (folders)

// Delete
await deleteObject(fileRef);

// Rename (copy + delete old)
const blob = await fetch(downloadURL).then((r) => r.blob());
await uploadBytes(newFileRef, blob);
await deleteObject(oldFileRef);
```

### 11.2 Environment Config

```typescript
// Chọn storage backend
environment.useFirebaseStorage = true; // Firebase Storage
environment.storageLocation = 'storage'; // 'storage' | 'local'
```

---

## 12. Internationalization (i18n)

### 12.1 Translation Files

```
src/assets/i18n/
├── en.json
└── vi.json
```

### 12.2 I18n Service

```typescript
class I18nService {
  supportedLanguages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  ];

  setLanguage(code: string): void;
  getCurrentLanguage(): string;
  translate$(key: string, params?): Observable<string>;
  translateSync(key: string, params?): string;
  switchLanguage(): void;
}
```

### 12.3 I18n Pipe

```typescript
// Usage in template
{{ 'COMMON.SAVE' | i18n }}
{{ 'STORAGE.FILES_LOADED_SUCCESS' | i18n:{ count: files.length } }}
```

### 12.4 Translation Structure

```json
{
  "COMMON": {
    "YES": "Yes",
    "NO": "No",
    "SAVE": "Save",
    "DELETE": "Delete"
  },
  "NAVIGATION": {
    "DASHBOARD": "Dashboard",
    "STORAGE": "Storage"
  },
  "STORAGE": {
    "TITLE": "Storage",
    "FILES_LOADED_SUCCESS": "Successfully loaded {{count}} files"
  }
}
```

---

## 13. Environment Configuration

### 13.1 Development Environment

```typescript
const environment = {
  openSocket: true,
  production: false,
  cloud: false,
  rabbitMQEnabled: false,
  kafkaMockMode: false,

  server: {
    cloudUrl: 'https://useful-tools-api-default-rtdb.firebaseio.com',
    apiUrl: 'http://localhost:3000/api',
  },

  webApiKey: 'AIzaSy...',

  fshare: {
    apiUrl: 'http://localhost:8081',
  },

  facebook: {
    appId: '1070009906931041',
  },

  google: {
    oauth: {
      clientId: '740845971597-...',
      clientSecret: 'GOCSPX-...',
      redirectURI: 'http://localhost:4200',
    },
  },

  azure: {
    clientId: '48447683-...',
    tenantId: '90d076c5-...',
    redirectURI: 'http://localhost:4200',
    ssoUrl:
      'https://login.microsoftonline.com/:tenantId/oauth2/v2.0/authorize?...',
    serviceBus: {
      connectionString: 'Endpoint=sb://...',
      namespace: 'theanh2906',
      queueName: 'benna',
    },
  },

  visualCrossing: {
    apiKey: 'W9ZMQH9J9C95VMW3EFA7XLNXB',
    apiUrl: 'https://weather.visualcrossing.com/...',
  },

  wsEndpoint: 'http://localhost:3000',
  storageLocation: 'storage',
  useFirebaseStorage: true,

  firebase: {
    apiKey: 'AIzaSy...',
    authDomain: 'useful-tools-api.firebaseapp.com',
    projectId: 'useful-tools-api',
    storageBucket: 'useful-tools-api.firebasestorage.app',
    messagingSenderId: 740845971597,
    appId: '1:740845971597:web:...',
  },

  vapidPublicKey: 'BMfGjKkOd44...',
  rabbitMQStompUrl: 'ws://localhost:15674/ws',
};
```

---

## 14. Deployment

### 14.1 Docker Configuration

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG BUILD_ENV=production
RUN npm run build -- --configuration=$BUILD_ENV

# Stage 2: Serve với Nginx
FROM nginx:alpine
COPY --from=build /app/dist/UsefulTools /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 14.2 Docker Compose

```yaml
version: '3.8'
services:
  useful-tools:
    image: theanh2906/useful-tools
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - BUILD_ENV=production
    container_name: useful-tools
    ports:
      - '80:80'
    restart: always
```

### 14.3 Build Commands

```bash
# Development
npm start          # ng serve --open
npm run dev        # ng serve --host 0.0.0.0

# Remote development
npm run remote     # ng serve --configuration=remote

# Production build
npm run build      # ng build

# Docker
docker-compose build --build-arg BUILD_ENV=production
docker-compose up -d
```

---

## 15. Feature Migration Checklist

### ✅ Core Features

- [ ] Authentication (Firebase/Google/Azure)
- [ ] Route guards
- [ ] HTTP interceptors
- [ ] State management (Redux/Zustand/Pinia)
- [ ] i18n support

### ✅ UI Components

- [ ] Navigation/Menu bar
- [ ] Dialog/Modal system
- [ ] Toast notifications
- [ ] Loading spinner
- [ ] Data tables
- [ ] Forms & validation

### ✅ Pages

- [ ] Dashboard with pregnancy tracking
- [ ] Calendar with FullCalendar
- [ ] Notes with rich text editor
- [ ] File storage with upload/preview
- [ ] Weather forecast
- [ ] QR scanner/generator
- [ ] Baby tracker
- [ ] Food management
- [ ] Timeline
- [ ] Ultrasound gallery
- [ ] System monitor
- [ ] Live share rooms

### ✅ Real-time Features

- [ ] WebSocket connection
- [ ] Server-Sent Events
- [ ] STOMP/RabbitMQ integration

### ✅ External Integrations

- [ ] Firebase Realtime Database
- [ ] Firebase Storage
- [ ] Firebase Cloud Messaging
- [ ] Visual Crossing Weather API
- [ ] Jenkins API
- [ ] Kafka monitoring

### ✅ Styling

- [ ] PrimeNG components → Alternative UI library
- [ ] SCSS themes
- [ ] Responsive design
- [ ] Mobile-first approach

---

## 📝 Notes cho Migration

1. **State Management**: Nếu migrate sang React, xem xét Redux Toolkit hoặc Zustand. Nếu Vue, dùng Pinia.

2. **UI Library**: PrimeNG có nhiều components. Tìm alternative phù hợp (MUI, Ant Design, Chakra UI, Vuetify).

3. **Firebase**: SDK có sẵn cho hầu hết frameworks.

4. **FullCalendar**: Có React và Vue wrappers.

5. **Real-time**: Socket.io client works everywhere. SSE là native browser API.

6. **Forms**: Angular Reactive Forms → React Hook Form, Formik, hoặc Vue Composition API.

7. **Routing**: React Router, Vue Router tương tự Angular Router.

8. **Dependency Injection**: Angular-specific. Cần refactor thành hooks/composables hoặc service classes.

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-16  
**Project Version**: Angular 18.2.7
