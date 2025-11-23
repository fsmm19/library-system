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

export default function MemberSettingsPage() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [preferences, setPreferences] = useState({
    theme: 'system',
    language: 'es',
    dateFormat: 'dd/MM/yyyy',
    timezone: 'America/Santiago',
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    loanReminders: true,
    reservationAlerts: true,
    newMaterials: false,
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
        <h1 className="text-3xl font-bold">Configuración</h1>
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
              <Label htmlFor="loanReminders">Recordatorios de prestamos</Label>
              <p className="text-sm text-muted-foreground">
                Recibe recordatorios antes de que venza un préstamo
              </p>
            </div>
            <Switch
              id="loanReminders"
              checked={notifications.loanReminders}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, loanReminders: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reservationAlerts">Alertas de reservas</Label>
              <p className="text-sm text-muted-foreground">
                Recibe notificaciones cuando una reserva este lista
              </p>
            </div>
            <Switch
              id="reservationAlerts"
              checked={notifications.reservationAlerts}
              onCheckedChange={(checked) =>
                setNotifications({
                  ...notifications,
                  reservationAlerts: checked,
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="newMaterials">Nuevos materiales</Label>
              <p className="text-sm text-muted-foreground">
                Recibe notificaciones sobre nuevos materiales agregados
              </p>
            </div>
            <Switch
              id="newMaterials"
              checked={notifications.newMaterials}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, newMaterials: checked })
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
