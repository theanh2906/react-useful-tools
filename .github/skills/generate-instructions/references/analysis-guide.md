# Project Analysis Guide

Scan the following to build a complete picture before generating instructions.

## Package & Config Files
- `package.json` — framework, dependencies, scripts
- `tsconfig.json` — TS strictness, path aliases
- `vite.config.*`, `webpack.config.*`, `next.config.*` — build tool
- `tailwind.config.*`, `postcss.config.*` — styling setup
- `.eslintrc.*`, `biome.json` — linting rules

## Directory Structure
- `src/` layout — pages, components, hooks, services, stores, types, utils
- Naming convention: kebab-case? PascalCase? Feature folders?
- File size patterns (under 200 lines? larger?)

## Architecture Patterns
- State management: Zustand, Redux, Jotai, Pinia, Context?
- Data fetching: React Query, SWR, direct fetch, services layer?
- Routing: React Router, Next.js App Router, TanStack Router?
- Backend: Firebase, Supabase, REST API, tRPC, GraphQL?

## Reusable UI Components
- Scan `components/ui/` (or equivalent) for existing primitives
- Common: Button, Input, DatePicker, Modal, Card, Badge, Progress, Spinner, Toast
- If the project has these, instructions MUST include a rule to always use them
- Never generate raw `<input>`, `<button>`, `<select>` when a wrapper exists

## Code Style
- Read 3–5 existing components/pages for patterns
- Component structure: how are props, hooks, return organized?
- Error handling: try/catch, error boundaries, toast notifications?
- i18n: react-i18next, i18next, hardcoded strings?

## Existing Instructions (if any)
- `.github/copilot-instructions.md`
- `.cursorrules`
- `CLAUDE.md`, `AGENTS.md`
- Read these to understand what's already established

## What to Extract
| Area | Questions |
|------|-----------|
| Stack | Which frameworks, libraries, versions? |
| Style | TailwindCSS? CSS Modules? Styled-components? |
| State | How is global state managed? |
| Auth | Firebase Auth? Better Auth? JWT? |
| DB | Firestore? PostgreSQL? REST? |
| Testing | Vitest? Jest? Playwright? |
| i18n | Translation system in use? |
| Conventions | File naming, folder structure rules |
| Principles | YAGNI, KISS, DRY, SOLID? What's stated? |
