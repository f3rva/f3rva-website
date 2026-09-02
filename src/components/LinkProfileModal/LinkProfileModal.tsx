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

  const modalRef = React.useRef<HTMLDivElement>(null);
  const closeBtnRef = React.useRef<HTMLButtonElement>(null);

  // Focus management & Escape key trapping
  React.useEffect(() => {
    if (!isOpen) return;

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Auto-focus close button or modal
    const timer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) {
        onCancel();
        return;
      }

      // Tab focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const firstElement = focusables[0];
        const lastElement = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel, submitting]);

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
    <div
      className="link-profile-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="link-modal-title"
      aria-describedby="link-modal-desc"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) {
          onCancel();
        }
      }}
    >
      <div className="link-profile-modal-content" ref={modalRef}>
        <div className="link-profile-modal-header">
          <h2 id="link-modal-title">Link Your Slack Profile</h2>
          <button
            ref={closeBtnRef}
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
          <p id="link-modal-desc" className="link-profile-intro">
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
                <div className="suggestion-info">
                  <span className="suggestion-icon">🎯</span>
                  <div className="suggestion-details">
                    <span className="suggestion-name">{suggestedMember.f3Name}</span>
                    <span className="suggestion-id">ID #{suggestedMember.memberId}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className={`btn-select-suggestion ${selectedMember?.memberId === suggestedMember.memberId ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedMember(suggestedMember);
                    setError(null);
                  }}
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
              <span className="preview-icon">🔗</span>
              <span>
                Confirming link: <strong>{slackDisplayName}</strong> (Slack) ➔{' '}
                <strong>{selectedMember.f3Name}</strong> (Big Data #{selectedMember.memberId})
              </span>
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
