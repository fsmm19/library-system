'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { materialCopiesApi } from '@/lib/api/material-copies';
import AddCopyDialog from '@/components/material-copies/AddCopyDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Loader2,
  Package,
  BookOpen,
} from 'lucide-react';
import {
  MaterialCopyWithDetails,
  MaterialCopyCondition,
  MaterialCopyStatus,
} from '@library/types';
import ConfirmDialog from '@/components/shared/ConfirmDialog';

const conditionLabels: Record<MaterialCopyCondition, string> = {
  NEW: 'Nuevo',
  GOOD: 'Bueno',
  FAIR: 'Regular',
  DAMAGED: 'Dañado',
  LOST: 'Perdido',
};

const statusLabels: Record<MaterialCopyStatus, string> = {
  AVAILABLE: 'Disponible',
  BORROWED: 'Prestado',
  RESERVED: 'Reservado',
  UNDER_REPAIR: 'En reparación',
  REMOVED: 'Retirado',
};

const conditionColors: Record<
  MaterialCopyCondition,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  NEW: 'default',
  GOOD: 'secondary',
  FAIR: 'outline',
  DAMAGED: 'destructive',
  LOST: 'destructive',
};

const statusColors: Record<
  MaterialCopyStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  AVAILABLE: 'default',
  BORROWED: 'secondary',
  RESERVED: 'outline',
  UNDER_REPAIR: 'destructive',
  REMOVED: 'destructive',
};

export default function CopiesPage() {
  const { token } = useAuth();
  const [copies, setCopies] = useState<MaterialCopyWithDetails[]>([]);
  const [filteredCopies, setFilteredCopies] = useState<
    MaterialCopyWithDetails[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [conditionFilter, setConditionFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [copyToDelete, setCopyToDelete] =
    useState<MaterialCopyWithDetails | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadCopies();
  }, [token]);

  useEffect(() => {
    filterCopies();
  }, [copies, searchQuery, statusFilter, conditionFilter]);

  const loadCopies = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const data = await materialCopiesApi.getAll(token);
      setCopies(data);
    } catch (error) {
      console.error('Error loading copies:', error);
      toast.error('Error al cargar las copias');
    } finally {
      setLoading(false);
    }
  };

  const filterCopies = () => {
    let filtered = [...copies];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (copy) =>
          copy.material.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          copy.material.authors?.some(
            (author) =>
              author.firstName
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              author.lastName.toLowerCase().includes(searchQuery.toLowerCase())
          ) ||
          copy.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((copy) => copy.status === statusFilter);
    }

    // Condition filter
    if (conditionFilter !== 'all') {
      filtered = filtered.filter((copy) => copy.condition === conditionFilter);
    }

    setFilteredCopies(filtered);
  };

  const handleAddCopy = (newCopy: MaterialCopyWithDetails) => {
    setCopies([newCopy, ...copies]);
    toast.success('Copia agregada correctamente');
  };

  const handleDeleteClick = (copy: MaterialCopyWithDetails) => {
    setCopyToDelete(copy);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!copyToDelete || !token) return;

    setDeleting(true);
    try {
      await materialCopiesApi.delete(copyToDelete.id, token);
      setCopies(copies.filter((c) => c.id !== copyToDelete.id));
      toast.success('Copia eliminada correctamente');
      setDeleteDialogOpen(false);
      setCopyToDelete(null);
    } catch (error) {
      console.error('Error deleting copy:', error);
      toast.error('Error al eliminar la copia');
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdateStatus = async (
    copyId: string,
    newStatus: MaterialCopyStatus
  ) => {
    if (!token) return;

    try {
      const updated = await materialCopiesApi.update(
        copyId,
        { status: newStatus },
        token
      );
      setCopies(copies.map((c) => (c.id === copyId ? updated : c)));
      toast.success('Estado actualizado correctamente');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  const stats = {
    total: copies.length,
    available: copies.filter((c) => c.status === 'AVAILABLE').length,
    borrowed: copies.filter((c) => c.status === 'BORROWED').length,
    underRepair: copies.filter((c) => c.status === 'UNDER_REPAIR').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de copias</h1>
          <p className="text-muted-foreground mt-1">
            Administre las copias físicas de los materiales del catálogo
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar copia
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de copias</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Disponibles</p>
              <p className="text-2xl font-bold">{stats.available}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Prestadas</p>
              <p className="text-2xl font-bold">{stats.borrowed}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">En reparación</p>
              <p className="text-2xl font-bold">{stats.underRepair}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, autor o ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {Object.entries(statusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={conditionFilter} onValueChange={setConditionFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filtrar por condición" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las condiciones</SelectItem>
            {Object.entries(conditionLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="px-3.5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Autores</TableHead>
              <TableHead>Fecha de adquisición</TableHead>
              <TableHead>Condición</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCopies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-muted-foreground">
                    No se encontraron copias
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredCopies.map((copy) => (
                <TableRow key={copy.id}>
                  <TableCell className="font-mono text-xs">
                    {copy.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell className="font-medium">
                    {copy.material.title}
                  </TableCell>
                  <TableCell>
                    {copy.material.authors && copy.material.authors.length > 0
                      ? copy.material.authors
                          .map(
                            (author) => `${author.firstName} ${author.lastName}`
                          )
                          .join(', ')
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {format(new Date(copy.acquisitionDate), 'PPP', {
                      locale: es,
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={conditionColors[copy.condition]}>
                      {conditionLabels[copy.condition]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[copy.status]}>
                      {statusLabels[copy.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            handleUpdateStatus(
                              copy.id,
                              MaterialCopyStatus.AVAILABLE
                            )
                          }
                          disabled={copy.status === 'AVAILABLE'}
                        >
                          Marcar como disponible
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleUpdateStatus(
                              copy.id,
                              MaterialCopyStatus.BORROWED
                            )
                          }
                          disabled={copy.status === 'BORROWED'}
                        >
                          Marcar como prestado
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleUpdateStatus(
                              copy.id,
                              MaterialCopyStatus.UNDER_REPAIR
                            )
                          }
                          disabled={copy.status === 'UNDER_REPAIR'}
                        >
                          Marcar en reparación
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(copy)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Add Dialog */}
      <AddCopyDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAddCopy}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Eliminar copia"
        description={`¿Está seguro de que desea eliminar esta copia del material "${copyToDelete?.material.title}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
      />
    </div>
  );
}
