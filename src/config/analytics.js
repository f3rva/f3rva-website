// Analytics configuration
// The Google Analytics ID is injected at build time via environment variables.

export const getAnalyticsConfig = () => {
  // Vite exposes env variables here
  const trackingId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;

  // Don't initialize if the ID is not set
  if (!trackingId) {
    return null;
  }

  // Validate the ID against strict pattern to prevent script injection (XSS)
  // Ensure it matches either a G-XXXXXXXX format (GA4) or UA-XXXXX-Y format (Universal Analytics)
  const isValidFormat = /^(G-[A-Z0-9]+|UA-\d+-\d+)$/.test(trackingId);

  if (!isValidFormat) {
    console.error('🛡️ Sentinel: Invalid Google Analytics ID format detected. Initialization aborted to prevent potential script injection.');
    return null;
  }

  return {
    trackingId,
    enabled: true
  };
};