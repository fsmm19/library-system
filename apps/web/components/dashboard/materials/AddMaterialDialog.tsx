'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AddBookMaterialFormData,
  addBookMaterialSchema,
} from '@/lib/schemas/material-schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpen, Disc, Loader2, Newspaper, Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { MaterialWithStatus } from './MaterialDetailsSheet';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { materialsApi } from '@/lib/api/materials';
import { Author, MaterialType as MaterialTypeEnum } from '@library/types';
import { useAuth } from '@/contexts/AuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';

interface AddMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (material: MaterialWithStatus) => void;
  onSuccess?: () => void | Promise<void>;
}

type MaterialType = 'book' | 'magazine' | 'dvd' | 'other' | null;

const materialTypes = [
  {
    type: 'book' as const,
    label: 'Libro',
    description: 'Agregar un libro al catálogo',
    icon: BookOpen,
    available: true,
  },
  {
    type: 'magazine' as const,
    label: 'Revista',
    description: 'Agregar una revista al catálogo',
    icon: Newspaper,
    available: false,
  },
  {
    type: 'dvd' as const,
    label: 'DVD',
    description: 'Agregar un DVD al catálogo',
    icon: Disc,
    available: false,
  },
];

export default function AddMaterialDialog({
  open,
  onOpenChange,
  onAdd,
  onSuccess,
}: AddMaterialDialogProps) {
  const { token } = useAuth();
  const [selectedType, setSelectedType] = useState<MaterialType>(null);
  const [existingAuthors, setExistingAuthors] = useState<Author[]>([]);
  const [loadingAuthors, setLoadingAuthors] = useState(false);
  const [authorModes, setAuthorModes] = useState<('new' | 'existing')[]>([
    'new',
  ]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddBookMaterialFormData>({
    resolver: zodResolver(addBookMaterialSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      language: 'Español',
      publishedDate: '',
      description: '',
      authors: [
        {
          firstName: '',
          middleName: '',
          lastName: '',
          nationality: '',
          birthDate: '',
        },
      ],
      book: {
        isbn13: '',
        edition: '',
        numberOfPages: undefined,
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'authors',
  });

  const onSubmit = async (data: AddBookMaterialFormData) => {
    if (!token) {
      toast.error('No se encontró el token de autenticación');
      return;
    }

    try {
      // Preparar los datos para la API
      const materialData = {
        title: data.title,
        subtitle: data.subtitle || undefined,
        type: MaterialTypeEnum.BOOK,
        language: data.language,
        publishedDate: data.publishedDate || undefined,
        description: data.description || undefined,
        authors: data.authors.map((author) => ({
          firstName: author.firstName,
          middleName: author.middleName || undefined,
          lastName: author.lastName,
          nationality: author.nationality || undefined,
          birthDate: author.birthDate || undefined,
        })),
        book:
          data.book?.isbn13 || data.book?.edition || data.book?.numberOfPages
            ? {
                isbn13: data.book.isbn13 || undefined,
                edition: data.book.edition || undefined,
                numberOfPages: data.book.numberOfPages || undefined,
              }
            : undefined,
      };

      // Crear el material en la API
      const createdMaterial = await materialsApi.create(materialData, token);

      // Agregar el material a la lista local
      onAdd(createdMaterial as MaterialWithStatus);

      // Refrescar la lista de materiales si existe el callback
      if (onSuccess) {
        await onSuccess();
      }

      toast.success('Material agregado correctamente');
      reset();
      setAuthorModes(['new']);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.message || 'Error al agregar el material');
      console.error(error);
    }
  };

  // Load existing authors when dialog opens and type is selected
  useEffect(() => {
    const loadAuthors = async () => {
      if (open && selectedType === 'book' && token) {
        setLoadingAuthors(true);
        try {
          const authors = await materialsApi.getAllAuthors(token);
          setExistingAuthors(authors);
        } catch (error) {
          console.error('Error loading authors:', error);
          toast.error('Error al cargar los autores');
        } finally {
          setLoadingAuthors(false);
        }
      }
    };
    loadAuthors();
  }, [open, selectedType, token]);

  const handleAddAuthor = () => {
    if (fields.length < 10) {
      append({
        firstName: '',
        middleName: '',
        lastName: '',
        nationality: '',
        birthDate: '',
      });
      setAuthorModes([...authorModes, 'new']);
    }
  };

  const handleRemoveAuthor = (index: number) => {
    if (fields.length > 1) {
      remove(index);
      setAuthorModes(authorModes.filter((_, i) => i !== index));
    } else {
      toast.error('Debe haber al menos un autor');
    }
  };

  const handleAuthorModeChange = (index: number, mode: 'new' | 'existing') => {
    const newModes = [...authorModes];
    newModes[index] = mode;
    setAuthorModes(newModes);

    // Clear author fields when switching mode
    setValue(`authors.${index}.firstName`, '');
    setValue(`authors.${index}.middleName`, '');
    setValue(`authors.${index}.lastName`, '');
    setValue(`authors.${index}.nationality`, '');
    setValue(`authors.${index}.birthDate`, '');
  };

  const handleExistingAuthorSelect = (index: number, authorId: string) => {
    const author = existingAuthors.find((a) => a.id === authorId);
    if (author) {
      setValue(`authors.${index}.firstName`, author.firstName);
      setValue(`authors.${index}.middleName`, author.middleName || '');
      setValue(`authors.${index}.lastName`, author.lastName);
      setValue(`authors.${index}.nationality`, author.nationality || '');
      setValue(`authors.${index}.birthDate`, author.birthDate || '');
    }
  };

  const handleTypeSelect = (type: MaterialType) => {
    if (!type) return;

    const materialType = materialTypes.find((mt) => mt.type === type);

    if (materialType && !materialType.available) {
      toast.info('Funcionalidad en desarrollo', {
        description: `La creación de materiales tipo "${materialType.label}" estará disponible próximamente`,
      });
      return;
    }

    setSelectedType(type);
  };

  const handleBack = () => {
    setSelectedType(null);
  };

  const handleClose = () => {
    setSelectedType(null);
    setAuthorModes(['new']);
    reset();
    onOpenChange(false);
  };

  // Reset selected type when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedType(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {!selectedType ? (
          <>
            <DialogHeader>
              <DialogTitle>Agregar nuevo material</DialogTitle>
              <DialogDescription>
                Seleccione el Tipo de material que desea agregar al catálogo
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6">
              {materialTypes.map((materialType) => {
                const Icon = materialType.icon;
                return (
                  <Card
                    key={materialType.type}
                    className={`p-6 cursor-pointer transition-all hover:shadow-md hover:border-primary ${
                      !materialType.available ? 'opacity-60' : ''
                    }`}
                    onClick={() => handleTypeSelect(materialType.type)}
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{materialType.label}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {materialType.description}
                        </p>
                      </div>
                      {!materialType.available && (
                        <span className="text-xs text-muted-foreground italic">
                          Próximamente
                        </span>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Agregar nuevo libro</DialogTitle>
              <DialogDescription>
                Complete la información del libro que desea agregar al catálogo
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Información General */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Información General
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="title">
                    Título <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Cien años de soledad"
                    disabled={isSubmitting}
                    {...register('title')}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtítulo</Label>
                  <Input
                    id="subtitle"
                    placeholder="Opcional"
                    disabled={isSubmitting}
                    {...register('subtitle')}
                  />
                  {errors.subtitle && (
                    <p className="text-sm text-destructive">
                      {errors.subtitle.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">
                      Idioma <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="language"
                      placeholder="Español"
                      disabled={isSubmitting}
                      {...register('language')}
                    />
                    {errors.language && (
                      <p className="text-sm text-destructive">
                        {errors.language.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="publishedDate">Fecha de publicación</Label>
                    <Controller
                      control={control}
                      name="publishedDate"
                      render={({ field }) => (
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Seleccionar fecha"
                          disabled={isSubmitting}
                          fromYear={1400}
                          toYear={new Date().getFullYear() + 1}
                        />
                      )}
                    />
                    {errors.publishedDate && (
                      <p className="text-sm text-destructive">
                        {errors.publishedDate.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    placeholder="Breve descripción del libro..."
                    disabled={isSubmitting}
                    rows={3}
                    {...register('description')}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Autores */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Autores <span className="text-destructive">*</span>
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddAuthor}
                    disabled={isSubmitting || fields.length >= 10}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar autor
                  </Button>
                </div>

                {errors.authors &&
                  typeof errors.authors.message === 'string' && (
                    <p className="text-sm text-destructive">
                      {errors.authors.message}
                    </p>
                  )}

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <Card key={field.id} className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium">
                            Autor {index + 1}
                          </h4>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveAuthor(index)}
                              disabled={isSubmitting}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`authors.${index}.mode`}>
                            Selección de autor
                          </Label>
                          <Select
                            value={authorModes[index] || 'new'}
                            onValueChange={(value) =>
                              handleAuthorModeChange(
                                index,
                                value as 'new' | 'existing'
                              )
                            }
                            disabled={isSubmitting || loadingAuthors}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">
                                Crear nuevo autor
                              </SelectItem>
                              <SelectItem value="existing">
                                Seleccionar autor existente
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {authorModes[index] === 'existing' ? (
                          <div className="space-y-2">
                            <Label htmlFor={`authors.${index}.select`}>
                              Autor <span className="text-destructive">*</span>
                            </Label>
                            <Select
                              onValueChange={(value) =>
                                handleExistingAuthorSelect(index, value)
                              }
                              disabled={isSubmitting || loadingAuthors}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar autor" />
                              </SelectTrigger>
                              <SelectContent>
                                {existingAuthors.map((author) => (
                                  <SelectItem key={author.id} value={author.id}>
                                    {author.firstName} {author.middleName || ''}{' '}
                                    {author.lastName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`authors.${index}.firstName`}>
                                  Nombre{' '}
                                  <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                  id={`authors.${index}.firstName`}
                                  placeholder="Gabriel"
                                  disabled={isSubmitting}
                                  {...register(`authors.${index}.firstName`)}
                                />
                                {errors.authors?.[index]?.firstName && (
                                  <p className="text-sm text-destructive">
                                    {errors.authors[index]?.firstName?.message}
                                  </p>
                                )}
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`authors.${index}.middleName`}>
                                  Segundo nombre
                                </Label>
                                <Input
                                  id={`authors.${index}.middleName`}
                                  placeholder="García"
                                  disabled={isSubmitting}
                                  {...register(`authors.${index}.middleName`)}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`authors.${index}.lastName`}>
                                Apellido{' '}
                                <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id={`authors.${index}.lastName`}
                                placeholder="Márquez"
                                disabled={isSubmitting}
                                {...register(`authors.${index}.lastName`)}
                              />
                              {errors.authors?.[index]?.lastName && (
                                <p className="text-sm text-destructive">
                                  {errors.authors[index]?.lastName?.message}
                                </p>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`authors.${index}.nationality`}>
                                  Nacionalidad
                                </Label>
                                <Input
                                  id={`authors.${index}.nationality`}
                                  placeholder="Colombiano"
                                  disabled={isSubmitting}
                                  {...register(`authors.${index}.nationality`)}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`authors.${index}.birthDate`}>
                                  Fecha de nacimiento
                                </Label>
                                <Controller
                                  control={control}
                                  name={`authors.${index}.birthDate`}
                                  render={({ field }) => (
                                    <DatePicker
                                      value={field.value}
                                      onChange={field.onChange}
                                      placeholder="Seleccionar fecha"
                                      disabled={isSubmitting}
                                      fromYear={1800}
                                      toYear={new Date().getFullYear()}
                                    />
                                  )}
                                />
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Información del Libro */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Información del Libro
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="book.isbn13">ISBN-13</Label>
                  <Input
                    id="book.isbn13"
                    placeholder="9780307474728"
                    disabled={isSubmitting}
                    maxLength={13}
                    {...register('book.isbn13')}
                  />
                  {errors.book?.isbn13 && (
                    <p className="text-sm text-destructive">
                      {errors.book.isbn13.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="book.edition">Edición</Label>
                    <Input
                      id="book.edition"
                      placeholder="1era edición"
                      disabled={isSubmitting}
                      {...register('book.edition')}
                    />
                    {errors.book?.edition && (
                      <p className="text-sm text-destructive">
                        {errors.book.edition.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="book.numberOfPages">
                      Número de páginas
                    </Label>
                    <Input
                      id="book.numberOfPages"
                      type="number"
                      placeholder="417"
                      disabled={isSubmitting}
                      {...register('book.numberOfPages', {
                        valueAsNumber: true,
                      })}
                    />
                    {errors.book?.numberOfPages && (
                      <p className="text-sm text-destructive">
                        {errors.book.numberOfPages.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  Volver
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Agregando...
                    </>
                  ) : (
                    'Agregar libro'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
