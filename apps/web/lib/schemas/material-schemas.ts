import { z } from 'zod';

// Schema para autor existente (con ID)
export const existingAuthorSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  middleName: z.string().optional().nullable(),
  lastName: z.string(),
  nationality: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
});

// Schema para autor nuevo (sin ID)
export const newAuthorSchema = z.object({
  firstName: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  middleName: z
    .string()
    .max(100, 'El segundo nombre no puede exceder 100 caracteres')
    .optional(),
  lastName: z
    .string()
    .min(1, 'El apellido es requerido')
    .max(100, 'El apellido no puede exceder 100 caracteres'),
  nationality: z
    .string()
    .max(100, 'La nacionalidad no puede exceder 100 caracteres')
    .optional(),
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
  language: z
    .string()
    .min(1, 'El idioma es requerido')
    .max(50, 'El idioma no puede exceder 50 caracteres'),
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
  authors: z
    .array(newAuthorSchema)
    .min(1, 'Debe agregar al menos un autor')
    .max(10, 'No puede agregar más de 10 autores'),
  book: bookSchema.optional(),
});

export type AddBookMaterialFormData = z.infer<typeof addBookMaterialSchema>;
export type AuthorFormData = z.infer<typeof authorSchema>;
export type NewAuthorFormData = z.infer<typeof newAuthorSchema>;
export type ExistingAuthorFormData = z.infer<typeof existingAuthorSchema>;
export type BookFormData = z.infer<typeof bookSchema>;
