'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground mt-1">
          Ajusta las preferencias de tu cuenta
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuración de cuenta</CardTitle>
          <CardDescription>
            Aquí podrás configurar tus preferencias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <SettingsIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Funcionalidad en desarrollo</p>
            <p className="text-sm mt-2">
              Próximamente podrás configurar tus preferencias desde aquí
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
