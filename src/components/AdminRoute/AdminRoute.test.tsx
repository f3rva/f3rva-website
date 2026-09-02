import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { AuthContext, AuthContextType } from '../../context/AuthContext';
import AdminRoute from './AdminRoute';

const mockAuthContext = (overrides: Partial<AuthContextType> = {}): AuthContextType => ({
  token: null,
  isAuthenticated: false,
  isAdmin: false,
  user: null,
  adminUsername: null,
  loading: false,
  error: null,
  login: vi.fn(),
  loginWithToken: vi.fn(),
  logout: vi.fn(),
  getAuthHeaders: vi.fn().mockReturnValue({}),
  ...overrides,
});

describe('AdminRoute Component', () => {
  it('renders loading spinner when auth is loading', () => {
    render(
      <AuthContext.Provider value={mockAuthContext({ loading: true })}>
        <MemoryRouter>
          <AdminRoute>
            <div>Protected Content</div>
          </AdminRoute>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText(/Verifying admin credentials/i)).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects unauthenticated user to admin login', () => {
    render(
      <AuthContext.Provider value={mockAuthContext({ isAuthenticated: false })}>
        <MemoryRouter initialEntries={['/bigdata/admin']}>
          <Routes>
            <Route
              path="/bigdata/admin"
              element={
                <AdminRoute>
                  <div>Protected Admin Area</div>
                </AdminRoute>
              }
            />
            <Route path="/bigdata/admin/login" element={<div>Admin Login Page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText('Admin Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Admin Area')).not.toBeInTheDocument();
  });

  it('shows administrator access required when user is authenticated as member only', () => {
    render(
      <AuthContext.Provider
        value={mockAuthContext({
          isAuthenticated: true,
          isAdmin: false,
          user: { memberId: 10, f3Name: 'Bleeder', role: 'member' },
          token: 'member-jwt-token',
        })}
      >
        <MemoryRouter initialEntries={['/bigdata/admin']}>
          <AdminRoute>
            <div>Protected Admin Area</div>
          </AdminRoute>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText(/Administrator Access Required/i)).toBeInTheDocument();
    expect(screen.getByText(/Bleeder/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sign In as Admin/i })).toBeInTheDocument();
    expect(screen.queryByText('Protected Admin Area')).not.toBeInTheDocument();
  });

  it('renders protected children when authenticated as admin', () => {
    render(
      <AuthContext.Provider
        value={mockAuthContext({
          isAuthenticated: true,
          isAdmin: true,
          adminUsername: 'ChiefAdmin',
          token: 'admin-token',
        })}
      >
        <MemoryRouter initialEntries={['/bigdata/admin']}>
          <AdminRoute>
            <div>Protected Admin Area</div>
          </AdminRoute>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText('Protected Admin Area')).toBeInTheDocument();
  });
});
