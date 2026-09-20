import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from './navbar';
import { Footer } from './footer';
import { useContentActions } from '@/hooks/useContentStore';

interface LayoutProps {
  children: React.ReactNode;
}

// Module-level guard: one page-view per pathname per browser session.
// Makes the effect StrictMode-safe (double-invoked effect sees the same
// pathname and skips) and prevents duplicates from any remount.
let lastRecordedPathname: string | null = null;

export function Layout({ children }: LayoutProps) {
  const { recordPageView } = useContentActions();
  const { pathname } = useLocation();

  // Pathname-aware analytics: record exactly one page-view per actual route
  // navigation. Dependencies are stable (pathname string + stable callback);
  // the guard prevents StrictMode/remount duplicates and same-path repeats.
  useEffect(() => {
    if (lastRecordedPathname === pathname) return;
    lastRecordedPathname = pathname;
    recordPageView();
  }, [pathname, recordPageView]);

  return (
    <div className="min-h-screen bg-white text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <Navbar />
      <main className="pt-20">{children}</main>
      <Footer />
    </div>
  );
}
