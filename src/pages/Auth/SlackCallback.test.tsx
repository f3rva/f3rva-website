import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SlackCallback } from './SlackCallback';
import { AuthProvider } from '../../context/AuthContext';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('SlackCallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('displays error when error query param is present', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/auth/slack/callback?error=access_denied&error_description=User%20denied']}>
          <Routes>
            <Route path="/auth/slack/callback" element={<SlackCallback />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByRole('heading', { name: /authentication failed/i })).toBeInTheDocument();
    expect(screen.getByText(/User denied/i)).toBeInTheDocument();
  });

  it('displays error when code query param is missing', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/auth/slack/callback']}>
          <Routes>
            <Route path="/auth/slack/callback" element={<SlackCallback />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByRole('heading', { name: /authentication failed/i })).toBeInTheDocument();
    expect(screen.getByText(/No authorization code provided/i)).toBeInTheDocument();
  });

  it('handles linked user exchange and navigates to target path', async () => {
    sessionStorage.setItem('f3rva_auth_return_to', '/backblast/new');
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/v2/auth/slack')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            isLinked: true,
            accessToken: 'jwt-linked-token',
            expiresIn: 86400,
            user: { memberId: 1, f3Name: 'Dingo', role: 'member' },
          }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: async () => [],
      } as Response);
    });

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/auth/slack/callback?code=valid-slack-code']}>
          <Routes>
            <Route path="/auth/slack/callback" element={<SlackCallback />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/backblast/new', { replace: true });
    });
  });

  it('opens confirmation modal when user is unlinked', async () => {
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/v2/auth/slack')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            isLinked: false,
            tempToken: 'temp-jwt-token',
            user: { f3Name: 'Dave B' },
            suggestedMember: { memberId: 1, f3Name: 'Dingo' },
          }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: async () => [{ memberId: 1, f3Name: 'Dingo' }],
      } as Response);
    });

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/auth/slack/callback?code=valid-code-unlinked']}>
          <Routes>
            <Route path="/auth/slack/callback" element={<SlackCallback />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /link your slack profile/i })).toBeInTheDocument();
    });
  });
});
