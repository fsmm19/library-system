import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getRoleLabel } from '@/lib/utils/role-utils';
import { User } from '@library/types';

interface ProfileHeaderProps {
  user: User;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  const fullName = `${user.firstName} ${
    user.middleName ? user.middleName + ' ' : ''
  }${user.lastName}`;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-card rounded-lg border">
      <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
        <AvatarImage src={undefined} alt={fullName} />
        <AvatarFallback className="text-2xl sm:text-3xl font-semibold bg-primary text-primary-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 text-center sm:text-left space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          {fullName}
        </h1>
        <p className="text-muted-foreground">{user.email}</p>

        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
          <Badge variant={user.role === 'LIBRARIAN' ? 'default' : 'secondary'}>
            {getRoleLabel(user.role)}
          </Badge>
          <Badge variant="outline" className="text-muted-foreground">
            Miembro desde{' '}
            {format(new Date(user.createdAt), 'MMMM yyyy', { locale: es })}
          </Badge>
        </div>
      </div>
    </div>
  );
}
