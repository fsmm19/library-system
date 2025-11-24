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
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
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
  const [formData, setFormData] = useState({ name: '' });
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    type: MasterDataType;
    item: { id: string; name: string };
  } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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
    setFormData({ name: item?.name || '' });
  };

  const handleCloseDialog = () => {
    setDialogState({
      open: false,
      mode: 'create',
      type: 'category',
      item: null,
    });
    setFormData({ name: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !formData.name.trim()) return;

    // Check if there are no changes in edit mode
    if (dialogState.mode === 'edit' && dialogState.item) {
      if (formData.name.trim() === dialogState.item.name.trim()) {
        toast.info('No hay cambios para guardar');
        handleCloseDialog();
        return;
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
          const updated = await materialsApi.updateAuthor(
            dialogState.item.id,
            { firstName: formData.name, lastName: '' },
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
            <CardContent>{renderTable(categories, 'category')}</CardContent>
          </Card>
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
            <CardContent>{renderTable(countries, 'country')}</CardContent>
          </Card>
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
            <CardContent>{renderTable(publishers, 'publisher')}</CardContent>
          </Card>
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
            <CardContent>
              {renderTable(
                authors.map((a) => ({
                  id: a.id,
                  name: `${a.firstName}${
                    a.middleName ? ' ' + a.middleName : ''
                  } ${a.lastName}`,
                })),
                'author'
              )}
            </CardContent>
          </Card>
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
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  placeholder="Ingresa el nombre"
                  disabled={submitting}
                  required
                />
              </div>
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
