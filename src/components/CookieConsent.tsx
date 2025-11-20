import React, { useState, useEffect } from 'react';
import { hasConsentChoice } from '../utils/cookieConsent';
import './CookieConsent.css';

/**
 * CookieConsent Component
 *
 * A minimalist cookie consent banner that appears at the bottom of the screen.
 * Only shows once per user and stores consent in localStorage.
 * Designed to be unobtrusive and comply with privacy regulations.
 */
const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const CONSENT_KEY = 'f3rva-cookie-consent';
  const CONSENT_VERSION = '1.0'; // Update this if you need to re-prompt users

  useEffect(() => {
    // Check if user has made a consent choice
    // Show banner only if no choice has been made
    if (!hasConsentChoice()) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    // Store consent with timestamp and version
    const consentData = {
      accepted: true,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION
    };

    localStorage.setItem(CONSENT_KEY, JSON.stringify(consentData));
    setShowBanner(false);
  };

  const handleDecline = () => {
    // Store declined consent
    const consentData = {
      accepted: false,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION
    };

    localStorage.setItem(CONSENT_KEY, JSON.stringify(consentData));
    setShowBanner(false);
  };

  // Don't render anything if banner shouldn't be shown
  if (!showBanner) {
    return null;
  }

  return (
    <div className="cookie-consent-banner" role="banner" aria-label="Cookie consent">
      <div className="cookie-consent-content">
        <div className="cookie-consent-text">
          <p>
            We use cookies to enhance your browsing experience and analyze site traffic.
            By continuing to use this site, you consent to our use of cookies.
          </p>
        </div>
        <div className="cookie-consent-actions">
          <button
            className="cookie-consent-btn cookie-consent-btn-decline"
            onClick={handleDecline}
            type="button"
            aria-label="Decline cookies"
          >
            Decline
          </button>
          <button
            className="cookie-consent-btn cookie-consent-btn-accept"
            onClick={handleAccept}
            type="button"
            aria-label="Accept cookies"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;