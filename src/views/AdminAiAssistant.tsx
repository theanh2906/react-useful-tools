/**
 * @module views/AdminAiAssistant
 * @description Unsupported admin database assistant placeholder.
 */

import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { Card, Badge } from '@/components/ui';

export default function AdminAiAssistant() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 p-4">
      <Card className="border-amber-200 bg-amber-50 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <AlertTriangle className="size-6" />
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-xl font-bold text-amber-950">
                Admin AI Assistant
              </h1>
              <Badge variant="warning">Unsupported</Badge>
            </div>

            <p className="text-sm leading-6 text-amber-900">
              Direct browser-based admin access to Firebase Realtime Database is
              disabled. The new database rules deny root reads and writes from
              client code, so this tool needs a server-side admin API before it
              can safely inspect or mutate production data again.
            </p>
          </div>
        </div>
      </Card>

      <Card className="border-line bg-elevated p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <ShieldCheck className="size-6" />
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Required replacement
            </h2>
            <p className="text-sm leading-6 text-muted">
              Re-enable this feature through a trusted server route that verifies
              the Firebase ID token, checks an admin custom claim, and performs
              database operations with the Firebase Admin SDK.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
