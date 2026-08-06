/**
 * @module Card
 * @description Card layout components with glass, solid and gradient variants,
 * including header, title, description, content and footer sub-components.
 */
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

/**
 * Props for the {@link Card} component.
 * Extends Framer Motion `<div>` props.
 */
interface CardProps extends HTMLMotionProps<'div'> {
  /** Card background style. @default 'glass' */
  variant?: 'glass' | 'solid' | 'gradient';
  /** Enable hover scale & highlight effect. @default false */
  hover?: boolean;
  /** Enable glow shadow on hover. @default false */
  glow?: boolean;
}

/**
 * Animated card container with fade-in entrance animation.
 *
 * @param props - {@link CardProps}
 * @returns The rendered card element.
 */

export function Card({
  className,
  variant = 'glass',
  hover = false,
  glow = false,
  children,
  ...props
}: CardProps) {
  const variants = {
    glass: 'border border-line bg-elevated',
    solid: 'border border-line bg-surface',
    gradient: 'border border-accent-100 bg-accent-50',
  };

  return (
    <motion.div
      className={cn(
        'relative rounded-lg shadow-glass',
        variants[variant],
        hover &&
          'transition-colors duration-200 hover:border-accent-200 hover:bg-accent-50/40',
        glow && 'hover:shadow-glow',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Props for the {@link CardHeader} component.
 */
interface CardHeaderProps {
  /** Additional CSS classes. */
  className?: string;
  /** Header content. */
  children: React.ReactNode;
}

/**
 * Card header section with a bottom border divider.
 */
export function CardHeader({ className, children }: CardHeaderProps) {
  return (
    <div className={cn('border-b border-line p-6', className)}>
      {children}
    </div>
  );
}

/**
 * Props for the {@link CardTitle} component.
 */
interface CardTitleProps {
  /** Additional CSS classes. */
  className?: string;
  /** Title text content. */
  children: React.ReactNode;
}

/**
 * Card title rendered as an `<h3>` element.
 */
export function CardTitle({ className, children }: CardTitleProps) {
  return (
    <h3
      className={cn('font-display text-xl font-semibold text-foreground', className)}
    >
      {children}
    </h3>
  );
}

/**
 * Props for the {@link CardDescription} component.
 */
interface CardDescriptionProps {
  /** Additional CSS classes. */
  className?: string;
  /** Description text content. */
  children: React.ReactNode;
}

/**
 * Muted description text shown below a {@link CardTitle}.
 */
export function CardDescription({ className, children }: CardDescriptionProps) {
  return (
    <p className={cn('mt-1 text-sm text-muted', className)}>{children}</p>
  );
}

/**
 * Props for the {@link CardContent} component.
 */
interface CardContentProps {
  /** Additional CSS classes. */
  className?: string;
  /** Main body content. */
  children: React.ReactNode;
}

/**
 * Main body section of a {@link Card}.
 */
export function CardContent({ className, children }: CardContentProps) {
  return <div className={cn('p-6', className)}>{children}</div>;
}

/**
 * Props for the {@link CardFooter} component.
 */
interface CardFooterProps {
  /** Additional CSS classes. */
  className?: string;
  /** Footer content (typically action buttons). */
  children: React.ReactNode;
}

/**
 * Card footer section with a top border divider.
 */
export function CardFooter({ className, children }: CardFooterProps) {
  return (
    <div className={cn('border-t border-line p-6', className)}>
      {children}
    </div>
  );
}
