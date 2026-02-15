# GitHub Copilot Instructions

This file provides guidance to GitHub Copilot when working with code in this repository.

## Project Overview

Useful Tools React is a modern React application for pregnancy tracking and productivity tools built with React 18, TypeScript, Vite, TailwindCSS, and Firebase.

**IMPORTANT:** Always read `../README.md` first to understand project context before making changes.

## Core Principles

Follow these fundamental principles at all times:

- **YAGNI** (You Aren't Gonna Need It) - Don't add features until needed
- **KISS** (Keep It Simple, Stupid) - Prefer simple solutions
- **DRY** (Don't Repeat Yourself) - Avoid code duplication
- **SOLID** principles - Write maintainable, extensible code
- **Clean Code** - Prioritize readability and maintainability

## Development Guidelines

### File Organization

- **Naming Convention**: Use kebab-case for file names with descriptive names
  - Example: `baby-tracker.tsx`, `use-countdown.ts`, `food-service.ts`
  - Make names self-documenting so purpose is clear without reading content
- **File Size**: Keep files under 200 lines for better maintainability
  - Split large files into smaller, focused components
  - Extract utility functions into separate modules
  - Create dedicated service classes for business logic
  - Use composition over inheritance

### Project Structure

```
src/
├── components/
│   ├── layout/          # Layout components (Sidebar, Header)
│   └── ui/              # Reusable UI components
├── config/              # App configuration
├── hooks/               # Custom React hooks
├── i18n/                # Internationalization
├── lib/                 # Utility functions
├── pages/               # Page components
├── services/            # API & Firebase services
├── stores/              # Zustand state stores
└── types/               # TypeScript type definitions
```

### Code Quality Standards

#### TypeScript

- Use strict TypeScript types - avoid `any`
- Define interfaces in `src/types/index.ts`
- Use type inference when obvious
- Create meaningful type aliases for complex types

#### React Best Practices

- Use functional components with hooks
- Prefer composition over prop drilling
- Keep components focused and single-purpose
- Use custom hooks for reusable logic
- Implement proper error boundaries

#### State Management

- Use Zustand for global state (`src/stores/`)
- Keep state close to where it's used
- Use React hooks for local component state
- Follow immutable update patterns

#### Styling

- Use TailwindCSS utility classes
- Follow mobile-first responsive design
- Keep consistent spacing and colors
- Use theme tokens from tailwind.config.js

#### Firebase Integration

- All Firebase operations go through services (`src/services/`)
- Handle authentication states properly
- Implement proper error handling for async operations
- Use Firestore real-time listeners appropriately

### Code Implementation

- Write clean, readable, and maintainable code
- Follow established architectural patterns
- Implement features according to specifications
- Handle edge cases and error scenarios properly
- **DO NOT** create new "enhanced" files - update existing files directly
- Use try-catch for error handling
- Cover security standards (input validation, XSS prevention, etc.)

### Testing & Quality

- Write comprehensive unit tests for utilities and services
- Test error scenarios and edge cases
- Ensure proper TypeScript compilation
- Run `npm run lint` before committing
- **DO NOT** use fake data, mocks, or temporary solutions just to pass builds

### Git & Version Control

- Create clean, professional commit messages using conventional commits:
  - `feat:` new feature
  - `fix:` bug fix
  - `docs:` documentation changes
  - `style:` formatting changes
  - `refactor:` code restructuring
  - `test:` adding tests
  - `chore:` maintenance tasks
- Keep commits focused on actual code changes
- **DO NOT** commit confidential information (API keys, credentials, .env files)
- Run linting before commit
- Run tests before push

### Security Guidelines

- Never expose API keys or credentials in code
- Use environment variables for sensitive data
- Validate and sanitize user inputs
- Implement proper authentication checks
- Use Firebase security rules properly
- Prevent XSS attacks in user-generated content

### Performance Best Practices

- Lazy load routes and heavy components
- Optimize images and assets
- Use proper React memoization (useMemo, useCallback) when needed
- Avoid unnecessary re-renders
- Implement proper loading states

### Internationalization (i18n)

- All user-facing text must use i18n keys
- Add translations to both `src/i18n/locales/en.json` and `vi.json`
- Use descriptive i18n keys that indicate context
- Format dates and numbers according to locale

### API & Services

- All API calls go through service files in `src/services/`
- Use consistent error handling patterns
- Implement proper loading and error states
- Use TypeScript interfaces for API responses

### Common Patterns

#### Creating a New Page

```typescript
// src/pages/NewPage.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

export const NewPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">{t('newPage.title')}</h1>
      {/* Content */}
    </div>
  );
};
```

#### Creating a Custom Hook

```typescript
// src/hooks/useCustomHook.ts
import { useState, useEffect } from 'react';

export const useCustomHook = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Logic here
  }, []);

  return { data };
};
```

#### Creating a Service

```typescript
// src/services/newService.ts
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';

export const newService = {
  async getData() {
    try {
      const snapshot = await getDocs(collection(db, 'collection'));
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  },
};
```

### What NOT to Do

❌ Don't create duplicate or "enhanced" versions of existing files
❌ Don't use `any` type in TypeScript
❌ Don't hardcode user-facing text - use i18n
❌ Don't commit .env files or API keys
❌ Don't ignore TypeScript or linting errors
❌ Don't skip error handling
❌ Don't create files over 200 lines without good reason
❌ Don't bypass authentication checks
❌ Don't use inline styles - use TailwindCSS classes

## Tech Stack

- **Frontend**: React 18.3, TypeScript 5.5
- **Build Tool**: Vite 5.4
- **Styling**: TailwindCSS 3.4
- **State**: Zustand
- **Backend**: Firebase (Auth, Firestore, Storage, Realtime DB)
- **i18n**: react-i18next
- **Routing**: React Router
- **UI Components**: Custom components + FullCalendar, QR Scanner, etc.

## Environment Variables

Required environment variables (never commit these):

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_WEATHER_API_KEY=
```

## Quick Reference

### Run Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Adding a New Feature

When receiving a new feature request, first analyze requirements, then brainstorm solutions and scenarios, ask user to select (A,B,C or D) before implementation. Then follow these steps:

1. Create types in `src/types/index.ts`
2. Create service in `src/services/`
3. If the feature requires database, add necessary Realtime Database or Firestore collections (for files upload management) and methods to modify data (CRUD) in the service.
4. Create store if needed in `src/stores/`
5. Create page component in `src/pages/`
6. Add route in `src/App.tsx`
7. Add i18n translations in `src/i18n/locales/`
8. Test thoroughly before committing
   **NOTE:** All the component styles must adapt current project TailwindCSS theme. If new feature has some components that can be reused later, create them in `src/components/ui/` with generic and reusable design.

---

**Remember**: Write code that is clean, maintainable, and follows established patterns. When in doubt, prioritize simplicity and readability over cleverness.
