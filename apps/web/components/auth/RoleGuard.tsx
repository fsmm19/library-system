'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Role } from '@library/types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Role[];
  redirectTo?: string;
}

export function RoleGuard({ children, allowedRoles, redirectTo }: RoleGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      // Check if user's role is allowed
      if (!allowedRoles.includes(user.role as Role)) {
        // Redirect based on user role
        const defaultRedirect = user.role === 'LIBRARIAN'
          ? '/dashboard/librarian'
          : '/dashboard/member';

        router.replace(redirectTo || defaultRedirect);
      }
    }
  }, [user, isLoading, allowedRoles, redirectTo, router]);

  // Don't render children if user doesn't have the right role
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role as Role)) {
    return null;
  }

  return <>{children}</>;
}
