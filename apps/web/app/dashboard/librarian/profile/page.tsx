'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground mt-1">
          Informacion de tu cuenta y configuracion personal
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Summary */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {user.firstName[0]}
                  {user.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold">
                {user.firstName} {user.middleName} {user.lastName}
              </h2>
              <Badge className="mt-2">
                {user.role === 'LIBRARIAN' ? 'Bibliotecario' : 'Miembro'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informacion personal</CardTitle>
            <CardDescription>
              Detalles de tu cuenta en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Nombre
                </label>
                <p className="text-sm mt-1">{user.firstName}</p>
              </div>
              {user.middleName && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Segundo nombre
                  </label>
                  <p className="text-sm mt-1">{user.middleName}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Apellido
                </label>
                <p className="text-sm mt-1">{user.lastName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Correo electronico
                </label>
                <p className="text-sm mt-1">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Rol
                </label>
                <p className="text-sm mt-1">
                  {user.role === 'LIBRARIAN' ? 'Bibliotecario' : 'Miembro'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Fecha de registro
                </label>
                <p className="text-sm mt-1">
                  {new Date(user.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <div className="pt-4">
              <Button disabled>Editar perfil</Button>
              <p className="text-xs text-muted-foreground mt-2">
                La edicion de perfil estara disponible proximamente
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
