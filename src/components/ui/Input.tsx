/**
 * @module Input
 * @description Text input and textarea components with label, error state and icon support.
 */
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Props for the {@link Input} component.
 * Extends native `<input>` attributes.
 */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Optional label displayed above the input. */
  label?: string;
  /** Error message displayed below the input. */
  error?: string;
  /** Icon rendered on the left side of the input. */
  leftIcon?: React.ReactNode;
  /** Icon rendered on the right side of the input. */
  rightIcon?: React.ReactNode;
}

/**
 * Styled text input with optional label, icons and error state.
 *
 * @param props - {@link InputProps}
 * @param ref - Forwarded ref to the underlying `<input>` element.
 */

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-slate-300">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400',
              'focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20',
              'transition-all duration-200',
              leftIcon && 'pl-12',
              rightIcon && 'pr-12',
              error &&
                'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

/**
 * Props for the {@link TextArea} component.
 * Extends native `<textarea>` attributes.
 */
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Optional label displayed above the textarea. */
  label?: string;
  /** Error message displayed below the textarea. */
  error?: string;
}

/**
 * Styled multi-line textarea with optional label and error state.
 *
 * @param props - {@link TextAreaProps}
 * @param ref - Forwarded ref to the underlying `<textarea>` element.
 */

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-slate-300">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400',
            'focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20',
            'transition-all duration-200 resize-none min-h-[120px]',
            error &&
              'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20',
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
