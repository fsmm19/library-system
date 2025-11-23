// Material types based on database schema
export interface Material {
  id: string;
  title: string;
  subtitle: string | null;
  type: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
  authors?: Author[];
  book?: Book;
}

export interface Author {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  nationality: string | null;
  birthDate: Date | null;
  materials?: Material[];
}

export interface Book {
  id: string;
  isbn13: string | null;
  edition: string | null;
  numberOfPages: number | null;
  materialId: string;
  material?: Material;
}

// Extended types for catalog functionality
export interface MaterialWithDetails
  extends Omit<Material, 'authors' | 'book'> {
  authors: Author[];
  book: Book | null;
  thumbnail?: string;
  description?: string;
}

// Search and filter types
export interface SearchFilters {
  query: string;
  types: string[];
  languages: string[];
  categories: string[];
  availability?: 'all' | 'available' | 'unavailable';
  authorName?: string;
  yearFrom?: number;
  yearTo?: number;
}

export interface CatalogFilters {
  query: string;
  types: string[];
  languages: string[];
  authorName?: string;
  yearFrom?: number;
  yearTo?: number;
}

export interface SearchParams {
  filters: SearchFilters;
  sortBy:
    | 'relevance'
    | 'title-asc'
    | 'title-desc'
    | 'year-asc'
    | 'year-desc'
    | 'author';
  page: number;
  pageSize: number;
}

export interface SearchResult {
  materials: MaterialWithDetails[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
