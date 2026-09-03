import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthContext, AuthContextType } from '../../../context/AuthContext';
import ClaimAlias from './ClaimAlias';

const mockPendingRequests = [
  {
    primaryMember: { memberId: 101, f3Name: 'Bischoff' },
    aliasMember: { memberId: 202, f3Name: 'Bischoff_Old' },
    status: 'pending',
  },
  {
    primaryMember: { memberId: 103, f3Name: 'Lockjaw' },
    aliasMember: { memberId: 303, f3Name: 'Lockjaw_Typo' },
    status: 'pending',
  },
];

const mockMemberLookup = [
  { memberId: 101, f3Name: 'Bischoff' },
  { memberId: 202, f3Name: 'Bischoff_Old' },
  { memberId: 123, f3Name: 'All PAX' },
];

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

describe('ClaimAlias Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders sign-in prompt and pending requests queue when unauthenticated', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      const urlStr = url.toString();
      if (urlStr.includes('/v2/aliases/requests')) {
        return {
          ok: true,
          json: async () => mockPendingRequests,
        } as Response;
      }
      if (urlStr.includes('/v2/members')) {
        return {
          ok: true,
          json: async () => mockMemberLookup,
        } as Response;
      }
      return { ok: false } as Response;
    });

    render(
      <AuthContext.Provider value={mockAuthContext({ isAuthenticated: false })}>
        <MemoryRouter>
          <ClaimAlias />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText(/Claim Alias/i)).toBeInTheDocument();
    expect(screen.getByText('Sign in to Claim an Alias')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign in with Slack/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Bischoff_Old')).toBeInTheDocument();
    });

    expect(screen.getByText('Lockjaw_Typo')).toBeInTheDocument();
    expect(screen.getByText('2 Pending')).toBeInTheDocument();
  });

  it('renders locked primary profile card for authenticated member and submits alias request', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
      const urlStr = url.toString();
      if (urlStr.includes('/v2/aliases/requests')) {
        return {
          ok: true,
          json: async () => mockPendingRequests,
        } as Response;
      }
      if (urlStr.includes('/v2/members')) {
        return {
          ok: true,
          json: async () => mockMemberLookup,
        } as Response;
      }
      if (urlStr.includes('/v2/aliases/request') && init?.method === 'POST') {
        return {
          ok: true,
          status: 201,
          json: async () => ({
            primaryMember: { memberId: 101, f3Name: 'Bischoff' },
            aliasMember: { memberId: 202, f3Name: 'Bischoff_Old' },
            status: 'pending',
          }),
        } as Response;
      }
      return { ok: false } as Response;
    });

    render(
      <AuthContext.Provider
        value={mockAuthContext({
          isAuthenticated: true,
          isAdmin: false,
          user: { memberId: 101, f3Name: 'Bischoff', role: 'member' },
          getAuthHeaders: () => ({ Authorization: 'Bearer mock-jwt-token' }),
        })}
      >
        <MemoryRouter>
          <ClaimAlias />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Primary profile card is displayed and locked
    expect(screen.getByText(/1\. Primary Profile \(Your Account\)/i)).toBeInTheDocument();
    expect(screen.getByText('🔒 Locked')).toBeInTheDocument();
    expect(screen.getByText('Member ID #101')).toBeInTheDocument();

    // Primary search input is NOT shown for regular members
    expect(screen.queryByPlaceholderText('Search your primary F3 name...')).not.toBeInTheDocument();

    // Search and select alias member
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search the alias or duplicate name...')).toBeInTheDocument();
    });
    const aliasInput = screen.getByPlaceholderText('Search the alias or duplicate name...');
    fireEvent.change(aliasInput, { target: { value: 'Bischoff_Old' } });

    await waitFor(() => {
      expect(screen.getByRole('option', { name: /Bischoff_Old.*ID #202/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('option', { name: /Bischoff_Old.*ID #202/i }));
    expect(screen.getByText(/ID #202/)).toBeInTheDocument();

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /Submit Alias Claim Request/i });
    expect(submitBtn).not.toBeDisabled();

    await act(async () => {
      fireEvent.click(submitBtn);
    });

    await waitFor(() => {
      expect(screen.getByText(/Alias claim request for "Bischoff_Old" into "Bischoff" submitted successfully!/i)).toBeInTheDocument();
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/v2/aliases/request'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-jwt-token',
        }),
        body: JSON.stringify({
          primaryMemberId: 101,
          aliasMemberId: 202,
        }),
      })
    );
  });

  it('allows selecting both primary and alias in autocomplete when authenticated as admin', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      const urlStr = url.toString();
      if (urlStr.includes('/v2/aliases/requests')) {
        return {
          ok: true,
          json: async () => [],
        } as Response;
      }
      if (urlStr.includes('/v2/members')) {
        return {
          ok: true,
          json: async () => mockMemberLookup,
        } as Response;
      }
      return { ok: false } as Response;
    });

    render(
      <AuthContext.Provider
        value={mockAuthContext({
          isAuthenticated: true,
          isAdmin: true,
          adminUsername: 'ChiefAdmin',
        })}
      >
        <MemoryRouter>
          <ClaimAlias />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search your primary F3 name...')).toBeInTheDocument();
    });

    const primaryInput = screen.getByPlaceholderText('Search your primary F3 name...');
    fireEvent.change(primaryInput, { target: { value: 'All' } });

    await waitFor(() => {
      expect(screen.getByRole('option', { name: /All PAX ID #123/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('option', { name: /All.*PAX.*ID #123/i }));
    expect(screen.getByText(/ID #123/)).toBeInTheDocument();
  });

  it('handles duplicate conflict error (409) from API', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
      const urlStr = url.toString();
      if (urlStr.includes('/v2/aliases/requests')) {
        return {
          ok: true,
          json: async () => [],
        } as Response;
      }
      if (urlStr.includes('/v2/members')) {
        return {
          ok: true,
          json: async () => mockMemberLookup,
        } as Response;
      }
      if (urlStr.includes('/v2/aliases/request') && init?.method === 'POST') {
        return {
          ok: false,
          status: 409,
          json: async () => ({
            errorCode: 2004,
            errorMessage: 'A pending alias request already exists for these members.',
          }),
        } as Response;
      }
      return { ok: false } as Response;
    });

    render(
      <AuthContext.Provider
        value={mockAuthContext({
          isAuthenticated: true,
          isAdmin: false,
          user: { memberId: 101, f3Name: 'Bischoff', role: 'member' },
        })}
      >
        <MemoryRouter>
          <ClaimAlias />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Select alias
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search the alias or duplicate name...')).toBeInTheDocument();
    });
    const aliasInput = screen.getByPlaceholderText('Search the alias or duplicate name...');
    fireEvent.change(aliasInput, { target: { value: 'Bischoff_Old' } });
    await waitFor(() => {
      expect(screen.getByRole('option', { name: /Bischoff_Old ID #202/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('option', { name: /Bischoff_Old ID #202/i }));

    // Submit
    const submitBtn = screen.getByRole('button', { name: /Submit Alias Claim Request/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    await waitFor(() => {
      expect(screen.getByText('A pending alias request already exists for these members.')).toBeInTheDocument();
    });
  });

  it('filters pending requests queue by member name', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      const urlStr = url.toString();
      if (urlStr.includes('/v2/aliases/requests')) {
        return {
          ok: true,
          json: async () => [
            ...mockPendingRequests,
            {
              primaryMember: { memberId: 104, f3Name: 'Biscuits' },
              aliasMember: { memberId: 404, f3Name: 'Biscuits_Alt' },
              status: 'pending',
            },
            {
              primaryMember: { memberId: 105, f3Name: 'Drip' },
              aliasMember: { memberId: 505, f3Name: 'Drip_Alt' },
              status: 'pending',
            },
            {
              primaryMember: { memberId: 106, f3Name: 'Flash' },
              aliasMember: { memberId: 606, f3Name: 'Flash_Alt' },
              status: 'pending',
            },
            {
              primaryMember: { memberId: 107, f3Name: 'Boomer' },
              aliasMember: { memberId: 707, f3Name: 'Boomer_Alt' },
              status: 'pending',
            },
          ],
        } as Response;
      }
      if (urlStr.includes('/v2/members')) {
        return {
          ok: true,
          json: async () => mockMemberLookup,
        } as Response;
      }
      return { ok: false } as Response;
    });

    render(
      <AuthContext.Provider value={mockAuthContext()}>
        <MemoryRouter>
          <ClaimAlias />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Filter queue...')).toBeInTheDocument();
    });

    const filterInput = screen.getByPlaceholderText('Filter queue...');
    fireEvent.change(filterInput, { target: { value: 'Lockjaw' } });

    expect(screen.getByText('Lockjaw_Typo')).toBeInTheDocument();
    expect(screen.queryByText('Bischoff_Old')).not.toBeInTheDocument();
  });
});
