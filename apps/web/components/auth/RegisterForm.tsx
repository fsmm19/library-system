'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import {
  RegisterMemberFormData,
  registerMemberSchema,
} from '@/lib/schemas/auth-schemas';
import { useAuth } from '@/hooks/useAuth';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Función para calcular fortaleza de contraseña
const calculatePasswordStrength = (
  password: string
): { strength: number; label: string; color: string } => {
  if (!password) return { strength: 0, label: '', color: '' };

  let strength = 0;

  // Longitud
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;

  // Contiene mayúsculas
  if (/[A-Z]/.test(password)) strength += 20;

  // Contiene minúsculas
  if (/[a-z]/.test(password)) strength += 20;

  // Contiene números
  if (/[0-9]/.test(password)) strength += 15;

  // Contiene símbolos especiales
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 15;

  if (strength <= 40)
    return { strength, label: 'Débil', color: 'bg-destructive' };
  if (strength <= 70) return { strength, label: 'Media', color: 'bg-warning' };
  return { strength, label: 'Fuerte', color: 'bg-success' };
};

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { registerMember } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterMemberFormData>({
    resolver: zodResolver(registerMemberSchema),
    mode: 'onBlur',
  });

  const password = watch('password', '');
  const passwordStrength = useMemo(
    () => calculatePasswordStrength(password),
    [password]
  );

  const onSubmit = async (data: RegisterMemberFormData) => {
    try {
      const { confirmPassword, ...registerData } = data;

      // Limpiar middleName si está vacío
      const cleanedData = {
        ...registerData,
        middleName: registerData.middleName?.trim() || undefined,
      };

      await registerMember(cleanedData);
      toast.success('Cuenta creada exitosamente');

      // Redirect to catalog after successful registration
      router.push('/catalog');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al crear la cuenta';
      toast.error(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="register-firstName">Primer nombre</Label>
          <Input
            id="register-firstName"
            type="text"
            placeholder="Juan"
            autoComplete="given-name"
            disabled={isSubmitting}
            {...register('firstName')}
            aria-invalid={errors.firstName ? 'true' : 'false'}
            aria-describedby={
              errors.firstName ? 'register-firstName-error' : undefined
            }
          />
          {errors.firstName && (
            <p
              id="register-firstName-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-middleName">
            Segundo nombre{' '}
            <span className="text-muted-foreground text-xs font-normal">
              (opcional)
            </span>
          </Label>
          <Input
            id="register-middleName"
            type="text"
            placeholder="Carlos"
            autoComplete="additional-name"
            disabled={isSubmitting}
            {...register('middleName')}
            aria-invalid={errors.middleName ? 'true' : 'false'}
            aria-describedby={
              errors.middleName ? 'register-middleName-error' : undefined
            }
          />
          {errors.middleName && (
            <p
              id="register-middleName-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {errors.middleName.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-lastName">Apellido(s)</Label>
        <Input
          id="register-lastName"
          type="text"
          placeholder="Pérez"
          autoComplete="family-name"
          disabled={isSubmitting}
          {...register('lastName')}
          aria-invalid={errors.lastName ? 'true' : 'false'}
          aria-describedby={
            errors.lastName ? 'register-lastName-error' : undefined
          }
        />
        {errors.lastName && (
          <p
            id="register-lastName-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {errors.lastName.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email">Correo electrónico</Label>
        <Input
          id="register-email"
          type="email"
          placeholder="tu@ejemplo.com"
          autoComplete="email"
          disabled={isSubmitting}
          {...register('email')}
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'register-email-error' : undefined}
        />
        {errors.email && (
          <p
            id="register-email-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password">Contraseña</Label>
        <div className="relative">
          <Input
            id="register-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="********"
            autoComplete="new-password"
            disabled={isSubmitting}
            {...register('password')}
            aria-invalid={errors.password ? 'true' : 'false'}
            aria-describedby={
              errors.password
                ? 'register-password-error register-password-strength'
                : 'register-password-strength'
            }
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={
              showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
            }
            disabled={isSubmitting}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {password && (
          <div id="register-password-strength" className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Fortaleza:</span>
              <span
                className={`font-medium ${
                  passwordStrength.label === 'Débil'
                    ? 'text-destructive'
                    : passwordStrength.label === 'Media'
                    ? 'text-warning'
                    : 'text-success'
                }`}
              >
                {passwordStrength.label}
              </span>
            </div>
            <Progress
              value={passwordStrength.strength}
              className="h-1.5"
              indicatorClassName={passwordStrength.color}
            />
            <div className="pt-2 space-y-1">
              <p className="text-xs text-muted-foreground">
                La contraseña debe contener:
              </p>
              <ul className="text-xs space-y-0.5 text-muted-foreground">
                <li>" Mínimo 8 caracteres</li>
                <li>" Una letra mayúscula (A-Z)</li>
                <li>" Una letra minúscula (a-z)</li>
                <li>" Un número (0-9)</li>
                <li>" Un símbolo especial (!@#$%...)</li>
              </ul>
            </div>
          </div>
        )}

        {errors.password && (
          <p
            id="register-password-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-confirmPassword">Confirmar contraseña</Label>
        <div className="relative">
          <Input
            id="register-confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="********"
            autoComplete="new-password"
            disabled={isSubmitting}
            {...register('confirmPassword')}
            aria-invalid={errors.confirmPassword ? 'true' : 'false'}
            aria-describedby={
              errors.confirmPassword
                ? 'register-confirmPassword-error'
                : undefined
            }
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={
              showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
            }
            disabled={isSubmitting}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p
            id="register-confirmPassword-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creando cuenta...
          </>
        ) : (
          'Crear cuenta'
        )}
      </Button>
    </form>
  );
}
