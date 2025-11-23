import { MaterialWithDetails } from '@library/types';

export function getTypeLabel(type: string): string {
  switch (type.toLowerCase()) {
    case 'book':
      return 'Libro';
    case 'dvd':
      return 'DVD';
    case 'magazine':
      return 'Revista';
    case 'other':
      return 'Otro';
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

export function formatAuthors(authors: MaterialWithDetails['authors']): string {
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

export function getLanguageLabel(languageCode: string): string {
  switch (languageCode.toUpperCase()) {
    case 'ES':
      return 'Español';
    case 'EN':
      return 'Inglés';
    case 'FR':
      return 'Francés';
    case 'DE':
      return 'Alemán';
    case 'OTHER':
      return 'Otro';
    default:
      return languageCode;
  }
}

export function getCopyStatusLabel(status: string): string {
  switch (status.toUpperCase()) {
    case 'AVAILABLE':
      return 'Disponible';
    case 'BORROWED':
      return 'Prestado';
    case 'RESERVED':
      return 'Reservado';
    case 'UNDER_REPAIR':
      return 'En reparación';
    case 'REMOVED':
      return 'Retirado';
    default:
      return status;
  }
}

export function getCopyConditionLabel(condition: string): string {
  switch (condition.toUpperCase()) {
    case 'NEW':
      return 'Nuevo';
    case 'GOOD':
      return 'Bueno';
    case 'FAIR':
      return 'Aceptable';
    case 'DAMAGED':
      return 'Dañado';
    case 'LOST':
      return 'Perdido';
    default:
      return condition;
  }
}

export function getCopyStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case 'AVAILABLE':
      return 'bg-success/10 text-success border-success/50';
    case 'BORROWED':
      return 'bg-destructive/10 text-destructive border-destructive/50';
    case 'RESERVED':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/50';
    case 'UNDER_REPAIR':
      return 'bg-warning/10 text-warning border-warning/50';
    case 'REMOVED':
      return 'bg-muted text-muted-foreground border-muted';
    default:
      return '';
  }
}
