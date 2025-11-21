import { NavLink } from '@/components/NavLink';
import { BarChart3, FileText, Home, Package, Users } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard/librarian', icon: Home },
  { name: 'Usuarios', href: '/dashboard/librarian/users', icon: Users },
  { name: 'Materiales', href: '/dashboard/librarian/materials', icon: Package },
  { name: 'Prestamos', href: '/dashboard/librarian/loans', icon: FileText },
  { name: 'Reportes', href: '/dashboard/librarian/reports', icon: BarChart3 },
];

export default function LibrarianSidebar() {
  return (
    <nav className="flex-1 space-y-1 p-4">
      {navigation.map((item) => (
        <NavLink
          key={item.name}
          href={item.href}
          exact={item.href === '/dashboard/librarian'}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
          activeClassName="bg-accent text-primary"
        >
          <item.icon className="h-5 w-5" />
          {item.name}
        </NavLink>
      ))}
    </nav>
  );
}
