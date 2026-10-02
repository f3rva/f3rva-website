import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthProvider } from './AuthContext';
import { useAuth } from '../hooks/useAuth';

const TestAuthConsumer: React.FC = () => {
  const { isAuthenticated, adminUsername, token, user, error, login, loginWithToken, logout, getAuthHeaders } = useAuth();

  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'unauthenticated'}</div>
      <div data-testid="auth-user">{adminUsername || 'none'}</div>
      <div data-testid="auth-role">{user?.role || 'none'}</div>
      <div data-testid="auth-token">{token || 'none'}</div>
      <div data-testid="auth-error">{error || 'none'}</div>
      <div data-testid="auth-header">{JSON.stringify(getAuthHeaders())}</div>
      <button onClick={() => login('admin', 'correct-password')}>Login Valid</button>
      <button onClick={() => login('admin', 'wrong-password')}>Login Invalid</button>
      <button onClick={() => loginWithToken('member-token-xyz', 86400, { f3Name: 'OBT', role: 'member' })}>Login Member</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext & useAuth', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('initializes in unauthenticated state when storage is empty', () => {
    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status').textContent).toBe('unauthenticated');
    expect(screen.getByTestId('auth-user').textContent).toBe('none');
    expect(screen.getByTestId('auth-token').textContent).toBe('none');
  });

  it('successfully logs in admin and stores token in sessionStorage (not localStorage)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        accessToken: 'mock-jwt-token-xyz',
        tokenType: 'bearer',
        expiresIn: 86400,
      }),
    } as Response);

    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Login Valid'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('authenticated');
    });

    expect(screen.getByTestId('auth-user').textContent).toBe('admin');
    expect(screen.getByTestId('auth-role').textContent).toBe('admin');
    expect(screen.getByTestId('auth-token').textContent).toBe('mock-jwt-token-xyz');
    expect(screen.getByTestId('auth-header').textContent).toContain('mock-jwt-token-xyz');

    // Admin token must be in sessionStorage and NOT localStorage
    expect(sessionStorage.getItem('f3rva_auth_token')).toBe('mock-jwt-token-xyz');
    expect(localStorage.getItem('f3rva_auth_token')).toBeNull();
  });

  it('stores member token in localStorage (not sessionStorage) for 60-day persistent session', async () => {
    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Login Member'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('authenticated');
    });

    expect(screen.getByTestId('auth-user').textContent).toBe('OBT');
    expect(screen.getByTestId('auth-role').textContent).toBe('member');
    expect(screen.getByTestId('auth-token').textContent).toBe('member-token-xyz');

    // Member token must be in localStorage and NOT sessionStorage
    expect(localStorage.getItem('f3rva_auth_token')).toBe('member-token-xyz');
    expect(sessionStorage.getItem('f3rva_auth_token')).toBeNull();
  });

  it('handles login failure and exposes error message', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({
        errorCode: 4001,
        errorMessage: 'Invalid username or password.',
      }),
    } as Response);

    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Login Invalid'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-error').textContent).toBe('Invalid username or password.');
    });

    expect(screen.getByTestId('auth-status').textContent).toBe('unauthenticated');
  });

  it('logs out and clears both localStorage and sessionStorage', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        accessToken: 'mock-jwt-token-xyz',
        tokenType: 'bearer',
        expiresIn: 86400,
      }),
    } as Response);

    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Login Valid'));
    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('authenticated');
    });

    fireEvent.click(screen.getByText('Logout'));
    expect(screen.getByTestId('auth-status').textContent).toBe('unauthenticated');
    expect(sessionStorage.getItem('f3rva_auth_token')).toBeNull();
    expect(localStorage.getItem('f3rva_auth_token')).toBeNull();
  });

  it('restores active admin token from sessionStorage on mount', () => {
    const futureExpiry = Date.now() + 3600 * 1000;
    sessionStorage.setItem('f3rva_auth_token', 'stored-admin-token');
    sessionStorage.setItem('f3rva_auth_expires_at', futureExpiry.toString());
    sessionStorage.setItem('f3rva_auth_user', JSON.stringify({ f3Name: 'superadmin', role: 'admin' }));

    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status').textContent).toBe('authenticated');
    expect(screen.getByTestId('auth-user').textContent).toBe('superadmin');
    expect(screen.getByTestId('auth-role').textContent).toBe('admin');
    expect(screen.getByTestId('auth-token').textContent).toBe('stored-admin-token');
  });

  it('restores active member token from localStorage on mount', () => {
    const futureExpiry = Date.now() + 3600 * 1000;
    localStorage.setItem('f3rva_auth_token', 'stored-member-token');
    localStorage.setItem('f3rva_auth_expires_at', futureExpiry.toString());
    localStorage.setItem('f3rva_auth_user', JSON.stringify({ f3Name: 'HighTide', role: 'member' }));

    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status').textContent).toBe('authenticated');
    expect(screen.getByTestId('auth-user').textContent).toBe('HighTide');
    expect(screen.getByTestId('auth-role').textContent).toBe('member');
    expect(screen.getByTestId('auth-token').textContent).toBe('stored-member-token');
  });

  it('migrates legacy admin token from localStorage to sessionStorage on mount', () => {
    const futureExpiry = Date.now() + 3600 * 1000;
    localStorage.setItem('f3rva_auth_token', 'legacy-admin-token');
    localStorage.setItem('f3rva_auth_expires_at', futureExpiry.toString());
    localStorage.setItem('f3rva_auth_user', JSON.stringify({ f3Name: 'legacyAdmin', role: 'admin' }));

    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status').textContent).toBe('authenticated');
    expect(screen.getByTestId('auth-user').textContent).toBe('legacyAdmin');
    expect(screen.getByTestId('auth-token').textContent).toBe('legacy-admin-token');

    // Should now be migrated into sessionStorage and cleaned from localStorage
    expect(sessionStorage.getItem('f3rva_auth_token')).toBe('legacy-admin-token');
    expect(localStorage.getItem('f3rva_auth_token')).toBeNull();
  });

  it('throws an error if useAuth is called outside AuthProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestAuthConsumer />)).toThrow('useAuth must be used within an AuthProvider');
    consoleError.mockRestore();
  });

  it('proactively logs out when token expires on visibility change', async () => {
    sessionStorage.setItem('f3rva_auth_token', 'expired-token');
    sessionStorage.setItem('f3rva_auth_expires_at', (Date.now() + 10000).toString());

    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status').textContent).toBe('authenticated');

    // Simulate time passing past expiry and tab becoming visible
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 20000);
    fireEvent(document, new Event('visibilitychange'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('unauthenticated');
    });
  });
});

