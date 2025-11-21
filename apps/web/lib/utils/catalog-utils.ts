import {
  MaterialWithDetails,
  SearchParams,
  SearchResult,
} from '@/types/catalog';

// Mock data for development
const mockMaterials: MaterialWithDetails[] = [
  {
    id: '1',
    title: 'Cien años de soledad',
    subtitle: null,
    type: 'book',
    language: 'Español',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    description:
      'Una obra maestra de la literatura latinoamericana que narra la historia de la familia Buendía.',
    thumbnail: '/images/books/cien-anos.jpg',
    authors: [
      {
        id: 'a1',
        firstName: 'Gabriel',
        middleName: 'García',
        lastName: 'Márquez',
        nationality: 'Colombiana',
        birthDate: new Date('1927-03-06'),
      },
    ],
    book: {
      id: 'b1',
      isbn13: '9780060883287',
      edition: 'Primera edición',
      numberOfPages: 417,
      materialId: '1',
    },
  },
  {
    id: '2',
    title: 'Don Quijote de la Mancha',
    subtitle: 'El ingenioso hidalgo',
    type: 'book',
    language: 'Español',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
    description:
      'La obra cumbre de la literatura española que narra las aventuras de un hidalgo manchego.',
    thumbnail: '/images/books/quijote.jpg',
    authors: [
      {
        id: 'a2',
        firstName: 'Miguel',
        middleName: 'de',
        lastName: 'Cervantes',
        nationality: 'Española',
        birthDate: new Date('1547-09-29'),
      },
    ],
    book: {
      id: 'b2',
      isbn13: '9788420412146',
      edition: 'Edición conmemorativa',
      numberOfPages: 1216,
      materialId: '2',
    },
  },
  {
    id: '3',
    title: '1984',
    subtitle: null,
    type: 'book',
    language: 'Inglés',
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-17'),
    description:
      'Una distopía que presenta un futuro totalitario donde el Gran Hermano lo controla todo.',
    thumbnail: '/images/books/1984.jpg',
    authors: [
      {
        id: 'a3',
        firstName: 'George',
        middleName: null,
        lastName: 'Orwell',
        nationality: 'Británica',
        birthDate: new Date('1903-06-25'),
      },
    ],
    book: {
      id: 'b3',
      isbn13: '9780451524935',
      edition: 'Penguin Books',
      numberOfPages: 328,
      materialId: '3',
    },
  },
];

export function searchMaterials(params: SearchParams): SearchResult {
  let filtered = [...mockMaterials];

  // Apply query filter
  if (params.filters.query) {
    const query = params.filters.query.toLowerCase();
    filtered = filtered.filter(
      (m) =>
        m.title.toLowerCase().includes(query) ||
        m.subtitle?.toLowerCase().includes(query) ||
        m.authors.some(
          (a) =>
            a.firstName.toLowerCase().includes(query) ||
            a.lastName.toLowerCase().includes(query)
        ) ||
        m.book?.isbn13?.includes(query) ||
        m.description?.toLowerCase().includes(query)
    );
  }

  // Apply type filter
  if (params.filters.types.length > 0) {
    filtered = filtered.filter((m) => params.filters.types.includes(m.type));
  }

  // Apply language filter
  if (params.filters.languages.length > 0) {
    filtered = filtered.filter((m) =>
      params.filters.languages.includes(m.language)
    );
  }

  // Apply author name filter
  if (params.filters.authorName) {
    const authorQuery = params.filters.authorName.toLowerCase();
    filtered = filtered.filter((m) =>
      m.authors.some(
        (a) =>
          a.firstName.toLowerCase().includes(authorQuery) ||
          a.lastName.toLowerCase().includes(authorQuery)
      )
    );
  }

  // Apply year range filter
  if (params.filters.yearFrom) {
    filtered = filtered.filter(
      (m) => m.createdAt.getFullYear() >= params.filters.yearFrom!
    );
  }
  if (params.filters.yearTo) {
    filtered = filtered.filter(
      (m) => m.createdAt.getFullYear() <= params.filters.yearTo!
    );
  }

  // Sort results
  switch (params.sortBy) {
    case 'title-asc':
      filtered.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'title-desc':
      filtered.sort((a, b) => b.title.localeCompare(a.title));
      break;
    case 'year-asc':
      filtered.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      );
      break;
    case 'year-desc':
      filtered.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
      break;
    case 'author':
      filtered.sort((a, b) => {
        const aName = a.authors[0]?.lastName || '';
        const bName = b.authors[0]?.lastName || '';
        return aName.localeCompare(bName);
      });
      break;
    default:
      // "relevance" - keep current order
      break;
  }

  // Paginate
  const total = filtered.length;
  const totalPages = Math.ceil(total / params.pageSize);
  const start = (params.page - 1) * params.pageSize;
  const end = start + params.pageSize;
  const materials = filtered.slice(start, end);

  return {
    materials,
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages,
  };
}

export function getMaterialById(
  id: string
): MaterialWithDetails | undefined {
  return mockMaterials.find((m) => m.id === id);
}

export function getTypeLabel(type: string): string {
  switch (type.toLowerCase()) {
    case 'book':
      return 'Libro';
    case 'dvd':
      return 'DVD';
    case 'magazine':
      return 'Revista';
    case 'cd':
      return 'CD';
    case 'document':
      return 'Documento';
    case 'map':
      return 'Mapa';
    default:
      return type;
  }
}

export function getTypeIcon(type: string): string {
  switch (type.toLowerCase()) {
    case 'book':
      return '📚';
    case 'dvd':
      return '📀';
    case 'magazine':
      return '📰';
    case 'cd':
      return '🎵';
    case 'document':
      return '📄';
    case 'map':
      return '🗺️';
    default:
      return '📄';
  }
}

export function formatAuthors(
  authors: MaterialWithDetails['authors']
): string {
  if (!authors || authors.length === 0) return 'Autor desconocido';

  return authors
    .map((author) => {
      const parts = [author.firstName];
      if (author.middleName) parts.push(author.middleName);
      parts.push(author.lastName);
      return parts.join(' ');
    })
    .join(', ');
}
