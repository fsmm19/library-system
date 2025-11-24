'use client';

import {
  PreferencesFormData,
  preferencesSchema,
} from '@/lib/schemas/profile-schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Monitor, Moon, Sun } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface PreferencesSectionProps {
  initialPreferences: PreferencesFormData;
  onUpdate: (data: { theme: string; notifications: boolean }) => Promise<void>;
}

export function PreferencesSection({
  initialPreferences,
  onUpdate,
}: PreferencesSectionProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(preferencesSchema),
    defaultValues: initialPreferences,
    mode: 'onChange',
  });

  const handleNotificationChange = async (checked: boolean) => {
    setValue('notifications', checked);
    setIsLoading(true);

    try {
      const dataToSend = {
        theme: watch('theme'),
        notifications: checked,
      };

      await onUpdate(dataToSend);

      toast.success('Notificaciones actualizadas');
    } catch (error) {
      setValue('notifications', !checked);
      toast.error('Error al actualizar notificaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    setValue('theme', newTheme);
    toast.info('Funcionalidad en desarrollo', {
      description: 'El cambio de tema estará disponible próximamente.',
    });
  };

  // const timezones = [
  //   { value: 'America/Santiago', label: 'Santiago (GMT-3)' },
  //   { value: 'America/Buenos_Aires', label: 'Buenos Aires (GMT-3)' },
  //   { value: 'America/Sao_Paulo', label: 'Sao Paulo (GMT-3)' },
  //   { value: 'America/Mexico_City', label: 'Ciudad de México (GMT-6)' },
  //   { value: 'America/Monterrey', label: 'Monterrey (GMT-6)' },
  //   { value: 'America/Bogota', label: 'Bogotá (GMT-5)' },
  //   { value: 'America/Lima', label: 'Lima (GMT-5)' },
  // ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Apariencia</CardTitle>
          <CardDescription>
            Personaliza cómo se ve la aplicación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Tema de color</Label>
            <RadioGroup
              value={watch('theme')}
              onValueChange={(value) => {
                const newTheme = value as 'light' | 'dark' | 'system';
                handleThemeChange(newTheme);
              }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              disabled={isLoading}
            >
              <div>
                <RadioGroupItem
                  value="light"
                  id="light"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="light"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Sun className="mb-3 h-6 w-6" />
                  <span className="text-sm font-medium">Claro</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="dark"
                  id="dark"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="dark"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Moon className="mb-3 h-6 w-6" />
                  <span className="text-sm font-medium">Oscuro</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="system"
                  id="system"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="system"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Monitor className="mb-3 h-6 w-6" />
                  <span className="text-sm font-medium">Sistema</span>
                </Label>
              </div>
            </RadioGroup>
            <p className="text-sm text-muted-foreground">
              Selecciona el tema que prefieras o usa la configuración de tu
              sistema
            </p>
            {errors.theme && (
              <p className="text-sm text-destructive">{errors.theme.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* <Card>
          <CardHeader>
            <CardTitle>Idioma y región</CardTitle>
            <CardDescription>
              Configura el idioma y formato de fecha
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="language">Idioma</Label>
              <Select
                onValueChange={(value) => setValue('language', value as any)}
                defaultValue={initialPreferences.language}
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder="Selecciona un idioma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en" disabled>
                    English (Próximamente)
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.language && (
                <p className="text-sm text-destructive">
                  {errors.language.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFormat">Formato de fecha</Label>
              <Select
                onValueChange={(value) => setValue('dateFormat', value as any)}
                defaultValue={initialPreferences.dateFormat}
              >
                <SelectTrigger id="dateFormat">
                  <SelectValue placeholder="Selecciona un formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">
                    DD/MM/YYYY (31/12/2024)
                  </SelectItem>
                  <SelectItem value="MM/DD/YYYY">
                    MM/DD/YYYY (12/31/2024)
                  </SelectItem>
                  <SelectItem value="YYYY-MM-DD">
                    YYYY-MM-DD (2024-12-31)
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.dateFormat && (
                <p className="text-sm text-destructive">
                  {errors.dateFormat.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Zona horaria</Label>
              <Select
                onValueChange={(value) => setValue('timezone', value as any)}
                defaultValue={initialPreferences.timezone}
              >
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Selecciona tu zona horaria" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.timezone && (
                <p className="text-sm text-destructive">
                  {errors.timezone.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card> */}

      <Card>
        <CardHeader>
          <CardTitle>Notificaciones</CardTitle>
          <CardDescription>
            Configura cómo quieres recibir notificaciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Notificaciones del sistema</Label>
              <p className="text-sm text-muted-foreground">
                Recibe notificaciones sobre préstamos, devoluciones y
                reservaciones
              </p>
            </div>
            <Switch
              checked={watch('notifications')}
              onCheckedChange={handleNotificationChange}
              disabled={isLoading}
            />
          </div>
          {errors.notifications && (
            <p className="text-sm text-destructive">
              {errors.notifications.message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
