interface AppLoaderProps {
  loading?: boolean;
}

export function AppLoader({ loading = true }: AppLoaderProps) {
  if (!loading) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-opacity duration-500 dark:bg-slate-950"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading portfolio"
    >
      <div className="flex flex-col items-center gap-8">
        {/* Brand mark */}
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-xl shadow-blue-500/25">
            <span className="font-display text-3xl font-bold text-white">US</span>
          </div>
          {/* Animated ring */}
          <div className="absolute -inset-2 animate-spin rounded-2xl border-2 border-transparent border-t-blue-500/50" style={{ animationDuration: '3s' }} />
        </div>

        {/* Brand name */}
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Udeh Samson
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Full Stack Engineer
          </p>
        </div>

        {/* Loading indicator */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="h-2 w-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Loading portfolio...
          </p>
        </div>
      </div>
    </div>
  );
}