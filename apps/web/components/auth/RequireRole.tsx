'use client';

import { useAuth } from '@/hooks/useAuth';
import { Role } from '@library/types';

interface RequireRoleProps {
  children: React.ReactNode;
  roles: Role[];
  fallback?: React.ReactNode;
}

export function RequireRole({ children, roles, fallback = null }: RequireRoleProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user || !roles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
