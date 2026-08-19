/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { config } from '../config';
import { TokenResponse, ApiErrorResponse } from '../types/bigdata';

export interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  adminUsername: string | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  getAuthHeaders: () => Record<string, string>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);


const TOKEN_STORAGE_KEY = 'f3rva_admin_token';
const EXPIRY_STORAGE_KEY = 'f3rva_admin_expires_at';
const USER_STORAGE_KEY = 'f3rva_admin_username';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [adminUsername, setAdminUsername] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(() => {
    setToken(null);
    setAdminUsername(null);
    setExpiresAt(null);
    setError(null);
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(EXPIRY_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      // Ignore localStorage access failures in restricted environments
    }
  }, []);

  // Initialize and validate token from localStorage on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      const savedExpiry = localStorage.getItem(EXPIRY_STORAGE_KEY);
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);

      if (savedToken && savedExpiry) {
        const expiryTime = parseInt(savedExpiry, 10);
        if (Date.now() < expiryTime) {
          setToken(savedToken);
          setExpiresAt(expiryTime);
          setAdminUsername(savedUser || 'admin');
        } else {
          // Token has expired
          logout();
        }
      }
    } catch {
      // Local storage unavailable
    } finally {
      setLoading(false);
    }
  }, [logout]);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${config.apiBaseUrl}/v2/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        let message = 'Invalid admin credentials';
        try {
          const errData: ApiErrorResponse = await response.json();
          if (errData.errorMessage) {
            message = errData.errorMessage;
          }
        } catch {
          // Fallback to HTTP error
        }
        setError(message);
        return false;
      }

      const tokenData: TokenResponse = await response.json();
      const expiryTimestamp = Date.now() + tokenData.expiresIn * 1000;

      setToken(tokenData.accessToken);
      setExpiresAt(expiryTimestamp);
      setAdminUsername(username);

      try {
        localStorage.setItem(TOKEN_STORAGE_KEY, tokenData.accessToken);
        localStorage.setItem(EXPIRY_STORAGE_KEY, expiryTimestamp.toString());
        localStorage.setItem(USER_STORAGE_KEY, username);
      } catch {
        // Storage restricted
      }

      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network error during login';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

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

  const value = useMemo(
    () => ({
      token,
      isAuthenticated,
      adminUsername,
      loading,
      error,
      login,
      logout,
      getAuthHeaders,
    }),
    [token, isAuthenticated, adminUsername, loading, error, login, logout, getAuthHeaders]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
