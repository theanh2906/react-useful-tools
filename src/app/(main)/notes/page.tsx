'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import NotesPage from '@/views/Notes';

export default function NotesPageRoute() {
  return (
    <ProtectedRoute>
      <NotesPage />
    </ProtectedRoute>
  );
}
