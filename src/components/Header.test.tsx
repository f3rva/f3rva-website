import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { AuthContext, AuthContextType } from '../context/AuthContext';
import MainNavigationHeader from './Header';

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

describe('MainNavigationHeader Component', () => {
  it('renders branding and primary navigation links', () => {
    render(
      <AuthContext.Provider value={mockAuthContext()}>
        <MemoryRouter>
          <MainNavigationHeader />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByAltText('F3 RVA Logo')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Schedule')).toBeInTheDocument();
    expect(screen.getByText('New Guy')).toBeInTheDocument();
    expect(screen.getByText('Archives')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Big Data/i })).toBeInTheDocument();
  });

  it('toggles Big Data dropdown menu when clicked', () => {
    render(
      <AuthContext.Provider value={mockAuthContext()}>
        <MemoryRouter>
          <MainNavigationHeader />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    const bigDataButton = screen.getByRole('button', { name: /Big Data/i });
    expect(bigDataButton).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(bigDataButton);
    expect(bigDataButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Attendance Leaderboard')).toBeInTheDocument();
    expect(screen.getByText('AO Analytics')).toBeInTheDocument();
    expect(screen.getByText('Day of Week')).toBeInTheDocument();
    expect(screen.getByText('Claim Alias')).toBeInTheDocument();
    expect(screen.getByText('Admin Login')).toBeInTheDocument();
  });

  it('displays Admin Portal and Log Out option when user is authenticated', () => {
    const logoutMock = vi.fn();

    render(
      <AuthContext.Provider
        value={mockAuthContext({
          isAuthenticated: true,
          adminUsername: 'ChiefAdmin',
          logout: logoutMock,
        })}
      >
        <MemoryRouter>
          <MainNavigationHeader />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    const bigDataButton = screen.getByRole('button', { name: /Big Data/i });
    fireEvent.click(bigDataButton);

    expect(screen.getByText(/Admin Portal \(ChiefAdmin\)/i)).toBeInTheDocument();
    const logoutBtn = screen.getByRole('button', { name: /Log Out/i });
    expect(logoutBtn).toBeInTheDocument();

    fireEvent.click(logoutBtn);
    expect(logoutMock).toHaveBeenCalled();
  });

  it('closes dropdown menu when a dropdown link is clicked', () => {
    render(
      <AuthContext.Provider value={mockAuthContext()}>
        <MemoryRouter>
          <MainNavigationHeader />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    const bigDataButton = screen.getByRole('button', { name: /Big Data/i });
    fireEvent.click(bigDataButton);
    expect(bigDataButton).toHaveAttribute('aria-expanded', 'true');

    const dashboardLink = screen.getByText('Dashboard');
    fireEvent.click(dashboardLink);

    expect(bigDataButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('toggles mobile navigation menu when hamburger button is clicked', () => {
    render(
      <AuthContext.Provider value={mockAuthContext()}>
        <MemoryRouter>
          <MainNavigationHeader />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    const hamburgerBtn = screen.getByLabelText('Toggle navigation menu');
    expect(hamburgerBtn).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(hamburgerBtn);
    expect(hamburgerBtn).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(hamburgerBtn);
    expect(hamburgerBtn).toHaveAttribute('aria-expanded', 'false');
  });
});

