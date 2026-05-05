# Useful Tools - React Edition

A beautiful, modern React application for pregnancy tracking and productivity tools.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)
![React](https://img.shields.io/badge/React-18.3-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-blue?logo=tailwindcss)

## Features

### Baby & Family

- **Dashboard** - Pregnancy progress tracking with live countdown
- **Baby Tracker** - Track growth for both pregnancy (Soya) and born baby (Peanut)
- **Calendar** - Event management with FullCalendar integration
- **Food Guide** - Safe/forbidden food reference for pregnancy
- **Ultrasound Gallery** - Store and view ultrasound images
- **Timeline** - Visual journey of your pregnancy

### Productivity

- **Notes** - Rich text notes with categories
- **Storage** - Cloud file management with Firebase Storage
- **Live Share** - Real-time file/text sharing

### Utilities

- **Weather** - 7-day forecast with Visual Crossing API
- **QR Scanner/Generator** - Scan and create QR codes
- **Crypto Tools** - Text encryption/decryption
- **Time Calculator** - Date/time calculations

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
cd useful-tools-react

# Install dependencies
npm install

# Create environment file
cp .env.production .env.local
# Edit .env.local with your actual values

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev      # Start Next.js development server (with Turbopack)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Project Structure

```
src/
├── app/                     # Next.js App Router pages
│   ├── layout.tsx           # Root layout (providers, metadata)
│   ├── globals.css          # Global styles
│   ├── (main)/              # Layout group with sidebar/header
│   ├── auth/                # Auth page (no sidebar)
│   └── meal-checkin/share/  # Public share pages
├── components/
│   ├── auth/                # Auth guard components
│   ├── layout/              # Layout components (Sidebar, Header)
│   ├── providers/           # App providers (QueryClient, i18n)
│   └── ui/                  # Reusable UI components
├── config/                  # App configuration
├── hooks/                   # Custom React hooks
├── i18n/                    # Internationalization (en, vi)
├── lib/                     # Utility functions
├── views/                   # Page components (imported by app/ routes)
├── services/                # Firebase & API services
├── stores/                  # Zustand state stores
├── types/                   # TypeScript type definitions
└── utils/                   # Additional utilities
```

## Tech Stack

- **Framework**: Next.js 15 (App Router) with React 18 & TypeScript
- **State Management**: Zustand
- **Styling**: TailwindCSS with custom design system
- **Animation**: Framer Motion
- **Calendar**: FullCalendar
- **HTTP**: React Query + Fetch
- **Forms**: React Hook Form
- **Icons**: Lucide React
- **Deploy**: Vercel

## Mobile-First Design

The app is built with a mobile-first approach:

- Responsive navigation with slide-out sidebar
- Touch-friendly interactions
- Optimized for various screen sizes
- Safe area support for notched devices

## Authentication

Supports multiple authentication methods:

- Email/Password (Firebase Auth)
- Google OAuth 2.0
- Microsoft Azure AD SSO

## Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_WEATHER_API_KEY=your-visual-crossing-key
SECRET_KEY=your-admin-secret-key
```

## Building for Production

```bash
npm run build
```

The build output will be in the `.next/` directory. Deploy to Vercel for automatic builds.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Made with Love

For growing families everywhere. Track your pregnancy journey with beautiful, intuitive tools.

---

**Version**: 2.0.0  
**Last Updated**: May 2026
