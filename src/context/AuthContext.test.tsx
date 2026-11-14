import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthProvider } from './AuthContext';
import { useAuth } from '../hooks/useAuth';

const TestAuthConsumer: React.FC = () => {
  const { isAuthenticated, isAdmin, adminUsername, token, user, loginWithToken, logout, getAuthHeaders } = useAuth();

  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'unauthenticated'}</div>
      <div data-testid="auth-is-admin">{isAdmin ? 'admin' : 'not-admin'}</div>
      <div data-testid="auth-user">{adminUsername || 'none'}</div>
      <div data-testid="auth-role">{user?.role || 'none'}</div>
      <div data-testid="auth-token">{token || 'none'}</div>
      <div data-testid="auth-header">{JSON.stringify(getAuthHeaders())}</div>
      <button
        onClick={() =>
          loginWithToken('admin-slack-token-xyz', 5184000, {
            memberId: 1,
            f3Name: 'Splinter',
            role: 'admin',
            roles: ['admin', 'member'],
          })
        }
      >
        Login Admin via Slack
      </button>
      <button
        onClick={() =>
          loginWithToken('member-token-xyz', 5184000, {
            memberId: 42,
            f3Name: 'OBT',
            role: 'member',
            roles: ['member'],
          })
        }
      >
        Login Member via Slack
      </button>
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
    expect(screen.getByTestId('auth-is-admin').textContent).toBe('not-admin');
    expect(screen.getByTestId('auth-user').textContent).toBe('none');
    expect(screen.getByTestId('auth-token').textContent).toBe('none');
  });

  it('logs in admin via Slack OAuth and stores unified 60-day token in localStorage', async () => {
    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Login Admin via Slack'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('authenticated');
    });

    expect(screen.getByTestId('auth-is-admin').textContent).toBe('admin');
    expect(screen.getByTestId('auth-user').textContent).toBe('Splinter');
    expect(screen.getByTestId('auth-role').textContent).toBe('admin');
    expect(screen.getByTestId('auth-token').textContent).toBe('admin-slack-token-xyz');
    expect(screen.getByTestId('auth-header').textContent).toContain('admin-slack-token-xyz');

    expect(localStorage.getItem('f3rva_auth_token')).toBe('admin-slack-token-xyz');
  });

  it('stores member token in localStorage for 60-day persistent session', async () => {
    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Login Member via Slack'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('authenticated');
    });

    expect(screen.getByTestId('auth-is-admin').textContent).toBe('not-admin');
    expect(screen.getByTestId('auth-user').textContent).toBe('OBT');
    expect(screen.getByTestId('auth-role').textContent).toBe('member');
    expect(screen.getByTestId('auth-token').textContent).toBe('member-token-xyz');
    expect(localStorage.getItem('f3rva_auth_token')).toBe('member-token-xyz');
  });

  it('logs out and clears both localStorage and sessionStorage', async () => {
    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Login Admin via Slack'));
    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('authenticated');
    });

    fireEvent.click(screen.getByText('Logout'));
    expect(screen.getByTestId('auth-status').textContent).toBe('unauthenticated');
    expect(sessionStorage.getItem('f3rva_auth_token')).toBeNull();
    expect(localStorage.getItem('f3rva_auth_token')).toBeNull();
  });

  it('restores active admin token from localStorage on mount', () => {
    const futureExpiry = Date.now() + 3600 * 1000;
    localStorage.setItem('f3rva_auth_token', 'stored-admin-token');
    localStorage.setItem('f3rva_auth_expires_at', futureExpiry.toString());
    localStorage.setItem(
      'f3rva_auth_user',
      JSON.stringify({ memberId: 1, f3Name: 'Splinter', role: 'admin', roles: ['admin', 'member'] })
    );

    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status').textContent).toBe('authenticated');
    expect(screen.getByTestId('auth-is-admin').textContent).toBe('admin');
    expect(screen.getByTestId('auth-user').textContent).toBe('Splinter');
    expect(screen.getByTestId('auth-role').textContent).toBe('admin');
    expect(screen.getByTestId('auth-token').textContent).toBe('stored-admin-token');
  });

  it('restores active member token from localStorage on mount', () => {
    const futureExpiry = Date.now() + 3600 * 1000;
    localStorage.setItem('f3rva_auth_token', 'stored-member-token');
    localStorage.setItem('f3rva_auth_expires_at', futureExpiry.toString());
    localStorage.setItem('f3rva_auth_user', JSON.stringify({ memberId: 42, f3Name: 'HighTide', role: 'member' }));

    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status').textContent).toBe('authenticated');
    expect(screen.getByTestId('auth-is-admin').textContent).toBe('not-admin');
    expect(screen.getByTestId('auth-user').textContent).toBe('HighTide');
    expect(screen.getByTestId('auth-role').textContent).toBe('member');
    expect(screen.getByTestId('auth-token').textContent).toBe('stored-member-token');
  });

  it('throws an error if useAuth is called outside AuthProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestAuthConsumer />)).toThrow('useAuth must be used within an AuthProvider');
    consoleError.mockRestore();
  });

  it('proactively logs out when token expires on visibility change', async () => {
    localStorage.setItem('f3rva_auth_token', 'expired-token');
    localStorage.setItem('f3rva_auth_expires_at', (Date.now() + 10000).toString());

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
