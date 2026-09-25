import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

export function Badge({ children, className, variant = 'default' }: BadgeProps) {
  const variants = {
    default:
      'bg-elevated text-ink',
    primary:
      'bg-accent-soft text-accent-ink',
    success:
      'bg-success-soft text-success-ink',
    warning:
      'bg-warning-soft text-warning-ink',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
