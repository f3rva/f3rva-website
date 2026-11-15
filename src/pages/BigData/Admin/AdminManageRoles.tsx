import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { config } from '../../../config';
import { useAuth } from '../../../hooks/useAuth';
import {
  MemberSummary,
  MemberRoleAssignmentResponse,
  ApiErrorResponse,
} from '../../../types/bigdata';
import { useFetch } from '../../../hooks/useFetch';
import BigDataPageHeader from '../../../components/BigDataPageHeader';
import PaxAutocomplete from '../SelfService/PaxAutocomplete';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import SEO from '../../../components/SEO';
import '../BigData.css';
import '../SelfService/ClaimAlias.css';
import './Admin.css';

export const AdminManageRoles: React.FC = () => {
  const { user, getAuthHeaders, logout } = useAuth();

  // Form State
  const [selectedMember, setSelectedMember] = useState<MemberSummary | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('admin');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Active Role Assignments State
  const [assignments, setAssignments] = useState<MemberRoleAssignmentResponse[]>([]);
  const [loadingRoles, setLoadingRoles] = useState<boolean>(true);
  const [errorRoles, setErrorRoles] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<MemberRoleAssignmentResponse | null>(null);
  const [revoking, setRevoking] = useState<boolean>(false);

  // Fetch all members for PaxAutocomplete
  const {
    data: allMembers,
    loading: loadingMembers,
  } = useFetch<MemberSummary[]>(`${config.apiBaseUrl}/v2/members`);

  const fetchRoleAssignments = useCallback(async () => {
    setLoadingRoles(true);
    setErrorRoles(null);
    try {
      const response = await fetch(`${config.apiBaseUrl}/v2/admin/roles`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error(`Error loading role assignments (${response.status})`);
      }

      const data: MemberRoleAssignmentResponse[] = await response.json();
      setAssignments(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load role assignments.';
      setErrorRoles(msg);
    } finally {
      setLoadingRoles(false);
    }
  }, [getAuthHeaders, logout]);

  useEffect(() => {
    fetchRoleAssignments();
  }, [fetchRoleAssignments]);

  const handleGrantRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (!selectedMember) {
      setAlert({
        type: 'error',
        message: 'Please select a PAX member to grant the role.',
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(
        `${config.apiBaseUrl}/v2/admin/members/${selectedMember.memberId}/roles`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ role: selectedRole }),
        }
      );

      if (response.status === 401) {
        logout();
        return;
      }

      if (response.ok) {
        const granted: MemberRoleAssignmentResponse = await response.json();
        setAlert({
          type: 'success',
          message: `Granted "${granted.role}" role to ${granted.f3Name} (ID #${granted.memberId}). They will receive admin access on their next Slack sign-in.`,
        });
        setSelectedMember(null);
        await fetchRoleAssignments();
      } else {
        const errData: ApiErrorResponse = await response.json().catch(() => ({
          errorCode: response.status,
          errorMessage: 'Failed to grant role.',
        }));
        setAlert({
          type: 'error',
          message: errData.errorMessage || 'Failed to grant role.',
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error while granting role.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const executeRevokeRole = async () => {
    if (!revokeTarget) return;

    setRevoking(true);
    setAlert(null);

    try {
      const response = await fetch(
        `${config.apiBaseUrl}/v2/admin/members/${revokeTarget.memberId}/roles/${encodeURIComponent(
          revokeTarget.role
        )}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
        }
      );

      if (response.status === 401) {
        logout();
        return;
      }

      if (response.ok) {
        setAlert({
          type: 'success',
          message: `Revoked "${revokeTarget.role}" role from ${revokeTarget.f3Name} (ID #${revokeTarget.memberId}).`,
        });
        setAssignments((prev) =>
          prev.filter(
            (a) => !(a.memberId === revokeTarget.memberId && a.role === revokeTarget.role)
          )
        );
      } else {
        const errData: ApiErrorResponse = await response.json().catch(() => ({
          errorCode: response.status,
          errorMessage: 'Failed to revoke role.',
        }));
        setAlert({
          type: 'error',
          message: errData.errorMessage || 'Failed to revoke role.',
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error while revoking role.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setRevoking(false);
      setRevokeTarget(null);
    }
  };

  return (
    <>
      <SEO
        title="Manage Roles & Access - F3 RVA Admin"
        description="Grant and revoke administrator roles for F3 RVA members."
        url="https://f3rva.org/bigdata/admin/roles"
        type="website"
        noindex={true}
      />
      <div className="bigdata-page-container">
        <BigDataPageHeader
          title="Administrator Portal"
          description="Manage Role-Based Access Control (RBAC) assignments for F3 RVA members."
          category="ADMIN"
          actions={
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link
                to="/bigdata/claim-alias"
                className="bigdata-pill count-pill"
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.9rem' }}
              >
                Self-Service Claim ↗
              </Link>
              <Link
                to="/bigdata"
                className="bigdata-pill q-pill"
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.9rem' }}
              >
                Big Data Hub ↗
              </Link>
            </div>
          }
        />

        {/* Navigation Tabs */}
        <div className="admin-nav-tabs">
          <Link to="/bigdata/admin/alias-requests" className="admin-nav-tab">
            📋 Pending Alias Requests
          </Link>
          <Link to="/bigdata/admin/manage-pax" className="admin-nav-tab">
            👥 Manage PAX &amp; Merger
          </Link>
          <Link to="/bigdata/admin/roles" className="admin-nav-tab active">
            🛡️ Manage Roles
            {assignments.length > 0 && <span className="admin-tab-badge">{assignments.length}</span>}
          </Link>
        </div>

        {alert && (
          <div
            className={`claim-alias-alert ${alert.type === 'success' ? 'alert-success' : 'alert-error'}`}
            style={{ marginBottom: '1.5rem' }}
          >
            <span>{alert.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{alert.message}</span>
          </div>
        )}

        <div className="admin-manage-grid">
          {/* Left Column: Grant Role Form */}
          <div className="bigdata-card">
            <div className="bigdata-card-header" style={{ marginBottom: '1.25rem' }}>
              <div>
                <h2 className="bigdata-card-title">Grant Member Role</h2>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Assign elevated permissions to an F3 RVA PAX member
                </span>
              </div>
            </div>

            <form onSubmit={handleGrantRole} className="claim-alias-form">
              <PaxAutocomplete
                id="admin-role-member"
                label="1. Select PAX Member"
                placeholder="Search PAX by F3 name..."
                helpText="The member must link their Slack account when signing in to use their role."
                members={allMembers || []}
                loadingMembers={loadingMembers}
                selectedMember={selectedMember}
                onSelectMember={setSelectedMember}
                disabled={submitting}
              />

              <div className="admin-form-group" style={{ marginTop: '0.5rem' }}>
                <label htmlFor="admin-role-select" className="admin-form-label">
                  2. Select Role
                </label>
                <select
                  id="admin-role-select"
                  className="admin-form-input"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  disabled={submitting}
                >
                  <option value="admin">admin — Regional Administrator (Full Access + Role Management)</option>
                  <option value="moderator">moderator — Moderator (Alias Approval, PAX Merge &amp; Backblasts)</option>
                </select>
              </div>

              <div style={{ marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  className="admin-btn-merge"
                  disabled={submitting || !selectedMember || loadingMembers}
                >
                  {submitting ? 'Granting Role...' : 'Grant Role'}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Active Role Assignments Table */}
          <div className="bigdata-card">
            <div className="bigdata-card-header">
              <div>
                <h2 className="bigdata-card-title">Assigned Roles ({assignments.length})</h2>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Members currently holding elevated permissions in <code>MEMBER_ROLE</code>
                </span>
              </div>
            </div>

            {loadingRoles ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                <LoadingSpinner message="Loading role assignments..." />
              </div>
            ) : errorRoles ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#ef4444' }}>
                <p>⚠️ {errorRoles}</p>
                <button
                  type="button"
                  onClick={fetchRoleAssignments}
                  className="claim-alias-submit-btn"
                  style={{ maxWidth: '200px', margin: '1rem auto 0' }}
                >
                  Retry
                </button>
              </div>
            ) : assignments.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b' }}>
                <p>No active role assignments found.</p>
              </div>
            ) : (
              <div className="bigdata-table-wrapper">
                <table className="bigdata-table">
                  <thead>
                    <tr>
                      <th>PAX Member</th>
                      <th>Slack Linked</th>
                      <th>Role</th>
                      <th>Granted By</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((assignment) => {
                      const isSelf =
                        user?.memberId !== undefined &&
                        Number(user.memberId) === Number(assignment.memberId) &&
                        assignment.role === 'admin';

                      return (
                        <tr key={`role-${assignment.memberId}-${assignment.role}`}>
                          <td>
                            <Link
                              to={`/bigdata/pax/${assignment.memberId}`}
                              className="member-name-link"
                              style={{ fontWeight: 600 }}
                            >
                              {assignment.f3Name}
                            </Link>
                            <span
                              style={{
                                marginLeft: '0.4rem',
                                fontSize: '0.8rem',
                                color: '#64748b',
                              }}
                            >
                              #{assignment.memberId}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.85rem', color: '#475569' }}>
                            {assignment.slackDisplayName ? (
                              <span>@{assignment.slackDisplayName}</span>
                            ) : (
                              <span style={{ color: '#94a3b8' }}>Not linked yet</span>
                            )}
                          </td>
                          <td>
                            <span className="pending-badge" style={{ margin: 0 }}>
                              {assignment.role}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                            {assignment.grantedByF3Name || 'System'}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="admin-btn-reject"
                              onClick={() => setRevokeTarget(assignment)}
                              disabled={isSelf || revoking}
                              title={
                                isSelf
                                  ? 'You cannot revoke your own administrator role'
                                  : `Revoke ${assignment.role} role from ${assignment.f3Name}`
                              }
                            >
                              {isSelf ? 'Current User' : 'Revoke'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Revoke Role Confirmation Modal */}
        {revokeTarget && (
          <div className="admin-modal-backdrop" onClick={() => !revoking && setRevokeTarget(null)}>
            <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
              <h3 className="admin-modal-title">Revoke Member Role</h3>
              <div className="admin-modal-body">
                <p>
                  Are you sure you want to revoke the <strong>&quot;{revokeTarget.role}&quot;</strong> role from{' '}
                  <strong>{revokeTarget.f3Name}</strong> (ID #{revokeTarget.memberId})?
                </p>
              </div>
              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-modal-cancel"
                  onClick={() => setRevokeTarget(null)}
                  disabled={revoking}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="admin-modal-confirm reject"
                  onClick={executeRevokeRole}
                  disabled={revoking}
                >
                  {revoking ? 'Revoking...' : 'Confirm Revoke'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminManageRoles;
