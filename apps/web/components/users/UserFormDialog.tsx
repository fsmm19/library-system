'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { PasswordRequirements } from '@/components/shared/PasswordRequirements';
import { User, Role } from '@library/types';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const calculatePasswordStrength = (
  password: string
): { strength: number; label: string; color: string } => {
  if (!password) return { strength: 0, label: '', color: '' };

  let strength = 0;

  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;
  if (/[A-Z]/.test(password)) strength += 20;
  if (/[a-z]/.test(password)) strength += 20;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 15;
  if (strength <= 40)
    return { strength, label: 'Débil', color: 'bg-destructive' };
  if (strength <= 70) return { strength, label: 'Media', color: 'bg-warning' };

  return { strength, label: 'Fuerte', color: 'bg-success' };
};

export interface UserFormData {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  role: 'MEMBER' | 'LIBRARIAN';
}

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSubmit: (data: UserFormData) => Promise<void>;
}

export default function UserFormDialog({
  open,
  onOpenChange,
  user,
  onSubmit,
}: UserFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const isEditing = !!user;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UserFormData>({
    defaultValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'MEMBER',
    },
  });

  const firstName = watch('firstName') || '';
  const lastName = watch('lastName') || '';
  const password = watch('password') || '';
  const confirmPassword = watch('confirmPassword') || '';

  const passwordStrength = useMemo(
    () => calculatePasswordStrength(password),
    [password]
  );

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        middleName: user.middleName || '',
        lastName: user.lastName,
        email: user.email,
        password: undefined,
        confirmPassword: undefined,
        role: user.role as 'MEMBER' | 'LIBRARIAN',
      });
    } else {
      reset({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'MEMBER',
      });
    }
  }, [user, reset]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open && !user) {
      reset({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'MEMBER',
      });
    }
  }, [open, user, reset]);

  const handleFormSubmit = async (data: UserFormData) => {
    // Check if there are changes when editing
    if (isEditing && user) {
      const hasChanges =
        data.firstName !== user.firstName ||
        (data.middleName || '') !== (user.middleName || '') ||
        data.lastName !== user.lastName;

      if (!hasChanges) {
        toast.info('Sin cambios', {
          description: 'No se detectaron cambios en el usuario',
        });
        onOpenChange(false);
        return;
      }
    }

    // Clean middleName: convert empty string to undefined
    const cleanedData = {
      ...data,
      middleName: data.middleName?.trim() || undefined,
    };

    try {
      setIsLoading(true);
      await onSubmit(cleanedData);
      onOpenChange(false);
      reset();
    } catch (error) {
      // Error is handled by parent component
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset({
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'MEMBER',
    });
    onOpenChange(false);
  };

  const getInitials = () => {
    if (!firstName || !lastName) return 'U';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar usuario' : 'Crear nuevo usuario'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica la información del usuario. Los cambios se guardarán al hacer clic en Guardar'
              : 'Completa el formulario para registrar un nuevo usuario en el sistema'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          {/* Avatar Preview */}
          <div className="flex justify-center">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* First name & Middle name fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">Primer nombre</Label>
              <Input
                id="firstName"
                {...register('firstName', {
                  required: 'El primer nombre es requerido',
                  minLength: {
                    value: 2,
                    message:
                      'El primer nombre debe tener al menos 2 caracteres',
                  },
                  maxLength: {
                    value: 50,
                    message: 'El primer nombre es demasiado largo',
                  },
                  pattern: {
                    value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                    message: 'El nombre solo puede contener letras y espacios',
                  },
                })}
                disabled={isLoading}
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
                {...register('middleName', {
                  validate: {
                    minLength: (value) => {
                      if (
                        value &&
                        value.trim().length > 0 &&
                        value.trim().length < 2
                      ) {
                        return 'El segundo nombre debe tener al menos 2 caracteres';
                      }
                      return true;
                    },
                  },
                  maxLength: {
                    value: 50,
                    message: 'El nombre es demasiado largo',
                  },
                  pattern: {
                    value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/,
                    message: 'El nombre solo puede contener letras y espacios',
                  },
                })}
                disabled={isLoading}
              />
              {errors.middleName && (
                <p className="text-sm text-destructive">
                  {errors.middleName.message}
                </p>
              )}
            </div>
          </div>

          {/* Last name & Role fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido(s)</Label>
              <Input
                id="lastName"
                {...register('lastName', {
                  required: 'El apellido es requerido',
                  minLength: {
                    value: 2,
                    message: 'El apellido debe tener al menos 2 caracteres',
                  },
                  maxLength: {
                    value: 50,
                    message: 'El apellido es demasiado largo',
                  },
                  pattern: {
                    value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                    message:
                      'El apellido solo puede contener letras y espacios',
                  },
                })}
                disabled={isLoading}
                aria-invalid={errors.lastName ? 'true' : 'false'}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select
                value={watch('role')}
                onValueChange={(value: 'MEMBER' | 'LIBRARIAN') =>
                  setValue('role', value)
                }
                disabled={isLoading || isEditing}
              >
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">Miembro</SelectItem>
                  <SelectItem value="LIBRARIAN">Bibliotecario</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-destructive">
                  {errors.role.message}
                </p>
              )}
            </div>
          </div>

          {/* Email field */}
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              {...register('email', {
                required: !isEditing
                  ? 'El correo electrónico es requerido'
                  : false,
                maxLength: {
                  value: 255,
                  message: 'El correo electrónico es demasiado largo',
                },
                pattern: !isEditing
                  ? {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Formato de correo electrónico inválido',
                    }
                  : undefined,
              })}
              disabled={isLoading || isEditing}
              autoComplete="email"
              aria-invalid={errors.email ? 'true' : 'false'}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Password fields (only for new users) */}
          {!isEditing && (
            <>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      {...register('password', {
                        required: 'La contraseña es requerida',
                        minLength: {
                          value: 8,
                          message:
                            'La contraseña debe tener al menos 8 caracteres',
                        },
                        validate: {
                          hasUpperCase: (value) =>
                            /[A-Z]/.test(value || '') ||
                            'La contraseña debe contener al menos una mayúscula',
                          hasLowerCase: (value) =>
                            /[a-z]/.test(value || '') ||
                            'La contraseña debe contener al menos una minúscula',
                          hasNumber: (value) =>
                            /[0-9]/.test(value || '') ||
                            'La contraseña debe contener al menos un número',
                          hasSpecialChar: (value) =>
                            /[!@#$%^&*(),.?":{}|<>]/.test(value || '') ||
                            'La contraseña debe contener al menos un símbolo especial',
                        },
                      })}
                      disabled={isLoading}
                      autoComplete="new-password"
                      aria-invalid={errors.password ? 'true' : 'false'}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-2">
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
                    <div className="pt-2">
                      <PasswordRequirements password={password} />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirmPassword', {
                        required: 'Debes confirmar la contraseña',
                        validate: (value) =>
                          value === password || 'Las contraseñas no coinciden',
                      })}
                      disabled={isLoading}
                      autoComplete="new-password"
                      aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : isEditing ? (
                'Guardar cambios'
              ) : (
                'Crear usuario'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
