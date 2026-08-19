import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

const TestAuthConsumer: React.FC = () => {
  const { isAuthenticated, adminUsername, token, error, login, logout, getAuthHeaders } = useAuth();

  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'unauthenticated'}</div>
      <div data-testid="auth-user">{adminUsername || 'none'}</div>
      <div data-testid="auth-token">{token || 'none'}</div>
      <div data-testid="auth-error">{error || 'none'}</div>
      <div data-testid="auth-header">{JSON.stringify(getAuthHeaders())}</div>
      <button onClick={() => login('admin', 'correct-password')}>Login Valid</button>
      <button onClick={() => login('admin', 'wrong-password')}>Login Invalid</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext & useAuth', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('initializes in unauthenticated state when localStorage is empty', () => {
    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status').textContent).toBe('unauthenticated');
    expect(screen.getByTestId('auth-user').textContent).toBe('none');
    expect(screen.getByTestId('auth-token').textContent).toBe('none');
  });

  it('successfully logs in with valid credentials and sets token in localStorage', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
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
    expect(screen.getByTestId('auth-token').textContent).toBe('mock-jwt-token-xyz');
    expect(screen.getByTestId('auth-header').textContent).toContain('mock-jwt-token-xyz');
    expect(localStorage.getItem('f3rva_admin_token')).toBe('mock-jwt-token-xyz');
  });

  it('handles login failure and exposes error message', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
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

  it('logs out and clears localStorage', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
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
    expect(localStorage.getItem('f3rva_admin_token')).toBeNull();
  });

  it('restores active token from localStorage on mount', () => {
    const futureExpiry = Date.now() + 3600 * 1000;
    localStorage.setItem('f3rva_admin_token', 'stored-token-123');
    localStorage.setItem('f3rva_admin_expires_at', futureExpiry.toString());
    localStorage.setItem('f3rva_admin_username', 'superadmin');

    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status').textContent).toBe('authenticated');
    expect(screen.getByTestId('auth-user').textContent).toBe('superadmin');
    expect(screen.getByTestId('auth-token').textContent).toBe('stored-token-123');
  });

  it('throws an error if useAuth is called outside AuthProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestAuthConsumer />)).toThrow('useAuth must be used within an AuthProvider');
    consoleError.mockRestore();
  });
});
