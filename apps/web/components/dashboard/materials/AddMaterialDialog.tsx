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
import { BookOpen, Disc, Loader2, Newspaper, Plus, Trash2, X } from 'lucide-react';
import { useFieldArray, useForm, Controller, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { MaterialWithStatus } from './MaterialDetailsSheet';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
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

interface AddMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (material: MaterialWithStatus) => void;
  onUpdate?: (material: MaterialWithStatus) => void;
  onSuccess?: () => void | Promise<void>;
  materialToEdit?: MaterialWithStatus | null;
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

const STORAGE_KEY = 'addMaterialFormDraft';

export default function AddMaterialDialog({
  open,
  onOpenChange,
  onAdd,
  onUpdate,
  onSuccess,
  materialToEdit,
}: AddMaterialDialogProps) {
  const { token } = useAuth();
  const [selectedType, setSelectedType] = useState<MaterialType>(null);
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
  const [authorModes, setAuthorModes] = useState<('new' | 'existing')[]>([
    'new',
  ]);
  const [selectedAuthorIds, setSelectedAuthorIds] = useState<string[]>(['']);
  const [formLoaded, setFormLoaded] = useState(false);

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
      language: 'ES',
      publishedDate: '',
      description: '',
      categories: [],
      authors: [
        {
          firstName: '',
          middleName: '',
          lastName: '',
          countryOfOriginId: '',
          birthDate: '',
        },
      ],
      book: {
        isbn13: '',
        edition: '',
        numberOfPages: undefined,
        publisherId: '',
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'authors',
  });

  // Watch all form values
  const watchedValues = useWatch({ control });

  // Load form data from localStorage on mount
  useEffect(() => {
    if (formLoaded) return;

    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);

        // Restore form values
        if (parsed.formData) {
          Object.keys(parsed.formData).forEach((key) => {
            setValue(key as any, parsed.formData[key]);
          });
        }

        // Restore author modes and selected IDs
        if (parsed.authorModes) {
          setAuthorModes(parsed.authorModes);
        }
        if (parsed.selectedAuthorIds) {
          setSelectedAuthorIds(parsed.selectedAuthorIds);
        }
      }
    } catch (error) {
      console.error('Error loading form draft:', error);
    } finally {
      setFormLoaded(true);
    }
  }, [formLoaded, setValue]);

  // Initialize form with materialToEdit data when it changes
  useEffect(() => {
    if (open && materialToEdit) {
      // Set type based on material type
      if (materialToEdit.type === 'BOOK') {
        setSelectedType('book');
      } else if (materialToEdit.type === 'MAGAZINE') {
        setSelectedType('magazine');
      } else if (materialToEdit.type === 'DVD') {
        setSelectedType('dvd');
      } else {
        setSelectedType('other');
      }

      // Prepare form data
      const formData: any = {
        title: materialToEdit.title,
        subtitle: materialToEdit.subtitle || '',
        language: (materialToEdit.language as any) || 'ES',
        publishedDate: materialToEdit.publishedDate ? new Date(materialToEdit.publishedDate).toISOString().split('T')[0] : '',
        description: materialToEdit.description || '',
        categories: materialToEdit.categories ? materialToEdit.categories.map(c => c.id) : [],
        book: {
          isbn13: '',
          edition: '',
          numberOfPages: undefined,
          publisherId: '',
        },
        authors: [],
      };

      // Set book details
      if (materialToEdit.book) {
        formData.book = {
          isbn13: materialToEdit.book.isbn13 || '',
          edition: materialToEdit.book.edition || '',
          numberOfPages: materialToEdit.book.numberOfPages || undefined,
          publisherId: materialToEdit.book.publisherId || '',
        };
      }

      // Set authors
      if (materialToEdit.authors && materialToEdit.authors.length > 0) {
        // Set author modes to 'existing' for all authors
        const modes = materialToEdit.authors.map(() => 'existing' as const);
        setAuthorModes(modes);
        
        // Set selected IDs
        const ids = materialToEdit.authors.map(a => a.id);
        setSelectedAuthorIds(ids);

        // Add authors to form data
        formData.authors = materialToEdit.authors.map(author => ({
          firstName: author.firstName,
          middleName: author.middleName || '',
          lastName: author.lastName,
          countryOfOriginId: author.countryOfOriginId || '',
          birthDate: author.birthDate || '',
        }));
      } else {
        // If no authors (which is allowed now), initialize with empty array
        // But if we want to show at least one empty row for UX, we could do that, 
        // but since we allow 0 authors, empty array is correct.
        formData.authors = [];
        setAuthorModes([]);
        setSelectedAuthorIds([]);
      }

      // Reset form with all data
      reset(formData);
    } else if (open && !materialToEdit) {
      // Reset if opening for new material
      // Only if we haven't loaded a draft (handled by other useEffect)
      if (!localStorage.getItem(STORAGE_KEY)) {
        setSelectedType(null);
        reset({
          title: '',
          subtitle: '',
          language: 'ES',
          publishedDate: '',
          description: '',
          categories: [],
          authors: [
            {
              firstName: '',
              middleName: '',
              lastName: '',
              countryOfOriginId: '',
              birthDate: '',
            },
          ],
          book: {
            isbn13: '',
            edition: '',
            numberOfPages: undefined,
            publisherId: '',
          },
        });
        setAuthorModes(['new']);
        setSelectedAuthorIds(['']);
      }
    }
  }, [open, materialToEdit, setValue, reset]);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (!formLoaded) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          formData: watchedValues,
          authorModes,
          selectedAuthorIds,
          timestamp: new Date().toISOString(),
        })
      );
    } catch (error) {
      console.error('Error saving form draft:', error);
    }
  }, [watchedValues, authorModes, selectedAuthorIds, formLoaded]);
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
        language: data.language as Language,
        publishedDate: data.publishedDate || undefined,
        description: data.description || undefined,
        categories:
          data.categories && data.categories.length > 0
            ? data.categories.map((id) => {
                const category = categories.find((c) => c.id === id);
                return { id, name: category?.name || '' };
              })
            : undefined,
        authors: data.authors.map((author, index) => {
          // Si hay un ID seleccionado, es un autor existente
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
          // Si no, es un autor nuevo
          return {
            firstName: author.firstName,
            middleName: author.middleName || undefined,
            lastName: author.lastName,
            countryOfOriginId: author.countryOfOriginId || undefined,
            birthDate: author.birthDate || undefined,
          };
        }),
        book:
          data.book?.isbn13 ||
          data.book?.edition ||
          data.book?.numberOfPages ||
          data.book?.publisherId
            ? {
                isbn13: data.book.isbn13 || undefined,
                edition: data.book.edition || undefined,
                numberOfPages: data.book.numberOfPages || undefined,
                publisherId: data.book.publisherId && data.book.publisherId !== '' ? data.book.publisherId : undefined,
              }
            : undefined,
      };

      let resultMaterial;

      if (materialToEdit) {
        // Update existing material
        const updatedMaterial = await materialsApi.update(materialToEdit.id, materialData, token);
        resultMaterial = updatedMaterial;
        
        if (onUpdate) {
          onUpdate(resultMaterial as MaterialWithStatus);
        }
        toast.success('Material actualizado correctamente');
      } else {
        // Create new material
        const createdMaterial = await materialsApi.create(materialData, token);
        resultMaterial = createdMaterial;
        
        if (onAdd) {
          onAdd(resultMaterial as MaterialWithStatus);
        }
        toast.success('Material agregado correctamente');
      }

      // Clear form and localStorage
      reset();
      setAuthorModes(['new']);
      setSelectedAuthorIds(['']);
      localStorage.removeItem(STORAGE_KEY);

      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.message || 'Error al agregar el material');
    }
  };

  // Load existing data when dialog opens and type is selected
  useEffect(() => {
    const loadData = async () => {
      if (open && selectedType === 'book' && token) {
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
  }, [open, selectedType, token]);

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

    // Clear selected author id and fields when switching mode
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
    // Solo volvemos a la selección de tipo, sin resetear los datos
    setSelectedType(null);
    onOpenChange(false);
  };

  const handleClearForm = () => {
    reset();
    setAuthorModes(['new']);
    setSelectedAuthorIds(['']);
    localStorage.removeItem(STORAGE_KEY);
    toast.info('Campos restablecidos');
  };

  // Reset selected type when dialog closes, but keep form data
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
              <DialogTitle>
                {materialToEdit ? 'Editar material' : 'Agregar nuevo material'}
              </DialogTitle>
              <DialogDescription>
                Seleccione el tipo de material que desea {materialToEdit ? 'editar' : 'agregar'} al catálogo
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
              <DialogTitle>
                {materialToEdit ? 'Editar libro' : 'Agregar nuevo libro'}
              </DialogTitle>
              <DialogDescription>
                {materialToEdit 
                  ? 'Modifique la información del libro' 
                  : 'Complete la información del libro que desea agregar al catálogo'}
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
                            <SelectValue placeholder="Seleccionar idioma" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ES">Español</SelectItem>
                            <SelectItem value="EN">Inglés</SelectItem>
                            <SelectItem value="FR">Francés</SelectItem>
                            <SelectItem value="DE">Alemán</SelectItem>
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
                            <SelectTrigger className="w-full">
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
                            <Combobox
                              options={existingAuthors.map((author) => ({
                                value: author.id,
                                label: `${author.firstName} ${
                                  author.middleName || ''
                                } ${author.lastName}`.trim(),
                              }))}
                              value={selectedAuthorIds[index] || ''}
                              onValueChange={(value) =>
                                handleExistingAuthorSelect(index, value)
                              }
                              placeholder="Buscar y seleccionar autor..."
                              searchPlaceholder="Buscar por nombre..."
                              emptyText="No se encontró ningún autor"
                              disabled={isSubmitting || loadingAuthors}
                            />
                          </div>
                        ) : (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`authors.${index}.firstName`}>
                                  Primer nombre
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
                                  Segundo nombre{' '}
                                  <span className="text-muted-foreground text-xs font-normal">
                                    (opcional)
                                  </span>
                                </Label>
                                <Input
                                  id={`authors.${index}.middleName`}
                                  placeholder="García"
                                  disabled={isSubmitting}
                                  {...register(`authors.${index}.middleName`)}
                                />
                                {errors.authors?.[index]?.middleName && (
                                  <p className="text-sm text-destructive">
                                    {errors.authors[index]?.middleName?.message}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`authors.${index}.lastName`}>
                                Apellido(s)
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
                                <Label
                                  htmlFor={`authors.${index}.countryOfOriginId`}
                                >
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
                                      fromYear={1100}
                                      toYear={new Date().getFullYear()}
                                    />
                                  )}
                                />
                                {errors.authors?.[index]?.countryOfOriginId && (
                                  <p className="text-sm text-destructive">
                                    {errors.authors[index]?.countryOfOriginId?.message}
                                  </p>
                                )}
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

                <div className="grid grid-cols-2 gap-4">
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
                        setValueAs: (value) => {
                          if (
                            value === '' ||
                            value === null ||
                            value === undefined
                          ) {
                            return undefined;
                          }
                          const num = Number(value);
                          return isNaN(num) ? undefined : num;
                        },
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

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <div className="flex gap-2 flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={isSubmitting}
                  >
                    Volver
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClearForm}
                    disabled={isSubmitting}
                  >
                    Limpiar campos
                  </Button>
                </div>
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
