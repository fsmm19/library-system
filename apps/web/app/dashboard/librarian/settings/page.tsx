'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function LibrarianSettingsPage() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [preferences, setPreferences] = useState({
    theme: 'system',
    language: 'es',
    dateFormat: 'dd/MM/yyyy',
    timezone: 'America/Santiago',
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    overdueLoanAlerts: true,
    newUserRegistrations: true,
    systemAlerts: true,
    dailyReports: false,
  });

  const handleSavePreferences = () => {
    setIsUpdating(true);

    // Simulate API call
    setTimeout(() => {
      setIsUpdating(false);
      toast.success('Preferencias guardadas correctamente');
    }, 1000);
  };

  const handleSaveNotifications = () => {
    setIsUpdating(true);

    // Simulate API call
    setTimeout(() => {
      setIsUpdating(false);
      toast.success('Configuración de notificaciones guardada');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Configuración de cuenta</h1>
        <p className="text-muted-foreground mt-1">
          Personaliza tu experiencia en el sistema
        </p>
      </div>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferencias</CardTitle>
          <CardDescription>
            Configura la apariencia y comportamiento de la aplicación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="theme">Tema</Label>
            <Select
              value={preferences.theme}
              onValueChange={(value) =>
                setPreferences({ ...preferences, theme: value })
              }
            >
              <SelectTrigger id="theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Oscuro</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Idioma</Label>
            <Select
              value={preferences.language}
              onValueChange={(value) =>
                setPreferences({ ...preferences, language: value })
              }
            >
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateFormat">Formato de fecha</Label>
            <Select
              value={preferences.dateFormat}
              onValueChange={(value) =>
                setPreferences({ ...preferences, dateFormat: value })
              }
            >
              <SelectTrigger id="dateFormat">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dd/MM/yyyy">DD/MM/AAAA</SelectItem>
                <SelectItem value="MM/dd/yyyy">MM/DD/AAAA</SelectItem>
                <SelectItem value="yyyy-MM-dd">AAAA-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Zona horaria</Label>
            <Select
              value={preferences.timezone}
              onValueChange={(value) =>
                setPreferences({ ...preferences, timezone: value })
              }
            >
              <SelectTrigger id="timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/Santiago">
                  Santiago (GMT-3)
                </SelectItem>
                <SelectItem value="America/Buenos_Aires">
                  Buenos Aires (GMT-3)
                </SelectItem>
                <SelectItem value="America/Sao_Paulo">
                  Sao Paulo (GMT-3)
                </SelectItem>
                <SelectItem value="America/Mexico_City">
                  Ciudad de Mexico (GMT-6)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSavePreferences} disabled={isUpdating}>
            {isUpdating ? 'Guardando...' : 'Guardar preferencias'}
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notificaciones</CardTitle>
          <CardDescription>
            Configura que notificaciones deseas recibir
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailNotifications">
                Notificaciones por correo
              </Label>
              <p className="text-sm text-muted-foreground">
                Recibe notificaciones importantes por correo electrónico
              </p>
            </div>
            <Switch
              id="emailNotifications"
              checked={notifications.emailNotifications}
              onCheckedChange={(checked) =>
                setNotifications({
                  ...notifications,
                  emailNotifications: checked,
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="overdueLoanAlerts">
                Alertas de préstamos vencidos
              </Label>
              <p className="text-sm text-muted-foreground">
                Recibe alertas cuando haya préstamos vencidos
              </p>
            </div>
            <Switch
              id="overdueLoanAlerts"
              checked={notifications.overdueLoanAlerts}
              onCheckedChange={(checked) =>
                setNotifications({
                  ...notifications,
                  overdueLoanAlerts: checked,
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="newUserRegistrations">
                Nuevos usuarios registrados
              </Label>
              <p className="text-sm text-muted-foreground">
                Recibe notificaciones cuando se registre un nuevo usuario
              </p>
            </div>
            <Switch
              id="newUserRegistrations"
              checked={notifications.newUserRegistrations}
              onCheckedChange={(checked) =>
                setNotifications({
                  ...notifications,
                  newUserRegistrations: checked,
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="systemAlerts">Alertas del sistema</Label>
              <p className="text-sm text-muted-foreground">
                Recibe notificaciones sobre actualizaciones y mantenimiento
              </p>
            </div>
            <Switch
              id="systemAlerts"
              checked={notifications.systemAlerts}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, systemAlerts: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dailyReports">Reportes diarios</Label>
              <p className="text-sm text-muted-foreground">
                Recibe un reporte diario con las estadísticas del sistema
              </p>
            </div>
            <Switch
              id="dailyReports"
              checked={notifications.dailyReports}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, dailyReports: checked })
              }
            />
          </div>

          <Button onClick={handleSaveNotifications} disabled={isUpdating}>
            {isUpdating ? 'Guardando...' : 'Guardar configuración'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
