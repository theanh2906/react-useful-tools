import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'glass' | 'solid' | 'gradient';
  hover?: boolean;
  glow?: boolean;
}

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
    gradient: 'bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-primary-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative rounded-2xl shadow-glass',
        variants[variant],
        hover && 'transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02]',
        glow && 'hover:shadow-glow',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export function CardHeader({ className, children }: CardHeaderProps) {
  return (
    <div className={cn('p-6 border-b border-white/5', className)}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  className?: string;
  children: React.ReactNode;
}

export function CardTitle({ className, children }: CardTitleProps) {
  return (
    <h3 className={cn('text-xl font-display font-semibold text-white', className)}>
      {children}
    </h3>
  );
}

interface CardDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

export function CardDescription({ className, children }: CardDescriptionProps) {
  return (
    <p className={cn('text-sm text-slate-400 mt-1', className)}>
      {children}
    </p>
  );
}

interface CardContentProps {
  className?: string;
  children: React.ReactNode;
}

export function CardContent({ className, children }: CardContentProps) {
  return (
    <div className={cn('p-6', className)}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
}

export function CardFooter({ className, children }: CardFooterProps) {
  return (
    <div className={cn('p-6 border-t border-white/5', className)}>
      {children}
    </div>
  );
}
