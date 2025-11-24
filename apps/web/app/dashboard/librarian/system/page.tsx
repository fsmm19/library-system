'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  X,
  Filter,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { materialsApi } from '@/lib/api/materials';
import { loansApi } from '@/lib/api/loans';
import { toast } from 'sonner';
import type {
  Category,
  Country,
  Publisher,
  Author,
  LoanConfiguration,
} from '@library/types';

type MasterDataType = 'category' | 'country' | 'publisher' | 'author';

const ITEMS_PER_PAGE = 10;

interface DialogState {
  open: boolean;
  mode: 'create' | 'edit';
  type: MasterDataType;
  item: { id: string; name: string } | null;
}

export default function SystemConfigPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loanConfig, setLoanConfig] = useState<LoanConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogState, setDialogState] = useState<DialogState>({
    open: false,
    mode: 'create',
    type: 'category',
    item: null,
  });
  const [formData, setFormData] = useState<{
    name: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    countryOfOriginId?: string;
    birthDate?: string;
  }>({ name: '' });
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    type: MasterDataType;
    item: { id: string; name: string };
  } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [categorySearch, setCategorySearch] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [publisherSearch, setPublisherSearch] = useState('');
  const [authorSearch, setAuthorSearch] = useState('');
  const [authorCountryFilter, setAuthorCountryFilter] = useState<string>('');
  const [currentPageCategories, setCurrentPageCategories] = useState(1);
  const [currentPageCountries, setCurrentPageCountries] = useState(1);
  const [currentPagePublishers, setCurrentPagePublishers] = useState(1);
  const [currentPageAuthors, setCurrentPageAuthors] = useState(1);
  const [formErrors, setFormErrors] = useState<{
    firstName?: string;
    lastName?: string;
  }>({});

  const sortItems = <T extends { name: string }>(
    items: T[],
    order: 'asc' | 'desc'
  ): T[] => {
    return [...items].sort((a, b) => {
      const comparison = a.name.localeCompare(b.name, 'es', {
        sensitivity: 'base',
      });
      return order === 'asc' ? comparison : -comparison;
    });
  };

  const sortAuthors = (authors: Author[], order: 'asc' | 'desc'): Author[] => {
    return [...authors].sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      const comparison = nameA.localeCompare(nameB, 'es', {
        sensitivity: 'base',
      });
      return order === 'asc' ? comparison : -comparison;
    });
  };

  const handleSortChange = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    setCategories(sortItems(categories, newOrder));
    setCountries(sortItems(countries, newOrder));
    setPublishers(sortItems(publishers, newOrder));
    setAuthors(sortAuthors(authors, newOrder));
  };

  useEffect(() => {
    loadAllData();
  }, [token]);

  useEffect(() => {
    setCurrentPageCategories(1);
  }, [categorySearch]);

  useEffect(() => {
    setCurrentPageCountries(1);
  }, [countrySearch]);

  useEffect(() => {
    setCurrentPagePublishers(1);
  }, [publisherSearch]);

  useEffect(() => {
    setCurrentPageAuthors(1);
  }, [authorSearch, authorCountryFilter]);

  const paginateItems = <T,>(items: T[], currentPage: number) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return items.slice(startIndex, endIndex);
  };

  const getTotalPages = (itemsLength: number) => {
    return Math.ceil(itemsLength / ITEMS_PER_PAGE);
  };

  const loadAllData = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const [
        categoriesData,
        countriesData,
        publishersData,
        authorsData,
        configData,
      ] = await Promise.all([
        materialsApi.getAllCategories(token),
        materialsApi.getAllCountries(token),
        materialsApi.getAllPublishers(token),
        materialsApi.getAllAuthors(token),
        loansApi.getConfiguration(token),
      ]);

      setCategories(sortItems(categoriesData, sortOrder));
      setCountries(sortItems(countriesData, sortOrder));
      setPublishers(sortItems(publishersData, sortOrder));
      setAuthors(sortAuthors(authorsData, sortOrder));
      setLoanConfig(configData);
    } catch (error) {
      console.error('Error loading master data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (
    mode: 'create' | 'edit',
    type: MasterDataType,
    item: { id: string; name: string } | null = null
  ) => {
    setDialogState({ open: true, mode, type, item });

    // Si estamos editando un autor, cargar todos sus datos
    if (mode === 'edit' && type === 'author' && item) {
      const author = authors.find((a) => a.id === item.id);
      if (author) {
        setFormData({
          name: item.name,
          firstName: author.firstName,
          middleName: author.middleName || '',
          lastName: author.lastName,
          countryOfOriginId: author.countryOfOriginId || '',
          birthDate: author.birthDate
            ? author.birthDate.split('T')[0]
            : undefined,
        });
      }
    } else {
      setFormData({ name: item?.name || '' });
    }
  };

  const handleCloseDialog = () => {
    setDialogState({
      open: false,
      mode: 'create',
      type: 'category',
      item: null,
    });
    setFormData({
      name: '',
      firstName: undefined,
      middleName: undefined,
      lastName: undefined,
      countryOfOriginId: undefined,
      birthDate: undefined,
    });
    setFormErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !formData.name.trim()) return;

    // Check if there are no changes in edit mode
    if (dialogState.mode === 'edit' && dialogState.item) {
      // Para autores, no verificar cambios aquí ya que tienen campos adicionales
      if (dialogState.type !== 'author') {
        if (formData.name.trim() === dialogState.item.name.trim()) {
          toast.info('No hay cambios para guardar');
          handleCloseDialog();
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      if (dialogState.mode === 'create') {
        // Create
        if (dialogState.type === 'category') {
          const newItem = await materialsApi.createCategory(formData, token);
          setCategories([...categories, newItem]);
          toast.success('Categoría creada correctamente');
        } else if (dialogState.type === 'country') {
          const newItem = await materialsApi.createCountry(formData, token);
          setCountries([...countries, newItem]);
          toast.success('País creado correctamente');
        } else {
          const newItem = await materialsApi.createPublisher(formData, token);
          setPublishers([...publishers, newItem]);
          toast.success('Editorial creada correctamente');
        }
      } else {
        // Edit
        if (!dialogState.item) return;

        if (dialogState.type === 'category') {
          const updated = await materialsApi.updateCategory(
            dialogState.item.id,
            formData,
            token
          );
          setCategories(
            categories.map((c) => (c.id === updated.id ? updated : c))
          );
          toast.success('Categoría actualizada correctamente');
        } else if (dialogState.type === 'country') {
          const updated = await materialsApi.updateCountry(
            dialogState.item.id,
            formData,
            token
          );
          setCountries(
            countries.map((c) => (c.id === updated.id ? updated : c))
          );
          toast.success('País actualizado correctamente');
        } else if (dialogState.type === 'publisher') {
          const updated = await materialsApi.updatePublisher(
            dialogState.item.id,
            formData,
            token
          );
          setPublishers(
            publishers.map((p) => (p.id === updated.id ? updated : p))
          );
          toast.success('Editorial actualizada correctamente');
        } else if (dialogState.type === 'author') {
          // Validar campos requeridos para autor
          const errors: { firstName?: string; lastName?: string } = {};

          if (!formData.firstName?.trim()) {
            errors.firstName = 'El primer nombre es obligatorio';
          } else if (formData.firstName.trim().length < 2) {
            errors.firstName =
              'El primer nombre debe tener al menos 2 caracteres';
          } else if (formData.firstName.trim().length > 50) {
            errors.firstName = 'El primer nombre es demasiado largo';
          } else if (
            !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.firstName.trim())
          ) {
            errors.firstName =
              'El nombre solo puede contener letras y espacios';
          }

          if (!formData.lastName?.trim()) {
            errors.lastName = 'El apellido es obligatorio';
          } else if (formData.lastName.trim().length < 2) {
            errors.lastName = 'El apellido debe tener al menos 2 caracteres';
          } else if (formData.lastName.trim().length > 50) {
            errors.lastName = 'El apellido es demasiado largo';
          } else if (
            !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.lastName.trim())
          ) {
            errors.lastName =
              'El apellido solo puede contener letras y espacios';
          }

          if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
          }

          setFormErrors({});
          const updated = await materialsApi.updateAuthor(
            dialogState.item.id,
            {
              firstName: formData.firstName!.trim(),
              middleName: formData.middleName?.trim() || '',
              lastName: formData.lastName!.trim(),
              countryOfOriginId: formData.countryOfOriginId || null,
              birthDate:
                formData.birthDate && formData.birthDate.trim() !== ''
                  ? `${formData.birthDate}T00:00:00.000Z`
                  : null,
            },
            token
          );
          setAuthors(authors.map((a) => (a.id === updated.id ? updated : a)));
          toast.success('Autor actualizado correctamente');
        }
      }

      handleCloseDialog();
    } catch (error: any) {
      toast.error(error?.message || 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeleteDialog = (
    type: MasterDataType,
    item: { id: string; name: string }
  ) => {
    setItemToDelete({ type, item });
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!token || !itemToDelete) return;

    setDeleting(true);
    try {
      if (itemToDelete.type === 'category') {
        await materialsApi.deleteCategory(itemToDelete.item.id, token);
        setCategories(categories.filter((c) => c.id !== itemToDelete.item.id));
        toast.success('Categoría eliminada correctamente');
      } else if (itemToDelete.type === 'country') {
        await materialsApi.deleteCountry(itemToDelete.item.id, token);
        setCountries(countries.filter((c) => c.id !== itemToDelete.item.id));
        toast.success('País eliminado correctamente');
      } else if (itemToDelete.type === 'publisher') {
        await materialsApi.deletePublisher(itemToDelete.item.id, token);
        setPublishers(publishers.filter((p) => p.id !== itemToDelete.item.id));
        toast.success('Editorial eliminada correctamente');
      } else if (itemToDelete.type === 'author') {
        await materialsApi.deleteAuthor(itemToDelete.item.id, token);
        setAuthors(authors.filter((a) => a.id !== itemToDelete.item.id));
        toast.success('Autor eliminado correctamente');
      }

      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error: any) {
      // Cerrar el diálogo y resetear el estado
      setDeleteDialogOpen(false);
      setItemToDelete(null);

      // Mostrar el error específico
      if (itemToDelete.type === 'category') {
        toast.error(error?.message || 'Error al eliminar la categoría');
      } else if (itemToDelete.type === 'country') {
        toast.error(error?.message || 'Error al eliminar el país');
      } else if (itemToDelete.type === 'publisher') {
        toast.error(error?.message || 'Error al eliminar la editorial');
      } else if (itemToDelete.type === 'author') {
        toast.error('Error al eliminar el autor', {
          description: error?.message,
        });
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveLoanConfig = async () => {
    if (!token || !loanConfig) return;

    // Normalizar valores vacíos a 0
    const normalizedConfig = {
      defaultLoanDays:
        typeof loanConfig.defaultLoanDays === 'string' &&
        loanConfig.defaultLoanDays === ''
          ? 0
          : Number(loanConfig.defaultLoanDays),
      maxActiveLoans:
        typeof loanConfig.maxActiveLoans === 'string' &&
        loanConfig.maxActiveLoans === ''
          ? 0
          : Number(loanConfig.maxActiveLoans),
      maxRenewals:
        typeof loanConfig.maxRenewals === 'string' &&
        loanConfig.maxRenewals === ''
          ? 0
          : Number(loanConfig.maxRenewals),
      gracePeriodDays:
        typeof loanConfig.gracePeriodDays === 'string' &&
        loanConfig.gracePeriodDays === ''
          ? 0
          : Number(loanConfig.gracePeriodDays),
      dailyFineAmount:
        typeof loanConfig.dailyFineAmount === 'string' &&
        loanConfig.dailyFineAmount === ''
          ? 0
          : Number(loanConfig.dailyFineAmount),
      allowLoansWithFines: loanConfig.allowLoansWithFines,
      reservationHoldDays:
        typeof loanConfig.reservationHoldDays === 'string' &&
        loanConfig.reservationHoldDays === ''
          ? 0
          : Number(loanConfig.reservationHoldDays),
    };

    // Validaciones
    if (
      normalizedConfig.defaultLoanDays < 1 ||
      normalizedConfig.defaultLoanDays > 365 ||
      isNaN(normalizedConfig.defaultLoanDays)
    ) {
      toast.error('Los días de préstamo deben estar entre 1 y 365');
      return;
    }

    if (
      normalizedConfig.maxActiveLoans < 1 ||
      normalizedConfig.maxActiveLoans > 50 ||
      isNaN(normalizedConfig.maxActiveLoans)
    ) {
      toast.error('El máximo de préstamos activos debe estar entre 1 y 50');
      return;
    }

    if (
      normalizedConfig.maxRenewals < 0 ||
      normalizedConfig.maxRenewals > 10 ||
      isNaN(normalizedConfig.maxRenewals)
    ) {
      toast.error('El máximo de renovaciones debe estar entre 0 y 10');
      return;
    }

    if (
      normalizedConfig.gracePeriodDays < 0 ||
      normalizedConfig.gracePeriodDays > 30 ||
      isNaN(normalizedConfig.gracePeriodDays)
    ) {
      toast.error('Los días de gracia deben estar entre 0 y 30');
      return;
    }

    if (
      normalizedConfig.dailyFineAmount < 0 ||
      normalizedConfig.dailyFineAmount > 100000 ||
      isNaN(normalizedConfig.dailyFineAmount)
    ) {
      toast.error('El monto de multa diaria debe estar entre 0 y 100,000');
      return;
    }

    if (
      normalizedConfig.reservationHoldDays < 1 ||
      normalizedConfig.reservationHoldDays > 30 ||
      isNaN(normalizedConfig.reservationHoldDays)
    ) {
      toast.error('Los días de espera de reservación deben estar entre 1 y 30');
      return;
    }

    setSavingConfig(true);
    try {
      const updated = await loansApi.updateConfiguration(
        normalizedConfig,
        token
      );
      setLoanConfig(updated);
      toast.success('Configuración guardada correctamente');
    } catch (error: any) {
      toast.error(error?.message || 'Error al guardar configuración');
    } finally {
      setSavingConfig(false);
    }
  };

  const renderPagination = (
    totalItems: number,
    currentPage: number,
    setCurrentPage: (page: number) => void
  ) => {
    const totalPages = getTotalPages(totalItems);
    const paginatedCount =
      Math.min(currentPage * ITEMS_PER_PAGE, totalItems) -
      (currentPage - 1) * ITEMS_PER_PAGE;

    return (
      <div className="flex items-center justify-between px-2 py-4">
        <p className="text-sm text-muted-foreground whitespace-nowrap">
          Mostrando {paginatedCount} de {totalItems} resultados
        </p>
        {totalPages > 1 ? (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={
                    currentPage === 1
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  className={
                    currentPage === totalPages
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        ) : (
          <div />
        )}
      </div>
    );
  };

  const renderTable = (
    items: Array<{ id: string; name: string }>,
    type: MasterDataType
  ) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <button
              onClick={handleSortChange}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              Nombre
              {sortOrder === 'asc' ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </button>
          </TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={2}
              className="text-center py-8 text-muted-foreground"
            >
              No hay registros
            </TableCell>
          </TableRow>
        ) : (
          items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenDialog('edit', type, item)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenDeleteDialog(type, item)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  const renderAuthorsTable = (authors: Author[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <button
              onClick={handleSortChange}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              Nombre completo
              {sortOrder === 'asc' ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </button>
          </TableHead>
          <TableHead>País de origen</TableHead>
          <TableHead>Fecha de nacimiento</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {authors.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={4}
              className="text-center py-8 text-muted-foreground"
            >
              No hay registros
            </TableCell>
          </TableRow>
        ) : (
          authors.map((author) => (
            <TableRow key={author.id}>
              <TableCell className="font-medium">
                {`${author.firstName}${
                  author.middleName ? ' ' + author.middleName : ''
                } ${author.lastName}`}
              </TableCell>
              <TableCell>
                {author.countryOfOrigin?.name || (
                  <span className="text-muted-foreground italic">-</span>
                )}
              </TableCell>
              <TableCell>
                {author.birthDate ? (
                  new Date(author.birthDate).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                ) : (
                  <span className="text-muted-foreground italic">-</span>
                )}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    handleOpenDialog('edit', 'author', {
                      id: author.id,
                      name: `${author.firstName}${
                        author.middleName ? ' ' + author.middleName : ''
                      } ${author.lastName}`,
                    })
                  }
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    handleOpenDeleteDialog('author', {
                      id: author.id,
                      name: `${author.firstName}${
                        author.middleName ? ' ' + author.middleName : ''
                      } ${author.lastName}`,
                    })
                  }
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Configuración del sistema
        </h1>
        <p className="text-muted-foreground mt-1">
          Gestiona los datos maestros del sistema
        </p>
      </div>

      <Tabs defaultValue="loans" className="space-y-4">
        <TabsList>
          <TabsTrigger value="loans">Préstamos</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
          <TabsTrigger value="countries">Países</TabsTrigger>
          <TabsTrigger value="publishers">Editoriales</TabsTrigger>
          <TabsTrigger value="authors">Autores</TabsTrigger>
        </TabsList>
        <TabsContent value="loans">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de préstamos y multas</CardTitle>
              <CardDescription>
                Configura las políticas de préstamos, renovaciones y multas del
                sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loanConfig && (
                <>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="defaultLoanDays">
                        Días de préstamo por defecto
                      </Label>
                      <Input
                        id="defaultLoanDays"
                        type="number"
                        min="1"
                        max="365"
                        value={loanConfig.defaultLoanDays}
                        onKeyDown={(e) => {
                          if (
                            e.key === '.' ||
                            e.key === ',' ||
                            e.key === 'e' ||
                            e.key === 'E'
                          ) {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => {
                          const value =
                            e.target.value === ''
                              ? ''
                              : parseInt(e.target.value);
                          setLoanConfig({
                            ...loanConfig,
                            defaultLoanDays: value as any,
                          });
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        Número de días que dura un préstamo (1-365)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxActiveLoans">
                        Máximo de préstamos activos
                      </Label>
                      <Input
                        id="maxActiveLoans"
                        type="number"
                        min="1"
                        max="50"
                        value={loanConfig.maxActiveLoans}
                        onKeyDown={(e) => {
                          if (
                            e.key === '.' ||
                            e.key === ',' ||
                            e.key === 'e' ||
                            e.key === 'E'
                          ) {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => {
                          const value =
                            e.target.value === ''
                              ? ''
                              : parseInt(e.target.value);
                          setLoanConfig({
                            ...loanConfig,
                            maxActiveLoans: value as any,
                          });
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        Cantidad máxima de préstamos activos por miembro (1-50)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxRenewals">
                        Máximo de renovaciones
                      </Label>
                      <Input
                        id="maxRenewals"
                        type="number"
                        min="0"
                        max="10"
                        value={loanConfig.maxRenewals}
                        onKeyDown={(e) => {
                          if (
                            e.key === '.' ||
                            e.key === ',' ||
                            e.key === 'e' ||
                            e.key === 'E'
                          ) {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => {
                          const value =
                            e.target.value === ''
                              ? ''
                              : parseInt(e.target.value);
                          setLoanConfig({
                            ...loanConfig,
                            maxRenewals: value as any,
                          });
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        Número máximo de veces que se puede renovar un préstamo
                        (0-10)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gracePeriodDays">Días de gracia</Label>
                      <Input
                        id="gracePeriodDays"
                        type="number"
                        min="0"
                        max="30"
                        value={loanConfig.gracePeriodDays}
                        onKeyDown={(e) => {
                          if (
                            e.key === '.' ||
                            e.key === ',' ||
                            e.key === 'e' ||
                            e.key === 'E'
                          ) {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => {
                          const value =
                            e.target.value === ''
                              ? ''
                              : parseInt(e.target.value);
                          setLoanConfig({
                            ...loanConfig,
                            gracePeriodDays: value as any,
                          });
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        Días de gracia antes de aplicar multas por retraso
                        (0-30)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dailyFineAmount">
                        Monto de multa diaria (COP)
                      </Label>
                      <Input
                        id="dailyFineAmount"
                        type="number"
                        min="0"
                        max="100000"
                        value={loanConfig.dailyFineAmount}
                        onKeyDown={(e) => {
                          if (
                            e.key === '.' ||
                            e.key === ',' ||
                            e.key === 'e' ||
                            e.key === 'E'
                          ) {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => {
                          const value =
                            e.target.value === ''
                              ? ''
                              : parseInt(e.target.value);
                          setLoanConfig({
                            ...loanConfig,
                            dailyFineAmount: value as any,
                          });
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        Monto que se cobra por cada día de retraso (0-100 000)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reservationHoldDays">
                        Días de espera de reservación
                      </Label>
                      <Input
                        id="reservationHoldDays"
                        type="number"
                        min="1"
                        max="30"
                        value={loanConfig.reservationHoldDays}
                        onKeyDown={(e) => {
                          if (
                            e.key === '.' ||
                            e.key === ',' ||
                            e.key === 'e' ||
                            e.key === 'E'
                          ) {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => {
                          const value =
                            e.target.value === ''
                              ? ''
                              : parseInt(e.target.value);
                          setLoanConfig({
                            ...loanConfig,
                            reservationHoldDays: value as any,
                          });
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        Días que una reserva lista permanece disponible antes de
                        expirar (1-30)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="allowLoansWithFines">
                            Permitir préstamos con multas
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Permitir que miembros con multas pendientes puedan
                            solicitar préstamos
                          </p>
                        </div>
                        <Switch
                          id="allowLoansWithFines"
                          checked={loanConfig.allowLoansWithFines}
                          onCheckedChange={(checked) =>
                            setLoanConfig({
                              ...loanConfig,
                              allowLoansWithFines: checked,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleSaveLoanConfig}
                    disabled={savingConfig}
                  >
                    {savingConfig ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      'Guardar configuración'
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Categorías</CardTitle>
                <CardDescription>
                  Gestiona las categorías de los materiales
                </CardDescription>
              </div>
              <Button onClick={() => handleOpenDialog('create', 'category')}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar categoría
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar categoría..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              {(() => {
                const filteredCategories = categories.filter((cat) =>
                  cat.name.toLowerCase().includes(categorySearch.toLowerCase())
                );
                return renderTable(
                  paginateItems(filteredCategories, currentPageCategories),
                  'category'
                );
              })()}
            </CardContent>
          </Card>
          {(() => {
            const filteredCategories = categories.filter((cat) =>
              cat.name.toLowerCase().includes(categorySearch.toLowerCase())
            );
            return renderPagination(
              filteredCategories.length,
              currentPageCategories,
              setCurrentPageCategories
            );
          })()}
        </TabsContent>

        <TabsContent value="countries">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Países</CardTitle>
                <CardDescription>
                  Gestiona los países de origen de los autores
                </CardDescription>
              </div>
              <Button onClick={() => handleOpenDialog('create', 'country')}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar país
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar país..."
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              {(() => {
                const filteredCountries = countries.filter((country) =>
                  country.name
                    .toLowerCase()
                    .includes(countrySearch.toLowerCase())
                );
                return renderTable(
                  paginateItems(filteredCountries, currentPageCountries),
                  'country'
                );
              })()}
            </CardContent>
          </Card>
          {(() => {
            const filteredCountries = countries.filter((country) =>
              country.name.toLowerCase().includes(countrySearch.toLowerCase())
            );
            return renderPagination(
              filteredCountries.length,
              currentPageCountries,
              setCurrentPageCountries
            );
          })()}
        </TabsContent>

        <TabsContent value="publishers">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Editoriales</CardTitle>
                <CardDescription>
                  Gestiona las editoriales de los libros
                </CardDescription>
              </div>
              <Button onClick={() => handleOpenDialog('create', 'publisher')}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar editorial
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar editorial..."
                  value={publisherSearch}
                  onChange={(e) => setPublisherSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              {(() => {
                const filteredPublishers = publishers.filter((publisher) =>
                  publisher.name
                    .toLowerCase()
                    .includes(publisherSearch.toLowerCase())
                );
                return renderTable(
                  paginateItems(filteredPublishers, currentPagePublishers),
                  'publisher'
                );
              })()}
            </CardContent>
          </Card>
          {(() => {
            const filteredPublishers = publishers.filter((publisher) =>
              publisher.name
                .toLowerCase()
                .includes(publisherSearch.toLowerCase())
            );
            return renderPagination(
              filteredPublishers.length,
              currentPagePublishers,
              setCurrentPagePublishers
            );
          })()}
        </TabsContent>

        <TabsContent value="authors">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Autores</CardTitle>
                <CardDescription>
                  Gestiona los autores de los materiales. Los autores se crean
                  automáticamente al agregar materiales.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar autor..."
                    value={authorSearch}
                    onChange={(e) => setAuthorSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select
                  value={authorCountryFilter}
                  onValueChange={setAuthorCountryFilter}
                >
                  <SelectTrigger className="w-[200px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Todos los países" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los países</SelectItem>
                    {countries.map((country) => (
                      <SelectItem key={country.id} value={country.id}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {(() => {
                const filteredAuthors = authors.filter((author) => {
                  const fullName = `${author.firstName}${
                    author.middleName ? ' ' + author.middleName : ''
                  } ${author.lastName}`.toLowerCase();
                  const matchesSearch = fullName.includes(
                    authorSearch.toLowerCase()
                  );
                  const matchesCountry =
                    !authorCountryFilter ||
                    authorCountryFilter === 'all' ||
                    author.countryOfOriginId === authorCountryFilter;
                  return matchesSearch && matchesCountry;
                });
                return renderAuthorsTable(
                  paginateItems(filteredAuthors, currentPageAuthors)
                );
              })()}
            </CardContent>
          </Card>
          {(() => {
            const filteredAuthors = authors.filter((author) => {
              const fullName = `${author.firstName}${
                author.middleName ? ' ' + author.middleName : ''
              } ${author.lastName}`.toLowerCase();
              const matchesSearch = fullName.includes(
                authorSearch.toLowerCase()
              );
              const matchesCountry =
                !authorCountryFilter ||
                authorCountryFilter === 'all' ||
                author.countryOfOriginId === authorCountryFilter;
              return matchesSearch && matchesCountry;
            });
            return renderPagination(
              filteredAuthors.length,
              currentPageAuthors,
              setCurrentPageAuthors
            );
          })()}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogState.open} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogState.mode === 'create' ? 'Agregar' : 'Editar'}{' '}
              {dialogState.type === 'category'
                ? 'categoría'
                : dialogState.type === 'country'
                ? 'país'
                : dialogState.type === 'publisher'
                ? 'editorial'
                : 'autor'}
            </DialogTitle>
            <DialogDescription>
              {dialogState.mode === 'create'
                ? 'Ingresa el nombre para crear un nuevo registro'
                : 'Modifica el nombre del registro'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {dialogState.type === 'author' && dialogState.mode === 'edit' ? (
                // Campos completos para editar autor
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">
                        Primer nombre{' '}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        value={formData.firstName || ''}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          });
                          if (formErrors.firstName) {
                            setFormErrors({
                              ...formErrors,
                              firstName: undefined,
                            });
                          }
                        }}
                        placeholder="Gabriel"
                        disabled={submitting}
                      />
                      {formErrors.firstName && (
                        <p className="text-sm text-destructive">
                          {formErrors.firstName}
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
                        value={formData.middleName || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            middleName: e.target.value,
                          })
                        }
                        placeholder="García"
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      Apellido(s) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, lastName: e.target.value });
                        if (formErrors.lastName) {
                          setFormErrors({ ...formErrors, lastName: undefined });
                        }
                      }}
                      placeholder="Márquez"
                      disabled={submitting}
                    />
                    {formErrors.lastName && (
                      <p className="text-sm text-destructive">
                        {formErrors.lastName}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="countryOfOriginId">País de origen</Label>
                      <div className="flex gap-2 items-center">
                        <div className="flex-1 min-w-0">
                          <Select
                            value={formData.countryOfOriginId || ''}
                            onValueChange={(value) =>
                              setFormData({
                                ...formData,
                                countryOfOriginId: value,
                              })
                            }
                            disabled={submitting}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Seleccionar país" />
                            </SelectTrigger>
                            <SelectContent>
                              {countries.map((country) => (
                                <SelectItem key={country.id} value={country.id}>
                                  {country.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {formData.countryOfOriginId && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                countryOfOriginId: undefined,
                              })
                            }
                            disabled={submitting}
                            className="shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="birthDate">Fecha de nacimiento</Label>
                      <div className="flex gap-2 items-center">
                        <div className="flex-1 min-w-0">
                          <DatePicker
                            value={formData.birthDate || ''}
                            onChange={(value: string | undefined) =>
                              setFormData({
                                ...formData,
                                birthDate: value || undefined,
                              })
                            }
                            placeholder="Seleccionar fecha"
                            disabled={submitting}
                            fromYear={1100}
                            toYear={new Date().getFullYear()}
                          />
                        </div>
                        {formData.birthDate && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setFormData({ ...formData, birthDate: undefined })
                            }
                            disabled={submitting}
                            className="shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                // Campo simple para categorías, países y editoriales
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ingresa el nombre"
                    disabled={submitting}
                    required
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : dialogState.mode === 'create' ? (
                  'Crear'
                ) : (
                  'Guardar cambios'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar "{itemToDelete?.item.name}"?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setItemToDelete(null);
              }}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
