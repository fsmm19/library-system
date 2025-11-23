'use client';

import AddMaterialDialog from '@/components/dashboard/materials/AddMaterialDialog';
import MaterialDetailsSheet, {
  MaterialWithStatus,
} from '@/components/dashboard/materials/MaterialDetailsSheet';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/hooks/useAuth';
import { materialsApi } from '@/lib/api/materials';
import {
  BookOpen,
  Edit,
  Eye,
  Filter,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

const typeLabels: Record<string, string> = {
  BOOK: 'Libro',
  MAGAZINE: 'Revista',
  DVD: 'DVD',
  OTHER: 'Otro',
};

export default function MaterialsPage() {
  const { token } = useAuth();
  const [materials, setMaterials] = useState<MaterialWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedMaterial, setSelectedMaterial] =
    useState<MaterialWithStatus | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] =
    useState<MaterialWithStatus | null>(null);

  // Fetch materials from API
  const fetchMaterials = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await materialsApi.search({}, token);
      setMaterials(
        response.materials.map((material) => ({
          ...material,
          description: material.description ?? undefined,
        }))
      );
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast.error('Error al cargar los materiales');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (material.authors &&
        material.authors.some(
          (author) =>
            `${author.firstName} ${author.lastName}`
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            (author.middleName &&
              `${author.firstName} ${author.middleName} ${author.lastName}`
                .toLowerCase()
                .includes(searchTerm.toLowerCase()))
        )) ||
      (material.book?.isbn13 &&
        material.book.isbn13.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === 'all' || material.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const handleDeleteMaterial = async () => {
    if (materialToDelete && token) {
      try {
        await materialsApi.delete(materialToDelete.id, token);
        setMaterials(materials.filter((m) => m.id !== materialToDelete.id));
        toast.success('Material eliminado correctamente');
        setMaterialToDelete(null);
      } catch (error) {
        console.error('Error deleting material:', error);
        toast.error('Error al eliminar el material');
      }
    }
  };

  const openDetails = (material: MaterialWithStatus) => {
    setSelectedMaterial(material);
    setIsDetailsOpen(true);
  };

  const handleAddMaterial = (newMaterial: MaterialWithStatus) => {
    setMaterials([newMaterial, ...materials]);
  };

  const refreshMaterials = useCallback(async () => {
    await fetchMaterials();
  }, [fetchMaterials]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Materiales</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona el catálogo de materiales bibliográficos
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar material
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, autor o ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="BOOK">Libro</SelectItem>
              <SelectItem value="MAGAZINE">Revista</SelectItem>
              <SelectItem value="DVD">DVD</SelectItem>
              <SelectItem value="OTHER">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card className="px-3.5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Autor(es)</TableHead>
              <TableHead>Año</TableHead>
              <TableHead>Idioma</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-12 w-12 opacity-50 animate-spin" />
                    <p>Cargando materiales...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredMaterials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-12 w-12 opacity-50" />
                    <p>No se encontraron materiales</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredMaterials.map((material) => {
                const authorsText = material.authors
                  ?.map(
                    (author) =>
                      `${author.firstName}${
                        author.middleName ? ' ' + author.middleName : ''
                      } ${author.lastName}`
                  )
                  .join(', ');

                return (
                  <TableRow key={material.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{material.title}</p>
                        {material.subtitle && (
                          <p className="text-sm text-muted-foreground">
                            {material.subtitle}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {typeLabels[material.type] || material.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{authorsText || '-'}</TableCell>
                    <TableCell>
                      {material.publishedDate
                        ? new Date(material.publishedDate).getFullYear()
                        : '-'}
                    </TableCell>
                    <TableCell className="capitalize">
                      {material.language || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menú</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openDetails(material)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              toast.info('Edición disponible próximamente')
                            }
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setMaterialToDelete(material)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Mostrando {filteredMaterials.length} de {materials.length} materiales
        </p>
      </div>

      {/* Sheets & Dialogs */}
      <AddMaterialDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddMaterial}
        onSuccess={refreshMaterials}
      />

      <MaterialDetailsSheet
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        material={selectedMaterial}
      />

      <ConfirmDialog
        open={!!materialToDelete}
        onOpenChange={(open) => !open && setMaterialToDelete(null)}
        title="¿Eliminar material?"
        description={`¿Estás seguro de que deseas eliminar "${materialToDelete?.title}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDeleteMaterial}
        variant="destructive"
        confirmText="Eliminar"
      />
    </div>
  );
}
