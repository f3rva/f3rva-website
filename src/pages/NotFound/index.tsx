import React from 'react';
import { Link } from 'react-router-dom';
import { MdHome, MdSearch, MdArrowBack } from 'react-icons/md';
import './index.css';

/**
 * 404 Not Found page component for F3 RVA website
 * Displays when users navigate to a non-existent route
 * Provides helpful navigation options to get back on track
 */
const NotFoundPage: React.FC = () => {
  return (
    <div className="not-found-page-container">
      <section className="not-found-hero-section">
        <div className="hero-content-wrapper">
          <div className="error-code">404</div>
          <h2 className="not-found-heading">Page Not Found</h2>
          <p className="not-found-description">
            Looks like you've wandered off the beaten path. The page you're looking for 
            doesn't exist, but don't worry - we'll help you get back on track.
          </p>
          
          <div className="not-found-actions">
            <Link to="/" className="primary-action-button">
              <MdHome size={20} />
              Back to Home
            </Link>
            <Link to="/schedule" className="secondary-action-button">
              <MdSearch size={20} />
              Find a Workout
            </Link>
          </div>
        </div>
      </section>

      <section className="helpful-links-section">
        <div className="links-content-wrapper">
          <h3 className="section-title">Popular Pages</h3>
          <div className="helpful-links-grid">
            <Link to="/about" className="helpful-link">
              <h4 className="link-title">About F3 RVA</h4>
              <p className="link-description">Learn about our community and mission</p>
            </Link>
            
            <Link to="/schedule" className="helpful-link">
              <h4 className="link-title">Workout Schedule</h4>
              <p className="link-description">Find workout times and locations</p>
            </Link>
            
            <Link to="/friendly-new-guy" className="helpful-link">
              <h4 className="link-title">New to F3?</h4>
              <p className="link-description">Everything you need to know to get started</p>
            </Link>
          </div>
          
          <div className="back-navigation">
            <button 
              onClick={() => window.history.back()}
              className="back-button"
              aria-label="Go back to previous page"
            >
              <MdArrowBack size={20} />
              Go Back
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NotFoundPage;