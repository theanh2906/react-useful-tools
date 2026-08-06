/**
 * @module Badge
 * @description Reusable badge/tag component with multiple visual variants and sizes.
 */
import { cn } from '@/lib/utils';

/**
 * Props for the {@link Badge} component.
 */
interface BadgeProps {
  /** Visual style variant. @default 'default' */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  /** Size of the badge. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes. */
  className?: string;
  /** Badge content. */
  children: React.ReactNode;
}

/**
 * Displays a small status badge / tag with colour-coded variants.
 *
 * @param props - {@link BadgeProps}
 * @returns The rendered badge element.
 */
export function Badge({
  variant = 'default',
  size = 'md',
  className,
  children,
}: BadgeProps) {
  const variants = {
    default: 'border-line bg-surface text-muted',
    primary: 'border-primary-200 bg-primary-50 text-primary-700',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-700',
    danger: 'border-red-200 bg-red-50 text-red-700',
    info: 'border-accent-200 bg-accent-50 text-accent-700',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium border',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
