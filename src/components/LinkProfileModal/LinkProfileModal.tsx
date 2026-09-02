import React, { useState, useCallback } from 'react';
import { MemberSummary, SlackAuthResponse, AuthUserProfile } from '../../types/bigdata';
import { PaxAutocomplete } from '../../pages/BigData/SelfService/PaxAutocomplete';
import { config } from '../../config';
import './LinkProfileModal.css';

interface LinkProfileModalProps {
  isOpen: boolean;
  tempToken: string;
  slackDisplayName: string;
  suggestedMember: MemberSummary | null;
  onSuccess: (token: string, expiresIn: number, user: AuthUserProfile) => void;
  onCancel: () => void;
}

export const LinkProfileModal: React.FC<LinkProfileModalProps> = ({
  isOpen,
  tempToken,
  slackDisplayName,
  suggestedMember,
  onSuccess,
  onCancel,
}) => {
  const [selectedMember, setSelectedMember] = useState<MemberSummary | null>(suggestedMember);
  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [loadingMembers, setLoadingMembers] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    setLoadingMembers(true);
    fetch(`${config.apiBaseUrl}/v2/members`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (isMounted) setMembers(data);
      })
      .catch(() => {
        if (isMounted) setMembers([]);
      })
      .finally(() => {
        if (isMounted) setLoadingMembers(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!selectedMember) {
      setError('Please select an F3 member profile to link.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${config.apiBaseUrl}/v2/auth/slack/confirm-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tempToken,
          memberId: selectedMember.memberId,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.errorMessage || 'Failed to link profile.');
      }

      const data: SlackAuthResponse = await response.json();
      if (data.accessToken && data.user) {
        onSuccess(data.accessToken, data.expiresIn || 86400, data.user);
      } else {
        throw new Error('Link confirmed, but no session token was returned.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred while linking your profile.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }, [selectedMember, tempToken, onSuccess]);

  if (!isOpen) return null;

  return (
    <div className="link-profile-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="link-modal-title">
      <div className="link-profile-modal-content">
        <div className="link-profile-modal-header">
          <h2 id="link-modal-title">Link Your Slack Profile</h2>
          <button
            type="button"
            className="link-profile-close-btn"
            onClick={onCancel}
            aria-label="Close modal"
            disabled={submitting}
          >
            ×
          </button>
        </div>

        <div className="link-profile-modal-body">
          <p className="link-profile-intro">
            Welcome, <strong>{slackDisplayName}</strong>! To post and manage backblasts, please confirm your F3 RVA
            name.
          </p>

          {error && (
            <div className="link-profile-error" role="alert">
              {error}
            </div>
          )}

          {suggestedMember && (
            <div className="link-profile-suggestion-box">
              <span className="suggestion-label">Suggested Match:</span>
              <div className="suggestion-card">
                <span className="suggestion-name">{suggestedMember.f3Name}</span>
                <button
                  type="button"
                  className={`btn-select-suggestion ${selectedMember?.memberId === suggestedMember.memberId ? 'active' : ''}`}
                  onClick={() => setSelectedMember(suggestedMember)}
                  disabled={submitting}
                >
                  {selectedMember?.memberId === suggestedMember.memberId ? '✓ Selected' : 'Select'}
                </button>
              </div>
            </div>
          )}

          <div className="link-profile-search-section">
            <PaxAutocomplete
              id="pax-search-input"
              label={suggestedMember ? 'Or search for a different F3 profile:' : 'Search for your F3 profile:'}
              members={members}
              loadingMembers={loadingMembers}
              selectedMember={selectedMember}
              onSelectMember={(member) => {
                setSelectedMember(member);
                setError(null);
              }}
              placeholder="Type your F3 name (e.g. Dingo, Lab Rat)..."
              disabled={submitting}
            />
          </div>

          {selectedMember && (
            <div className="link-profile-confirmation-preview">
              Confirming link: <strong>{slackDisplayName}</strong> (Slack) ➔{' '}
              <strong>{selectedMember.f3Name}</strong> (F3 Profile #{selectedMember.memberId})
            </div>
          )}
        </div>

        <div className="link-profile-modal-footer">
          <button
            type="button"
            className="btn-cancel"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-confirm-link"
            onClick={handleConfirm}
            disabled={!selectedMember || submitting}
          >
            {submitting ? 'Linking Profile...' : 'Confirm & Log In'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkProfileModal;
