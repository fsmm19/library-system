import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { User } from '@library/types';
import { Calendar, Edit, Mail, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getUserStateInfo } from '@/lib/utils/userState';

interface UserDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onEdit?: (user: User) => void;
}

const getRoleLabel = (role: string): string => {
  const roleMap: Record<string, string> = {
    LIBRARIAN: 'Bibliotecario',
    MEMBER: 'Miembro',
  };
  return roleMap[role] || role;
};

export default function UserDetailsSheet({
  open,
  onOpenChange,
  user,
  onEdit,
}: UserDetailsSheetProps) {
  if (!user) return null;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const fullName = `${user.firstName}${
    user.middleName ? ` ${user.middleName}` : ''
  } ${user.lastName}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto px-6 pb-6">
        <SheetHeader>
          <SheetTitle>Detalles del usuario</SheetTitle>
          <SheetDescription>
            Información completa del usuario en el sistema
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* User Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                {getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{fullName}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <div className="flex gap-2">
              <Badge
                variant={user.role === 'LIBRARIAN' ? 'default' : 'secondary'}
              >
                {getRoleLabel(user.role)}
              </Badge>
              <Badge
                variant={
                  getUserStateInfo(
                    user.role,
                    user.member?.accountState,
                    user.librarian?.isActive
                  ).variant
                }
              >
                {
                  getUserStateInfo(
                    user.role,
                    user.member?.accountState,
                    user.librarian?.isActive
                  ).label
                }
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Información de contacto
            </h4>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Correo electrónico</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* System Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Información del sistema
            </h4>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Estado de la cuenta</p>
                  <p className="text-sm text-muted-foreground">
                    {
                      getUserStateInfo(
                        user.role,
                        user.member?.accountState,
                        user.librarian?.isActive
                      ).label
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Fecha de registro</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-2">
            <Button className="w-full" onClick={() => onEdit?.(user)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar usuario
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              Cerrar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
