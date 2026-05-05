import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Providers } from '@/components/providers/Providers';
import { AppInitializer } from '@/components/providers/AppInitializer';
import './globals.css';

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
  themeColor: '#7c3aed',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=JetBrains+Mono:wght@400;500;600&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          <AppInitializer>{children}</AppInitializer>
        </Providers>

        <Script id="disable-zoom" strategy="afterInteractive">{`
          document.addEventListener('gesturestart', function(e) { e.preventDefault(); }, { passive: false });
          document.addEventListener('gesturechange', function(e) { e.preventDefault(); }, { passive: false });
          document.addEventListener('gestureend', function(e) { e.preventDefault(); }, { passive: false });
          document.addEventListener('touchmove', function(e) { if (e.touches.length > 1) { e.preventDefault(); } }, { passive: false });
          (function() {
            var lastTouchEnd = 0;
            document.addEventListener('touchend', function(e) {
              var now = Date.now();
              if (now - lastTouchEnd <= 300) { e.preventDefault(); }
              lastTouchEnd = now;
            }, { passive: false });
          })();
        `}</Script>
      </body>
    </html>
  );
}
