import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { GlobalLoading } from '@/components/ui';
import { 
  Dashboard, 
  CalendarPage, 
  NotesPage, 
  WeatherPage, 
  BabyTrackerPage,
  FoodGuidePage,
  AuthPage,
  StoragePage,
  QrScannerPage,
  QrGeneratorPage,
  CryptoToolsPage,
  TimeCalculatorPage,
  LiveSharePage,
  UltrasoundGalleryPage,
  TimelinePage,
  SystemMonitorPage,
  ChangeCasePage,
  ZipToolPage
} from '@/pages';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { useEffect } from 'react';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}


export default function App() {
  const { checkTokenExpiration, initAuthListener, isLoading: authLoading } = useAuthStore();
  const { initProfileListener, isGlobalLoading } = useAppStore();
  const userId = useAuthStore((state) => state.user?.id);

  // Check token expiration on mount
  useEffect(() => {
    checkTokenExpiration();
    const interval = setInterval(checkTokenExpiration, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [checkTokenExpiration]);

  useEffect(() => {
    const unsubscribeAuth = initAuthListener();
    return () => {
      if (typeof unsubscribeAuth === 'function') unsubscribeAuth();
    };
  }, [initAuthListener]);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;
    initProfileListener().then((unsub) => {
      unsubscribeProfile = unsub;
    });
    return () => {
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, [initProfileListener, userId]);

  return (
    <>
      <GlobalLoading isLoading={isGlobalLoading || authLoading} />
      
      <Routes>
        <Route path="/auth" element={<AuthPage />} />

        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/weather" element={<WeatherPage />} />
          <Route path="/baby" element={<BabyTrackerPage />} />
          <Route path="/foods" element={<FoodGuidePage />} />
          <Route path="/storage" element={<StoragePage />} />
          <Route path="/qr-scanner" element={<QrScannerPage />} />
          <Route path="/qr-generator" element={<QrGeneratorPage />} />
          <Route path="/crypto" element={<CryptoToolsPage />} />
          <Route path="/time-calculator" element={<TimeCalculatorPage />} />
          <Route path="/change-case" element={<ChangeCasePage />} />
          <Route path="/zip" element={<ZipToolPage />} />
          <Route path="/live-share" element={<LiveSharePage />} />
          <Route path="/live-share/room/:roomId" element={<LiveSharePage />} />
          <Route path="/ultrasounds" element={<UltrasoundGalleryPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/monitor" element={<SystemMonitorPage />} />

          <Route path="/notes" element={
            <ProtectedRoute>
              <NotesPage />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  );
}
