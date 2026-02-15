/**
 * @module main
 * @description Application entry point. Mounts the React root, sets up React Query,
 * React Router and the Toast provider.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { ToastProvider } from '@/components/ui/Toast';
import './i18n';
import './index.css';

/** Global React Query client with 5-minute stale time and single retry. */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <ToastProvider />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
