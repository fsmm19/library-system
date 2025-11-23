'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useAuth } from '@/hooks/useAuth';

interface FavoritesContextType {
  favorites: Set<string>; // Set de materialIds
  isLoading: boolean;
  addFavorite: (materialId: string) => void;
  removeFavorite: (materialId: string) => void;
  toggleFavorite: (materialId: string) => void;
  isFavorite: (materialId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

const FAVORITES_STORAGE_KEY = 'library_favorites';

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Cargar favoritos del localStorage
  useEffect(() => {
    if (!user) {
      setFavorites(new Set());
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const storageKey = `${FAVORITES_STORAGE_KEY}_${user.id}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFavorites(new Set(parsed));
      } else {
        setFavorites(new Set());
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites(new Set());
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Guardar favoritos en localStorage cuando cambien
  useEffect(() => {
    if (!user || isLoading) return;

    try {
      const storageKey = `${FAVORITES_STORAGE_KEY}_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify([...favorites]));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }, [favorites, user, isLoading]);

  const addFavorite = (materialId: string) => {
    setFavorites((prev) => new Set([...prev, materialId]));
  };

  const removeFavorite = (materialId: string) => {
    setFavorites((prev) => {
      const newSet = new Set(prev);
      newSet.delete(materialId);
      return newSet;
    });
  };

  const toggleFavorite = (materialId: string) => {
    if (favorites.has(materialId)) {
      removeFavorite(materialId);
    } else {
      addFavorite(materialId);
    }
  };

  const isFavorite = (materialId: string) => {
    return favorites.has(materialId);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isLoading,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
