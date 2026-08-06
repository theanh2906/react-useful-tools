/**
 * @module Modal
 * @description Animated modal dialog with backdrop, configurable size and optional close behaviour.
 */
import { Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Props for the {@link Modal} component.
 */
interface ModalProps {
  /** Whether the modal is visible. */
  isOpen: boolean;
  /** Callback invoked when the modal should close. */
  onClose: () => void;
  /** Optional title shown in the header. */
  title?: string;
  /** Optional description shown below the title. */
  description?: string;
  /** Maximum width of the modal. @default 'md' */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Modal body content. */
  children: React.ReactNode;
  /** Show an "X" close button in the header. @default true */
  showCloseButton?: boolean;
  /** Close modal when clicking the backdrop. @default true */
  closeOnOverlayClick?: boolean;
}

/**
 * Animated modal dialog with spring transition, backdrop blur and keyboard-friendly focus.
 *
 * @param props - {@link ModalProps}
 */

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  children,
  showCloseButton = true,
  closeOnOverlayClick = true,
}: ModalProps) {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Fragment>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOnOverlayClick ? onClose : undefined}
            className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-[2px]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={cn(
                'relative w-full rounded-lg border border-line bg-elevated shadow-2xl',
                'max-h-[90vh] overflow-hidden',
                sizes[size]
              )}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-start justify-between border-b border-line p-6">
                  <div>
                    {title && (
                      <h2 className="font-display text-xl font-semibold text-foreground">
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p className="mt-1 text-sm text-muted">
                        {description}
                      </p>
                    )}
                  </div>
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="rounded-md p-2 text-muted transition-colors hover:bg-surface hover:text-foreground"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                {children}
              </div>
            </motion.div>
          </div>
        </Fragment>
      )}
    </AnimatePresence>
  );
}

/**
 * Props for the {@link ModalFooter} component.
 */
interface ModalFooterProps {
  /** Additional CSS classes. */
  className?: string;
  /** Footer content (typically action buttons). */
  children: React.ReactNode;
}

/**
 * Sticky footer for a {@link Modal}, typically containing action buttons.
 */
export function ModalFooter({ className, children }: ModalFooterProps) {
  return (
    <div
      className={cn(
        '-mx-6 -mb-6 flex items-center justify-end gap-3 border-t border-line bg-surface px-6 py-4 pt-6',
        className
      )}
    >
      {children}
    </div>
  );
}
