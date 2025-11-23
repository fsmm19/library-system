'use client';

import { useState, useEffect, ReactNode, useCallback } from 'react';
import { AuthContext, AuthState } from './AuthContext';
import { authApi, AuthApiError } from '@/lib/api/auth';
import {
  LoginCredentials,
  RegisterMemberData,
  RegisterLibrarianData,
  LoginResponse,
  RegisterMemberResponse,
  RegisterLibrarianResponse,
} from '@library/types';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const MEMBER_KEY = 'auth_member';
const LIBRARIAN_KEY = 'auth_librarian';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    member: null,
    librarian: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Load stored auth data on mount
  useEffect(() => {
    const loadStoredAuth = () => {
      try {
        if (typeof window === 'undefined') {
          setState((prev) => ({ ...prev, isLoading: false }));
          return;
        }

        const token = localStorage.getItem(TOKEN_KEY);
        const userStr = localStorage.getItem(USER_KEY);
        const memberStr = localStorage.getItem(MEMBER_KEY);
        const librarianStr = localStorage.getItem(LIBRARIAN_KEY);

        if (token && userStr) {
          const user = JSON.parse(userStr);
          const member = memberStr ? JSON.parse(memberStr) : null;
          const librarian = librarianStr ? JSON.parse(librarianStr) : null;

          setState({
            user,
            member,
            librarian,
            token,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error loading stored auth:', error);
        clearStoredAuth();
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    loadStoredAuth();
  }, []);

  const setCookie = useCallback((name: string, value: string, days = 7) => {
    if (typeof window !== 'undefined') {
      const expires = new Date();
      expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
      document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
    }
  }, []);

  const deleteCookie = useCallback((name: string) => {
    if (typeof window !== 'undefined') {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    }
  }, []);

  const clearStoredAuth = useCallback(() => {
    if (typeof window !== 'undefined') {
      // Clear localStorage
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(MEMBER_KEY);
      localStorage.removeItem(LIBRARIAN_KEY);

      // Clear cookies
      deleteCookie('auth_token');
      deleteCookie('user_role');
    }
  }, [deleteCookie]);

  const storeAuth = useCallback(
    (
      token: string,
      user: AuthState['user'],
      member?: AuthState['member'],
      librarian?: AuthState['librarian']
    ) => {
      if (typeof window !== 'undefined') {
        // Store in localStorage
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        if (member) {
          localStorage.setItem(MEMBER_KEY, JSON.stringify(member));
        }
        if (librarian) {
          localStorage.setItem(LIBRARIAN_KEY, JSON.stringify(librarian));
        }

        // Store in cookies for server-side access (middleware)
        setCookie('auth_token', token);
        if (user) {
          setCookie('user_role', user.role);
        }
      }
    },
    [setCookie]
  );

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<LoginResponse> => {
      try {
        const response = await authApi.login(credentials);
        const { accessToken, user } = response;

        storeAuth(accessToken, user);

        setState({
          user,
          member: null,
          librarian: null,
          token: accessToken,
          isLoading: false,
          isAuthenticated: true,
        });

        return response;
      } catch (error) {
        if (error instanceof AuthApiError) {
          throw error;
        }
        throw new AuthApiError('Failed to login');
      }
    },
    [storeAuth]
  );

  const registerMember = useCallback(
    async (data: RegisterMemberData): Promise<RegisterMemberResponse> => {
      try {
        const response = await authApi.registerMember(data);
        const { accessToken, user, member } = response;

        storeAuth(accessToken, user, member);

        setState({
          user,
          member,
          librarian: null,
          token: accessToken,
          isLoading: false,
          isAuthenticated: true,
        });

        return response;
      } catch (error) {
        if (error instanceof AuthApiError) {
          throw error;
        }
        throw new AuthApiError('Failed to register member');
      }
    },
    [storeAuth]
  );

  const registerLibrarian = useCallback(
    async (data: RegisterLibrarianData): Promise<RegisterLibrarianResponse> => {
      try {
        const response = await authApi.registerLibrarian(data);
        const { user, librarian } = response;

        // Note: Librarian registration doesn't return a token
        // They need to login after registration

        return response;
      } catch (error) {
        if (error instanceof AuthApiError) {
          throw error;
        }
        throw new AuthApiError('Failed to register librarian');
      }
    },
    []
  );

  const logout = useCallback(() => {
    clearStoredAuth();
    setState({
      user: null,
      member: null,
      librarian: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, [clearStoredAuth]);

  const value = {
    ...state,
    login,
    logout,
    registerMember,
    registerLibrarian,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
