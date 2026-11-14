import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider } from '../../../context/AuthContext';
import AdminLogin from './AdminLogin';
import AdminAliasRequests from './AdminAliasRequests';
import AdminManagePax from './AdminManagePax';
import AdminManageRoles from './AdminManageRoles';

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

const mockRoleAssignments = [
  {
    memberId: 1,
    f3Name: 'Splinter',
    slackDisplayName: 'Splinter',
    role: 'admin',
    grantedByMemberId: 1,
    grantedByF3Name: 'Splinter',
    createdAt: '2026-11-14T10:00:00Z',
  },
  {
    memberId: 103,
    f3Name: 'Lockjaw',
    slackDisplayName: 'Lockjaw',
    role: 'admin',
    grantedByMemberId: 1,
    grantedByF3Name: 'Splinter',
    createdAt: '2026-11-14T11:00:00Z',
  },
];

describe('Admin Portal Components', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('AdminLogin Component', () => {
    it('renders Sign in with Slack card when unauthenticated', () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <AdminLogin />
          </AuthProvider>
        </MemoryRouter>
      );

      expect(screen.getByText(/Administrator Portal/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign in with Slack/i })).toBeInTheDocument();
    });

    it('renders role required notice when logged in as regular member without admin role', () => {
      localStorage.setItem('f3rva_auth_token', 'member-token');
      localStorage.setItem('f3rva_auth_expires_at', (Date.now() + 3600000).toString());
      localStorage.setItem('f3rva_auth_user', JSON.stringify({ memberId: 10, f3Name: 'Dingo', role: 'member' }));

      render(
        <MemoryRouter>
          <AuthProvider>
            <AdminLogin />
          </AuthProvider>
        </MemoryRouter>
      );

      expect(screen.getByText(/Administrator Role Required/i)).toBeInTheDocument();
      expect(screen.getByText('Dingo')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Log Out & Refresh Session/i })).toBeInTheDocument();
    });

    it('renders already authenticated card when logged in as admin', () => {
      localStorage.setItem('f3rva_auth_token', 'admin-token');
      localStorage.setItem('f3rva_auth_expires_at', (Date.now() + 3600000).toString());
      localStorage.setItem(
        'f3rva_auth_user',
        JSON.stringify({ memberId: 1, f3Name: 'Splinter', role: 'admin', roles: ['admin', 'member'] })
      );

      render(
        <MemoryRouter>
          <AuthProvider>
            <AdminLogin />
          </AuthProvider>
        </MemoryRouter>
      );

      expect(screen.getByText(/Already Authenticated/i)).toBeInTheDocument();
      expect(screen.getByText(/Splinter/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Go to Admin Portal/i })).toBeInTheDocument();
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
      localStorage.setItem('f3rva_auth_token', 'test_token');
      localStorage.setItem('f3rva_auth_expires_at', (Date.now() + 3600000).toString());
      localStorage.setItem(
        'f3rva_auth_user',
        JSON.stringify({ memberId: 1, f3Name: 'Splinter', role: 'admin', roles: ['admin', 'member'] })
      );
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

      const approveBtns = screen.getAllByRole('button', { name: /^Approve$/i });
      fireEvent.click(approveBtns[0]);

      expect(screen.getByText(/Approve Alias & Merge Records/i)).toBeInTheDocument();
      expect(screen.getByText(/This action is irreversible/i)).toBeInTheDocument();

      const confirmBtn = screen.getByRole('button', { name: /Confirm & Merge/i });
      await act(async () => {
        fireEvent.click(confirmBtn);
      });

      await waitFor(() => {
        expect(
          screen.getByText(/Successfully approved and merged "Bischoff_Old" into "Bischoff"!/i)
        ).toBeInTheDocument();
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

      const rejectBtns = screen.getAllByRole('button', { name: /^Reject$/i });
      fireEvent.click(rejectBtns[0]);

      expect(screen.getByText(/Reject Alias Request/i)).toBeInTheDocument();

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
      localStorage.setItem('f3rva_auth_token', 'test_token');
      localStorage.setItem('f3rva_auth_expires_at', (Date.now() + 3600000).toString());
      localStorage.setItem(
        'f3rva_auth_user',
        JSON.stringify({ memberId: 1, f3Name: 'Splinter', role: 'admin', roles: ['admin', 'member'] })
      );
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

      const primaryQuickFillBtns = screen.getAllByRole('button', { name: /\+ Primary/i });
      fireEvent.click(primaryQuickFillBtns[0]);

      const aliasQuickFillBtns = screen.getAllByRole('button', { name: /\+ Alias/i });
      fireEvent.click(aliasQuickFillBtns[2]);

      expect(screen.getAllByText('#101').length).toBeGreaterThan(0);
      expect(screen.getAllByText('#202').length).toBeGreaterThan(0);

      const mergeBtn = screen.getByRole('button', { name: /Execute Direct Merge/i });
      fireEvent.click(mergeBtn);

      expect(screen.getByText(/Confirm Direct PAX Merger/i)).toBeInTheDocument();

      const confirmBtn = screen.getByRole('button', { name: /Confirm & Execute Merge/i });
      await act(async () => {
        fireEvent.click(confirmBtn);
      });

      await waitFor(() => {
        expect(
          screen.getByText(/Successfully merged "Bischoff_Old" \(ID #202\) into "Bischoff" \(ID #101\)!/i)
        ).toBeInTheDocument();
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

  describe('AdminManageRoles Component', () => {
    beforeEach(() => {
      localStorage.setItem('f3rva_auth_token', 'test_token');
      localStorage.setItem('f3rva_auth_expires_at', (Date.now() + 3600000).toString());
      localStorage.setItem(
        'f3rva_auth_user',
        JSON.stringify({ memberId: 1, f3Name: 'Splinter', role: 'admin', roles: ['admin', 'member'] })
      );
    });

    it('renders assigned roles, disables self-revoke on current user, and revokes another member role', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
        const urlStr = url.toString();
        if (urlStr.includes('/v2/members')) {
          return {
            ok: true,
            json: async () => mockMembers,
          } as Response;
        }
        if (urlStr.includes('/v2/admin/roles')) {
          return {
            ok: true,
            json: async () => mockRoleAssignments,
          } as Response;
        }
        if (urlStr.includes('/v2/admin/members/103/roles/admin') && init?.method === 'DELETE') {
          return {
            ok: true,
            json: async () => ({
              message: "Role 'admin' revoked from member ID 103.",
              memberId: 103,
              role: 'admin',
            }),
          } as Response;
        }
        return { ok: false } as Response;
      });

      render(
        <MemoryRouter>
          <AuthProvider>
            <AdminManageRoles />
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Assigned Roles (2)')).toBeInTheDocument();
      });

      // Verify self-revoke button is disabled ("Current User")
      const currentUserBtn = screen.getByRole('button', { name: /Current User/i });
      expect(currentUserBtn).toBeDisabled();

      // Click Revoke for Lockjaw (#103)
      const revokeBtn = screen.getByRole('button', { name: /^Revoke$/i });
      fireEvent.click(revokeBtn);

      expect(screen.getByText(/Revoke Member Role/i)).toBeInTheDocument();

      const confirmRevokeBtn = screen.getByRole('button', { name: /Confirm Revoke/i });
      await act(async () => {
        fireEvent.click(confirmRevokeBtn);
      });

      await waitFor(() => {
        expect(screen.getByText(/Revoked "admin" role from Lockjaw \(ID #103\)\./i)).toBeInTheDocument();
      });

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/v2/admin/members/103/roles/admin'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('grants a role to a selected PAX member', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
        const urlStr = url.toString();
        if (urlStr.includes('/v2/members')) {
          return {
            ok: true,
            json: async () => mockMembers,
          } as Response;
        }
        if (urlStr.includes('/v2/admin/roles')) {
          return {
            ok: true,
            json: async () => mockRoleAssignments,
          } as Response;
        }
        if (urlStr.includes('/v2/admin/members/101/roles') && init?.method === 'POST') {
          return {
            ok: true,
            status: 201,
            json: async () => ({
              memberId: 101,
              f3Name: 'Bischoff',
              slackDisplayName: 'Bischoff',
              role: 'admin',
              grantedByMemberId: 1,
              grantedByF3Name: 'Splinter',
              createdAt: '2026-11-14T12:00:00Z',
            }),
          } as Response;
        }
        return { ok: false } as Response;
      });

      render(
        <MemoryRouter>
          <AuthProvider>
            <AdminManageRoles />
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Assigned Roles (2)')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Search PAX by F3 name/i)).not.toBeDisabled();
      });

      const searchInput = screen.getByPlaceholderText(/Search PAX by F3 name/i);
      fireEvent.focus(searchInput);
      fireEvent.change(searchInput, { target: { value: 'Bischoff' } });

      const options = await screen.findAllByText('Bischoff');
      fireEvent.click(options[0]);

      const grantBtn = screen.getByRole('button', { name: /^Grant Role$/i });
      await act(async () => {
        fireEvent.click(grantBtn);
      });

      await waitFor(() => {
        expect(screen.getByText(/Granted "admin" role to Bischoff \(ID #101\)/i)).toBeInTheDocument();
      });

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/v2/admin/members/101/roles'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ role: 'admin' }),
        })
      );
    });
  });
});
