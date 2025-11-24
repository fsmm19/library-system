'use client';

import { Bell, LogOut, User, Settings, Menu, Check } from 'lucide-react';
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
import { useEffect, useState } from 'react';
import { notificationsApi } from '@/lib/api/notifications';
import { Notification } from '@library/types';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const { logout, token, user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  const loadNotifications = async () => {
    if (!token || !user?.notifications) return;

    try {
      setIsLoadingNotifications(true);
      const [notifs, countData] = await Promise.all([
        notificationsApi.getNotifications(token, false),
        notificationsApi.getUnreadCount(token),
      ]);
      setNotifications(notifs);
      setUnreadCount(countData.count);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Reload notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [token, user?.notifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    if (!token) return;

    try {
      await notificationsApi.markAsRead(notificationId, token);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, isRead: true, readAt: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      toast.error('Error al marcar como leída');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!token) return;

    try {
      await notificationsApi.markAllAsRead(token);
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          isRead: true,
          readAt: new Date().toISOString(),
        }))
      );
      setUnreadCount(0);
      toast.success('Todas las notificaciones marcadas como leídas');
    } catch (error) {
      toast.error('Error al marcar como leídas');
    }
  };

  const getNotificationTitle = (type: string): string => {
    const titles: Record<string, string> = {
      LOAN_DUE_SOON: 'Préstamo próximo a vencer',
      LOAN_OVERDUE: 'Préstamo vencido',
      RESERVATION_READY: 'Reserva lista',
      RESERVATION_EXPIRED: 'Reserva expirada',
      FINE_ISSUED: 'Multa emitida',
      ACCOUNT_SUSPENDED: 'Cuenta suspendida',
      GENERAL: 'Notificación',
    };
    return titles[type] || 'Notificación';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays}d`;
  };

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
        {user?.notifications && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
                <span className="sr-only">Notificaciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-2 py-1.5">
                <DropdownMenuLabel className="p-0">
                  Notificaciones
                </DropdownMenuLabel>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto py-1 px-2 text-xs"
                    onClick={handleMarkAllAsRead}
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Marcar todas
                  </Button>
                )}
              </div>
              <DropdownMenuSeparator />
              {isLoadingNotifications ? (
                <div className="flex items-center justify-center p-8">
                  <p className="text-sm text-muted-foreground">Cargando...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <Bell className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No hay notificaciones
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-1 p-1">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`rounded-lg p-3 text-sm cursor-pointer transition-colors ${
                          notification.isRead
                            ? 'bg-background hover:bg-accent/50'
                            : 'bg-accent hover:bg-accent/70'
                        }`}
                        onClick={() =>
                          !notification.isRead &&
                          handleMarkAsRead(notification.id)
                        }
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {getNotificationTitle(notification.type)}
                            </p>
                            <p className="text-muted-foreground text-xs mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                        {!notification.isRead && (
                          <div className="mt-2">
                            <Badge variant="secondary" className="text-xs">
                              Nueva
                            </Badge>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

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
