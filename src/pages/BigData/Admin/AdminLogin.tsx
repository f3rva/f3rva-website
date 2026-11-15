import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { config } from '../../../config';
import BigDataPageHeader from '../../../components/BigDataPageHeader';
import SEO from '../../../components/SEO';
import { sanitizeRedirectPath } from '../../../utils/validation';
import '../BigData.css';
import './Admin.css';

export const AdminLogin: React.FC = () => {
  const { isAuthenticated, isAdmin, isModerator, user, adminUsername, logout } = useAuth();
  const canModerate = Boolean(
    isAdmin || isModerator || user?.role === 'moderator' || user?.roles?.includes('moderator')
  );
  const location = useLocation();

  const rawFrom = (location.state as { from?: { pathname: string } })?.from?.pathname;
  const from = sanitizeRedirectPath(rawFrom);

  const handleSlackLogin = () => {
    sessionStorage.setItem('f3rva_auth_return_to', from);
    if (config.slackClientId) {
      const slackAuthUrl = `https://slack.com/openid/connect/authorize?response_type=code&scope=openid%20profile%20email&client_id=${encodeURIComponent(
        config.slackClientId
      )}&redirect_uri=${encodeURIComponent(config.slackRedirectUri)}&state=${encodeURIComponent(from)}`;
      window.location.href = slackAuthUrl;
    }
  };

  return (
    <>
      <SEO
        title="Admin Sign In - F3 RVA Big Data"
        description="Sign in with Slack to access protected administrator tools."
        url="https://f3rva.org/bigdata/admin/login"
        type="website"
        noindex={true}
      />
      <div className="bigdata-page-container">
        <BigDataPageHeader
          title="Administrator Portal"
          description="Sign in with your F3 RVA Slack account to access administrator tools."
          category="ADMIN"
          actions={
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link
                to="/bigdata"
                className="bigdata-pill q-pill"
                style={{ padding: '0.45rem 0.9rem', textDecoration: 'none' }}
              >
                Big Data Hub ↗
              </Link>
            </div>
          }
        />

        <div className="admin-login-card">
          {canModerate ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🛡️</div>
              <h2 className="admin-login-title">Already Authenticated</h2>
              <p className="admin-login-subtitle">
                You are signed in as {isAdmin ? 'Administrator' : 'Moderator'}{' '}
                <strong>{user?.f3Name || adminUsername || 'Admin'}</strong>.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
                <Link
                  to={from || '/bigdata/admin/alias-requests'}
                  className="admin-form-submit"
                  style={{ textAlign: 'center', textDecoration: 'none' }}
                >
                  Go to Admin Portal →
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="pax-chip-clear-btn"
                  style={{ alignSelf: 'center', padding: '0.5rem 1rem' }}
                >
                  Log Out
                </button>
              </div>
            </div>
          ) : isAuthenticated && user ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔒</div>
              <h2 className="admin-login-title">Administrator Role Required</h2>
              <p className="admin-login-subtitle">
                You are signed in via Slack as <strong>{user.f3Name}</strong>, which does not currently hold the{' '}
                <code>admin</code> role. If you were recently granted administrator access, log out and sign back in
                with Slack to refresh your session token.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={logout}
                  className="admin-form-submit"
                >
                  Log Out &amp; Refresh Session
                </button>
                <Link
                  to="/bigdata"
                  className="pax-chip-clear-btn"
                  style={{ alignSelf: 'center', padding: '0.5rem 1rem', textDecoration: 'none' }}
                >
                  Back to Big Data
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🛡️</div>
              <h2 className="admin-login-title">Sign In with Slack</h2>
              <p className="admin-login-subtitle">
                Administrator permissions are tied directly to your F3 RVA member profile via Slack authentication.
              </p>
              <button
                type="button"
                onClick={handleSlackLogin}
                className="admin-form-submit"
                style={{ marginTop: '1rem' }}
              >
                Sign in with Slack
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
