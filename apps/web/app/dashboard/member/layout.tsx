'use client';

import { RoleGuard } from '@/components/auth';
import { Role } from '@library/types';

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={[Role.MEMBER]}>
      {children}
    </RoleGuard>
  );
}
