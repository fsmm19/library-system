import { Home, BookOpen, Calendar, Heart, Settings, User } from 'lucide-react';
import { NavLink } from '@/components/NavLink';

export default function MemberSidebar() {
  const navItems = [
    {
      href: '/dashboard/member',
      label: 'Dashboard',
      icon: Home,
    },
    {
      href: '/dashboard/member/loans',
      label: 'Mis préstamos',
      icon: BookOpen,
    },
    {
      href: '/dashboard/member/reservations',
      label: 'Mis reservas',
      icon: Calendar,
    },
    {
      href: '/dashboard/member/favorites',
      label: 'Mis favoritos',
      icon: Heart,
    },
    {
      href: '/catalog',
      label: 'Catálogo',
      icon: BookOpen,
    },
  ];

  return (
    <nav className="flex-1 overflow-y-auto p-4">
      <ul className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <NavLink
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                activeClassName="bg-accent text-accent-foreground"
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
