import type { Metadata, Viewport } from 'next';
import { Be_Vietnam_Pro, JetBrains_Mono } from 'next/font/google';
import { Providers } from '@/components/providers/Providers';
import { AppInitializer } from '@/components/providers/AppInitializer';
import './globals.css';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-be-vietnam-pro',
  display: 'swap',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'https://useful-tools.vercel.app'
  ),
  title: 'Useful Tools - Pregnancy & Productivity Suite',
  description:
    'Useful Tools - Pregnancy Tracker & Productivity Suite. Track your pregnancy journey, manage notes, and stay productive.',
  keywords:
    'pregnancy tracker, baby tracker, productivity tools, notes, calendar, weather',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    title: 'Useful Tools - Pregnancy & Productivity Suite',
    description:
      'A beautiful app for pregnancy tracking and productivity tools',
    images: ['/icon-512.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${beVietnamPro.variable} ${jetBrainsMono.variable} font-sans antialiased`}
      >
        <Providers>
          <AppInitializer>{children}</AppInitializer>
        </Providers>
      </body>
    </html>
  );
}
