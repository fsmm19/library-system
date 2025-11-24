export const getRoleLabel = (role: string): string => {
  switch (role) {
    case 'LIBRARIAN':
      return 'Bibliotecario';
    case 'MEMBER':
      return 'Miembro';
    default:
      return role;
  }
};
