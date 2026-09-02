import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { BackblastForm } from './BackblastForm';
import { AuthContext } from '../../context/AuthContext';

describe('BackblastForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/v2/workouts/aos')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ id: 1, description: 'First Watch', slug: 'first-watch' }],
        } as Response);
      }
      if (url.includes('/v2/members')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ memberId: 1, f3Name: 'Dingo' }],
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: async () => [],
      } as Response);
    });
  });

  it('renders Slack login prompt when unauthenticated', () => {
    const mockAuthContext = {
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
      getAuthHeaders: vi.fn(),
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter>
          <BackblastForm />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByRole('heading', { name: /sign in with slack/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in with slack/i })).toBeInTheDocument();
  });

  it('renders backblast form when authenticated', async () => {
    const mockAuthContext = {
      token: 'valid-jwt',
      isAuthenticated: true,
      isAdmin: false,
      user: { memberId: 1, f3Name: 'Dingo', role: 'member' as const },
      adminUsername: 'Dingo',
      loading: false,
      error: null,
      login: vi.fn(),
      loginWithToken: vi.fn(),
      logout: vi.fn(),
      getAuthHeaders: vi.fn().mockReturnValue({ Authorization: 'Bearer valid-jwt' }),
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter>
          <BackblastForm />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(await screen.findByRole('heading', { name: /post a backblast/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/workout title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/workout date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/area of operations/i)).toBeInTheDocument();
    expect(screen.getByText(/q \/ co-q\(s\)/i)).toBeInTheDocument();
    expect(screen.getByText(/pax attendees/i)).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    const mockAuthContext = {
      token: 'valid-jwt',
      isAuthenticated: true,
      isAdmin: false,
      user: { memberId: 1, f3Name: 'Dingo', role: 'member' as const },
      adminUsername: 'Dingo',
      loading: false,
      error: null,
      login: vi.fn(),
      loginWithToken: vi.fn(),
      logout: vi.fn(),
      getAuthHeaders: vi.fn().mockReturnValue({ Authorization: 'Bearer valid-jwt' }),
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter>
          <BackblastForm />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    const submitBtn = await screen.findByRole('button', { name: /publish backblast/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Title is required.')).toBeInTheDocument();
  });
});
