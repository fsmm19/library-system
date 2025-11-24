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
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { materialsApi } from '@/lib/api/materials';
import { toast } from 'sonner';
import type { Category, Country, Publisher } from '@library/types';

type MasterDataType = 'category' | 'country' | 'publisher';

interface DialogState {
  open: boolean;
  mode: 'create' | 'edit';
  type: MasterDataType;
  item: { id: string; name: string } | null;
}

export default function SettingsPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
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

  useEffect(() => {
    loadAllData();
  }, [token]);

  const loadAllData = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const [categoriesData, countriesData, publishersData] = await Promise.all(
        [
          materialsApi.getAllCategories(token),
          materialsApi.getAllCountries(token),
          materialsApi.getAllPublishers(token),
        ]
      );

      setCategories(categoriesData);
      setCountries(countriesData);
      setPublishers(publishersData);
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
        } else {
          const updated = await materialsApi.updatePublisher(
            dialogState.item.id,
            formData,
            token
          );
          setPublishers(
            publishers.map((p) => (p.id === updated.id ? updated : p))
          );
          toast.success('Editorial actualizada correctamente');
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
      } else {
        await materialsApi.deletePublisher(itemToDelete.item.id, token);
        setPublishers(publishers.filter((p) => p.id !== itemToDelete.item.id));
        toast.success('Editorial eliminada correctamente');
      }

      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error: any) {
      toast.error(error?.message || 'Error al eliminar');
    } finally {
      setDeleting(false);
    }
  };

  const renderTable = (
    items: Array<{ id: string; name: string }>,
    type: MasterDataType
  ) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
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
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona los datos maestros del sistema
        </p>
      </div>

      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
          <TabsTrigger value="countries">Países</TabsTrigger>
          <TabsTrigger value="publishers">Editoriales</TabsTrigger>
        </TabsList>

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
                : 'editorial'}
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
