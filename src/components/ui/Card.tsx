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
    glass: 'bg-white/5 backdrop-blur-xl border border-white/10',
    solid: 'bg-slate-800/80 border border-slate-700',
    gradient:
      'bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-primary-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative rounded-2xl shadow-glass',
        variants[variant],
        hover &&
          'transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02]',
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
    <div className={cn('p-6 border-b border-white/5', className)}>
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
      className={cn('text-xl font-display font-semibold text-white', className)}
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
    <p className={cn('text-sm text-slate-400 mt-1', className)}>{children}</p>
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
    <div className={cn('p-6 border-t border-white/5', className)}>
      {children}
    </div>
  );
}
