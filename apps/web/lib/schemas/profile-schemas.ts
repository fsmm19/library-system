import { z } from 'zod';

// Schema para información personal
export const personalInfoSchema = z.object({
  firstName: z
    .string()
    .min(1, 'El primer nombre es requerido')
    .min(2, 'El primer nombre debe tener al menos 2 caracteres')
    .max(100, 'El primer nombre es demasiado largo')
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      'El nombre solo puede contener letras y espacios'
    ),
  middleName: z
    .string()
    .max(100, 'El nombre es demasiado largo')
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/,
      'El nombre solo puede contener letras y espacios'
    )
    .refine(
      (val) => !val || val.trim().length === 0 || val.trim().length >= 2,
      { message: 'El segundo nombre debe tener al menos 2 caracteres' }
    )
    .optional()
    .or(z.literal('')),
  lastName: z
    .string()
    .min(1, 'El apellido es requerido')
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(100, 'El apellido es demasiado largo')
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      'El apellido solo puede contener letras y espacios'
    ),
  phone: z
    .string()
    .regex(/^\+?[0-9]{10,15}$/, 'Formato inválido (ej: +1234567890)')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .max(200, 'Máximo 200 caracteres')
    .optional()
    .or(z.literal('')),
});

export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

// Schema para cambio de contraseña
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
    newPassword: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .regex(/[a-z]/, 'Debe contener al menos una minúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número')
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        'Debe contener al menos un símbolo especial'
      ),
    confirmPassword: z.string().min(1, 'Debes confirmar la contraseña'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'La nueva contraseña debe ser diferente a la actual',
    path: ['newPassword'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// Schema para preferencias
export const preferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  language: z.enum(['es', 'en']),
  dateFormat: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']),
  timezone: z.string(),
  notifications: z.boolean().default(true),
});

export type PreferencesFormData = z.infer<typeof preferencesSchema>;
