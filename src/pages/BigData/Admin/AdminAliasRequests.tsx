import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { config } from '../../../config';
import { useAuth } from '../../../hooks/useAuth';
import { AliasRequestResponse, ApiErrorResponse } from '../../../types/bigdata';
import BigDataPageHeader from '../../../components/BigDataPageHeader';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import SEO from '../../../components/SEO';
import '../BigData.css';
import '../SelfService/ClaimAlias.css';
import './Admin.css';

interface ConfirmActionState {
  type: 'approve' | 'reject';
  primaryId: number;
  primaryName: string;
  aliasId: number;
  aliasName: string;
}

export const AdminAliasRequests: React.FC = () => {
  const { getAuthHeaders, logout } = useAuth();
  const [requests, setRequests] = useState<AliasRequestResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTerm, setFilterTerm] = useState<string>('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [confirmModal, setConfirmModal] = useState<ConfirmActionState | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${config.apiBaseUrl}/v2/admin/aliases/requests`, {
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
        throw new Error(`Error loading alias requests (${response.status})`);
      }

      const data: AliasRequestResponse[] = await response.json();
      setRequests(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load alias requests.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, logout]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAction = async () => {
    if (!confirmModal) return;

    const { type, primaryId, aliasId, primaryName, aliasName } = confirmModal;
    setActionLoading(true);
    setAlert(null);

    try {
      const endpoint =
        type === 'approve'
          ? `${config.apiBaseUrl}/v2/admin/aliases/approve/${primaryId}/${aliasId}`
          : `${config.apiBaseUrl}/v2/admin/aliases/reject/${primaryId}/${aliasId}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (response.ok) {
        setAlert({
          type: 'success',
          message:
            type === 'approve'
              ? `Successfully approved and merged "${aliasName}" into "${primaryName}"!`
              : `Rejected alias request for "${aliasName}".`,
        });
        // Remove from local list
        setRequests((prev) =>
          prev.filter(
            (r) =>
              !(r.primaryMember.memberId === primaryId && r.aliasMember.memberId === aliasId)
          )
        );
      } else {
        const errData: ApiErrorResponse = await response.json().catch(() => ({
          errorCode: response.status,
          errorMessage: `Failed to ${type} alias request.`,
        }));
        setAlert({
          type: 'error',
          message: errData.errorMessage || `Failed to ${type} alias request.`,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `Network error during ${type}.`;
      setAlert({ type: 'error', message: msg });
    } finally {
      setActionLoading(false);
      setConfirmModal(null);
    }
  };

  const filteredRequests = useMemo(() => {
    const term = filterTerm.trim().toLowerCase();
    if (!term) return requests;

    return requests.filter(
      (r) =>
        r.primaryMember.f3Name.toLowerCase().includes(term) ||
        r.aliasMember.f3Name.toLowerCase().includes(term) ||
        r.primaryMember.memberId.toString().includes(term) ||
        r.aliasMember.memberId.toString().includes(term)
    );
  }, [requests, filterTerm]);

  return (
    <>
      <SEO
        title="Pending Alias Requests - F3 RVA Admin"
        description="Review, approve, or reject member alias claims."
        url="https://f3rva.org/bigdata/admin/alias-requests"
        type="website"
      />
      <div className="bigdata-page-container">
        <BigDataPageHeader
          title="Administrator Portal"
          description="Review submitted alias claims and manage PAX duplicate records."
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
          <Link to="/bigdata/admin/alias-requests" className="admin-nav-tab active">
            📋 Pending Alias Requests
            {requests.length > 0 && <span className="admin-tab-badge">{requests.length}</span>}
          </Link>
          <Link to="/bigdata/admin/manage-pax" className="admin-nav-tab">
            👥 Manage PAX & Merger
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

        <div className="bigdata-card">
          <div className="bigdata-card-header">
            <div>
              <h2 className="bigdata-card-title">Pending Alias Requests Queue</h2>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Review and approve member alias claims to atomically merge duplicate PAX records
              </span>
            </div>
            <div className="bigdata-search-container">
              <input
                type="text"
                className="bigdata-search-input"
                placeholder="Filter requests (name, ID)..."
                value={filterTerm}
                onChange={(e) => setFilterTerm(e.target.value)}
                aria-label="Filter alias requests"
              />
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
              <LoadingSpinner message="Loading pending alias requests..." />
            </div>
          ) : error ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#ef4444' }}>
              <p>⚠️ {error}</p>
              <button
                type="button"
                onClick={fetchRequests}
                className="claim-alias-submit-btn"
                style={{ maxWidth: '200px', margin: '1rem auto 0' }}
              >
                Retry
              </button>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎉</div>
              <p style={{ fontWeight: 600, margin: '0 0 0.25rem' }}>No pending alias requests!</p>
              <p style={{ fontSize: '0.9rem', margin: 0 }}>
                {filterTerm
                  ? `No requests match filter "${filterTerm}".`
                  : 'All member alias claims have been reviewed and processed.'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="bigdata-table-wrapper desktop-only-view">
                <table className="bigdata-table">
                  <thead>
                    <tr>
                      <th>Primary Profile (Keep)</th>
                      <th>Alias Profile (Merge & Delete)</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((req) => (
                      <tr
                        key={`req-${req.primaryMember.memberId}-${req.aliasMember.memberId}`}
                      >
                        <td>
                          <Link
                            to={`/bigdata/pax/${req.primaryMember.memberId}`}
                            className="member-name-link"
                            style={{ fontWeight: 600 }}
                          >
                            {req.primaryMember.f3Name}
                          </Link>
                          <span
                            style={{
                              marginLeft: '0.4rem',
                              fontSize: '0.8rem',
                              color: '#64748b',
                            }}
                          >
                            #{req.primaryMember.memberId}
                          </span>
                        </td>
                        <td>
                          <Link
                            to={`/bigdata/pax/${req.aliasMember.memberId}`}
                            className="member-name-link"
                            style={{ fontWeight: 600, color: '#b45309' }}
                          >
                            {req.aliasMember.f3Name}
                          </Link>
                          <span
                            style={{
                              marginLeft: '0.4rem',
                              fontSize: '0.8rem',
                              color: '#64748b',
                            }}
                          >
                            #{req.aliasMember.memberId}
                          </span>
                        </td>
                        <td>
                          <span className="pending-badge" style={{ margin: 0 }}>
                            Pending Review
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div
                            className="admin-action-btn-group"
                            style={{ justifyContent: 'flex-end' }}
                          >
                            <button
                              type="button"
                              className="admin-btn-approve"
                              onClick={() =>
                                setConfirmModal({
                                  type: 'approve',
                                  primaryId: req.primaryMember.memberId,
                                  primaryName: req.primaryMember.f3Name,
                                  aliasId: req.aliasMember.memberId,
                                  aliasName: req.aliasMember.f3Name,
                                })
                              }
                              disabled={actionLoading}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="admin-btn-reject"
                              onClick={() =>
                                setConfirmModal({
                                  type: 'reject',
                                  primaryId: req.primaryMember.memberId,
                                  primaryName: req.primaryMember.f3Name,
                                  aliasId: req.aliasMember.memberId,
                                  aliasName: req.aliasMember.f3Name,
                                })
                              }
                              disabled={actionLoading}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card Feed */}
              <div className="mobile-only-view">
                {filteredRequests.map((req) => (
                  <div
                    key={`mobile-req-${req.primaryMember.memberId}-${req.aliasMember.memberId}`}
                    className="bigdata-mobile-card"
                  >
                    <div className="bigdata-mobile-card-header">
                      <span className="pending-badge">Pending</span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        ID #{req.primaryMember.memberId} ← #{req.aliasMember.memberId}
                      </span>
                    </div>
                    <div style={{ margin: '0.75rem 0' }}>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Primary:</div>
                      <Link
                        to={`/bigdata/pax/${req.primaryMember.memberId}`}
                        style={{ fontWeight: 700, color: '#1e293b', textDecoration: 'none' }}
                      >
                        {req.primaryMember.f3Name}
                      </Link>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.4rem' }}>
                        Alias to Merge:
                      </div>
                      <Link
                        to={`/bigdata/pax/${req.aliasMember.memberId}`}
                        style={{ fontWeight: 700, color: '#b45309', textDecoration: 'none' }}
                      >
                        {req.aliasMember.f3Name}
                      </Link>
                    </div>
                    <div className="admin-action-btn-group" style={{ marginTop: '0.75rem' }}>
                      <button
                        type="button"
                        className="admin-btn-approve"
                        style={{ flex: 1 }}
                        onClick={() =>
                          setConfirmModal({
                            type: 'approve',
                            primaryId: req.primaryMember.memberId,
                            primaryName: req.primaryMember.f3Name,
                            aliasId: req.aliasMember.memberId,
                            aliasName: req.aliasMember.f3Name,
                          })
                        }
                        disabled={actionLoading}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="admin-btn-reject"
                        style={{ flex: 1 }}
                        onClick={() =>
                          setConfirmModal({
                            type: 'reject',
                            primaryId: req.primaryMember.memberId,
                            primaryName: req.primaryMember.f3Name,
                            aliasId: req.aliasMember.memberId,
                            aliasName: req.aliasMember.f3Name,
                          })
                        }
                        disabled={actionLoading}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Confirmation Modal */}
        {confirmModal && (
          <div className="admin-modal-backdrop" onClick={() => !actionLoading && setConfirmModal(null)}>
            <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
              <h3 className="admin-modal-title">
                {confirmModal.type === 'approve' ? 'Approve Alias & Merge Records' : 'Reject Alias Request'}
              </h3>
              <div className="admin-modal-body">
                {confirmModal.type === 'approve' ? (
                  <>
                    <p>
                      Are you sure you want to merge <strong>&quot;{confirmModal.aliasName}&quot;</strong> (ID #{confirmModal.aliasId}) into <strong>&quot;{confirmModal.primaryName}&quot;</strong> (ID #{confirmModal.primaryId})?
                    </p>
                    <div className="admin-warning-banner" style={{ margin: '0.75rem 0 0' }}>
                      ⚠️ <strong>This action is irreversible.</strong> All historical workout attendance and Q records will be reassigned to <em>{confirmModal.primaryName}</em>, an alias record will be created, and the duplicate member entity will be deleted.
                    </div>
                  </>
                ) : (
                  <p>
                    Are you sure you want to reject the alias claim for <strong>&quot;{confirmModal.aliasName}&quot;</strong> into <strong>&quot;{confirmModal.primaryName}&quot;</strong>?
                  </p>
                )}
              </div>
              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-modal-cancel"
                  onClick={() => setConfirmModal(null)}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`admin-modal-confirm ${confirmModal.type}`}
                  onClick={handleAction}
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? 'Processing...'
                    : confirmModal.type === 'approve'
                    ? 'Confirm & Merge'
                    : 'Confirm Reject'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminAliasRequests;
