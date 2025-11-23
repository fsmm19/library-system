'use client';

import UserDetailsSheet from '@/components/users/UserDetailsSheet';
import UserFormDialog, {
  UserFormData,
} from '@/components/users/UserFormDialog';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { User } from '@library/types';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit,
  Eye,
  Filter,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { usersApi } from '@/lib/api/users';
import { useAuth } from '@/contexts/AuthContext';
import { matchesStateFilter, getUserStateInfo } from '@/lib/utils/userState';

const ITEMS_PER_PAGE = 10;

const getRoleLabel = (role: string): string => {
  const roleMap: Record<string, string> = {
    LIBRARIAN: 'Bibliotecario',
    MEMBER: 'Miembro',
  };
  return roleMap[role] || role;
};

export default function UsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<'name' | 'createdAt' | null>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, stateFilter]);

  const loadUsers = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await usersApi.getAll({ limit: 100 }, token);
      setUsers(response.data || []);
    } catch (error) {
      toast.error('Error al cargar usuarios', {
        description: 'No se pudieron cargar los usuarios de la base de datos',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const filteredUsers = (users || []).filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesState = matchesStateFilter(
      stateFilter,
      user.role,
      user.member?.accountState,
      user.librarian?.isActive
    );

    return matchesSearch && matchesRole && matchesState;
  });

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortColumn) return 0;

    let compareValue = 0;

    switch (sortColumn) {
      case 'name': {
        const nameA = `${a.firstName} ${a.middleName || ''} ${a.lastName}`.toLowerCase();
        const nameB = `${b.firstName} ${b.middleName || ''} ${b.lastName}`.toLowerCase();
        compareValue = nameA.localeCompare(nameB);
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

  const handleSort = (column: 'name' | 'createdAt') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const totalPages = Math.ceil(sortedUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedUsers = sortedUsers.slice(startIndex, endIndex);

  const handleCreateUser = async (data: UserFormData) => {
    if (!data.password) {
      toast.error('Error al crear usuario', {
        description: 'La contraseña es requerida',
      });
      throw new Error('Password is required');
    }

    try {
      if (data.role === 'MEMBER') {
        await usersApi.createMember({
          firstName: data.firstName,
          middleName: data.middleName?.trim() || undefined,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
        });
      } else {
        await usersApi.createLibrarian(
          {
            firstName: data.firstName,
            middleName: data.middleName?.trim() || undefined,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
            hireDate: new Date().toISOString(),
          },
          token!
        );
      }

      await loadUsers();
      toast.success('Usuario creado correctamente');
    } catch (error) {
      toast.error('Error al crear usuario', {
        description:
          error instanceof Error
            ? error.message
            : 'Ocurrió un error inesperado',
      });
      throw error;
    }
  };

  const handleUpdateUser = async (data: UserFormData) => {
    if (!userToEdit || !token) return;

    try {
      await usersApi.updateProfile(
        userToEdit.id,
        {
          firstName: data.firstName,
          middleName: data.middleName?.trim() || null,
          lastName: data.lastName,
        },
        token
      );

      await loadUsers();
      toast.success('Usuario actualizado correctamente');
    } catch (error) {
      toast.error('Error al actualizar usuario', {
        description:
          error instanceof Error
            ? error.message
            : 'Ocurrió un error inesperado',
      });
      throw error;
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete || !token) return;

    try {
      await usersApi.delete(userToDelete.id, token);
      await loadUsers();
      toast.success('Usuario eliminado correctamente');
      setUserToDelete(null);
    } catch (error) {
      toast.error('Error al eliminar usuario', {
        description:
          error instanceof Error
            ? error.message
            : 'Ocurrió un error inesperado',
      });
    }
  };

  const openCreateForm = () => {
    setUserToEdit(null);
    setIsFormOpen(true);
  };

  const openEditForm = (user: User) => {
    setUserToEdit(user);
    setIsFormOpen(true);
  };

  const openDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los miembros y bibliotecarios del sistema
          </p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Crear usuario
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o correo electrónico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4" />
              <SelectValue placeholder="Filtrar por rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>
              <SelectItem value="MEMBER">Miembro</SelectItem>
              <SelectItem value="LIBRARIAN">Bibliotecario</SelectItem>
            </SelectContent>
          </Select>
          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger className="w-full sm:w-[162px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="ACTIVE">Activo</SelectItem>
              <SelectItem value="INACTIVE">Inactivo</SelectItem>
              <SelectItem value="SUSPENDED">Suspendido</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card className="px-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Nombre completo
                  {sortColumn === 'name' ? (
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
              <TableHead>Correo electrónico</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort('createdAt')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Fecha de registro
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
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No se encontraron usuarios
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(user.firstName, user.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {user.firstName}{' '}
                          {user.middleName ? `${user.middleName} ` : ''}
                          {user.lastName}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.role === 'LIBRARIAN' ? 'default' : 'secondary'
                      }
                    >
                      {getRoleLabel(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        getUserStateInfo(
                          user.role,
                          user.member?.accountState,
                          user.librarian?.isActive
                        ).variant
                      }
                    >
                      {
                        getUserStateInfo(
                          user.role,
                          user.member?.accountState,
                          user.librarian?.isActive
                        ).label
                      }
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="text-center">
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
                        <DropdownMenuItem onClick={() => openDetails(user)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditForm(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setUserToDelete(user)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
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

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {paginatedUsers.length} de {sortedUsers.length} usuarios
        </p>
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className={
                    currentPage === 1
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                >
                  Anterior
                </PaginationPrevious>
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
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  className={
                    currentPage === totalPages
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                >
                  Siguiente
                </PaginationNext>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      {/* Dialogs & Sheets */}
      <UserFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        user={userToEdit}
        onSubmit={userToEdit ? handleUpdateUser : handleCreateUser}
      />

      <UserDetailsSheet
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        user={selectedUser}
        onEdit={(user) => {
          setIsDetailsOpen(false);
          openEditForm(user);
        }}
      />

      <ConfirmDialog
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}
        title="¿Eliminar usuario?"
        description={`¿Estás seguro de que deseas eliminar a ${userToDelete?.firstName} ${userToDelete?.lastName}? Esta acción no se puede deshacer.`}
        onConfirm={handleDeleteUser}
        variant="destructive"
        confirmText="Eliminar"
      />
    </div>
  );
}
