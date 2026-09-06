import { Skeleton, GridSkeleton } from '@/components/ui/Skeleton';

export function BlogCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/50 bg-white dark:border-slate-800 dark:bg-slate-900/60">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="space-y-3 p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function BlogGridSkeleton() {
  return (
    <GridSkeleton columns={3} rows={2}>
      <BlogCardSkeleton />
    </GridSkeleton>
  );
}

export function BlogDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 sm:px-6 lg:px-8">
      <Skeleton className="mb-6 h-4 w-20" />
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="mb-4 h-10 w-full" />
        <Skeleton className="mb-4 h-10 w-2/3" />
        <div className="mb-6 flex items-center gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="mb-10 aspect-video w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}