import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useContentStore } from '@/hooks/useContentStore';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useContentStore();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
