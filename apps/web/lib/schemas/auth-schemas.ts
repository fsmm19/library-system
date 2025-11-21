import { z } from 'zod';

// Login schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Formato de correo electrónico inválido')
    .max(255, 'El correo electrónico es demasiado largo'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Formato de correo electrónico inválido')
    .max(255, 'El correo electrónico es demasiado largo'),
});

// Register Member schema
export const registerMemberSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'El primer nombre es requerido')
      .min(2, 'El primer nombre debe tener al menos 2 caracteres')
      .max(50, 'El primer nombre es demasiado largo')
      .regex(
        /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
        'El nombre solo puede contener letras y espacios'
      ),
    middleName: z
      .string()
      .max(50, 'El nombre es demasiado largo')
      .regex(
        /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/,
        'El nombre solo puede contener letras y espacios'
      )
      .optional()
      .or(z.literal('')),
    lastName: z
      .string()
      .min(1, 'El apellido es requerido')
      .min(2, 'El apellido debe tener al menos 2 caracteres')
      .max(50, 'El apellido es demasiado largo')
      .regex(
        /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
        'El apellido solo puede contener letras y espacios'
      ),
    email: z
      .string()
      .min(1, 'El correo electrónico es requerido')
      .email('Formato de correo electrónico inválido')
      .max(255, 'El correo electrónico es demasiado largo'),
    password: z
      .string()
      .min(1, 'La contraseña es requerida')
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
      .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
      .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        'La contraseña debe contener al menos un símbolo especial'
      ),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type RegisterMemberFormData = z.infer<typeof registerMemberSchema>;
