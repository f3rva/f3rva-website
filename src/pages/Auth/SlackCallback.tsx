import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { config } from '../../config';
import { SlackAuthResponse, AuthUserProfile, MemberSummary } from '../../types/bigdata';
import { LinkProfileModal } from '../../components/LinkProfileModal';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import SEO from '../../components/SEO';
import './SlackCallback.css';

export const SlackCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State for unlinked profiles
  const [showLinkModal, setShowLinkModal] = useState<boolean>(false);
  const [tempToken, setTempToken] = useState<string>('');
  const [slackDisplayName, setSlackDisplayName] = useState<string>('');
  const [suggestedMember, setSuggestedMember] = useState<MemberSummary | null>(null);

  const exchangeAttempted = useRef<boolean>(false);

  useEffect(() => {
    // Avoid double execution in React 19 dev mode
    if (exchangeAttempted.current) return;
    exchangeAttempted.current = true;

    const code = searchParams.get('code');
    const oauthError = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (oauthError) {
      setLoading(false);
      setError(errorDescription || `Slack authentication failed (${oauthError}).`);
      return;
    }

    if (!code) {
      setLoading(false);
      setError('No authorization code provided in the callback URL.');
      return;
    }

    const exchangeCode = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/v2/auth/slack`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            redirectUri: config.slackRedirectUri,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.errorMessage || 'Failed to authenticate with Slack.');
        }

        const data: SlackAuthResponse = await response.json();

        if (data.isLinked && data.accessToken && data.user) {
          // User is already linked! Log them in directly
          loginWithToken(data.accessToken, data.expiresIn || 86400, data.user);
          const returnTo = sessionStorage.getItem('f3rva_auth_return_to') || '/backblast/new';
          sessionStorage.removeItem('f3rva_auth_return_to');
          navigate(returnTo, { replace: true });
        } else if (!data.isLinked && data.tempToken) {
          // User is not yet linked; trigger confirmation modal
          setTempToken(data.tempToken);
          setSlackDisplayName(data.user?.f3Name || 'Slack User');
          setSuggestedMember(data.suggestedMember || null);
          setShowLinkModal(true);
          setLoading(false);
        } else {
          throw new Error('Unexpected authentication response received.');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Authentication service error.';
        setError(msg);
        setLoading(false);
      }
    };

    exchangeCode();
  }, [searchParams, loginWithToken, navigate]);

  const handleLinkSuccess = (token: string, expiresIn: number, user: AuthUserProfile) => {
    setShowLinkModal(false);
    loginWithToken(token, expiresIn, user);
    const returnTo = sessionStorage.getItem('f3rva_auth_return_to') || '/backblast/new';
    sessionStorage.removeItem('f3rva_auth_return_to');
    navigate(returnTo, { replace: true });
  };

  const handleLinkCancel = () => {
    setShowLinkModal(false);
    navigate('/', { replace: true });
  };

  return (
    <div className="slack-callback-container">
      <SEO title="Authenticating with Slack" description="Processing Slack authentication login." />

      {loading && (
        <div className="slack-callback-loading">
          <LoadingSpinner message="Authenticating with F3 RVA Slack workspace..." />
        </div>
      )}

      {error && (
        <div className="slack-callback-error-card" role="alert">
          <h2>Authentication Failed</h2>
          <p>{error}</p>
          <div className="slack-callback-actions">
            <button type="button" className="btn-retry" onClick={() => navigate('/', { replace: true })}>
              Return to Homepage
            </button>
          </div>
        </div>
      )}

      {showLinkModal && (
        <LinkProfileModal
          isOpen={showLinkModal}
          tempToken={tempToken}
          slackDisplayName={slackDisplayName}
          suggestedMember={suggestedMember}
          onSuccess={handleLinkSuccess}
          onCancel={handleLinkCancel}
        />
      )}
    </div>
  );
};

export default SlackCallback;
