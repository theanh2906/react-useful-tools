'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MealCheckIn } from '@/views/MealCheckIn';

export default function MealCheckInPageRoute() {
  return (
    <ProtectedRoute>
      <MealCheckIn />
    </ProtectedRoute>
  );
}
