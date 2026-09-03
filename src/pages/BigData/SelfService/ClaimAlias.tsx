import React, { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { config } from '../../../config';
import { MemberSummary, AliasRequestResponse, ApiErrorResponse } from '../../../types/bigdata';
import { useFetch } from '../../../hooks/useFetch';
import { useAuth } from '../../../hooks/useAuth';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import BigDataPageHeader from '../../../components/BigDataPageHeader';
import SEO from '../../../components/SEO';
import PaxAutocomplete from './PaxAutocomplete';
import { trackClaimAliasSubmit } from '../../../utils/analytics';
import '../BigData.css';
import './ClaimAlias.css';

export const ClaimAlias: React.FC = () => {
  const { isAuthenticated, isAdmin, user, getAuthHeaders } = useAuth();

  // Form state
  const [primaryMember, setPrimaryMember] = useState<MemberSummary | null>(null);
  const [aliasMember, setAliasMember] = useState<MemberSummary | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Pending queue filter
  const [queueFilter, setQueueFilter] = useState<string>('');

  // Fetch all registered members for fast client-side autocomplete
  const membersUrl = `${config.apiBaseUrl}/v2/members`;
  const { data: allMembers, loading: loadingMembers } = useFetch<MemberSummary[]>(membersUrl);

  // Determine effective primary member (auto-locked to authenticated member if regular user)
  const effectivePrimaryMember = useMemo<MemberSummary | null>(() => {
    if (!isAdmin && user?.memberId) {
      return { memberId: user.memberId, f3Name: user.f3Name };
    }
    return primaryMember;
  }, [isAdmin, user, primaryMember]);

  // Exclude primary member from alias choices so a member cannot alias to themselves
  const availableAliasMembers = useMemo(() => {
    if (!allMembers) return [];
    const primaryId = effectivePrimaryMember?.memberId;
    if (!primaryId) return allMembers;
    return allMembers.filter((m) => m.memberId !== primaryId);
  }, [allMembers, effectivePrimaryMember]);

  // Fetch pending alias requests
  const [fetchKey, setFetchKey] = useState<number>(0);
  const pendingRequestsUrl = `${config.apiBaseUrl}/v2/aliases/requests${fetchKey > 0 ? `?_k=${fetchKey}` : ''}`;
  const {
    data: pendingRequests,
    loading: loadingPending,
    error: errorPending,
    setData: setPendingRequests,
  } = useFetch<AliasRequestResponse[]>(pendingRequestsUrl);

  // Filter pending requests by member name
  const filteredPendingRequests = useMemo(() => {
    if (!pendingRequests) return [];
    const term = queueFilter.trim().toLowerCase();
    if (!term) return pendingRequests;

    return pendingRequests.filter(
      (req) =>
        req.primaryMember.f3Name.toLowerCase().includes(term) ||
        req.aliasMember.f3Name.toLowerCase().includes(term)
    );
  }, [pendingRequests, queueFilter]);

  const handleSlackLogin = useCallback(() => {
    sessionStorage.setItem('f3rva_auth_return_to', window.location.pathname);
    if (config.slackClientId) {
      window.location.href = `https://slack.com/openid/connect/authorize?response_type=code&scope=openid%20profile%20email&client_id=${encodeURIComponent(
        config.slackClientId
      )}&redirect_uri=${encodeURIComponent(config.slackRedirectUri)}&state=${encodeURIComponent(
        window.location.pathname
      )}`;
    }
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setAlert(null);

      const targetPrimary = effectivePrimaryMember;

      // Client-side validation
      if (!targetPrimary || !aliasMember) {
        setAlert({
          type: 'error',
          message: 'Please select both your primary profile and the alias record to merge.',
        });
        return;
      }

      if (targetPrimary.memberId === aliasMember.memberId) {
        setAlert({
          type: 'error',
          message: 'Primary member and alias member cannot be the same record.',
        });
        return;
      }

      setSubmitting(true);

      try {
        const response = await fetch(`${config.apiBaseUrl}/v2/aliases/request`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify({
            primaryMemberId: targetPrimary.memberId,
            aliasMemberId: aliasMember.memberId,
          }),
        });

        if (response.ok) {
          trackClaimAliasSubmit({
            primaryMemberId: targetPrimary.memberId,
            primaryMemberName: targetPrimary.f3Name,
            aliasMemberId: aliasMember.memberId,
            aliasMemberName: aliasMember.f3Name,
          });

          setAlert({
            type: 'success',
            message: `Alias claim request for "${aliasMember.f3Name}" into "${targetPrimary.f3Name}" submitted successfully! An administrator will review and merge the records.`,
          });
          // Update pending queue
          setPendingRequests((prev) => [
            {
              primaryMember: { memberId: targetPrimary.memberId, f3Name: targetPrimary.f3Name },
              aliasMember: { memberId: aliasMember.memberId, f3Name: aliasMember.f3Name },
              status: 'pending',
            },
            ...(prev || []),
          ]);
          setFetchKey((k) => k + 1);
          // Clear inputs
          if (isAdmin) {
            setPrimaryMember(null);
          }
          setAliasMember(null);
        } else {
          const errData: ApiErrorResponse = await response.json().catch(() => ({
            errorCode: response.status,
            errorMessage: 'Error submitting alias claim request.',
          }));

          setAlert({
            type: 'error',
            message: errData.errorMessage || 'Error submitting alias claim request.',
          });
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Network error submitting alias claim.';
        setAlert({
          type: 'error',
          message: msg,
        });
      } finally {
        setSubmitting(false);
      }
    },
    [effectivePrimaryMember, aliasMember, setPendingRequests, getAuthHeaders, isAdmin]
  );

  return (
    <>
      <SEO
        title="Claim Member Alias - F3 RVA Self-Service"
        description="Associate an alternate F3 name, nickname typo, or duplicate attendance record with your primary profile."
        url="https://f3rva.org/bigdata/claim-alias"
        type="website"
      />

      <div className="bigdata-page-container">
        <BigDataPageHeader
          title="Claim Alias"
          description="Request to associate an alternate name, nickname typo, or duplicate record with your primary F3 profile."
          category="SELF-SERVICE"
          actions={
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link
                to="/bigdata/attendance"
                className="bigdata-pill count-pill"
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.9rem' }}
              >
                ← Attendance Leaderboard
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

        <div className="claim-alias-grid">
          {/* Left Column: Submission Form or Sign-in Prompt */}
          <div className="bigdata-card">
            <div className="bigdata-card-header" style={{ marginBottom: '1.25rem' }}>
              <div>
                <h2 className="bigdata-card-title">Submit an Alias Claim</h2>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Merge duplicate attendance records into your primary profile
                </span>
              </div>
            </div>

            {alert && (
              <div
                className={`claim-alias-alert ${alert.type}`}
                role="alert"
                style={{ marginBottom: '1.25rem' }}
              >
                <span>{alert.type === 'success' ? '✅' : '⚠️'}</span>
                <span>{alert.message}</span>
              </div>
            )}

            {!isAuthenticated ? (
              <div className="claim-alias-auth-prompt">
                <div className="auth-prompt-icon">🔐</div>
                <h3 className="auth-prompt-title">Sign in to Claim an Alias</h3>
                <p className="auth-prompt-desc">
                  Please sign in with your Slack account to claim duplicate attendance records and link alternate F3 names to your profile.
                </p>
                <button
                  type="button"
                  className="claim-alias-login-btn"
                  onClick={handleSlackLogin}
                >
                  Sign in with Slack
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="claim-alias-form">
                {!isAdmin && user ? (
                  <div className="claim-alias-primary-card">
                    <div className="claim-alias-primary-card-header">
                      <span className="claim-alias-step-label">1. Primary Profile (Your Account)</span>
                      <span className="claim-alias-locked-badge">🔒 Locked</span>
                    </div>
                    <div className="claim-alias-primary-card-body">
                      <div className="claim-alias-avatar">
                        {user.f3Name ? user.f3Name.charAt(0).toUpperCase() : '👤'}
                      </div>
                      <div className="claim-alias-primary-info">
                        <strong className="claim-alias-primary-name">{user.f3Name}</strong>
                        <span className="claim-alias-primary-id">Member ID #{user.memberId}</span>
                      </div>
                    </div>
                    <p className="claim-alias-primary-hint">
                      All attendance and historical Qs from the claimed duplicate will be consolidated into your profile.
                    </p>
                  </div>
                ) : (
                  <PaxAutocomplete
                    id="primary-member-select"
                    label="1. Preferred Primary Profile (Admin Selection)"
                    placeholder="Search your primary F3 name..."
                    helpText="The main profile that will retain your combined workout attendance and stats."
                    members={allMembers || []}
                    loadingMembers={loadingMembers}
                    selectedMember={primaryMember}
                    onSelectMember={setPrimaryMember}
                    disabled={submitting}
                  />
                )}

                <PaxAutocomplete
                  id="alias-member-select"
                  label={isAdmin ? '2. Alternate / Duplicate Name to Merge' : '2. Select Duplicate Profile / Alias to Claim'}
                  placeholder="Search the alias or duplicate name..."
                  helpText="The secondary name or typo that should be linked and merged into your primary profile."
                  members={availableAliasMembers}
                  loadingMembers={loadingMembers}
                  selectedMember={aliasMember}
                  onSelectMember={setAliasMember}
                  disabled={submitting}
                />

                <div style={{ marginTop: '0.5rem' }}>
                  <button
                    type="submit"
                    className="claim-alias-submit-btn"
                    disabled={submitting || !effectivePrimaryMember || !aliasMember}
                  >
                    {submitting ? 'Submitting Request...' : 'Submit Alias Claim Request'}
                  </button>
                </div>
              </form>
            )}

            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#64748b' }}>
              <strong style={{ color: '#1e293b' }}>💡 How it works:</strong>
              <p style={{ margin: '0.35rem 0 0' }}>
                Once submitted, your claim is placed in the review queue. An administrator will verify the request and merge all historical backblasts and Q records to your primary profile.
              </p>
            </div>
          </div>

          {/* Right Column: Pending Requests Queue */}
          <div className="bigdata-card">
            <div className="pending-requests-header">
              <div>
                <h2 className="bigdata-card-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  Pending Requests
                  {pendingRequests && (
                    <span className="pending-badge">
                      {pendingRequests.length} Pending
                    </span>
                  )}
                </h2>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Requests currently awaiting administrator review
                </div>
              </div>

              {pendingRequests && pendingRequests.length > 5 && (
                <div className="bigdata-search-container" style={{ minWidth: '180px' }}>
                  <input
                    type="text"
                    className="bigdata-search-input"
                    placeholder="Filter queue..."
                    value={queueFilter}
                    onChange={(e) => setQueueFilter(e.target.value)}
                    aria-label="Filter pending alias requests"
                  />
                </div>
              )}
            </div>

            {loadingPending && (
              <div style={{ padding: '2rem 0' }}>
                <LoadingSpinner message="Loading pending alias requests..." />
              </div>
            )}

            {errorPending && !loadingPending && (
              <div className="claim-alias-alert error" style={{ margin: '1rem 0' }}>
                <span>⚠️ Unable to load pending requests.</span>
              </div>
            )}

            {!loadingPending && !errorPending && (
              <>
                {filteredPendingRequests.length > 0 ? (
                  <div className="bigdata-table-wrapper">
                    <table className="bigdata-table">
                      <thead>
                        <tr>
                          <th>Primary Profile</th>
                          <th>Alias to Merge</th>
                          <th style={{ textAlign: 'center', width: '110px' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPendingRequests.map((req, idx) => (
                          <tr key={`req-${req.primaryMember.memberId}-${req.aliasMember.memberId}-${idx}`}>
                            <td>
                              <Link
                                to={`/bigdata/pax/${req.primaryMember.memberId}`}
                                style={{ color: '#1e40af', fontWeight: 600, textDecoration: 'none' }}
                              >
                                {req.primaryMember.f3Name}
                              </Link>
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.35rem' }}>
                                (#{req.primaryMember.memberId})
                              </span>
                            </td>
                            <td>
                              <Link
                                to={`/bigdata/pax/${req.aliasMember.memberId}`}
                                style={{ color: '#0f766e', fontWeight: 600, textDecoration: 'none' }}
                              >
                                {req.aliasMember.f3Name}
                              </Link>
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.35rem' }}>
                                (#{req.aliasMember.memberId})
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span className="pending-badge">
                                ⏳ Pending
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bigdata-empty-state" style={{ padding: '2.5rem 1rem' }}>
                    <p style={{ margin: 0, color: '#64748b' }}>
                      {queueFilter
                        ? 'No pending requests match your search.'
                        : 'No pending alias requests currently in queue.'}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ClaimAlias;
