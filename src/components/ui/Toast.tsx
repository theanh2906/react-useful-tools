import { Toaster, toast as sonnerToast } from 'sonner';

// Toast component to be placed at app root
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      theme="dark"
      toastOptions={{
        style: {
          background: 'rgba(15, 15, 20, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(12px)',
          color: 'white'
        },
        className: 'toast-custom'
      }}
    />
  );
}

// Toast utility functions
export const toast = {
  success: (message: string, description?: string) => {
    sonnerToast.success(message, {
      description,
      duration: 3000
    });
  },
  
  error: (message: string, description?: string) => {
    sonnerToast.error(message, {
      description,
      duration: 5000
    });
  },
  
  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, {
      description,
      duration: 4000
    });
  },
  
  info: (message: string, description?: string) => {
    sonnerToast.info(message, {
      description,
      duration: 3000
    });
  },
  
  loading: (message: string) => {
    return sonnerToast.loading(message);
  },
  
  dismiss: (id?: string | number) => {
    sonnerToast.dismiss(id);
  },
  
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return sonnerToast.promise(promise, messages);
  }
};
