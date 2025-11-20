import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getAnalyticsConfig } from '../config/analytics.js';
import { hasAcceptedCookies } from '../utils/cookieConsent';

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
    GOOGLE_ANALYTICS_ID?: string;
  }
}

const GoogleAnalytics: React.FC = () => {
  const location = useLocation();
  const config = getAnalyticsConfig();
  const [isAnalyticsInitialized, setIsAnalyticsInitialized] = useState(false);

  // Initialize Google Analytics only if user has accepted cookies
  useEffect(() => {
    if (!config) return;

    const initializeAnalytics = () => {
      // Check if already initialized to prevent double-loading
      if (!hasAcceptedCookies() || isAnalyticsInitialized) return;

      console.log('🍪 Initializing Google Analytics - User has accepted cookies');

      // Initialize Google Analytics
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${config.trackingId}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function() {
        window.dataLayer.push(arguments);
      };

      window.gtag('js', new Date());
      window.gtag('config', config.trackingId, {
        send_page_view: false, // We'll handle page views manually
        anonymize_ip: false,   // Since user consented, we can collect IP
        cookie_expires: 63072000, // 2 years in seconds
      });

      setIsAnalyticsInitialized(true);
    };

    // Initialize on mount if already consented
    initializeAnalytics();

    // Listen for consent acceptance event
    window.addEventListener('cookieConsentAccepted', initializeAnalytics);

    return () => {
      // Cleanup script if component unmounts
      window.removeEventListener('cookieConsentAccepted', initializeAnalytics);
      const scripts = document.querySelectorAll(`script[src*="${config.trackingId}"]`);
      scripts.forEach(s => s.remove());
    };
  }, [config, isAnalyticsInitialized]);

  // Track page views only if analytics is initialized and user has consented
  useEffect(() => {
    if (!config || !window.gtag || !isAnalyticsInitialized || !hasAcceptedCookies()) return;

    // Track page view on route change
    window.gtag('config', config.trackingId, {
      page_path: location.pathname + location.search,
      page_title: document.title,
    });
  }, [location, config, isAnalyticsInitialized]);

  return null;
};

export default GoogleAnalytics;