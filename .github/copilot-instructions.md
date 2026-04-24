# GitHub Copilot Instructions

This file provides guidance to GitHub Copilot when working with code in this repository.

## Project Overview

**Useful Tools React** is a beautiful, dark-themed web application combining pregnancy tracking (baby growth, ultrasound gallery, timeline, countdown) with productivity tools (notes, calendar, live share, file storage, crypto tools, QR, weather). Users authenticate via Firebase Auth or Azure AD (Microsoft).

**IMPORTANT:** Always read `../README.md` first to understand project context before making changes.

---

## Core Principles

Follow these fundamental principles at all times:

- **YAGNI** (You Aren't Gonna Need It) - Don't add features until needed
- **KISS** (Keep It Simple, Stupid) - Prefer simple solutions
- **DRY** (Don't Repeat Yourself) - Avoid code duplication
- **SOLID** principles - Write maintainable, extensible code
- **Clean Code** - Prioritize readability and maintainability

---

## Design System

The app has a **consistent dark glass-morphism aesthetic**. All new UI must respect it:

- **Background**: `bg-slate-950` root with animated gradient orbs
- **Glass cards**: `bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl`
- **Primary color**: purple (`primary-500` = `#d946ef`, `primary-600` = `#c026d3`)
- **Accent color**: orange (`accent-500` = `#f97316`)
- **Baby palette**: `baby-pink`, `baby-blue`, `baby-mint`, `baby-lavender`, `baby-peach`
- **Dark mode**: class-based (`darkMode: 'class'`); toggled on `document.documentElement.classList`
- **Fonts**: `font-sans` (DM Sans body), `font-display` (Playfair Display headings), `font-mono` (JetBrains Mono)
- **Animations**: Use `framer-motion` `motion.*` with `whileHover`, `whileTap`, `initial/animate/exit`
- **Class composition**: Always use `cn()` from `@/lib/utils` for conditional/merged Tailwind classes

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React + TypeScript | 18.3 / 5.5 |
| Build | Vite | 5.4 |
| Styling | TailwindCSS (dark-first, glass morphism) | 3.4 |
| Animation | Framer Motion | 11 |
| State | Zustand (with `persist` middleware) | 5 |
| Routing | React Router DOM | v6 |
| Backend | Firebase (Auth + **Realtime DB** + Storage) | 11 |
| Auth | Firebase Auth + Azure AD via `@azure/msal-react` | — |
| Data fetching | React Query (`@tanstack/react-query`) | v5 |
| Real-time comms | Socket.io client (live share) | 4 |
| i18n | react-i18next | EN + VI |
| Forms | react-hook-form | 7 |
| Icons | lucide-react | — |
| Toast | Custom `toast` from `@/components/ui/Toast` | — |
| Dates | date-fns | 4 |
| Charts | chart.js + react-chartjs-2 | — |
| Class util | `cn()` from `@/lib/utils` (clsx + tailwind-merge) | — |

---

## Development Guidelines

### File Organization

- **Naming Convention**: Use kebab-case for all file names
  - Example: `baby-tracker.tsx`, `use-countdown.ts`, `notes-service.ts`
  - Make names self-documenting so purpose is clear without reading content
- **File Size**: Keep files under 200 lines for better maintainability
  - Split large files into smaller, focused components
  - Extract utility functions into separate modules
  - Create dedicated service classes for business logic
- **Path alias**: Always use `@/` for internal imports (maps to `./src/`)
  - Correct: `import { Button } from "@/components/ui"`
  - Wrong: `import { Button } from "../../components/ui"`

### Project Structure

```
src/
+-- components/
|   +-- layout/          # Sidebar, Header, Layout (app shell)
|   +-- ui/              # Reusable primitives: Button, Card, Modal, Input, Badge, Progress, etc.
+-- config/              # firebase.ts, authConfig.ts, constants.ts
+-- hooks/               # Custom React hooks (useCountdown, useMediaQuery, etc.)
+-- i18n/
|   +-- locales/         # en.json, vi.json - both required for every new key
+-- lib/
|   +-- utils.ts         # cn(), calculateBMI, getBMICategory, etc.
+-- pages/               # Route-level page components (one file per route)
+-- services/            # All Firebase / API calls
|   +-- realtimeDb.ts    # Generic Realtime DB abstraction - primary data layer
+-- stores/              # Zustand state stores
+-- types/
    +-- index.ts         # All shared interfaces, enums, type aliases
```

### Environment Files

Env files live in `environments/` directory (not the project root):

```
environments/
+-- .env.local       # Local development (git-ignored)
+-- .env.production  # Production values (git-ignored)
```

### Code Quality Standards

#### TypeScript

- `strict: true` is enforced - no `any`, unused vars/params will error
- All shared types and interfaces go in `src/types/index.ts`
- Use `import type { Foo }` for type-only imports
- Use enums for domain-specific constants (see `LoginMethod`, `RecurrenceCycle` in types)

#### React Best Practices

- Use functional components with hooks only - no class components
- Destructure props at function signature level
- Extract repeated logic into custom hooks in `src/hooks/`
- Keep components focused and single-purpose
- Use `React.FC` type annotation for exported components
- **Always use existing UI primitives** from `src/components/ui/` — never use raw HTML `<input>`, `<button>`, `<select>`, or `<textarea>` elements directly. Available components:
  - `Button` — all clickable actions
  - `Input` — text, number, password, email inputs (supports `label`, `error`)
  - `DatePicker` — date selection (supports `label`, `value`, `onChange`, `minDate`, `maxDate`, `centered` for modals)
  - `Card` — content containers
  - `Modal` — dialog overlays
  - `Badge` — status labels
  - `Progress` — progress bars
  - `Spinner` — loading indicators
  - `Toast` — notifications via `toast.success()` / `toast.error()`

#### State Management

- Use Zustand for global state (`src/stores/`)
- Use `persist` middleware for state that survives page refresh
- Keep local/ephemeral state with `useState`
- Follow immutable update patterns in `set()` calls

#### Styling

- Use TailwindCSS utility classes - no inline styles
- Follow mobile-first responsive design (`sm:`, `md:`, `lg:`)
- Use `cn()` from `@/lib/utils` for all conditional class merging
- Reference custom tokens from `tailwind.config.js` (`primary-*`, `accent-*`, `baby-*`, `glass-*`)

#### Firebase & Data Layer

- Primary database: **Firebase Realtime Database** via `src/services/realtimeDb.ts`
- **Do NOT** write raw Firebase calls in page components or stores - always go through `src/services/`
- Firestore is used only for file upload metadata (`storageService.ts`)
- Unsubscribe all real-time listeners in `useEffect` cleanup functions

#### Animation

Use `framer-motion` for all UI interactions:

```typescript
import { motion, AnimatePresence } from "framer-motion";

// Page entry
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

// Micro-interactions
<motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>

// Exit animations
<AnimatePresence>
  {isVisible && <motion.div exit={{ opacity: 0, scale: 0.95 }} />}
</AnimatePresence>
```

### Code Implementation

- Write clean, readable, and maintainable code
- Follow established architectural patterns in existing pages
- Handle edge cases and error scenarios properly
- **DO NOT** create new "enhanced" files - update existing files directly
- Use try-catch for error handling in all async operations
- Cover security standards (input validation, XSS prevention, auth checks)

### Testing & Quality

- Run `npm run lint` before committing - fix all ESLint errors
- Ensure TypeScript compiles cleanly: `tsc --noEmit`
- **DO NOT** use fake data, mocks, or temporary solutions just to pass builds

### Git & Version Control

Use Conventional Commits:

- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation only
- `style:` formatting, no logic change
- `refactor:` code restructuring
- `test:` adding/fixing tests
- `chore:` build, tooling, deps

**Never** commit `environments/*.local`, API keys, or credentials.

### Security Guidelines

- Never expose API keys - use `VITE_` prefixed env vars in `environments/`
- Validate and sanitize all user inputs before writing to Firebase
- Always check `isAuthenticated` from `useAuthStore()` before rendering protected content
- Use Firebase Security Rules for server-side data access control
- Prevent XSS in user-generated content rendered as HTML

### Performance Best Practices

- Lazy load heavy page components with `React.lazy` + `<Suspense>`
- Use `useMemo` / `useCallback` for expensive computations and stable callbacks
- Unsubscribe all Firebase real-time listeners in `useEffect` cleanup
- Register Chart.js components individually (tree-shaking) - no global `Chart.register(...)`
- Use `AnimatePresence` from framer-motion for exit animations

### Internationalization (i18n)

- All user-facing text must use `t("key.subkey")` - no hardcoded strings
- Add translations to **both** `src/i18n/locales/en.json` **and** `vi.json`
- Use descriptive, context-scoped keys: `babyTracker.addKickButton`, not `btn1`
- Format dates and numbers per locale using `date-fns` locale utilities

### API & Services

- All Firebase / API calls go through service files in `src/services/`
- Use `realtimeDb.ts` helpers (`createItem`, `updateItem`, `deleteItem`, `listenCollection`) for Realtime DB
- Use consistent error handling: `try/catch` + `toast.error()`
- Implement proper loading states in stores or local state

---

## Common Patterns

### Creating a Zustand Store

```typescript
// src/stores/example-store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Item } from "@/types";

interface ExampleState {
  items: Item[];
  isLoading: boolean;
  setItems: (items: Item[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useExampleStore = create<ExampleState>()(
  persist(
    (set) => ({
      items: [],
      isLoading: false,
      setItems: (items) => set({ items }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    { name: "example-storage", storage: createJSONStorage(() => localStorage) }
  )
);
```

### Creating a New Page

```typescript
// src/pages/new-feature.tsx
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui";
import { useAuthStore } from "@/stores/authStore";

export const NewFeaturePage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto p-4"
    >
      <h1 className="font-display text-2xl font-bold text-white mb-6">
        {t("newFeature.title")}
      </h1>
      <Card>{/* content */}</Card>
    </motion.div>
  );
};
```

### Creating a Custom Hook

```typescript
// src/hooks/use-items.ts
import { useState, useEffect } from "react";
import type { Item } from "@/types";
import { listenItems } from "@/services/example-service";

export const useItems = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = listenItems((data) => {
      setItems(data);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { items, isLoading };
};
```

### Using react-hook-form

```typescript
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "@/components/ui/Toast";
import { Input, Button } from "@/components/ui";

interface FormData { name: string; value: string; }

export const ExampleForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      await myService.save(data);
      toast.success(t("form.saved"));
      reset();
      onSuccess();
    } catch {
      toast.error(t("form.error"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        {...register("name", { required: t("form.required") })}
        placeholder={t("form.namePlaceholder")}
        error={errors.name?.message}
      />
      <Button type="submit" isLoading={isSubmitting}>
        {t("common.save")}
      </Button>
    </form>
  );
};
```

### Creating a Realtime DB Service

```typescript
// src/services/example-service.ts
import type { Item } from "@/types";
import { createItem, deleteItem, listenCollection, updateItem } from "./realtimeDb";

const PATH = "items";

export const listenItems = (onChange: (items: Item[]) => void) =>
  listenCollection<Item>(PATH, onChange);

export const createItemEntry = async (item: Item) => {
  const { id, ...payload } = item;
  return createItem(PATH, payload);
};

export const updateItemEntry = async (id: string, item: Partial<Item>) =>
  updateItem(PATH, id, item);

export const deleteItemEntry = async (id: string) => deleteItem(PATH, id);
```

---

## What NOT to Do

- Don't use `any` type in TypeScript - use proper types or `unknown`
- Don't hardcode user-facing text - always use `t()` from react-i18next
- Don't commit `environments/.env.local` or API keys
- Don't create duplicate or "enhanced" versions of existing files - edit them
- Don't use inline styles - use TailwindCSS utility classes
- Don't skip error handling in async operations
- Don't bypass authentication checks
- Don't create files over 200 lines without splitting them
- Don't ignore TypeScript or ESLint errors
- Don't write raw Firebase calls outside `src/services/`
- Don't use relative imports like `../../` - always use `@/`
- Don't use class components or `React.Component`
- Don't use raw HTML `<input>`, `<button>`, `<select>` — always use `Input`, `Button`, `DatePicker` from `@/components/ui`

---

## Environment Variables

Files live in `environments/` directory. Required variables (never commit values):

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_DATABASE_URL=
VITE_WEATHER_API_KEY=
VITE_SECRET_KEY=
```

---

## Quick Reference

### Run Commands

```bash
npm run dev      # Start development server (http://localhost:4200)
npm run build    # Type-check + production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Adding a New Feature

When receiving a new feature request, analyze requirements, brainstorm A/B/C solutions, ask user to choose — then implement:

1. **Types**: Add interfaces/enums to `src/types/index.ts`
2. **Service**: Create `src/services/feature-service.ts` using `realtimeDb.ts` helpers
3. **Store** *(if needed)*: Create `src/stores/feature-store.ts` with Zustand
4. **Page**: Create `src/pages/feature-name.tsx` — export named component
5. **Export**: Add to `src/pages/index.ts`
6. **Route**: Register in `src/App.tsx` under `<ProtectedRoute>`
7. **i18n**: Add keys to both `src/i18n/locales/en.json` and `vi.json`
8. **Reusable UI**: Place reusable components in `src/components/ui/` with generic design
9. **Validate**: `npm run lint` then `tsc --noEmit`

**NOTE:** All component styles must match the dark glass-morphism TailwindCSS theme. Look at `BabyTracker.tsx` or `Notes.tsx` for reference.

---

**Remember**: Write code that is clean, maintainable, and follows the dark glass-morphism aesthetic. When in doubt, look at an existing page for the established pattern.
