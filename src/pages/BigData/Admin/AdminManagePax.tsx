import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { config } from '../../../config';
import { useAuth } from '../../../hooks/useAuth';
import { MemberSummary, ApiErrorResponse } from '../../../types/bigdata';
import { useFetch } from '../../../hooks/useFetch';
import BigDataPageHeader from '../../../components/BigDataPageHeader';
import PaxAutocomplete from '../SelfService/PaxAutocomplete';
import Pagination from '../../../components/Pagination';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import SEO from '../../../components/SEO';
import '../BigData.css';
import '../SelfService/ClaimAlias.css';
import './Admin.css';

export const AdminManagePax: React.FC = () => {
  const { getAuthHeaders, logout } = useAuth();

  // Form State
  const [primaryMember, setPrimaryMember] = useState<MemberSummary | null>(null);
  const [aliasMember, setAliasMember] = useState<MemberSummary | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // Directory Search & Pagination State
  const [directorySearch, setDirectorySearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [resultsPerPage, setResultsPerPage] = useState<number>(20);

  // Fetch all members
  const [fetchKey, setFetchKey] = useState<number>(0);
  const membersUrl = `${config.apiBaseUrl}/v2/members${fetchKey > 0 ? `?_k=${fetchKey}` : ''}`;
  const {
    data: allMembers,
    loading: loadingMembers,
    error: errorMembers,
    setData: setAllMembers,
  } = useFetch<MemberSummary[]>(membersUrl);

  // Filter member directory
  const filteredDirectory = useMemo(() => {
    if (!allMembers) return [];
    const term = directorySearch.trim().toLowerCase();
    if (!term) return allMembers;

    return allMembers.filter(
      (m) =>
        m.f3Name.toLowerCase().includes(term) ||
        m.memberId.toString().includes(term)
    );
  }, [allMembers, directorySearch]);

  const hasMoreResults = currentPage * resultsPerPage < filteredDirectory.length;
  const paginatedDirectory = useMemo(() => {
    const start = (currentPage - 1) * resultsPerPage;
    return filteredDirectory.slice(start, start + resultsPerPage);
  }, [filteredDirectory, currentPage, resultsPerPage]);

  const handleResultsPerPageChange = (newResultsPerPage: number) => {
    setResultsPerPage(newResultsPerPage);
    setCurrentPage(1);
  };

  const handleDirectorySearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDirectorySearch(e.target.value);
    setCurrentPage(1);
  };

  const handleFormSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (!primaryMember || !aliasMember) {
      setAlert({
        type: 'error',
        message: 'Please select both a primary member and an alias member to merge.',
      });
      return;
    }

    if (primaryMember.memberId === aliasMember.memberId) {
      setAlert({
        type: 'error',
        message: 'Primary member and alias member cannot be the same record.',
      });
      return;
    }

    setShowConfirmModal(true);
  };

  const executeMerge = useCallback(async () => {
    if (!primaryMember || !aliasMember) return;

    setSubmitting(true);
    setAlert(null);

    try {
      const response = await fetch(`${config.apiBaseUrl}/v2/admin/members/merge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          primary_member_id: primaryMember.memberId,
          alias_member_id: aliasMember.memberId,
        }),
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (response.ok) {
        setAlert({
          type: 'success',
          message: `Successfully merged "${aliasMember.f3Name}" (ID #${aliasMember.memberId}) into "${primaryMember.f3Name}" (ID #${primaryMember.memberId})! All workouts, Qs, and attendance have been combined.`,
        });

        // Update local member list (remove the merged duplicate)
        setAllMembers((prev) =>
          prev ? prev.filter((m) => m.memberId !== aliasMember.memberId) : []
        );
        setFetchKey((k) => k + 1);

        // Reset form
        setPrimaryMember(null);
        setAliasMember(null);
      } else {
        const errData: ApiErrorResponse = await response.json().catch(() => ({
          errorCode: response.status,
          errorMessage: 'Failed to merge members.',
        }));

        setAlert({
          type: 'error',
          message: errData.errorMessage || 'Failed to merge members.',
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error during member merger.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
      setShowConfirmModal(false);
    }
  }, [primaryMember, aliasMember, getAuthHeaders, logout, setAllMembers]);

  return (
    <>
      <SEO
        title="Manage PAX & Direct Merger - F3 RVA Admin"
        description="Directly merge duplicate member entities and browse member directory."
        url="https://f3rva.org/bigdata/admin/manage-pax"
        type="website"
      />
      <div className="bigdata-page-container">
        <BigDataPageHeader
          title="Administrator Portal"
          description="Directly merge duplicate member entities and manage the community directory."
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
          <Link to="/bigdata/admin/manage-pax" className="admin-nav-tab active">
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

        <div className="admin-manage-grid">
          {/* Left Column: Direct Merger Form */}
          <div className="bigdata-card">
            <div className="bigdata-card-header" style={{ marginBottom: '1.25rem' }}>
              <div>
                <h2 className="bigdata-card-title">Direct PAX Merger</h2>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Combine two duplicate member entities directly without a pending request
                </span>
              </div>
            </div>

            <div className="admin-warning-banner">
              ⚠️ <strong>Administrative Action:</strong> This operation immediately reassigns all workout attendance and Q leadership records from the alias to the primary user, records the alias in <code>MEMBER_ALIAS</code>, and deletes the duplicate member record.
            </div>

            <form onSubmit={handleFormSubmitClick} className="claim-alias-form">
              <PaxAutocomplete
                id="admin-primary-member"
                label="1. Target Primary Profile (Keep)"
                placeholder="Search primary member..."
                helpText="The primary profile that will retain all combined attendance and stats."
                members={allMembers || []}
                loadingMembers={loadingMembers}
                selectedMember={primaryMember}
                onSelectMember={setPrimaryMember}
                disabled={submitting}
              />

              <PaxAutocomplete
                id="admin-alias-member"
                label="2. Duplicate Record to Merge (Delete)"
                placeholder="Search duplicate member to merge..."
                helpText="The duplicate record whose attendance will be transferred before deletion."
                members={allMembers || []}
                loadingMembers={loadingMembers}
                selectedMember={aliasMember}
                onSelectMember={setAliasMember}
                disabled={submitting}
              />

              <div style={{ marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  className="admin-btn-merge"
                  disabled={submitting || !primaryMember || !aliasMember || loadingMembers}
                >
                  {submitting ? 'Merging Members...' : 'Execute Direct Merge'}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Searchable Member Directory */}
          <div className="bigdata-card">
            <div className="bigdata-card-header">
              <div>
                <h2 className="bigdata-card-title">Member Directory Browser</h2>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {filteredDirectory.length} registered member records in database
                </span>
              </div>
            </div>

            <input
              type="text"
              className="admin-directory-search"
              placeholder="Search directory (F3 name, member ID)..."
              value={directorySearch}
              onChange={handleDirectorySearchChange}
              aria-label="Search member directory"
            />

            {loadingMembers ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                <LoadingSpinner message="Loading member directory..." />
              </div>
            ) : errorMembers ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#ef4444' }}>
                <p>⚠️ {errorMembers}</p>
              </div>
            ) : paginatedDirectory.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b' }}>
                <p>No members match &quot;{directorySearch}&quot;</p>
              </div>
            ) : (
              <>
                <div className="bigdata-table-wrapper" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                  <table className="bigdata-table">
                    <thead>
                      <tr>
                        <th style={{ width: '80px' }}>ID</th>
                        <th>F3 Name</th>
                        <th style={{ textAlign: 'right' }}>Quick Fill</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedDirectory.map((m) => (
                        <tr key={`dir-${m.memberId}`}>
                          <td style={{ fontWeight: 600, color: '#64748b', fontSize: '0.85rem' }}>
                            #{m.memberId}
                          </td>
                          <td>
                            <Link
                              to={`/bigdata/pax/${m.memberId}`}
                              className="member-name-link"
                              style={{ fontWeight: 600 }}
                            >
                              {m.f3Name}
                            </Link>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                              <button
                                type="button"
                                className="admin-quick-fill-btn"
                                onClick={() => setPrimaryMember(m)}
                                title="Select as Primary Profile"
                              >
                                + Primary
                              </button>
                              <button
                                type="button"
                                className="admin-quick-fill-btn"
                                onClick={() => setAliasMember(m)}
                                title="Select as Duplicate Alias"
                              >
                                + Alias
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {(filteredDirectory.length > resultsPerPage || currentPage > 1) && (
                  <div style={{ marginTop: '1rem' }}>
                    <Pagination
                      currentPage={currentPage}
                      resultsPerPage={resultsPerPage}
                      hasMoreResults={hasMoreResults}
                      loading={loadingMembers}
                      onPageChange={setCurrentPage}
                      onResultsPerPageChange={handleResultsPerPageChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Merge Confirmation Modal */}
        {showConfirmModal && primaryMember && aliasMember && (
          <div className="admin-modal-backdrop" onClick={() => !submitting && setShowConfirmModal(false)}>
            <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
              <h3 className="admin-modal-title">Confirm Direct PAX Merger</h3>
              <div className="admin-modal-body">
                <p>
                  You are about to merge <strong>&quot;{aliasMember.f3Name}&quot;</strong> (ID #{aliasMember.memberId}) into <strong>&quot;{primaryMember.f3Name}&quot;</strong> (ID #{primaryMember.memberId}).
                </p>
                <div className="admin-warning-banner" style={{ margin: '0.75rem 0 0' }}>
                  ⚠️ <strong>Irreversible Operation:</strong>
                  <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
                    <li>All attended workouts will be reassigned to <strong>{primaryMember.f3Name}</strong>.</li>
                    <li>All workouts Q&apos;d will be reassigned to <strong>{primaryMember.f3Name}</strong>.</li>
                    <li>The name <em>&quot;{aliasMember.f3Name}&quot;</em> will be registered as an alias for {primaryMember.f3Name}.</li>
                    <li>Member record #{aliasMember.memberId} will be permanently deleted.</li>
                  </ul>
                </div>
              </div>
              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-modal-cancel"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="admin-modal-confirm merge"
                  onClick={executeMerge}
                  disabled={submitting}
                >
                  {submitting ? 'Merging Records...' : 'Confirm & Execute Merge'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminManagePax;
