import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import BigDataPageHeader from '../../../components/BigDataPageHeader';
import SEO from '../../../components/SEO';
import { sanitizeRedirectPath } from '../../../utils/validation';
import '../BigData.css';
import './Admin.css';

export const AdminLogin: React.FC = () => {
  const { isAdmin, user, adminUsername, login, logout, error: authError } = useAuth();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const rawFrom = (location.state as { from?: { pathname: string } })?.from?.pathname;
  const from = sanitizeRedirectPath(rawFrom);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!username.trim() || !password) {
      setLocalError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    const success = await login(username.trim(), password);
    setLoading(false);

    if (success) {
      navigate(from || '/bigdata/admin/alias-requests', { replace: true });
    }
  };

  return (
    <>
      <SEO
        title="Admin Login - F3 RVA Big Data"
        description="Authenticate to access protected administrator tools."
        url="https://f3rva.org/bigdata/admin/login"
        type="website"
      />
      <div className="bigdata-page-container">
        <BigDataPageHeader
          title="Administrator Login"
          description="Sign in with your administrator credentials to review alias claims and manage PAX records."
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
          {isAdmin ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🛡️</div>
              <h2 className="admin-login-title">Already Authenticated</h2>
              <p className="admin-login-subtitle">
                You are currently signed in as Administrator <strong>{adminUsername || 'Admin'}</strong>.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
                <Link
                  to="/bigdata/admin/alias-requests"
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
          ) : (
            <form onSubmit={handleSubmit}>
              <h2 className="admin-login-title">Sign In as Admin</h2>
              <p className="admin-login-subtitle">
                Enter your administrator credentials to access management tools.
              </p>

              {user && !isAdmin && (
                <div
                  style={{
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    color: '#1e40af',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    marginBottom: '1.25rem',
                    lineHeight: '1.4',
                  }}
                >
                  ℹ️ Currently signed in as <strong>{user.f3Name}</strong>. Signing in here will switch your session to Administrator.
                </div>
              )}

              {(localError || authError) && (
                <div
                  className="claim-alias-alert alert-error"
                  style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem' }}
                >
                  <span>⚠️</span>
                  <span>{localError || authError}</span>
                </div>
              )}

              <div className="admin-form-group">
                <label htmlFor="admin-username" className="admin-form-label">
                  Username
                </label>
                <input
                  id="admin-username"
                  type="text"
                  className="admin-form-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  autoComplete="username"
                  disabled={loading}
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="admin-password" className="admin-form-label">
                  Password
                </label>
                <input
                  id="admin-password"
                  type="password"
                  className="admin-form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="admin-form-submit"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Sign In as Admin'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
