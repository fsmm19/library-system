'use client';

import { useEffect, useState } from 'react';
import {
  MaterialWithDetails,
  SearchMaterialsParams,
  MaterialType,
  Language,
} from '@library/types';
import { materialsApi } from '@/lib/api/materials';
import { SearchFilters } from '@/types/catalog';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import Link from 'next/link';
import {
  BookOpen,
  Grid,
  List,
  LogIn,
  SlidersHorizontal,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/catalog/SearchBar';
import { FiltersSidebar } from '@/components/catalog/FiltersSidebar';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { MaterialCard } from '@/components/catalog/MaterialCard';
import { MaterialListItem } from '@/components/catalog/MaterialListItem';
import { EmptyState } from '@/components/catalog/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Bell, Settings, LogOut, User, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';

export default function CatalogPage() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada correctamente');
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    types: [],
    languages: [],
    categories: [],
    availability: undefined,
    authorName: undefined,
    yearFrom: undefined,
    yearTo: undefined,
  });
  const [sortBy, setSortBy] =
    useState<SearchMaterialsParams['sortBy']>('relevance');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isLoading, setIsLoading] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [materials, setMaterials] = useState<MaterialWithDetails[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Load view mode from localStorage on mount
  useEffect(() => {
    const savedViewMode = localStorage.getItem('catalog-view-mode') as
      | 'grid'
      | 'list'
      | null;
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
  }, []);

  // Save view mode to localStorage when it changes
  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('catalog-view-mode', mode);
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilters({ ...filters, query: '' });
    }
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [filters, sortBy, pageSize]);

  useEffect(() => {
    const fetchMaterials = async () => {
      setIsLoading(true);
      try {
        const searchParams: SearchMaterialsParams = {
          query: filters.query || searchQuery,
          types: filters.types as MaterialType[],
          languages: filters.languages as Language[],
          categories: filters.categories,
          authorName: filters.authorName,
          yearFrom:
            filters.yearFrom !== undefined &&
            filters.yearFrom !== null &&
            filters.yearFrom.toString().trim() !== '' &&
            filters.yearFrom >= 0
              ? filters.yearFrom
              : undefined,
          yearTo:
            filters.yearTo !== undefined &&
            filters.yearTo !== null &&
            filters.yearTo.toString().trim() !== '' &&
            filters.yearTo <= 2100
              ? filters.yearTo
              : undefined,
          sortBy,
          page,
          pageSize,
        };

        const response = await materialsApi.search(searchParams, undefined);

        // Aplicar filtros del lado del cliente
        let filteredMaterials = response.materials;

        // Filtro de disponibilidad
        if (filters.availability === 'available') {
          filteredMaterials = filteredMaterials.filter(
            (m) => m.availableCopies && m.availableCopies > 0
          );
        } else if (filters.availability === 'unavailable') {
          filteredMaterials = filteredMaterials.filter(
            (m) => !m.availableCopies || m.availableCopies === 0
          );
        }

        // Filtro de categorías
        if (filters.categories && filters.categories.length > 0) {
          filteredMaterials = filteredMaterials.filter((material) =>
            material.categories?.some((category) =>
              filters.categories?.includes(category.id)
            )
          );
        }

        setMaterials(filteredMaterials);
        setTotal(filteredMaterials.length);
        setTotalPages(Math.ceil(filteredMaterials.length / pageSize));
      } catch (error) {
        console.error('Error fetching materials:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaterials();
  }, [filters, sortBy, page, pageSize, searchQuery]);

  const handleSearch = () => {
    if (searchQuery.trim() === '') {
      return;
    }
    setFilters({ ...filters, query: searchQuery });
  };

  const handleClearAll = () => {
    setSearchQuery('');
    setFilters({
      query: '',
      types: [],
      languages: [],
      categories: [],
      availability: undefined,
      authorName: undefined,
      yearFrom: undefined,
      yearTo: undefined,
    });
  };

  const results = { materials, total, page, pageSize, totalPages };

  const renderPagination = () => {
    const { page: currentPage, totalPages } = results;
    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => currentPage > 1 && setPage(currentPage - 1)}
              className={
                currentPage === 1
                  ? 'pointer-events-none opacity-50'
                  : 'cursor-pointer'
              }
            />
          </PaginationItem>

          {pages.map((p, idx) => (
            <PaginationItem key={idx}>
              {p === '...' ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  onClick={() => setPage(p as number)}
                  isActive={p === currentPage}
                  className="cursor-pointer"
                >
                  {p}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() =>
                currentPage < totalPages && setPage(currentPage + 1)
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
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link
              href="/catalog"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="bg-linear-to-br from-primary to-secondary p-2 rounded-lg shadow-md">
                <BookOpen
                  className="h-6 w-6 text-primary-foreground"
                  strokeWidth={2}
                />
              </div>
              <span className="text-xl font-bold">Babel</span>
            </Link>

            {/* Auth Section */}
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  {/* Notifications */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                          3
                        </Badge>
                        <span className="sr-only">Notificaciones</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                      <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <div className="space-y-2 p-2">
                        <div className="rounded-lg bg-accent/50 p-3 text-sm">
                          <p className="font-medium">Préstamo vencido</p>
                          <p className="text-muted-foreground text-xs mt-1">
                            Hay préstamos que requieren atención
                          </p>
                        </div>
                        <div className="rounded-lg bg-accent/50 p-3 text-sm">
                          <p className="font-medium">
                            Nuevo material disponible
                          </p>
                          <p className="text-muted-foreground text-xs mt-1">
                            Se han agregado nuevos materiales al catálogo
                          </p>
                        </div>
                        <div className="rounded-lg bg-accent/50 p-3 text-sm">
                          <p className="font-medium">
                            Recordatorio de devolución
                          </p>
                          <p className="text-muted-foreground text-xs mt-1">
                            Tienes un préstamo que vence pronto
                          </p>
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {user.firstName[0]?.toUpperCase()}
                            {user.lastName[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="hidden sm:flex sm:flex-col sm:items-start sm:gap-0">
                          <span className="text-sm">
                            {user.firstName} {user.lastName}
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-xs h-4 px-1"
                          >
                            {user.role === 'LIBRARIAN'
                              ? 'Bibliotecario'
                              : 'Miembro'}
                          </Badge>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          href={
                            user.role === 'LIBRARIAN'
                              ? '/dashboard/librarian/profile'
                              : '/dashboard/member/profile'
                          }
                        >
                          <User className="mr-2 h-4 w-4" />
                          Perfil
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href={
                            user.role === 'LIBRARIAN'
                              ? '/dashboard/librarian/settings'
                              : '/dashboard/member/settings'
                          }
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Configuración
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          href={
                            user.role === 'LIBRARIAN'
                              ? '/dashboard/librarian'
                              : '/dashboard/member'
                          }
                        >
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Panel de{' '}
                          {user.role === 'LIBRARIAN'
                            ? 'administración'
                            : 'usuario'}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-destructive"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar sesión
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="hidden sm:flex"
                  >
                    <Link href="/auth">
                      <LogIn className="h-4 w-4 mr-2" />
                      Iniciar sesión
                    </Link>
                  </Button>
                  <Button variant="default" size="sm" asChild>
                    <Link href="/auth">
                      <UserPlus className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Registrarse</span>
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Search Section */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            placeholder="Buscar por título, autor, ISBN..."
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <FiltersSidebar
              filters={filters}
              onFiltersChange={setFilters}
              resultsCount={results.total}
            />
          </aside>

          {/* Mobile Filters Sheet */}
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetContent side="left" className="w-80 p-0">
              <div className="p-6">
                <FiltersSidebar
                  filters={filters}
                  onFiltersChange={setFilters}
                  resultsCount={results.total}
                  onClose={() => setMobileFiltersOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Results Area */}
          <main className="flex-1 min-w-0">
            {/* Control Bar */}
            <Card className="mb-6">
              <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {/* Mobile Filters Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMobileFiltersOpen(true)}
                    className="lg:hidden"
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filtros
                    {filters.types.length +
                      filters.languages.length +
                      (filters.authorName ? 1 : 0) >
                      0 && (
                      <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                        {filters.types.length +
                          filters.languages.length +
                          (filters.authorName ? 1 : 0)}
                      </span>
                    )}
                  </Button>

                  <div className="text-sm text-muted-foreground hidden sm:block">
                    Mostrando{' '}
                    {results.materials.length > 0
                      ? (page - 1) * pageSize + 1
                      : 0}
                    -{Math.min(page * pageSize, results.total)} de{' '}
                    {results.total} resultados
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
                  <Select
                    value={sortBy}
                    onValueChange={(value: any) => setSortBy(value)}
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevancia</SelectItem>
                      <SelectItem value="title-asc">Título (A-Z)</SelectItem>
                      <SelectItem value="title-desc">Título (Z-A)</SelectItem>
                      <SelectItem value="year-desc">
                        Año (más reciente)
                      </SelectItem>
                      <SelectItem value="year-asc">
                        Año (más antiguo)
                      </SelectItem>
                      <SelectItem value="author">Autor (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex border rounded-md">
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => handleViewModeChange('list')}
                      className="rounded-r-none"
                      title="Vista en lista"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => handleViewModeChange('grid')}
                      className="rounded-l-none"
                      title="Vista en cuadricula"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                  </div>

                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => setPageSize(parseInt(value))}
                  >
                    <SelectTrigger className="w-full sm:w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12 por página</SelectItem>
                      <SelectItem value="24">24 por página</SelectItem>
                      <SelectItem value="48">48 por página</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Results Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {Array.from({ length: Math.min(pageSize, 6) }).map((_, i) => (
                  <Card key={i}>
                    <Skeleton className="aspect-2/3 w-full" />
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : results.materials.length > 0 ? (
              <>
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6'
                      : 'space-y-4'
                  }
                >
                  {results.materials.map((material, idx) =>
                    viewMode === 'grid' ? (
                      <MaterialCard key={material.id} material={material} />
                    ) : (
                      <MaterialListItem
                        key={material.id}
                        material={material}
                        index={(page - 1) * pageSize + idx + 1}
                      />
                    )
                  )}
                </div>

                {/* Pagination */}
                {results.totalPages > 1 && (
                  <div className="mt-8">{renderPagination()}</div>
                )}
              </>
            ) : (
              <EmptyState onClear={handleClearAll} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
