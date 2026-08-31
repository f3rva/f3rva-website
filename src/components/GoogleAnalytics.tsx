import React, { useEffect, useRef } from 'react';
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

/**
 * Google Analytics 4 Component with Consent Mode v2
 *
 * Implements modern Google Consent Mode v2:
 * 1. Establishes default consent state ('denied' unless previously accepted).
 * 2. Loads gtag.js immediately to enable cookieless measurement and modeling.
 * 3. Dynamically updates consent when the user accepts or declines the cookie banner.
 * 4. Manages Single Page App (SPA) pageview events with document title synchronization.
 */
const GoogleAnalytics: React.FC = () => {
  const location = useLocation();
  const config = getAnalyticsConfig();
  const isInitialized = useRef<boolean>(false);

  // 1. Initialize Google Consent Mode v2 and load gtag.js
  useEffect(() => {
    if (!config || isInitialized.current) return;

    // Establish dataLayer and gtag function
    window.dataLayer = window.dataLayer || [];
    window.gtag = function (...args: unknown[]) {
      window.dataLayer.push(args);
    };

    // Set default consent state before GA script runs
    const initialConsent = hasAcceptedCookies() ? 'granted' : 'denied';
    window.gtag('consent', 'default', {
      analytics_storage: initialConsent,
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      wait_for_update: 500,
    });

    // Inject Google Tag Manager script
    const existingScript = document.querySelector(`script[src*="${config.trackingId}"]`);
    if (!existingScript) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${config.trackingId}`;
      document.head.appendChild(script);
    }

    // Configure GA4
    window.gtag('js', new Date());
    window.gtag('config', config.trackingId, {
      send_page_view: false, // Handle SPA route changes manually
      cookie_expires: 63072000, // 2 years in seconds
    });

    isInitialized.current = true;

    // Listen for cookie banner acceptance
    const handleConsentAccepted = () => {
      if (window.gtag) {
        window.gtag('consent', 'update', {
          analytics_storage: 'granted',
        });
      }
    };

    // Listen for cookie banner decline
    const handleConsentDeclined = () => {
      if (window.gtag) {
        window.gtag('consent', 'update', {
          analytics_storage: 'denied',
        });
      }
    };

    window.addEventListener('cookieConsentAccepted', handleConsentAccepted);
    window.addEventListener('cookieConsentDeclined', handleConsentDeclined);

    return () => {
      window.removeEventListener('cookieConsentAccepted', handleConsentAccepted);
      window.removeEventListener('cookieConsentDeclined', handleConsentDeclined);
    };
  }, [config]);

  // 2. Track SPA page views with title synchronization
  useEffect(() => {
    if (!config || !isInitialized.current) return;

    // Small delay to allow React 19's <SEO> / document metadata to flush title changes
    const timer = setTimeout(() => {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'page_view', {
          page_title: document.title,
          page_location: window.location.href,
          page_path: location.pathname + location.search,
        });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [location, config]);

  return null;
};

export default GoogleAnalytics;