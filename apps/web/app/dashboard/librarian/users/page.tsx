'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los miembros y bibliotecarios del sistema
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Nuevo usuario
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de usuarios</CardTitle>
          <CardDescription>
            Aqui se mostrara la lista de todos los usuarios del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>Funcionalidad en desarrollo</p>
            <p className="text-sm mt-2">
              Proximamente podras gestionar usuarios desde aqui
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
