'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';

export function ThemeSync() {
  const { setTheme } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.theme) {
      const theme = user.theme.toLowerCase();
      setTheme(theme);
    }
  }, [user?.theme, setTheme]);

  return null;
}
