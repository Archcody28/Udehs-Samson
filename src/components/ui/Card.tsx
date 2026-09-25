import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hover?: boolean;
}

export function Card({ children, className, glass: _glass, hover = true, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-line bg-surface p-6 transition-colors duration-300',
        hover && 'hover:border-line dark:hover:border-muted/40',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
