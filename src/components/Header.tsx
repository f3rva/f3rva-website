import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

/**
 * Main navigation header component for F3 RVA website
 * Displays the organization name, tagline, and primary navigation
 * Serves as the top-level branding and wayfinding element
 */
const MainNavigationHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const toggleMenu = (): void => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = (): void => {
    setIsMenuOpen(false);
  };

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
              <a href="https://backblasts.f3rva.org/locations/richmond-va/" className="navigation-link" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>Backblasts</a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default MainNavigationHeader;