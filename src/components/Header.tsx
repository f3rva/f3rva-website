import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { config } from '../config';
import './Header.css';

/**
 * Main navigation header component for F3 RVA website
 * Displays the organization branding, primary navigation links,
 * Big Data analytics dropdown, dedicated user profile hub, and responsive mobile drawer.
 */
const MainNavigationHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isBigDataOpen, setIsBigDataOpen] = useState<boolean>(false);
  const [isMobileBigDataOpen, setIsMobileBigDataOpen] = useState<boolean>(false);
  const [isMobileUserOpen, setIsMobileUserOpen] = useState<boolean>(false);
  const [isMobileLoginOpen, setIsMobileLoginOpen] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const [isLoginMenuOpen, setIsLoginMenuOpen] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLLIElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const loginMenuRef = useRef<HTMLDivElement>(null);

  const { isAuthenticated, isAdmin, user, adminUsername, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = (): void => {
    setIsMenuOpen((prev) => !prev);
  };

  const closeMenu = (): void => {
    setIsMenuOpen(false);
    setIsBigDataOpen(false);
    setIsMobileBigDataOpen(false);
    setIsMobileUserOpen(false);
    setIsMobileLoginOpen(false);
    setIsUserMenuOpen(false);
    setIsLoginMenuOpen(false);
  };

  const toggleBigData = (e: React.MouseEvent): void => {
    e.preventDefault();
    setIsBigDataOpen((prev) => !prev);
  };

  const handleLogout = (): void => {
    logout();
    closeMenu();
    navigate('/bigdata');
  };

  // Slack OAuth authorization URL
  const slackAuthUrl = config.slackClientId
    ? `https://slack.com/openid/connect/authorize?response_type=code&scope=openid%20profile%20email&client_id=${encodeURIComponent(
        config.slackClientId
      )}&redirect_uri=${encodeURIComponent(config.slackRedirectUri)}&state=${encodeURIComponent(
        window.location.pathname
      )}`
    : '#';

  const handleSlackLogin = (): void => {
    sessionStorage.setItem('f3rva_auth_return_to', window.location.pathname);
    if (config.slackClientId) {
      window.location.href = slackAuthUrl;
    } else {
      navigate('/backblast/new');
    }
  };

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Close dropdowns on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsBigDataOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (loginMenuRef.current && !loginMenuRef.current.contains(event.target as Node)) {
        setIsLoginMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsBigDataOpen(false);
        setIsUserMenuOpen(false);
        setIsLoginMenuOpen(false);
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header className="main-navigation-header">
      <div className="header-content-container">
        {/* Branding Section */}
        <div className="branding-section">
          <Link to="/" className="home-link" onClick={closeMenu}>
            <img
              src="/images/f3rva-logo-v1-white.svg"
              alt="F3 RVA Logo"
              className="organization-logo"
            />
            <p className="organization-tagline">Always 70 and Sunny</p>
          </Link>
        </div>

        {/* Primary Desktop Navigation Links */}
        <nav className="primary-navigation desktop-only" aria-label="Main navigation">
          <ul className="navigation-menu-list">
            <li className="navigation-menu-item">
              <Link to="/schedule" className="navigation-link" onClick={closeMenu}>
                Schedule
              </Link>
            </li>
            <li className="navigation-menu-item">
              <Link to="/about" className="navigation-link" onClick={closeMenu}>
                About
              </Link>
            </li>
            <li className="navigation-menu-item">
              <Link to="/new-guy" className="navigation-link" onClick={closeMenu}>
                New Guy
              </Link>
            </li>
            <li className="navigation-menu-item">
              <Link to="/archives" className="navigation-link" onClick={closeMenu}>
                Archives
              </Link>
            </li>

            {/* Big Data Dropdown */}
            <li
              ref={dropdownRef}
              className={`navigation-menu-item dropdown-item-container ${
                isBigDataOpen ? 'dropdown-active' : ''
              }`}
              onMouseEnter={() => setIsBigDataOpen(true)}
              onMouseLeave={() => setIsBigDataOpen(false)}
            >
              <button
                type="button"
                className="navigation-link dropdown-trigger"
                onClick={toggleBigData}
                aria-haspopup="true"
                aria-expanded={isBigDataOpen}
              >
                <span>Big Data</span>
                <span className={`dropdown-arrow ${isBigDataOpen ? 'arrow-up' : ''}`} aria-hidden="true">
                  ▾
                </span>
              </button>

              <div className={`nav-dropdown-menu ${isBigDataOpen ? 'menu-visible' : ''}`} role="menu">
                <div className="dropdown-category-title">Analytics & Leaderboards</div>
                <Link to="/bigdata" className="dropdown-link" role="menuitem" onClick={closeMenu}>
                  <div className="dropdown-link-content">
                    <span className="dropdown-link-title">Dashboard</span>
                    <span className="dropdown-link-desc">Workout analytics & regional metrics</span>
                  </div>
                </Link>
                <Link to="/bigdata/attendance" className="dropdown-link" role="menuitem" onClick={closeMenu}>
                  <div className="dropdown-link-content">
                    <span className="dropdown-link-title">Attendance Leaderboard</span>
                    <span className="dropdown-link-desc">Rankings by workouts, Qs & ratio</span>
                  </div>
                </Link>
                <Link to="/bigdata/ao" className="dropdown-link" role="menuitem" onClick={closeMenu}>
                  <div className="dropdown-link-content">
                    <span className="dropdown-link-title">AO Analytics</span>
                    <span className="dropdown-link-desc">Locations, averages & streakers</span>
                  </div>
                </Link>
                <Link to="/bigdata/day-of-week" className="dropdown-link" role="menuitem" onClick={closeMenu}>
                  <div className="dropdown-link-content">
                    <span className="dropdown-link-title">Day of Week</span>
                    <span className="dropdown-link-desc">Attendance volume by weekday</span>
                  </div>
                </Link>

                <div className="dropdown-divider"></div>

                <div className="dropdown-category-title">Member Tools</div>
                <Link to="/bigdata/claim-alias" className="dropdown-link" role="menuitem" onClick={closeMenu}>
                  <div className="dropdown-link-content">
                    <span className="dropdown-link-title">Claim PAX Alias</span>
                    <span className="dropdown-link-desc">Link duplicate PAX names</span>
                  </div>
                </Link>
              </div>
            </li>
          </ul>
        </nav>

        {/* Desktop User Hub / Auth State Dropdown */}
        <div className="header-user-section desktop-only">
          {isAuthenticated ? (
            <div
              ref={userMenuRef}
              className={`user-menu-container ${isUserMenuOpen ? 'user-menu-active' : ''}`}
              onMouseEnter={() => setIsUserMenuOpen(true)}
              onMouseLeave={() => setIsUserMenuOpen(false)}
            >
              <button
                type="button"
                className="user-profile-badge"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                aria-haspopup="true"
                aria-expanded={isUserMenuOpen}
                aria-label="User account menu"
              >
                <div className={`user-avatar ${isAdmin ? 'admin-avatar' : ''}`}>
                  {isAdmin ? '🛡️' : user?.f3Name ? user.f3Name.charAt(0).toUpperCase() : '👤'}
                </div>
                <span className="user-name-label">
                  {isAdmin ? adminUsername || 'Admin' : user?.f3Name || 'Member'}
                </span>
                <span className={`dropdown-arrow ${isUserMenuOpen ? 'arrow-up' : ''}`} aria-hidden="true">
                  ▾
                </span>
              </button>

              <div className={`user-dropdown-menu ${isUserMenuOpen ? 'menu-visible' : ''}`} role="menu">
                <div className="user-dropdown-header">
                  <span className="user-greeting-sub">Signed in as</span>
                  <strong className="user-greeting-name">
                    {isAdmin ? adminUsername || 'Admin' : user?.f3Name || 'Member'}
                  </strong>
                  {isAdmin && <span className="user-role-tag">Administrator</span>}
                </div>

                <div className="dropdown-divider"></div>

                {/* Primary Action: Post Backblast */}
                <Link
                  to="/backblast/new"
                  className="user-dropdown-link action-link"
                  role="menuitem"
                  onClick={closeMenu}
                >
                  <div className="dropdown-link-content">
                    <span className="dropdown-link-title">Post Backblast</span>
                    <span className="dropdown-link-desc">Record beatdown & attendance</span>
                  </div>
                </Link>

                {/* Member Profile Stats */}
                {!isAdmin && user?.memberId && (
                  <Link
                    to={`/bigdata/pax/${user.memberId}`}
                    className="user-dropdown-link"
                    role="menuitem"
                    onClick={closeMenu}
                  >
                    <div className="dropdown-link-content">
                      <span className="dropdown-link-title">My Stats & Profile</span>
                      <span className="dropdown-link-desc">Personal attendance & streaks</span>
                    </div>
                  </Link>
                )}

                {/* Admin Portal & Tools */}
                {isAdmin && (
                  <>
                    <Link
                      to="/bigdata/admin"
                      className="user-dropdown-link admin-action-link"
                      role="menuitem"
                      onClick={closeMenu}
                    >
                      <div className="dropdown-link-content">
                        <span className="dropdown-link-title">Admin Portal</span>
                        <span className="dropdown-link-desc">Alias requests & moderation</span>
                      </div>
                    </Link>
                    <Link
                      to="/bigdata/admin/manage-pax"
                      className="user-dropdown-link admin-action-link"
                      role="menuitem"
                      onClick={closeMenu}
                    >
                      <span className="dropdown-item-icon">👥</span>
                      <div className="dropdown-link-content">
                        <span className="dropdown-link-title">Manage PAX</span>
                        <span className="dropdown-link-desc">Merge & organize member records</span>
                      </div>
                    </Link>
                  </>
                )}

                <div className="dropdown-divider"></div>

                <button type="button" className="user-logout-btn" onClick={handleLogout}>
                  Log Out
                </button>
              </div>
            </div>
          ) : (
            <div
              ref={loginMenuRef}
              className={`login-menu-container ${isLoginMenuOpen ? 'login-menu-active' : ''}`}
              onMouseEnter={() => setIsLoginMenuOpen(true)}
              onMouseLeave={() => setIsLoginMenuOpen(false)}
            >
              <button
                type="button"
                className="nav-login-btn login-dropdown-trigger"
                onClick={() => setIsLoginMenuOpen((prev) => !prev)}
                aria-haspopup="true"
                aria-expanded={isLoginMenuOpen}
                aria-label="Log in options"
              >
                <span>Log In</span>
                <span className={`dropdown-arrow ${isLoginMenuOpen ? 'arrow-up' : ''}`} aria-hidden="true">
                  ▾
                </span>
              </button>

              <div className={`login-dropdown-menu ${isLoginMenuOpen ? 'menu-visible' : ''}`} role="menu">
                <button
                  type="button"
                  className="login-dropdown-item slack-login-item"
                  role="menuitem"
                  onClick={() => {
                    setIsLoginMenuOpen(false);
                    handleSlackLogin();
                  }}
                >
                  <div className="dropdown-link-content">
                    <span className="dropdown-link-title">Sign in with Slack</span>
                    <span className="dropdown-link-desc">For all members to post backblasts</span>
                  </div>
                </button>

                <div className="dropdown-divider"></div>

                <Link
                  to="/bigdata/admin/login"
                  className="login-dropdown-item admin-login-item"
                  role="menuitem"
                  onClick={closeMenu}
                >
                  <div className="dropdown-link-content">
                    <span className="dropdown-link-title">Admin Login</span>
                    <span className="dropdown-link-desc">Manage PAX & alias requests</span>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Menu Toggle Button */}
        <button
          className={`hamburger-menu-button ${isMenuOpen ? 'menu-open' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      <div
        className={`drawer-backdrop ${isMenuOpen ? 'backdrop-active' : ''}`}
        onClick={closeMenu}
        aria-hidden={!isMenuOpen}
      />

      {/* Mobile Drawer Menu */}
      <nav className={`mobile-drawer ${isMenuOpen ? 'drawer-open' : ''}`} aria-label="Mobile navigation">
        <div className="mobile-drawer-header">
          <span className="drawer-title">Navigation</span>
          <button
            type="button"
            className="drawer-close-button"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Mobile Navigation Links */}
        <ul className="mobile-nav-list">
          <li className="mobile-nav-item">
            <Link to="/schedule" className="mobile-nav-link" onClick={closeMenu}>
              Schedule
            </Link>
          </li>
          <li className="mobile-nav-item">
            <Link to="/about" className="mobile-nav-link" onClick={closeMenu}>
              About
            </Link>
          </li>
          <li className="mobile-nav-item">
            <Link to="/new-guy" className="mobile-nav-link" onClick={closeMenu}>
              New Guy
            </Link>
          </li>
          <li className="mobile-nav-item">
            <Link to="/archives" className="mobile-nav-link" onClick={closeMenu}>
              Archives
            </Link>
          </li>

          {/* Collapsible Big Data Accordion */}
          <li className="mobile-nav-item mobile-accordion-item">
            <button
              type="button"
              className="mobile-accordion-trigger"
              onClick={() => setIsMobileBigDataOpen((prev) => !prev)}
              aria-expanded={isMobileBigDataOpen}
            >
              <span>Big Data</span>
              <span className={`dropdown-arrow ${isMobileBigDataOpen ? 'arrow-up' : ''}`} aria-hidden="true">
                ▾
              </span>
            </button>
            {isMobileBigDataOpen && (
              <div className="mobile-accordion-content">
                <Link to="/bigdata" className="mobile-sublink" onClick={closeMenu}>
                  Dashboard
                </Link>
                <Link to="/bigdata/attendance" className="mobile-sublink" onClick={closeMenu}>
                  Attendance Leaderboard
                </Link>
                <Link to="/bigdata/ao" className="mobile-sublink" onClick={closeMenu}>
                  AO Analytics
                </Link>
                <Link to="/bigdata/day-of-week" className="mobile-sublink" onClick={closeMenu}>
                  Day of Week
                </Link>
                <Link to="/bigdata/claim-alias" className="mobile-sublink" onClick={closeMenu}>
                  Claim PAX Alias
                </Link>
              </div>
            )}
          </li>

          {/* Divider between site links and account actions */}
          <li className="mobile-nav-divider" role="separator" />

          {/* Collapsible Mobile User / Log In Accordion */}
          <li className="mobile-nav-item mobile-accordion-item">
            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  className="mobile-accordion-trigger"
                  onClick={() => setIsMobileUserOpen((prev) => !prev)}
                  aria-expanded={isMobileUserOpen}
                >
                  <span className="mobile-user-trigger-label">
                    <span className={`user-avatar ${isAdmin ? 'admin-avatar' : ''}`}>
                      {isAdmin ? '🛡️' : user?.f3Name ? user.f3Name.charAt(0).toUpperCase() : '👤'}
                    </span>
                    <span>{isAdmin ? adminUsername || 'Admin' : user?.f3Name || 'Member'}</span>
                  </span>
                  <span className={`dropdown-arrow ${isMobileUserOpen ? 'arrow-up' : ''}`} aria-hidden="true">
                    ▾
                  </span>
                </button>
                {isMobileUserOpen && (
                  <div className="mobile-accordion-content">
                    <Link to="/backblast/new" className="mobile-sublink" onClick={closeMenu}>
                      Post Backblast
                    </Link>
                    {!isAdmin && user?.memberId && (
                      <Link to={`/bigdata/pax/${user.memberId}`} className="mobile-sublink" onClick={closeMenu}>
                        My Stats & Profile
                      </Link>
                    )}
                    {isAdmin && (
                      <>
                        <Link to="/bigdata/admin" className="mobile-sublink" onClick={closeMenu}>
                          Admin Portal
                        </Link>
                        <Link to="/bigdata/admin/manage-pax" className="mobile-sublink" onClick={closeMenu}>
                          Manage PAX
                        </Link>
                      </>
                    )}
                    <button
                      type="button"
                      className="mobile-sublink mobile-btn-link text-danger"
                      onClick={handleLogout}
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="mobile-accordion-trigger"
                  onClick={() => setIsMobileLoginOpen((prev) => !prev)}
                  aria-expanded={isMobileLoginOpen}
                >
                  <span>Log In</span>
                  <span className={`dropdown-arrow ${isMobileLoginOpen ? 'arrow-up' : ''}`} aria-hidden="true">
                    ▾
                  </span>
                </button>
                {isMobileLoginOpen && (
                  <div className="mobile-accordion-content">
                    <button
                      type="button"
                      className="mobile-sublink mobile-btn-link"
                      onClick={() => {
                        closeMenu();
                        handleSlackLogin();
                      }}
                    >
                      Sign in with Slack
                    </button>
                    <Link to="/bigdata/admin/login" className="mobile-sublink" onClick={closeMenu}>
                      Admin Login
                    </Link>
                  </div>
                )}
              </>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default MainNavigationHeader;