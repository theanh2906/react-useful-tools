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
    default: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    primary: 'bg-primary-500/20 text-primary-300 border-primary-500/30',
    success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    danger: 'bg-red-500/20 text-red-300 border-red-500/30',
    info: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
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
