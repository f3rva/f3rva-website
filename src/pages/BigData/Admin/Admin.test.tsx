import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider } from '../../../context/AuthContext';
import AdminLogin from './AdminLogin';
import AdminAliasRequests from './AdminAliasRequests';
import AdminManagePax from './AdminManagePax';

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

const mockMembers = [
  { memberId: 101, f3Name: 'Bischoff' },
  { memberId: 103, f3Name: 'Lockjaw' },
  { memberId: 202, f3Name: 'Bischoff_Old' },
  { memberId: 303, f3Name: 'Lockjaw_Typo' },
  { memberId: 123, f3Name: 'All PAX' },
];

describe('Admin Portal Components', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe('AdminLogin Component', () => {
    it('renders sign in form when unauthenticated', () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <AdminLogin />
          </AuthProvider>
        </MemoryRouter>
      );

      expect(screen.getByText(/Administrator Login/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Enter admin username/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/••••••••••••/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign In as Admin/i })).toBeInTheDocument();
    });

    it('renders admin login form with elevation notice when logged in as regular member', () => {
      localStorage.setItem('f3rva_auth_token', 'member-token');
      localStorage.setItem('f3rva_auth_expires_at', (Date.now() + 3600000).toString());
      localStorage.setItem('f3rva_auth_user', JSON.stringify({ memberId: 1, f3Name: 'Dingo', role: 'member' }));

      render(
        <MemoryRouter>
          <AuthProvider>
            <AdminLogin />
          </AuthProvider>
        </MemoryRouter>
      );

      expect(screen.getByText(/Currently signed in as/i)).toBeInTheDocument();
      expect(screen.getByText('Dingo')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Enter admin username/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign In as Admin/i })).toBeInTheDocument();
    });

    it('renders already authenticated card when logged in as admin', () => {
      localStorage.setItem('f3rva_auth_token', 'admin-token');
      localStorage.setItem('f3rva_auth_expires_at', (Date.now() + 3600000).toString());
      localStorage.setItem('f3rva_auth_user', JSON.stringify({ memberId: 0, f3Name: 'ChiefAdmin', role: 'admin' }));
      localStorage.setItem('f3rva_admin_token', 'admin-token');
      localStorage.setItem('f3rva_admin_username', 'ChiefAdmin');

      render(
        <MemoryRouter>
          <AuthProvider>
            <AdminLogin />
          </AuthProvider>
        </MemoryRouter>
      );

      expect(screen.getByText(/Already Authenticated/i)).toBeInTheDocument();
      expect(screen.getByText(/ChiefAdmin/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Go to Admin Portal/i })).toBeInTheDocument();
    });

    it('handles successful login and token storage', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          accessToken: 'mock_jwt_token_123',
          tokenType: 'bearer',
          expiresIn: 86400,
        }),
      } as Response);

      render(
        <MemoryRouter>
          <AuthProvider>
            <AdminLogin />
          </AuthProvider>
        </MemoryRouter>
      );

      fireEvent.change(screen.getByPlaceholderText(/Enter admin username/i), {
        target: { value: 'admin' },
      });
      fireEvent.change(screen.getByPlaceholderText(/••••••••••••/i), {
        target: { value: 'supersecret' },
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Sign In as Admin/i }));
      });

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/v2/admin/login'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ username: 'admin', password: 'supersecret' }),
        })
      );
    });

    it('displays error on invalid credentials', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          errorCode: 4001,
          errorMessage: 'Invalid username or password.',
        }),
      } as Response);

      render(
        <MemoryRouter>
          <AuthProvider>
            <AdminLogin />
          </AuthProvider>
        </MemoryRouter>
      );

      fireEvent.change(screen.getByPlaceholderText(/Enter admin username/i), {
        target: { value: 'wronguser' },
      });
      fireEvent.change(screen.getByPlaceholderText(/••••••••••••/i), {
        target: { value: 'wrongpass' },
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Sign In as Admin/i }));
      });

      await waitFor(() => {
        expect(screen.getByText('Invalid username or password.')).toBeInTheDocument();
      });
    });

    it('sanitizes open redirect attempts safely', async () => {
      const { sanitizeRedirectPath } = await import('../../../utils/validation');
      expect(sanitizeRedirectPath('https://malicious.com')).toBe('/bigdata/admin/alias-requests');
      expect(sanitizeRedirectPath('//malicious.com')).toBe('/bigdata/admin/alias-requests');
      expect(sanitizeRedirectPath('javascript:alert(1)')).toBe('/bigdata/admin/alias-requests');
      expect(sanitizeRedirectPath(null)).toBe('/bigdata/admin/alias-requests');
      expect(sanitizeRedirectPath(undefined)).toBe('/bigdata/admin/alias-requests');
      expect(sanitizeRedirectPath('/bigdata/admin/manage-pax')).toBe('/bigdata/admin/manage-pax');
    });
  });

  describe('AdminAliasRequests Component', () => {
    beforeEach(() => {
      // Set authenticated admin token
      localStorage.setItem('f3rva_admin_token', 'test_token');
      localStorage.setItem('f3rva_admin_expires_at', (Date.now() + 3600000).toString());
      localStorage.setItem('f3rva_admin_username', 'admin');
    });

    it('renders pending requests and approves a request', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
        const urlStr = url.toString();
        if (urlStr.includes('/v2/admin/aliases/requests')) {
          return {
            ok: true,
            json: async () => mockPendingRequests,
          } as Response;
        }
        if (urlStr.includes('/v2/admin/aliases/approve/101/202') && init?.method === 'POST') {
          return {
            ok: true,
            json: async () => ({
              primaryMember: { memberId: 101, f3Name: 'Bischoff' },
              aliasMember: { memberId: 202, f3Name: 'Bischoff_Old' },
              status: 'approved',
            }),
          } as Response;
        }
        return { ok: false } as Response;
      });

      render(
        <MemoryRouter>
          <AuthProvider>
            <AdminAliasRequests />
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getAllByText('Bischoff_Old').length).toBeGreaterThan(0);
      });

      expect(screen.getAllByText('Lockjaw_Typo').length).toBeGreaterThan(0);

      // Click Approve for first item
      const approveBtns = screen.getAllByRole('button', { name: /^Approve$/i });
      fireEvent.click(approveBtns[0]);

      // Verify confirmation modal opens
      expect(screen.getByText(/Approve Alias & Merge Records/i)).toBeInTheDocument();
      expect(screen.getByText(/This action is irreversible/i)).toBeInTheDocument();

      // Confirm merge
      const confirmBtn = screen.getByRole('button', { name: /Confirm & Merge/i });
      await act(async () => {
        fireEvent.click(confirmBtn);
      });

      await waitFor(() => {
        expect(screen.getByText(/Successfully approved and merged "Bischoff_Old" into "Bischoff"!/i)).toBeInTheDocument();
      });

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/v2/admin/aliases/approve/101/202'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test_token',
          }),
        })
      );
    });

    it('rejects a pending alias request', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
        const urlStr = url.toString();
        if (urlStr.includes('/v2/admin/aliases/requests')) {
          return {
            ok: true,
            json: async () => mockPendingRequests,
          } as Response;
        }
        if (urlStr.includes('/v2/admin/aliases/reject/101/202') && init?.method === 'POST') {
          return {
            ok: true,
            json: async () => ({
              primaryMember: { memberId: 101, f3Name: 'Bischoff' },
              aliasMember: { memberId: 202, f3Name: 'Bischoff_Old' },
              status: 'rejected',
            }),
          } as Response;
        }
        return { ok: false } as Response;
      });

      render(
        <MemoryRouter>
          <AuthProvider>
            <AdminAliasRequests />
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getAllByText('Bischoff_Old').length).toBeGreaterThan(0);
      });

      // Click Reject for first item
      const rejectBtns = screen.getAllByRole('button', { name: /^Reject$/i });
      fireEvent.click(rejectBtns[0]);

      // Verify confirmation modal opens
      expect(screen.getByText(/Reject Alias Request/i)).toBeInTheDocument();

      // Confirm reject
      const confirmBtn = screen.getByRole('button', { name: /Confirm Reject/i });
      await act(async () => {
        fireEvent.click(confirmBtn);
      });

      await waitFor(() => {
        expect(screen.getByText(/Rejected alias request for "Bischoff_Old"/i)).toBeInTheDocument();
      });

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/v2/admin/aliases/reject/101/202'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  describe('AdminManagePax Component', () => {
    beforeEach(() => {
      localStorage.setItem('f3rva_admin_token', 'test_token');
      localStorage.setItem('f3rva_admin_expires_at', (Date.now() + 3600000).toString());
      localStorage.setItem('f3rva_admin_username', 'admin');
    });

    it('renders direct merger tool and member directory browser', async () => {
      vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
        const urlStr = url.toString();
        if (urlStr.includes('/v2/members')) {
          return {
            ok: true,
            json: async () => mockMembers,
          } as Response;
        }
        return { ok: false } as Response;
      });

      render(
        <MemoryRouter>
          <AuthProvider>
            <AdminManagePax />
          </AuthProvider>
        </MemoryRouter>
      );

      expect(screen.getByText('Direct PAX Merger')).toBeInTheDocument();
      expect(screen.getByText('Member Directory Browser')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('5 registered member records in database')).toBeInTheDocument();
      });
    });

    it('populates form with quick-fill buttons and executes direct merge', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
        const urlStr = url.toString();
        if (urlStr.includes('/v2/members')) {
          return {
            ok: true,
            json: async () => mockMembers,
          } as Response;
        }
        if (urlStr.includes('/v2/admin/members/merge') && init?.method === 'POST') {
          return {
            ok: true,
            json: async () => ({
              primaryMember: { memberId: 101, f3Name: 'Bischoff' },
              aliasMember: { memberId: 202, f3Name: 'Bischoff_Old' },
              status: 'merged',
            }),
          } as Response;
        }
        return { ok: false } as Response;
      });

      render(
        <MemoryRouter>
          <AuthProvider>
            <AdminManagePax />
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('5 registered member records in database')).toBeInTheDocument();
      });

      // Quick fill Primary (Bischoff)
      const primaryQuickFillBtns = screen.getAllByRole('button', { name: /\+ Primary/i });
      fireEvent.click(primaryQuickFillBtns[0]); // Bischoff (#101)

      // Quick fill Alias (Bischoff_Old)
      const aliasQuickFillBtns = screen.getAllByRole('button', { name: /\+ Alias/i });
      fireEvent.click(aliasQuickFillBtns[2]); // Bischoff_Old (#202)

      // Verify selected chips
      expect(screen.getAllByText('#101').length).toBeGreaterThan(0);
      expect(screen.getAllByText('#202').length).toBeGreaterThan(0);

      // Click Execute Direct Merge
      const mergeBtn = screen.getByRole('button', { name: /Execute Direct Merge/i });
      fireEvent.click(mergeBtn);

      // Verify modal
      expect(screen.getByText(/Confirm Direct PAX Merger/i)).toBeInTheDocument();

      // Confirm merge
      const confirmBtn = screen.getByRole('button', { name: /Confirm & Execute Merge/i });
      await act(async () => {
        fireEvent.click(confirmBtn);
      });

      await waitFor(() => {
        expect(screen.getByText(/Successfully merged "Bischoff_Old" \(ID #202\) into "Bischoff" \(ID #101\)!/i)).toBeInTheDocument();
      });

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/v2/admin/members/merge'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            primary_member_id: 101,
            alias_member_id: 202,
          }),
        })
      );
    });
  });
});
