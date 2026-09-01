import { useEffect } from 'react';
import { Navbar } from './navbar';
import { Footer } from './footer';
import { useContentStore } from '@/hooks/useContentStore';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { recordPageView } = useContentStore();

  useEffect(() => {
    recordPageView();
  }, [recordPageView]);

  return (
    <div className="min-h-screen bg-white text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <Navbar />
      <main className="pt-20">{children}</main>
      <Footer />
    </div>
  );
}
