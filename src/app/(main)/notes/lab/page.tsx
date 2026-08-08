'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import NotesLabPage from '@/views/NotesLab';

export default function NotesLabPageRoute() {
  return (
    <ProtectedRoute>
      <NotesLabPage />
    </ProtectedRoute>
  );
}
