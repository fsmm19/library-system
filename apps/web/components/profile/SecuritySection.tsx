'use client';

import { useState } from 'react';
import {
  ChangePasswordFormData,
  changePasswordSchema,
} from '@/lib/schemas/profile-schemas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, Eye, EyeOff, Loader2, X } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface SecuritySectionProps {
  onChangePassword: (data: ChangePasswordFormData) => Promise<void>;
}

export function SecuritySection({ onChangePassword }: SecuritySectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watch('newPassword');

  // Password strength calculator
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 20;
    return strength;
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const passwordRequirements = [
    { label: 'Mínimo 8 caracteres', test: (pwd: string) => pwd.length >= 8 },
    { label: 'Una mayúscula', test: (pwd: string) => /[A-Z]/.test(pwd) },
    { label: 'Una minúscula', test: (pwd: string) => /[a-z]/.test(pwd) },
    { label: 'Un número', test: (pwd: string) => /[0-9]/.test(pwd) },
    {
      label: 'Un símbolo especial (!@#$%^&*...)',
      test: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    },
  ];

  const handleFormSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true);
    try {
      await onChangePassword(data);
      reset();
      toast.success('Contraseña actualizada', {
        description: 'Tu contraseña ha sido cambiada exitosamente.',
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      const errorMessage = error?.message || 'No se pudo cambiar la contraseña';
      toast.error('Error al cambiar contraseña', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cambiar contraseña</CardTitle>
        <CardDescription>
          Asegura tu cuenta con una contraseña segura
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Contraseña actual *</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="Ingresa tu contraseña actual"
                {...register('currentPassword')}
                aria-invalid={errors.currentPassword ? 'true' : 'false'}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.currentPassword && (
              <p className="text-sm text-destructive">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nueva contraseña *</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Ingresa tu nueva contraseña"
                {...register('newPassword')}
                aria-invalid={errors.newPassword ? 'true' : 'false'}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-destructive">
                {errors.newPassword.message}
              </p>
            )}

            {newPassword && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Fortaleza:</span>
                  <span
                    className={`font-medium ${
                      passwordStrength < 50
                        ? 'text-destructive'
                        : passwordStrength < 75
                        ? 'text-orange-500'
                        : 'text-green-500'
                    }`}
                  >
                    {passwordStrength < 50
                      ? 'Débil'
                      : passwordStrength < 75
                      ? 'Media'
                      : 'Fuerte'}
                  </span>
                </div>
                <Progress
                  value={passwordStrength}
                  className="h-2"
                  indicatorClassName={
                    passwordStrength < 50
                      ? 'bg-destructive'
                      : passwordStrength < 75
                      ? 'bg-orange-500'
                      : 'bg-green-500'
                  }
                />
              </div>
            )}
          </div>

          {newPassword && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Requisitos de contraseña:
              </p>
              <ul className="space-y-1">
                {passwordRequirements.map((req) => {
                  const passed = req.test(newPassword);
                  return (
                    <li
                      key={req.label}
                      className="flex items-center gap-2 text-sm"
                    >
                      {passed ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span
                        className={
                          passed ? 'text-foreground' : 'text-muted-foreground'
                        }
                      >
                        {req.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              Confirmar nueva contraseña *
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirma tu nueva contraseña"
                {...register('confirmPassword')}
                aria-invalid={errors.confirmPassword ? 'true' : 'false'}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Actualizar contraseña
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
