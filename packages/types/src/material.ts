import { MaterialType, Language } from './enums';
import { MaterialCopy } from './material-copy';

// Material types
export interface Material {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  type: MaterialType;
  language: Language;
  publishedDate: string | null;
  maxLoanDays: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Category {
  id: string;
  name: string;
}

export interface Country {
  id: string;
  name: string;
}

export interface Publisher {
  id: string;
  name: string;
}

export interface Author {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  countryOfOriginId: string | null;
  countryOfOrigin?: Country | null;
  birthDate: string | null;
}

export interface Book {
  id: string;
  isbn13: string | null;
  edition: string | null;
  numberOfPages: number | null;
  materialId: string;
  publisherId: string | null;
  publisher?: Publisher | null;
}

export interface MaterialWithDetails extends Material {
  authors: Author[];
  categories: Category[];
  book: Book | null;
  copies: MaterialCopy[];
  thumbnail?: string;
  totalCopies?: number;
  availableCopies?: number;
  totalLoans?: number;
}

// API Request/Response types
export interface CreateCategoryData {
  id?: string;
  name?: string;
}

export interface CreateCountryData {
  id?: string;
  name: string;
}

export interface CreatePublisherData {
  id?: string;
  name: string;
}

export interface CreateAuthorData {
  id?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  countryOfOriginId?: string;
  birthDate?: string;
}

export interface CreateBookData {
  isbn13?: string;
  edition?: string;
  numberOfPages?: number | null;
  publisherId?: string;
}

export interface CreateMaterialData {
  title: string;
  subtitle?: string;
  description?: string;
  type: MaterialType;
  language: Language;
  publishedDate?: string | null;
  authors: CreateAuthorData[];
  categories?: CreateCategoryData[];
  book?: CreateBookData;
}

export interface UpdateMaterialData extends Partial<CreateMaterialData> {}

export interface SearchMaterialsParams {
  query?: string;
  types?: MaterialType[];
  languages?: Language[];
  categories?: string[];
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
