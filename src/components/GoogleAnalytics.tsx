import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getAnalyticsConfig } from '../config/analytics.js';

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

  useEffect(() => {
    if (!config) return;

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
      send_page_view: false // We'll handle page views manually
    });

    return () => {
      // Cleanup script if component unmounts
      const scripts = document.querySelectorAll(`script[src*="${config.trackingId}"]`);
      scripts.forEach(s => s.remove());
    };
  }, [config]);

  useEffect(() => {
    if (!config || !window.gtag) return;

    // Track page view on route change
    window.gtag('config', config.trackingId, {
      page_path: location.pathname + location.search,
      page_title: document.title,
    });
  }, [location, config]);

  return null;
};

export default GoogleAnalytics;