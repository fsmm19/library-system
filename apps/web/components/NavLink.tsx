'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { forwardRef, AnchorHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface NavLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
  exact?: boolean;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  (
    {
      className,
      activeClassName,
      pendingClassName,
      href,
      exact = false,
      children,
      ...props
    },
    ref
  ) => {
    const pathname = usePathname();
    const isActive = exact ? pathname === href : pathname.startsWith(href);
    const isPending = false;

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(
          className,
          isActive && activeClassName,
          isPending && pendingClassName
        )}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

NavLink.displayName = 'NavLink';

export { NavLink };
