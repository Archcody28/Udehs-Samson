import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SEO } from '@/components/layout/SEO';

export function NotFound() {
  return (
    <>
      <SEO title="404 - Page Not Found" noindex />
      <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center px-4 text-center">
        <div className="mb-6 rounded-full bg-blue-50 p-6 dark:bg-blue-900/20">
          <AlertTriangle className="h-16 w-16 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="font-display text-7xl font-bold">404</h1>
        <p className="mt-4 max-w-md text-lg text-slate-600 dark:text-slate-400">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="mt-8">
          <Button size="lg" leftIcon={<Home className="h-5 w-5" />}>
            Back to Home
          </Button>
        </Link>
      </div>
    </>
  );
}
