'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import PeriodTrackerPage from '@/views/PeriodTracker';

export default function PeriodTrackerPageRoute() {
  return (
    <ProtectedRoute>
      <PeriodTrackerPage />
    </ProtectedRoute>
  );
}
