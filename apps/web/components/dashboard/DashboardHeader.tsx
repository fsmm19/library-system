import { Bell, LogOut, User, Settings, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardHeaderProps {
  userName: string;
  userRole: 'LIBRARIAN' | 'MEMBER';
  onMenuClick: () => void;
}

export default function DashboardHeader({
  userName,
  userRole,
  onMenuClick,
}: DashboardHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada correctamente');
  };

  const getBreadcrumbs = (): Array<{ label: string; href: string | null }> => {
    const basePath =
      userRole === 'LIBRARIAN' ? '/dashboard/librarian' : '/dashboard/member';

    // Librarian breadcrumbs
    if (pathname === '/dashboard/librarian')
      return [{ label: 'Dashboard', href: null }];
    if (pathname.includes('/librarian/users'))
      return [
        { label: 'Dashboard', href: '/dashboard/librarian' },
        { label: 'Usuarios', href: null },
      ];
    if (pathname.includes('/librarian/materials'))
      return [
        { label: 'Dashboard', href: '/dashboard/librarian' },
        { label: 'Materiales', href: null },
      ];
    if (pathname.includes('/librarian/copies'))
      return [
        { label: 'Dashboard', href: '/dashboard/librarian' },
        { label: 'Copias', href: null },
      ];
    if (pathname.includes('/librarian/loans'))
      return [
        { label: 'Dashboard', href: '/dashboard/librarian' },
        { label: 'Préstamos', href: null },
      ];
    if (pathname.includes('/librarian/reports'))
      return [
        { label: 'Dashboard', href: '/dashboard/librarian' },
        { label: 'Reportes', href: null },
      ];

    // Member breadcrumbs
    if (pathname === '/dashboard/member')
      return [{ label: 'Dashboard', href: null }];
    if (pathname.includes('/member/loans'))
      return [
        { label: 'Dashboard', href: '/dashboard/member' },
        { label: 'Mis Préstamos', href: null },
      ];
    if (pathname.includes('/member/reservations'))
      return [
        { label: 'Dashboard', href: '/dashboard/member' },
        { label: 'Mis Reservas', href: null },
      ];
    if (pathname.includes('/member/favorites'))
      return [
        { label: 'Dashboard', href: '/dashboard/member' },
        { label: 'Mis favoritos', href: null },
      ];

    // Common breadcrumbs
    if (pathname.includes('/profile'))
      return [
        { label: 'Dashboard', href: basePath },
        { label: 'Perfil', href: null },
      ];
    if (pathname.includes('/settings'))
      return [
        { label: 'Dashboard', href: basePath },
        { label: 'Configuración', href: null },
      ];

    return [{ label: 'Dashboard', href: null }];
  };

  const getRoleLabel = () => {
    return userRole === 'LIBRARIAN' ? 'Bibliotecario' : 'Miembro';
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-card px-4 sm:px-6">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Abrir menu</span>
      </Button>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        {getBreadcrumbs().map((crumb, index) => (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && <span className="text-muted-foreground">/</span>}
            {crumb.href ? (
              <button
                onClick={() => router.push(crumb.href!)}
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {crumb.label}
              </button>
            ) : (
              <span
                className={
                  index === getBreadcrumbs().length - 1
                    ? 'font-medium'
                    : 'text-muted-foreground'
                }
              >
                {crumb.label}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                3
              </Badge>
              <span className="sr-only">Notificaciones</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="space-y-2 p-2">
              <div className="rounded-lg bg-accent/50 p-3 text-sm">
                <p className="font-medium">Préstamo vencido</p>
                <p className="text-muted-foreground text-xs mt-1">
                  Hay prestamos que requieren atención
                </p>
              </div>
              <div className="rounded-lg bg-accent/50 p-3 text-sm">
                <p className="font-medium">Nuevo usuario registrado</p>
                <p className="text-muted-foreground text-xs mt-1">
                  Un nuevo miembro se ha registrado en el sistema
                </p>
              </div>
              <div className="rounded-lg bg-accent/50 p-3 text-sm">
                <p className="font-medium">Material bajo stock</p>
                <p className="text-muted-foreground text-xs mt-1">
                  Algunos materiales necesitan reposición
                </p>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {(() => {
                    const parts = userName.trim().split(' ');
                    if (parts.length === 1) return parts[0][0].toUpperCase();
                    return (
                      parts[0][0] + parts[parts.length - 1][0]
                    ).toUpperCase();
                  })()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex sm:flex-col sm:items-start sm:gap-0">
                <span className="text-sm">{userName}</span>
                <Badge variant="secondary" className="text-xs h-4 px-1">
                  {getRoleLabel()}
                </Badge>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                router.push(
                  userRole === 'LIBRARIAN'
                    ? '/dashboard/librarian/profile'
                    : '/dashboard/member/profile'
                )
              }
            >
              <User className="mr-2 h-4 w-4" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                router.push(
                  userRole === 'LIBRARIAN'
                    ? '/dashboard/librarian/settings'
                    : '/dashboard/member/settings'
                )
              }
            >
              <Settings className="mr-2 h-4 w-4" />
              Configuración
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
