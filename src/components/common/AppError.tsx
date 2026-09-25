interface AppErrorProps {
  message: string;
  onRetry: () => void;
}

export function AppError({ message, onRetry }: AppErrorProps) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
      role="alert"
      aria-live="assertive"
    >
      <div className="mx-4 max-w-md text-center">
        {/* Error icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-danger-soft">
          <svg
            className="h-10 w-10 text-danger-ink"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>

        {/* Error content */}
        <h1 className="font-display text-2xl font-bold text-ink">
          Unable to load portfolio
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          We couldn't retrieve the latest portfolio data. Please check your connection and try again.
        </p>

        {/* Technical detail (collapsed) */}
        {message && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-xs text-subtle hover:text-subtle">
              Technical details
            </summary>
            <pre className="mt-2 overflow-auto rounded-lg bg-elevated p-3 text-xs text-muted">
              {message}
            </pre>
          </details>
        )}

        {/* Retry button */}
        <button
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.183"
            />
          </svg>
          Try Again
        </button>
      </div>
    </div>
  );
}