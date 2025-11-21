'use client';

import { useEffect, useState } from 'react';
import { MaterialWithDetails, SearchMaterialsParams } from '@library/types';
import { materialsApi } from '@/lib/api/materials';
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
import { User } from 'lucide-react';

interface SearchFilters {
  query: string;
  types: string[];
  languages: string[];
  authorName?: string;
  yearFrom?: number;
  yearTo?: number;
}

export default function CatalogPage() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    types: [],
    languages: [],
    authorName: undefined,
    yearFrom: undefined,
    yearTo: undefined,
  });
  const [sortBy, setSortBy] = useState<SearchMaterialsParams['sortBy']>('relevance');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isLoading, setIsLoading] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [materials, setMaterials] = useState<MaterialWithDetails[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    setPage(1);
  }, [filters, sortBy, pageSize]);

  useEffect(() => {
    const fetchMaterials = async () => {
      setIsLoading(true);
      try {
        const searchParams: SearchMaterialsParams = {
          query: filters.query || searchQuery,
          types: filters.types,
          languages: filters.languages,
          authorName: filters.authorName,
          yearFrom: filters.yearFrom,
          yearTo: filters.yearTo,
          sortBy,
          page,
          pageSize,
        };

        const response = await materialsApi.search(searchParams);
        setMaterials(response.materials);
        setTotal(response.total);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error('Error fetching materials:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaterials();
  }, [filters, sortBy, page, pageSize, searchQuery]);

  const handleSearch = () => {
    setFilters({ ...filters, query: searchQuery });
  };

  const handleClearAll = () => {
    setSearchQuery('');
    setFilters({
      query: '',
      types: [],
      languages: [],
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
      <nav className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link
              href="/catalog"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="bg-gradient-to-br from-primary to-secondary p-2 rounded-lg shadow-md">
                <BookOpen
                  className="h-6 w-6 text-primary-foreground"
                  strokeWidth={2}
                />
              </div>
              <span className="text-xl font-bold">Sistema de Biblioteca</span>
            </Link>

            {/* Auth Section */}
            <div className="flex items-center gap-2">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">
                        {user.firstName} {user.lastName}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {user.role === 'LIBRARIAN' ? 'Bibliotecario' : 'Miembro'}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Mi perfil</Link>
                    </DropdownMenuItem>
                    {user.role === 'LIBRARIAN' && (
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/librarian">Panel de administracion</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/my-loans">Mis prestamos</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-destructive">
                      Cerrar sesion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                      Iniciar sesion
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
            placeholder="Buscar por titulo, autor, ISBN..."
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
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
                      <SelectItem value="title-asc">Titulo (A-Z)</SelectItem>
                      <SelectItem value="title-desc">Titulo (Z-A)</SelectItem>
                      <SelectItem value="year-desc">
                        Año (mas reciente)
                      </SelectItem>
                      <SelectItem value="year-asc">
                        Año (mas antiguo)
                      </SelectItem>
                      <SelectItem value="author">Autor (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex border rounded-md">
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="rounded-r-none"
                      title="Vista en lista"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
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
                      <SelectItem value="12">12 por pagina</SelectItem>
                      <SelectItem value="24">24 por pagina</SelectItem>
                      <SelectItem value="48">48 por pagina</SelectItem>
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
                    <Skeleton className="aspect-[2/3] w-full" />
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
