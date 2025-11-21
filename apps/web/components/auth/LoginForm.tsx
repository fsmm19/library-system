'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import {
  LoginFormData,
  ResetPasswordFormData,
  loginSchema,
  resetPasswordSchema,
} from '@/lib/schemas/auth-schemas';
import { useAuth } from '@/hooks/useAuth';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    formState: { errors: errorsReset },
    reset: resetForm,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onSubmit',
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await login(data);
      toast.success('Inicio de sesión exitoso', {
        description: `Bienvenido de vuelta, ${response.user.firstName}`,
      });

      // Redirect based on user role
      if (response.user.role === 'LIBRARIAN') {
        router.push('/dashboard/librarian');
      } else {
        router.push('/catalog');
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al iniciar sesión';
      toast.error('Error en el inicio de sesión', {
        description: errorMessage,
      });
    }
  };

  const onResetPassword = async (data: ResetPasswordFormData) => {
    setIsResetLoading(true);

    // TODO: Implementar recuperación de contraseña
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log('Reset password for:', data.email);
    toast.success('Se ha enviado un enlace de recuperación a tu correo');

    setIsResetLoading(false);
    setIsResetDialogOpen(false);
    resetForm();
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="login-email">Correo electrónico</Label>
          <Input
            id="login-email"
            type="email"
            placeholder="tu@ejemplo.com"
            autoComplete="email"
            disabled={isSubmitting}
            {...register('email')}
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'login-email-error' : undefined}
          />
          {errors.email && (
            <p
              id="login-email-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="login-password">Contraseña</Label>
            <button
              type="button"
              onClick={() => setIsResetDialogOpen(true)}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
              disabled={isSubmitting}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="********"
              autoComplete="current-password"
              disabled={isSubmitting}
              {...register('password')}
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={
                errors.password ? 'login-password-error' : undefined
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
          {errors.password && (
            <p
              id="login-password-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Iniciando sesión...
            </>
          ) : (
            'Iniciar sesión'
          )}
        </Button>
      </form>

      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Recuperar contraseña</DialogTitle>
            <DialogDescription>
              Ingresa tu correo electrónico y te enviaremos un enlace para
              restablecer tu contraseña.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmitReset(onResetPassword)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="reset-email">Correo electrónico</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="tu@ejemplo.com"
                autoComplete="email"
                disabled={isResetLoading}
                {...registerReset('email')}
                aria-invalid={errorsReset.email ? 'true' : 'false'}
                aria-describedby={
                  errorsReset.email ? 'reset-email-error' : undefined
                }
              />
              {errorsReset.email && (
                <p
                  id="reset-email-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {errorsReset.email.message}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsResetDialogOpen(false)}
                disabled={isResetLoading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isResetLoading}
                className="flex-1"
              >
                {isResetLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar enlace'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
