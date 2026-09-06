import { Skeleton, GridSkeleton } from '@/components/ui/Skeleton';

export function ProjectCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/50 bg-white dark:border-slate-800 dark:bg-slate-900/60">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="space-y-3 p-6">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function ProjectGridSkeleton() {
  return (
    <GridSkeleton columns={3} rows={2}>
      <ProjectCardSkeleton />
    </GridSkeleton>
  );
}

export function ProjectDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 sm:px-6 lg:px-8">
      <Skeleton className="mb-6 h-4 w-20" />
      <div className="mb-8 flex flex-wrap gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="mb-4 h-10 w-2/3" />
      <Skeleton className="mb-6 h-5 w-full max-w-3xl" />
      <Skeleton className="mb-6 h-5 w-5/6 max-w-3xl" />
      <div className="mb-6 flex items-center gap-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="mb-8 aspect-video w-full max-w-3xl rounded-2xl" />
      <div className="space-y-4 max-w-3xl">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  );
}