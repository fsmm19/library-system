import { z } from 'zod';

// Schema para autor existente (con ID)
export const existingAuthorSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  middleName: z.string().optional().nullable(),
  lastName: z.string(),
  countryOfOriginId: z.string().uuid().optional().nullable(),
  birthDate: z.string().optional().nullable(),
});

// Schema para autor nuevo (sin ID)
export const newAuthorSchema = z.object({
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
    .max(50, 'El segundo nombre es demasiado largo')
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
    .max(50, 'El apellido es demasiado largo')
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      'El apellido solo puede contener letras y espacios'
    ),
  countryOfOriginId: z.string().uuid('ID de país inválido').optional().or(z.literal('')),
  birthDate: z.string().optional(),
});

// Schema para autor en el formulario (puede ser existente o nuevo)
export const authorSchema = z.union([existingAuthorSchema, newAuthorSchema]);

// Schema para libro
export const bookSchema = z.object({
  isbn13: z
    .string()
    .regex(/^[0-9]{13}$/, 'El ISBN-13 debe tener exactamente 13 dígitos')
    .optional()
    .or(z.literal('')),
  edition: z
    .string()
    .max(100, 'La edición no puede exceder 100 caracteres')
    .optional(),
  numberOfPages: z
    .number()
    .int('El número de páginas debe ser un entero')
    .positive('El número de páginas debe ser positivo')
    .optional()
    .nullable(),
  publisherId: z.string().uuid('ID de editorial inválido').optional().or(z.literal('')),
});

// Schema para agregar material tipo libro
export const addBookMaterialSchema = z.object({
  title: z
    .string()
    .min(1, 'El título es requerido')
    .max(500, 'El título no puede exceder 500 caracteres'),
  subtitle: z
    .string()
    .max(500, 'El subtítulo no puede exceder 500 caracteres')
    .optional(),
  language: z.enum(['EN', 'ES', 'FR', 'DE', 'OTHER']),
  publishedDate: z
    .string()
    .refine((date) => !date || !isNaN(Date.parse(date)), {
      message: 'Fecha inválida',
    })
    .optional(),
  description: z
    .string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .optional(),
  categories: z.array(z.string().uuid()).optional(),
  authors: z
    .array(newAuthorSchema)
    .max(10, 'No puede agregar más de 10 autores'),
  book: bookSchema.optional(),
});

export type AddBookMaterialFormData = z.infer<typeof addBookMaterialSchema>;
export type AuthorFormData = z.infer<typeof authorSchema>;
export type NewAuthorFormData = z.infer<typeof newAuthorSchema>;
export type ExistingAuthorFormData = z.infer<typeof existingAuthorSchema>;
export type BookFormData = z.infer<typeof bookSchema>;
