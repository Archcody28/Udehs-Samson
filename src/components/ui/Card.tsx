import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hover?: boolean;
}

export function Card({ children, className, glass = true, hover = true, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/50 bg-white p-6 shadow-sm transition-all duration-300 dark:border-slate-800 dark:bg-slate-900/60',
        glass && 'dark:glass',
        hover && 'hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:border-slate-700',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
