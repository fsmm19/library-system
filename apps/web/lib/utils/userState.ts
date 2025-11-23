import { AccountState } from '@library/types';

/**
 * Estado normalizado para usuarios del sistema
 */
export type NormalizedUserState = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

/**
 * Información de estado con metadatos
 */
export interface UserStateInfo {
  state: NormalizedUserState;
  label: string;
  variant: 'default' | 'secondary' | 'destructive';
  isLibrarian: boolean;
}

/**
 * Normaliza el estado de un usuario según su rol
 * - Para Members: usa accountState directamente
 * - Para Librarians: convierte isActive a ACTIVE/INACTIVE
 */
export function normalizeUserState(
  role: string,
  memberAccountState?: AccountState,
  librarianIsActive?: boolean
): NormalizedUserState {
  if (role === 'MEMBER' && memberAccountState) {
    return memberAccountState as NormalizedUserState;
  }

  if (role === 'LIBRARIAN') {
    return librarianIsActive ? 'ACTIVE' : 'INACTIVE';
  }

  return 'INACTIVE';
}

/**
 * Obtiene la información completa del estado de un usuario
 */
export function getUserStateInfo(
  role: string,
  memberAccountState?: AccountState,
  librarianIsActive?: boolean
): UserStateInfo {
  const state = normalizeUserState(role, memberAccountState, librarianIsActive);
  const isLibrarian = role === 'LIBRARIAN';

  const stateConfig: Record<
    NormalizedUserState,
    { label: string; variant: 'default' | 'secondary' | 'destructive' }
  > = {
    ACTIVE: { label: 'Activo', variant: 'default' },
    INACTIVE: { label: 'Inactivo', variant: 'secondary' },
    SUSPENDED: { label: 'Suspendido', variant: 'destructive' },
  };

  const config = stateConfig[state];

  return {
    state,
    label: config.label,
    variant: config.variant,
    isLibrarian,
  };
}

/**
 * Verifica si un usuario coincide con el filtro de estado
 */
export function matchesStateFilter(
  stateFilter: string,
  role: string,
  memberAccountState?: AccountState,
  librarianIsActive?: boolean
): boolean {
  if (stateFilter === 'all') return true;

  const normalizedState = normalizeUserState(
    role,
    memberAccountState,
    librarianIsActive
  );

  return normalizedState === stateFilter;
}
