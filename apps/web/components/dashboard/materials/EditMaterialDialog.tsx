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
import { Loader2, Plus, Trash2, X } from 'lucide-react';
import { useFieldArray, useForm, Controller, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { MaterialWithStatus } from './MaterialDetailsSheet';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { materialsApi } from '@/lib/api/materials';
import {
  Author,
  MaterialType as MaterialTypeEnum,
  Language,
} from '@library/types';
import { useAuth } from '@/contexts/AuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Combobox } from '@/components/ui/combobox';
import { Separator } from '@/components/ui/separator';

interface EditMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (material: MaterialWithStatus) => void;
  material: MaterialWithStatus;
}

export default function EditMaterialDialog({
  open,
  onOpenChange,
  onUpdate,
  material,
}: EditMaterialDialogProps) {
  const { token } = useAuth();
  const [existingAuthors, setExistingAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [countries, setCountries] = useState<{ id: string; name: string }[]>(
    []
  );
  const [publishers, setPublishers] = useState<{ id: string; name: string }[]>(
    []
  );
  const [loadingAuthors, setLoadingAuthors] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [authorModes, setAuthorModes] = useState<('new' | 'existing')[]>(() => {
    // Initialize with 'existing' for all authors from the material
    if (material.authors && material.authors.length > 0) {
      return material.authors.map(() => 'existing' as const);
    }
    return ['new'];
  });
  const [selectedAuthorIds, setSelectedAuthorIds] = useState<string[]>(() => {
    // Initialize with author IDs from the material
    if (material.authors && material.authors.length > 0) {
      return material.authors.map((a) => a.id);
    }
    return [''];
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddBookMaterialFormData>({
    resolver: zodResolver(addBookMaterialSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'authors',
  });

  // Reset isInitialized when dialog opens
  useEffect(() => {
    if (open) {
      setIsInitialized(false);
    }
  }, [open]);

  // Load existing data when dialog opens
  useEffect(() => {
    const loadData = async () => {
      if (open && token) {
        setLoadingAuthors(true);
        setLoadingData(true);
        try {
          const [authors, categoriesData, countriesData, publishersData] =
            await Promise.all([
              materialsApi.getAllAuthors(token),
              materialsApi.getAllCategories(token),
              materialsApi.getAllCountries(token),
              materialsApi.getAllPublishers(token),
            ]);
          setExistingAuthors(authors);
          setCategories(categoriesData);
          setCountries(countriesData);
          setPublishers(publishersData);
        } catch (error) {
          console.error('Error loading data:', error);
          toast.error('Error al cargar los datos');
        } finally {
          setLoadingAuthors(false);
          setLoadingData(false);
        }
      }
    };
    loadData();
  }, [open, token]);

  // Initialize form with material data AFTER categories are loaded
  useEffect(() => {
    if (!open || isInitialized || loadingData) return;

    // Prepare form data
    const formData: any = {
      title: material.title,
      subtitle: material.subtitle || '',
      language: (material.language as any) || 'ES',
      publishedDate: material.publishedDate
        ? material.publishedDate.split('T')[0]
        : '',
      description: material.description || '',
      categories: material.categories
        ? material.categories.map((c) => c.id)
        : [],
      book: {
        isbn13: '',
        edition: '',
        numberOfPages: undefined,
        publisherId: '',
      },
      authors: [],
    };

    // Set book details
    if (material.book) {
      formData.book = {
        isbn13: material.book.isbn13 || '',
        edition: material.book.edition || '',
        numberOfPages: material.book.numberOfPages || undefined,
        publisherId: material.book.publisherId || '',
      };
    }

    // Set authors
    if (material.authors && material.authors.length > 0) {
      const modes = material.authors.map(() => 'existing' as const);
      setAuthorModes(modes);

      const ids = material.authors.map((a) => a.id);
      setSelectedAuthorIds(ids);

      formData.authors = material.authors.map((author) => ({
        firstName: author.firstName,
        middleName: author.middleName || '',
        lastName: author.lastName,
        countryOfOriginId: author.countryOfOriginId || '',
        birthDate: author.birthDate || '',
      }));
    } else {
      formData.authors = [];
      setAuthorModes([]);
      setSelectedAuthorIds([]);
    }

    // Reset form with material data
    reset(formData);
    setIsInitialized(true);
  }, [open, material, reset, isInitialized, loadingData]);

  // Load existing data when dialog opens
  useEffect(() => {
    const loadData = async () => {
      if (open && token) {
        setLoadingAuthors(true);
        setLoadingData(true);
        try {
          const [authors, categoriesData, countriesData, publishersData] =
            await Promise.all([
              materialsApi.getAllAuthors(token),
              materialsApi.getAllCategories(token),
              materialsApi.getAllCountries(token),
              materialsApi.getAllPublishers(token),
            ]);
          setExistingAuthors(authors);
          setCategories(categoriesData);
          setCountries(countriesData);
          setPublishers(publishersData);
        } catch (error) {
          console.error('Error loading data:', error);
          toast.error('Error al cargar los datos');
        } finally {
          setLoadingAuthors(false);
          setLoadingData(false);
        }
      }
    };
    loadData();
  }, [open, token]);

  const onSubmit = async (data: AddBookMaterialFormData) => {
    if (!token) {
      toast.error('No se encontró el token de autenticación');
      return;
    }

    try {
      const materialData = {
        title: data.title,
        subtitle: data.subtitle || undefined,
        type: MaterialTypeEnum.BOOK,
        language: data.language as Language,
        publishedDate:
          data.publishedDate && data.publishedDate !== ''
            ? data.publishedDate
            : null,
        description: data.description || undefined,
        categories:
          data.categories && data.categories.length > 0
            ? data.categories.map((id) => {
                const category = categories.find((c) => c.id === id);
                return { id, name: category?.name || '' };
              })
            : undefined,
        authors: data.authors.map((author, index) => {
          if (selectedAuthorIds[index] && authorModes[index] === 'existing') {
            return {
              id: selectedAuthorIds[index],
              firstName: author.firstName,
              middleName: author.middleName || undefined,
              lastName: author.lastName,
              countryOfOriginId: author.countryOfOriginId || undefined,
              birthDate: author.birthDate || undefined,
            };
          }
          return {
            firstName: author.firstName,
            middleName: author.middleName || undefined,
            lastName: author.lastName,
            countryOfOriginId: author.countryOfOriginId || undefined,
            birthDate: author.birthDate || undefined,
          };
        }),
        book: {
          isbn13: data.book?.isbn13 || undefined,
          edition: data.book?.edition || undefined,
          numberOfPages:
            data.book?.numberOfPages !== undefined &&
            data.book?.numberOfPages !== null
              ? data.book.numberOfPages
              : null,
          publisherId:
            data.book?.publisherId && data.book.publisherId !== ''
              ? data.book.publisherId
              : undefined,
        },
      };

      const updatedMaterial = await materialsApi.update(
        material.id,
        materialData,
        token
      );

      onUpdate(updatedMaterial as MaterialWithStatus);
      toast.success('Material actualizado correctamente');

      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.message || 'Error al actualizar el material');
    }
  };

  const handleAddAuthor = () => {
    if (fields.length < 10) {
      append({
        firstName: '',
        middleName: '',
        lastName: '',
        countryOfOriginId: '',
        birthDate: '',
      });
      setAuthorModes([...authorModes, 'new']);
      setSelectedAuthorIds([...selectedAuthorIds, '']);
    }
  };

  const handleRemoveAuthor = (index: number) => {
    remove(index);
    setAuthorModes(authorModes.filter((_, i) => i !== index));
    setSelectedAuthorIds(selectedAuthorIds.filter((_, i) => i !== index));
  };

  const handleAuthorModeChange = (index: number, mode: 'new' | 'existing') => {
    const newModes = [...authorModes];
    newModes[index] = mode;
    setAuthorModes(newModes);

    const newSelectedIds = [...selectedAuthorIds];
    newSelectedIds[index] = '';
    setSelectedAuthorIds(newSelectedIds);

    setValue(`authors.${index}.firstName`, '');
    setValue(`authors.${index}.middleName`, '');
    setValue(`authors.${index}.lastName`, '');
    setValue(`authors.${index}.countryOfOriginId`, '');
    setValue(`authors.${index}.birthDate`, '');
  };

  const handleExistingAuthorSelect = (index: number, authorId: string) => {
    const author = existingAuthors.find((a) => a.id === authorId);
    if (author) {
      const newSelectedIds = [...selectedAuthorIds];
      newSelectedIds[index] = authorId;
      setSelectedAuthorIds(newSelectedIds);

      setValue(`authors.${index}.firstName`, author.firstName);
      setValue(`authors.${index}.middleName`, author.middleName || '');
      setValue(`authors.${index}.lastName`, author.lastName);
      setValue(
        `authors.${index}.countryOfOriginId`,
        author.countryOfOriginId || ''
      );
      setValue(`authors.${index}.birthDate`, author.birthDate || '');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar libro</DialogTitle>
          <DialogDescription>
            Modifique la información del libro
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
                <Controller
                  control={control}
                  name="language"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="language" className="w-full">
                        <SelectValue placeholder="Seleccione el idioma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ES">Español</SelectItem>
                        <SelectItem value="EN">Inglés</SelectItem>
                        <SelectItem value="FR">Francés</SelectItem>
                        <SelectItem value="DE">Alemán</SelectItem>
                        <SelectItem value="IT">Italiano</SelectItem>
                        <SelectItem value="PT">Portugués</SelectItem>
                        <SelectItem value="OTHER">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
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
                    <div className="flex gap-2 items-center">
                      <div className="flex-1 min-w-0">
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Seleccionar fecha"
                          disabled={isSubmitting}
                          fromYear={1400}
                          toYear={new Date().getFullYear() + 1}
                        />
                      </div>
                      {field.value && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => field.onChange('')}
                          disabled={isSubmitting}
                          className="shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
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
                rows={3}
                disabled={isSubmitting}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="categories">Categorías</Label>
              <Controller
                control={control}
                name="categories"
                render={({ field }) => (
                  <>
                    <Select
                      value={''}
                      onValueChange={(value) => {
                        const currentValues = field.value || [];
                        if (value && !currentValues.includes(value)) {
                          field.onChange([...currentValues, value]);
                        }
                      }}
                      disabled={isSubmitting || loadingData}
                    >
                      <SelectTrigger id="categories" className="w-full">
                        <SelectValue placeholder="Seleccionar categorías" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {field.value && field.value.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {field.value.map((catId: string) => {
                          const category = categories.find(
                            (c) => c.id === catId
                          );
                          return category ? (
                            <Badge
                              key={catId}
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() => {
                                field.onChange(
                                  (field.value || []).filter(
                                    (id: string) => id !== catId
                                  )
                                );
                              }}
                            >
                              {category.name} ✕
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    )}
                  </>
                )}
              />
              {errors.categories && (
                <p className="text-sm text-destructive">
                  {errors.categories.message}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Autores */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Autores
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddAuthor}
                disabled={isSubmitting || fields.length >= 10}
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar autor
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <Label>Autor {index + 1}</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveAuthor(index)}
                    disabled={isSubmitting}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Tipo de autor</Label>
                  <Select
                    value={authorModes[index] || 'existing'}
                    onValueChange={(value: 'new' | 'existing') =>
                      handleAuthorModeChange(index, value)
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Nuevo autor</SelectItem>
                      <SelectItem value="existing">Autor existente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {authorModes[index] === 'existing' ? (
                  <div className="space-y-2">
                    <Label>Seleccionar autor</Label>
                    <Combobox
                      options={existingAuthors
                        .filter((author) => {
                          // Filter out already selected authors except current index
                          return !selectedAuthorIds.some(
                            (id, i) => i !== index && id === author.id
                          );
                        })
                        .map((author) => ({
                          label: `${author.firstName} ${author.lastName}`,
                          value: author.id,
                        }))}
                      value={selectedAuthorIds[index] || ''}
                      onValueChange={(value) =>
                        handleExistingAuthorSelect(index, value)
                      }
                      placeholder="Buscar autor..."
                      searchPlaceholder="Buscar por nombre..."
                      emptyText="No se encontraron autores"
                      disabled={isSubmitting || loadingAuthors}
                    />
                  </div>
                ) : null}

                {authorModes[index] === 'new' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`authors.${index}.firstName`}>
                          Nombre <span className="text-destructive">*</span>
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
                          placeholder="José"
                          disabled={isSubmitting}
                          {...register(`authors.${index}.middleName`)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`authors.${index}.lastName`}>
                        Apellido <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={`authors.${index}.lastName`}
                        placeholder="García Márquez"
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
                        <Label htmlFor={`authors.${index}.countryOfOriginId`}>
                          País de origen
                        </Label>
                        <Controller
                          control={control}
                          name={`authors.${index}.countryOfOriginId`}
                          render={({ field }) => (
                            <Select
                              value={field.value || ''}
                              onValueChange={field.onChange}
                              disabled={isSubmitting || loadingData}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar país" />
                              </SelectTrigger>
                              <SelectContent>
                                {countries.map((country) => (
                                  <SelectItem
                                    key={country.id}
                                    value={country.id}
                                  >
                                    {country.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
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
                              fromYear={1400}
                              toYear={new Date().getFullYear()}
                            />
                          )}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          <Separator />

          {/* Detalles del Libro */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Detalles del Libro
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="book.isbn13">ISBN-13</Label>
                <Input
                  id="book.isbn13"
                  placeholder="978-3-16-148410-0"
                  disabled={isSubmitting}
                  {...register('book.isbn13')}
                />
                {errors.book?.isbn13 && (
                  <p className="text-sm text-destructive">
                    {errors.book.isbn13.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="book.edition">Edición</Label>
                <Input
                  id="book.edition"
                  placeholder="Primera edición"
                  disabled={isSubmitting}
                  {...register('book.edition')}
                />
                {errors.book?.edition && (
                  <p className="text-sm text-destructive">
                    {errors.book.edition.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="book.numberOfPages">Número de páginas</Label>
                <Input
                  id="book.numberOfPages"
                  type="number"
                  min="1"
                  placeholder="350"
                  disabled={isSubmitting}
                  {...register('book.numberOfPages', { valueAsNumber: true })}
                />
                {errors.book?.numberOfPages && (
                  <p className="text-sm text-destructive">
                    {errors.book.numberOfPages.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="book.publisherId">Editorial</Label>
                <Controller
                  control={control}
                  name="book.publisherId"
                  render={({ field }) => (
                    <div className="flex gap-2 items-center">
                      <div className="flex-1 min-w-0">
                        <Select
                          value={field.value || ''}
                          onValueChange={field.onChange}
                          disabled={isSubmitting || loadingData}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccionar editorial" />
                          </SelectTrigger>
                          <SelectContent>
                            {publishers.map((publisher) => (
                              <SelectItem
                                key={publisher.id}
                                value={publisher.id}
                              >
                                {publisher.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {field.value && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => field.onChange('')}
                          disabled={isSubmitting}
                          className="shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                />
                {errors.book?.publisherId && (
                  <p className="text-sm text-destructive">
                    {errors.book.publisherId.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
