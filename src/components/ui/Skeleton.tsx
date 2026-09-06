import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800',
        'before:absolute before:inset-0 before:-translate-x-full',
        'before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
        'before:animate-[shimmer_2s_infinite]',
        className
      )}
    />
  );
}

interface CardSkeletonProps {
  className?: string;
  lines?: number;
}

export function CardSkeleton({ className, lines = 3 }: CardSkeletonProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <Skeleton className="h-48 w-full" />
      <div className="space-y-3 px-1">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn('h-4', i === lines - 1 ? 'w-2/3' : 'w-full')}
          />
        ))}
      </div>
    </div>
  );
}

interface GridSkeletonProps {
  className?: string;
  columns?: number;
  rows?: number;
  children: React.ReactNode;
}

export function GridSkeleton({ className, columns = 3, rows = 2, children }: GridSkeletonProps) {
  return (
    <div
      className={cn(
        'grid gap-6',
        columns === 1 && 'grid-cols-1',
        columns === 2 && 'grid-cols-1 md:grid-cols-2',
        columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        className
      )}
    >
      {Array.from({ length: columns * rows }).map((_, i) => (
        <div key={i}>{children}</div>
      ))}
    </div>
  );
}

interface ContentSkeletonProps {
  className?: string;
}

export function ContentSkeleton({ className }: ContentSkeletonProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  );
}
