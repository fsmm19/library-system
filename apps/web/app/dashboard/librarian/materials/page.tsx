'use client';

import AddMaterialDialog from '@/components/dashboard/materials/AddMaterialDialog';
import EditMaterialDialog from '@/components/dashboard/materials/EditMaterialDialog';
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
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
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
import { getLanguageLabel } from '@/lib/utils/catalog-utils';

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
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [selectedMaterial, setSelectedMaterial] =
    useState<MaterialWithStatus | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] =
    useState<MaterialWithStatus | null>(null);
  const [materialToEdit, setMaterialToEdit] =
    useState<MaterialWithStatus | null>(null);
  const [sortColumn, setSortColumn] = useState<
    'title' | 'author' | 'publishedDate' | 'createdAt' | null
  >('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

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
          authors: material.authors
            ? [...material.authors].sort((a, b) => {
                const nameA = `${a.lastName} ${a.firstName}`.toLowerCase();
                const nameB = `${b.lastName} ${b.firstName}`.toLowerCase();
                return nameA.localeCompare(nameB);
              })
            : material.authors,
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

    const matchesCategory =
      categoryFilter === 'all' ||
      (material.categories &&
        material.categories.some((cat) => cat.id === categoryFilter));

    const matchesLanguage =
      languageFilter === 'all' || material.language === languageFilter;

    return matchesSearch && matchesType && matchesCategory && matchesLanguage;
  });

  // Sort materials
  const sortedMaterials = [...filteredMaterials].sort((a, b) => {
    if (!sortColumn) return 0;

    let compareValue = 0;

    switch (sortColumn) {
      case 'title':
        compareValue = a.title.localeCompare(b.title);
        break;
      case 'author': {
        const authorA = a.authors?.[0]
          ? `${a.authors[0].firstName} ${a.authors[0].lastName}`
          : '';
        const authorB = b.authors?.[0]
          ? `${b.authors[0].firstName} ${b.authors[0].lastName}`
          : '';

        // Handle empty values: put them at the end in ascending order
        if (!authorA && !authorB) {
          compareValue = 0;
        } else if (!authorA) {
          compareValue = 1;
        } else if (!authorB) {
          compareValue = -1;
        } else {
          compareValue = authorA.localeCompare(authorB);
        }
        break;
      }
      case 'publishedDate': {
        const dateA = a.publishedDate
          ? new Date(a.publishedDate).getTime()
          : null;
        const dateB = b.publishedDate
          ? new Date(b.publishedDate).getTime()
          : null;

        // Handle null values: put them at the end in ascending order
        if (dateA === null && dateB === null) {
          compareValue = 0;
        } else if (dateA === null) {
          compareValue = 1;
        } else if (dateB === null) {
          compareValue = -1;
        } else {
          compareValue = dateA - dateB;
        }
        break;
      }
      case 'createdAt': {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        compareValue = dateA - dateB;
        break;
      }
    }

    return sortDirection === 'asc' ? compareValue : -compareValue;
  });

  const handleSort = (
    column: 'title' | 'author' | 'publishedDate' | 'createdAt'
  ) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleAddMaterial = (newMaterial: MaterialWithStatus) => {
    // Sort authors alphabetically before adding
    const materialWithSortedAuthors = {
      ...newMaterial,
      authors: newMaterial.authors
        ? [...newMaterial.authors].sort((a, b) => {
            const nameA = `${a.lastName} ${a.firstName}`.toLowerCase();
            const nameB = `${b.lastName} ${b.firstName}`.toLowerCase();
            return nameA.localeCompare(nameB);
          })
        : newMaterial.authors,
    };

    setMaterials((prev) => [materialWithSortedAuthors, ...prev]);
  };

  const handleUpdateMaterial = (updatedMaterial: MaterialWithStatus) => {
    // Sort authors alphabetically before updating
    const materialWithSortedAuthors = {
      ...updatedMaterial,
      authors: updatedMaterial.authors
        ? [...updatedMaterial.authors].sort((a, b) => {
            const nameA = `${a.lastName} ${a.firstName}`.toLowerCase();
            const nameB = `${b.lastName} ${b.firstName}`.toLowerCase();
            return nameA.localeCompare(nameB);
          })
        : updatedMaterial.authors,
    };

    setMaterials((prev) =>
      prev.map((m) =>
        m.id === updatedMaterial.id ? materialWithSortedAuthors : m
      )
    );
    setMaterialToEdit(null);
    setIsEditDialogOpen(false);
  };

  const handleEditMaterial = (material: MaterialWithStatus) => {
    if (material.type !== 'BOOK') {
      toast.info('Edición solo disponible para libros por el momento');
      return;
    }
    setMaterialToEdit(material);
    setIsEditDialogOpen(true);
  };

  const handleDeleteMaterial = async () => {
    if (materialToDelete && token) {
      try {
        await materialsApi.delete(materialToDelete.id, token);
        setMaterials(materials.filter((m) => m.id !== materialToDelete.id));
        toast.success('Material eliminado correctamente');
        setMaterialToDelete(null);
      } catch (error: any) {
        console.error('Error deleting material:', error);
        // Show the specific error message from the backend
        const errorMessage = error?.message || 'Error al eliminar el material';
        toast.error(errorMessage, {
          description: 'Primero debe eliminar todas las copias',
        });
        setMaterialToDelete(null);
      }
    }
  };

  const openDetails = async (material: MaterialWithStatus) => {
    setSelectedMaterial(material);
    setIsDetailsOpen(true);

    // Fetch full material details including copies
    if (token) {
      try {
        const fullMaterial = await materialsApi.getById(material.id, token);
        setSelectedMaterial({
          ...fullMaterial,
          description: fullMaterial.description ?? undefined,
        });
      } catch (error) {
        console.error('Error fetching material details:', error);
        toast.error('Error al cargar los detalles del material');
      }
    }
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
        <div className="flex flex-col gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, autor o ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
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
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[220px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {Array.from(
                  new Set(
                    materials
                      .flatMap((m) => m.categories || [])
                      .map((c) => JSON.stringify({ id: c.id, name: c.name }))
                  )
                )
                  .map((c) => JSON.parse(c))
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrar por idioma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los idiomas</SelectItem>
                {Array.from(new Set(materials.map((m) => m.language)))
                  .sort((a, b) =>
                    getLanguageLabel(a).localeCompare(getLanguageLabel(b))
                  )
                  .map((language) => (
                    <SelectItem key={language} value={language}>
                      {getLanguageLabel(language)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="px-3.5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button
                  onClick={() => handleSort('title')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Título
                  {sortColumn === 'title' ? (
                    sortDirection === 'asc' ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )
                  ) : (
                    <ArrowUpDown className="h-4 w-4 opacity-50" />
                  )}
                </button>
              </TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort('author')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Autor(es)
                  {sortColumn === 'author' ? (
                    sortDirection === 'asc' ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )
                  ) : (
                    <ArrowUpDown className="h-4 w-4 opacity-50" />
                  )}
                </button>
              </TableHead>
              <TableHead>Categorías</TableHead>
              <TableHead>Copias</TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort('publishedDate')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Fecha de publicación
                  {sortColumn === 'publishedDate' ? (
                    sortDirection === 'asc' ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )
                  ) : (
                    <ArrowUpDown className="h-4 w-4 opacity-50" />
                  )}
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort('createdAt')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Fecha de creación
                  {sortColumn === 'createdAt' ? (
                    sortDirection === 'asc' ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )
                  ) : (
                    <ArrowUpDown className="h-4 w-4 opacity-50" />
                  )}
                </button>
              </TableHead>
              <TableHead>Idioma</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-12 w-12 opacity-50 animate-spin" />
                    <p>Cargando materiales...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredMaterials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-12 w-12 opacity-50" />
                    <p>No se encontraron materiales</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedMaterials.map((material) => {
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
                    <TableCell>
                      {material.authors && material.authors.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {[...material.authors]
                            .sort((a, b) => {
                              // Sort by full name: firstName + middleName + lastName
                              const fullNameA = `${a.firstName} ${
                                a.middleName || ''
                              } ${a.lastName}`
                                .trim()
                                .toLowerCase();
                              const fullNameB = `${b.firstName} ${
                                b.middleName || ''
                              } ${b.lastName}`
                                .trim()
                                .toLowerCase();
                              return fullNameA.localeCompare(fullNameB, 'es');
                            })
                            .map((author, idx) => (
                              <span key={author.id || idx} className="text-sm">
                                {author.firstName}
                                {author.middleName
                                  ? ' ' + author.middleName
                                  : ''}{' '}
                                {author.lastName}
                              </span>
                            ))}
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {material.categories && material.categories.length > 0
                          ? material.categories.map((category) => (
                              <Badge
                                key={category.id}
                                variant="secondary"
                                className="text-xs"
                              >
                                {category.name}
                              </Badge>
                            ))
                          : '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        {material.totalCopies !== undefined ? (
                          <Badge variant="outline">
                            {material.totalCopies}
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {material.publishedDate
                        ? (() => {
                            const [year, month, day] = material.publishedDate
                              .split('T')[0]
                              .split('-');
                            const date = new Date(
                              parseInt(year),
                              parseInt(month) - 1,
                              parseInt(day)
                            );
                            return date.toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            });
                          })()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {new Date(material.createdAt).toLocaleDateString(
                        'es-ES',
                        {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        }
                      )}
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
                            onClick={() => handleEditMaterial(material)}
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

      {materialToEdit && (
        <EditMaterialDialog
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) setMaterialToEdit(null);
          }}
          onUpdate={handleUpdateMaterial}
          material={materialToEdit}
        />
      )}

      <MaterialDetailsSheet
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        material={selectedMaterial}
        onEdit={(material) => {
          setIsDetailsOpen(false);
          handleEditMaterial(material);
        }}
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
