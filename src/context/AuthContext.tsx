/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { config } from '../config';
import { TokenResponse, ApiErrorResponse, AuthUserProfile } from '../types/bigdata';

export interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: AuthUserProfile | null;
  adminUsername: string | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
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

    // Administrative tokens are stored in sessionStorage for defense-in-depth against shared devices.
    // Regular member tokens remain in localStorage for a frictionless 60-day community experience.
    const isUserAdmin = newUser.role === 'admin';
    const targetStorage = isUserAdmin ? sessionStorage : localStorage;
    const oppositeStorage = isUserAdmin ? localStorage : sessionStorage;

    try {
      oppositeStorage.removeItem(TOKEN_STORAGE_KEY);
      oppositeStorage.removeItem(EXPIRY_STORAGE_KEY);
      oppositeStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      // Ignore storage access failures
    }

    try {
      targetStorage.setItem(TOKEN_STORAGE_KEY, newToken);
      targetStorage.setItem(EXPIRY_STORAGE_KEY, expiryTimestamp.toString());
      targetStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    } catch {
      // Storage restricted
    }
  }, []);

  // Initialize and validate token on mount (checking sessionStorage first, then localStorage)
  useEffect(() => {
    let savedToken: string | null = null;
    let savedExpiry: string | null = null;
    let savedUserStr: string | null = null;
    let fromLocalStorage = false;

    // Check sessionStorage first (active admin session takes priority)
    try {
      savedToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);
      savedExpiry = sessionStorage.getItem(EXPIRY_STORAGE_KEY);
      savedUserStr = sessionStorage.getItem(USER_STORAGE_KEY);
    } catch {
      // Session storage unavailable
    }

    // Fall back to localStorage for persistent member sessions
    if (!savedToken) {
      try {
        savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        savedExpiry = localStorage.getItem(EXPIRY_STORAGE_KEY);
        savedUserStr = localStorage.getItem(USER_STORAGE_KEY);
        if (savedToken) {
          fromLocalStorage = true;
        }
      } catch {
        // Local storage unavailable
      }
    }

    try {
      if (savedToken && savedExpiry) {
        const expiryTime = parseInt(savedExpiry, 10);
        if (Date.now() < expiryTime) {
          setToken(savedToken);
          setExpiresAt(expiryTime);

          let parsedUser: AuthUserProfile = { f3Name: 'admin', role: 'admin' };
          if (savedUserStr) {
            try {
              parsedUser = JSON.parse(savedUserStr);
            } catch {
              parsedUser = { f3Name: 'admin', role: 'admin' };
            }
          }
          setUser(parsedUser);

          // If a legacy admin token was found in localStorage, migrate it to sessionStorage
          if (fromLocalStorage && parsedUser.role === 'admin') {
            try {
              sessionStorage.setItem(TOKEN_STORAGE_KEY, savedToken);
              sessionStorage.setItem(EXPIRY_STORAGE_KEY, savedExpiry);
              sessionStorage.setItem(USER_STORAGE_KEY, savedUserStr || JSON.stringify(parsedUser));
              localStorage.removeItem(TOKEN_STORAGE_KEY);
              localStorage.removeItem(EXPIRY_STORAGE_KEY);
              localStorage.removeItem(USER_STORAGE_KEY);
            } catch {
              // Ignore storage errors
            }
          }
        } else {
          // Token has expired
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

    // Immediate check on visibility change (e.g. returning to an idle tab)
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
      const adminUser: AuthUserProfile = { f3Name: username, role: 'admin' };
      loginWithToken(tokenData.accessToken, tokenData.expiresIn, adminUser);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network error during login';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loginWithToken]);

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
    return Boolean(isAuthenticated && user?.role === 'admin');
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
      login,
      loginWithToken,
      logout,
      getAuthHeaders,
    }),
    [token, isAuthenticated, isAdmin, user, adminUsername, loading, error, login, loginWithToken, logout, getAuthHeaders]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
