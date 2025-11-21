// Material types
export interface Material {
  id: string;
  title: string;
  subtitle: string | null;
  type: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}

export interface Author {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  nationality: string | null;
  birthDate: string | null;
}

export interface Book {
  id: string;
  isbn13: string | null;
  edition: string | null;
  numberOfPages: number | null;
  materialId: string;
}

export interface MaterialWithDetails extends Material {
  authors: Author[];
  book: Book | null;
  thumbnail?: string;
  description?: string;
}

// API Request/Response types
export interface CreateAuthorData {
  firstName: string;
  middleName?: string;
  lastName: string;
  nationality?: string;
  birthDate?: string;
}

export interface CreateBookData {
  isbn13?: string;
  edition?: string;
  numberOfPages?: number;
}

export interface CreateMaterialData {
  title: string;
  subtitle?: string;
  type: string;
  language: string;
  authors: CreateAuthorData[];
  book?: CreateBookData;
}

export interface UpdateMaterialData extends Partial<CreateMaterialData> {}

export interface SearchMaterialsParams {
  query?: string;
  types?: string[];
  languages?: string[];
  authorName?: string;
  yearFrom?: number;
  yearTo?: number;
  sortBy?:
    | 'relevance'
    | 'title-asc'
    | 'title-desc'
    | 'year-asc'
    | 'year-desc'
    | 'author';
  page?: number;
  pageSize?: number;
}

export interface SearchMaterialsResponse {
  materials: MaterialWithDetails[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
