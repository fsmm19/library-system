'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  PersonalInfoFormData,
  personalInfoSchema,
} from '@/lib/schemas/profile-schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, Camera } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { getRoleLabel } from '@/lib/utils/role-utils';
import { User } from '@library/types';

interface PersonalInfoSectionProps {
  user: User;
  onUpdate: (data: PersonalInfoFormData) => Promise<void>;
}

export function PersonalInfoSection({
  user,
  onUpdate,
}: PersonalInfoSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: user.firstName,
      middleName: user.middleName || '',
      lastName: user.lastName,
      phone: '',
      address: '',
    },
  });

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  const handleFormSubmit = async (data: PersonalInfoFormData) => {
    setIsLoading(true);
    try {
      await onUpdate(data);
      setHasChanges(false);
      toast.success('Cambios guardados', {
        description:
          'Tu información personal ha sido actualizada correctamente',
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const errorMessage =
        error?.message || 'No se pudieron guardar los cambios';
      toast.error('Error al guardar', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <Card>
        <CardHeader>
          <CardTitle>Foto de perfil</CardTitle>
          <CardDescription>
            Tu foto de perfil aparecerá en todo el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={undefined} alt={user.firstName} />
              <AvatarFallback className="text-2xl font-semibold bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    toast.info('Próximamente', {
                      description:
                        'La función de cambiar foto estará disponible pronto',
                    });
                  }}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Cambiar foto
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                JPG, PNG o GIF. Tamaño máximo 2MB.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información personal</CardTitle>
          <CardDescription>
            Actualiza tu información de contacto y datos personales
          </CardDescription>
          {hasChanges && (
            <div className="pt-2">
              <span className="text-sm font-medium text-orange-600">
                ⚠ Tienes cambios sin guardar
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            onChange={() => setHasChanges(true)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Primer nombre</Label>
                <Input
                  id="firstName"
                  placeholder="Juan"
                  {...register('firstName')}
                  aria-invalid={errors.firstName ? 'true' : 'false'}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="middleName">
                  Segundo nombre{' '}
                  <span className="text-muted-foreground text-xs font-normal">
                    (opcional)
                  </span>
                </Label>
                <Input
                  id="middleName"
                  placeholder="Carlos"
                  {...register('middleName')}
                  aria-invalid={errors.middleName ? 'true' : 'false'}
                />
                {errors.middleName && (
                  <p className="text-sm text-destructive">
                    {errors.middleName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido(s)</Label>
              <Input
                id="lastName"
                placeholder="Pérez"
                {...register('lastName')}
                aria-invalid={errors.lastName ? 'true' : 'false'}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Correo electrónico</Label>
              <Input value={user.email} disabled className="bg-muted" />
              <p className="text-sm text-muted-foreground">
                Contacta al administrador para cambiar tu correo electrónico
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button type="submit" disabled={isLoading || !hasChanges}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar cambios
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading || !hasChanges}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
