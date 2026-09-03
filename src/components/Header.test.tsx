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
    expect(screen.getAllByText('Schedule')[0]).toBeInTheDocument();
    expect(screen.getAllByText('About')[0]).toBeInTheDocument();
    expect(screen.getAllByText('New Guy')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Archives')[0]).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Big Data/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Log In/i })[0]).toBeInTheDocument();
  });

  it('toggles Big Data dropdown menu when clicked', () => {
    render(
      <AuthContext.Provider value={mockAuthContext()}>
        <MemoryRouter>
          <MainNavigationHeader />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    const bigDataButton = screen.getAllByRole('button', { name: /Big Data/i })[0];
    expect(bigDataButton).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(bigDataButton);
    expect(bigDataButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Attendance Leaderboard')).toBeInTheDocument();
    expect(screen.getByText('AO Analytics')).toBeInTheDocument();
    expect(screen.getByText('Day of Week')).toBeInTheDocument();
    expect(screen.queryByText('Member Tools')).not.toBeInTheDocument();
  });

  it('toggles Log In dropdown menu when clicked and displays Slack and Admin options', () => {
    render(
      <AuthContext.Provider value={mockAuthContext()}>
        <MemoryRouter>
          <MainNavigationHeader />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    const loginBtn = screen.getAllByRole('button', { name: /Log In/i })[0];
    expect(loginBtn).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(loginBtn);
    expect(loginBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByText('Sign in with Slack')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Admin Login')[0]).toBeInTheDocument();
  });

  it('displays user profile badge and actions when authenticated as regular member', () => {
    const logoutMock = vi.fn();

    render(
      <AuthContext.Provider
        value={mockAuthContext({
          isAuthenticated: true,
          isAdmin: false,
          user: { memberId: 42, f3Name: 'Bleeder', role: 'member' },
          logout: logoutMock,
        })}
      >
        <MemoryRouter>
          <MainNavigationHeader />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Header displays member's name
    expect(screen.getAllByText('Bleeder')[0]).toBeInTheDocument();

    const userBadge = screen.getByLabelText('User account menu');
    expect(userBadge).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(userBadge);
    expect(userBadge).toHaveAttribute('aria-expanded', 'true');

    // Shows Post Backblast, personal stats link, and Claim PAX Alias
    expect(screen.getAllByText('Post Backblast')[0]).toBeInTheDocument();
    expect(screen.getAllByText('My Stats & Profile')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Claim PAX Alias')[0]).toBeInTheDocument();
    expect(screen.queryByText(/Admin Portal/i)).not.toBeInTheDocument();

    const logoutBtns = screen.getAllByRole('button', { name: /Log Out/i });
    fireEvent.click(logoutBtns[0]);
    expect(logoutMock).toHaveBeenCalled();
  });

  it('displays Admin Portal and admin controls when authenticated as admin', () => {
    render(
      <AuthContext.Provider
        value={mockAuthContext({
          isAuthenticated: true,
          isAdmin: true,
          adminUsername: 'ChiefAdmin',
        })}
      >
        <MemoryRouter>
          <MainNavigationHeader />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getAllByText('ChiefAdmin')[0]).toBeInTheDocument();

    const userBadge = screen.getByLabelText('User account menu');
    fireEvent.click(userBadge);

    expect(screen.getAllByText('Admin Portal')[0]).toBeInTheDocument();
    expect(screen.getByText('Manage PAX')).toBeInTheDocument();
  });

  it('closes dropdown menu when a dropdown link is clicked', () => {
    render(
      <AuthContext.Provider value={mockAuthContext()}>
        <MemoryRouter>
          <MainNavigationHeader />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    const bigDataButton = screen.getAllByRole('button', { name: /Big Data/i })[0];
    fireEvent.click(bigDataButton);
    expect(bigDataButton).toHaveAttribute('aria-expanded', 'true');

    const dashboardLink = screen.getByText('Dashboard');
    fireEvent.click(dashboardLink);

    expect(bigDataButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('toggles mobile navigation drawer when hamburger button is clicked', () => {
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

    // Close via close button in drawer
    const closeBtn = screen.getByLabelText('Close menu');
    fireEvent.click(closeBtn);
    expect(hamburgerBtn).toHaveAttribute('aria-expanded', 'false');
  });

  it('toggles mobile accordion for Big Data in mobile drawer', () => {
    render(
      <AuthContext.Provider value={mockAuthContext()}>
        <MemoryRouter>
          <MainNavigationHeader />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Open mobile menu
    const hamburgerBtn = screen.getByLabelText('Toggle navigation menu');
    fireEvent.click(hamburgerBtn);

    const accordionTriggers = screen.getAllByRole('button', { name: /Big Data/i });
    const mobileAccordionBtn = accordionTriggers[1]; // second one is in mobile drawer

    expect(mobileAccordionBtn).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(mobileAccordionBtn);
    expect(mobileAccordionBtn).toHaveAttribute('aria-expanded', 'true');
  });

  it('toggles mobile accordion for Log In in mobile drawer when unauthenticated', () => {
    render(
      <AuthContext.Provider value={mockAuthContext()}>
        <MemoryRouter>
          <MainNavigationHeader />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Open mobile menu
    const hamburgerBtn = screen.getByLabelText('Toggle navigation menu');
    fireEvent.click(hamburgerBtn);

    // Second Log In button is the mobile accordion trigger inside drawer
    const mobileLoginAccordionBtn = screen.getAllByRole('button', { name: /Log In/i })[1];
    expect(mobileLoginAccordionBtn).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(mobileLoginAccordionBtn);
    expect(mobileLoginAccordionBtn).toHaveAttribute('aria-expanded', 'true');

    // Reveals Slack & Admin options inside mobile drawer
    expect(screen.getAllByText('Sign in with Slack').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Admin Login').length).toBeGreaterThan(0);
  });

  it('toggles mobile accordion for authenticated user in mobile drawer', () => {
    render(
      <AuthContext.Provider
        value={mockAuthContext({
          isAuthenticated: true,
          isAdmin: false,
          user: { memberId: 42, f3Name: 'Bleeder', role: 'member' },
        })}
      >
        <MemoryRouter>
          <MainNavigationHeader />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Open mobile menu
    const hamburgerBtn = screen.getByLabelText('Toggle navigation menu');
    fireEvent.click(hamburgerBtn);

    const userAccordionBtn = screen.getByRole('button', { name: /Bleeder/i });
    expect(userAccordionBtn).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(userAccordionBtn);
    expect(userAccordionBtn).toHaveAttribute('aria-expanded', 'true');

    // Reveals member options inside mobile drawer
    expect(screen.getAllByText('Post Backblast').length).toBeGreaterThan(0);
    expect(screen.getAllByText('My Stats & Profile').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Claim PAX Alias').length).toBeGreaterThan(0);
  });
});

