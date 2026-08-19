import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Header.css';

/**
 * Main navigation header component for F3 RVA website
 * Displays the organization name, tagline, and primary navigation
 * Includes responsive dropdown for Big Data analytics and tools
 */
const MainNavigationHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isBigDataOpen, setIsBigDataOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLLIElement>(null);
  const { isAuthenticated, adminUsername, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = (): void => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = (): void => {
    setIsMenuOpen(false);
    setIsBigDataOpen(false);
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

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsBigDataOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsBigDataOpen(false);
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
        <div className="branding-section">
          <Link to="/" className="home-link" onClick={closeMenu}>
            <img 
              src="/images/f3rva-logo-v1-white.svg" 
              alt="F3 RVA Logo" 
              className="organization-logo"
            />
            <p className="organization-tagline">
              Always 70 and Sunny
            </p>
          </Link>
        </div>
        
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
        
        <nav className={`primary-navigation ${isMenuOpen ? 'nav-open' : ''}`} aria-label="Main navigation">
          <ul className="navigation-menu-list">
            <li className="navigation-menu-item">
              <Link to="/" className="navigation-link" onClick={closeMenu}>Home</Link>
            </li>
            <li className="navigation-menu-item">
              <Link to="/about" className="navigation-link" onClick={closeMenu}>About</Link>
            </li>
            <li className="navigation-menu-item">
              <Link to="/schedule" className="navigation-link" onClick={closeMenu}>Schedule</Link>
            </li>
            <li className="navigation-menu-item">
              <Link to="/new-guy" className="navigation-link" onClick={closeMenu}>New Guy</Link>
            </li>
            <li className="navigation-menu-item">
              <Link to="/archives" className="navigation-link" onClick={closeMenu}>Archives</Link>
            </li>

            {/* Big Data Dropdown */}
            <li 
              ref={dropdownRef}
              className={`navigation-menu-item dropdown-item-container ${isBigDataOpen ? 'dropdown-active' : ''}`}
              onMouseEnter={() => window.innerWidth > 768 && setIsBigDataOpen(true)}
              onMouseLeave={() => window.innerWidth > 768 && setIsBigDataOpen(false)}
            >
              <button
                type="button"
                className="navigation-link dropdown-trigger"
                onClick={toggleBigData}
                aria-haspopup="true"
                aria-expanded={isBigDataOpen}
              >
                <span>Big Data</span>
                <span className={`dropdown-arrow ${isBigDataOpen ? 'arrow-up' : ''}`} aria-hidden="true">▾</span>
              </button>

              <div className={`nav-dropdown-menu ${isBigDataOpen ? 'menu-visible' : ''}`} role="menu">
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
                <Link to="/bigdata/claim-alias" className="dropdown-link" role="menuitem" onClick={closeMenu}>
                  <div className="dropdown-link-content">
                    <span className="dropdown-link-title">Claim Alias</span>
                    <span className="dropdown-link-desc">Link duplicate PAX names</span>
                  </div>
                </Link>

                <div className="dropdown-divider"></div>

                {isAuthenticated ? (
                  <div className="dropdown-admin-section">
                    <Link to="/bigdata/admin" className="dropdown-link admin-link" role="menuitem" onClick={closeMenu}>
                      <div className="dropdown-link-content">
                        <span className="dropdown-link-title">Admin Portal ({adminUsername || 'Admin'})</span>
                        <span className="dropdown-link-desc">Review alias claims & merge PAX</span>
                      </div>
                    </Link>
                    <button type="button" className="dropdown-logout-btn" onClick={handleLogout}>
                      Log Out
                    </button>
                  </div>
                ) : (
                  <Link to="/bigdata/admin/login" className="dropdown-link admin-login-link" role="menuitem" onClick={closeMenu}>
                    <div className="dropdown-link-content">
                      <span className="dropdown-link-title">Admin Login</span>
                      <span className="dropdown-link-desc">Manage PAX & alias requests</span>
                    </div>
                  </Link>
                )}
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default MainNavigationHeader;