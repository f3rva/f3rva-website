/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { AuthUserProfile } from '../types/bigdata';

export interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: AuthUserProfile | null;
  adminUsername: string | null;
  loading: boolean;
  error: string | null;
  loginWithToken: (token: string, expiresIn: number, user: AuthUserProfile) => void;
  logout: () => void;
  getAuthHeaders: () => Record<string, string>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_STORAGE_KEY = 'f3rva_auth_token';
const EXPIRY_STORAGE_KEY = 'f3rva_auth_expires_at';
const USER_STORAGE_KEY = 'f3rva_auth_user';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUserProfile | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setExpiresAt(null);
    setError(null);
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(EXPIRY_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      // Ignore localStorage access failures in restricted environments
    }
    try {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      sessionStorage.removeItem(EXPIRY_STORAGE_KEY);
      sessionStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      // Ignore sessionStorage access failures in restricted environments
    }
  }, []);

  const loginWithToken = useCallback((newToken: string, expiresIn: number, newUser: AuthUserProfile) => {
    const expiryTimestamp = Date.now() + expiresIn * 1000;
    setToken(newToken);
    setExpiresAt(expiryTimestamp);
    setUser(newUser);
    setError(null);

    try {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      sessionStorage.removeItem(EXPIRY_STORAGE_KEY);
      sessionStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      // Ignore storage access failures
    }

    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
      localStorage.setItem(EXPIRY_STORAGE_KEY, expiryTimestamp.toString());
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    } catch {
      // Storage restricted
    }
  }, []);

  // Initialize and validate token on mount from localStorage (falling back to sessionStorage for migration)
  useEffect(() => {
    let savedToken: string | null = null;
    let savedExpiry: string | null = null;
    let savedUserStr: string | null = null;

    try {
      savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      savedExpiry = localStorage.getItem(EXPIRY_STORAGE_KEY);
      savedUserStr = localStorage.getItem(USER_STORAGE_KEY);
    } catch {
      // Local storage unavailable
    }

    if (!savedToken) {
      try {
        savedToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);
        savedExpiry = sessionStorage.getItem(EXPIRY_STORAGE_KEY);
        savedUserStr = sessionStorage.getItem(USER_STORAGE_KEY);
      } catch {
        // Session storage unavailable
      }
    }

    try {
      if (savedToken && savedExpiry) {
        const expiryTime = parseInt(savedExpiry, 10);
        if (Date.now() < expiryTime) {
          setToken(savedToken);
          setExpiresAt(expiryTime);

          let parsedUser: AuthUserProfile = { f3Name: 'Member', role: 'member' };
          if (savedUserStr) {
            try {
              parsedUser = JSON.parse(savedUserStr);
            } catch {
              parsedUser = { f3Name: 'Member', role: 'member' };
            }
          }
          setUser(parsedUser);
        } else {
          logout();
        }
      }
    } catch {
      // Storage parsing failure
    } finally {
      setLoading(false);
    }
  }, [logout]);

  // Periodic token expiration verification and window focus check
  useEffect(() => {
    if (!token || !expiresAt) return;

    const checkExpiration = () => {
      if (Date.now() >= expiresAt) {
        logout();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkExpiration();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    const interval = setInterval(checkExpiration, 30000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [token, expiresAt, logout]);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    if (token && expiresAt && Date.now() < expiresAt) {
      return {
        Authorization: `Bearer ${token}`,
      };
    }
    return {};
  }, [token, expiresAt]);

  const isAuthenticated = useMemo(() => {
    return Boolean(token && expiresAt && Date.now() < expiresAt);
  }, [token, expiresAt]);

  const isAdmin = useMemo(() => {
    return Boolean(
      isAuthenticated && (user?.role === 'admin' || user?.roles?.includes('admin'))
    );
  }, [isAuthenticated, user]);

  const adminUsername = useMemo(() => {
    return user?.f3Name || null;
  }, [user]);

  const value = useMemo(
    () => ({
      token,
      isAuthenticated,
      isAdmin,
      user,
      adminUsername,
      loading,
      error,
      loginWithToken,
      logout,
      getAuthHeaders,
    }),
    [token, isAuthenticated, isAdmin, user, adminUsername, loading, error, loginWithToken, logout, getAuthHeaders]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
