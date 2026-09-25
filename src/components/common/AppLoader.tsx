interface AppLoaderProps {
  loading?: boolean;
}

export function AppLoader({ loading = true }: AppLoaderProps) {
  if (!loading) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background transition-opacity duration-500"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading portfolio"
    >
      <div className="flex flex-col items-center gap-8">
        {/* Brand mark */}
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent">
            <span className="font-display text-3xl font-bold text-white">US</span>
          </div>
          {/* Animated ring */}
          <div className="absolute -inset-2 animate-spin rounded-2xl border-2 border-transparent border-t-accent/50" style={{ animationDuration: '3s' }} />
        </div>

        {/* Brand name */}
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-ink">
            Udeh Samson
          </h1>
          <p className="mt-1 text-sm text-subtle">
            Full Stack Engineer
          </p>
        </div>

        {/* Loading indicator */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" style={{ animationDelay: '0ms' }} />
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" style={{ animationDelay: '150ms' }} />
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-xs text-subtle">
            Loading portfolio...
          </p>
        </div>
      </div>
    </div>
  );
}