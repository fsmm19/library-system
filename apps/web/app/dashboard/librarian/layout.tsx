'use client';

import { RoleGuard } from '@/components/auth';
import { Role } from '@library/types';

export default function LibrarianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={[Role.LIBRARIAN]}>
      {children}
    </RoleGuard>
  );
}
