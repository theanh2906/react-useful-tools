# Useful Tools - React Edition

A beautiful, modern React application for pregnancy tracking and productivity tools.

![React](https://img.shields.io/badge/React-18.3-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-blue?logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-5.4-blue?logo=vite)

## ✨ Features

### 🍼 Baby & Family
- **Dashboard** - Pregnancy progress tracking with live countdown
- **Baby Tracker** - Track growth for both pregnancy (Soya) and born baby (Peanut)
- **Calendar** - Event management with FullCalendar integration
- **Food Guide** - Safe/forbidden food reference for pregnancy
- **Ultrasound Gallery** - Store and view ultrasound images
- **Timeline** - Visual journey of your pregnancy

### 📋 Productivity
- **Notes** - Rich text notes with categories
- **Storage** - Cloud file management with Firebase Storage
- **Live Share** - Real-time file/text sharing

### 🔧 Utilities
- **Weather** - 7-day forecast with Visual Crossing API
- **QR Scanner/Generator** - Scan and create QR codes
- **Crypto Tools** - Text encryption/decryption
- **Time Calculator** - Date/time calculations

## 🚀 Getting Started

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
cp .env.example .env

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🏗️ Project Structure

```
src/
├── components/
│   ├── layout/          # Layout components (Sidebar, Header)
│   └── ui/              # Reusable UI components
├── config/              # App configuration
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── pages/               # Page components
├── stores/              # Zustand state stores
└── types/               # TypeScript type definitions
```

## 🎨 Tech Stack

- **Framework**: React 18 with TypeScript
- **State Management**: Zustand
- **Styling**: TailwindCSS with custom design system
- **Animation**: Framer Motion
- **Calendar**: FullCalendar
- **HTTP**: React Query + Fetch
- **Forms**: React Hook Form
- **Icons**: Lucide React

## 📱 Mobile-First Design

The app is built with a mobile-first approach:
- Responsive navigation with slide-out sidebar
- Touch-friendly interactions
- Optimized for various screen sizes
- Safe area support for notched devices

## 🔐 Authentication

Supports multiple authentication methods:
- Email/Password (Firebase Auth)
- Google OAuth 2.0
- Microsoft Azure AD SSO

## 🌐 Environment Variables

Create a `.env` file with the following variables:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_WEATHER_API_KEY=your-visual-crossing-key
```

## 📦 Building for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

## 🐳 Docker

```dockerfile
# Build
docker build -t useful-tools-react .

# Run
docker run -p 80:80 useful-tools-react
```

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 💜 Made with Love

For growing families everywhere. Track your pregnancy journey with beautiful, intuitive tools.

---

**Version**: 1.0.0  
**Last Updated**: January 2026
