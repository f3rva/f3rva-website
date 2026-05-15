// Analytics configuration
// The Google Analytics ID is injected at build time via environment variables.

export const getAnalyticsConfig = () => {
  // Vite exposes env variables here
  const trackingId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;

  // 🛡️ Sentinel: Validate GA tracking ID format to prevent script injection
  // Expected formats: G-XXXXXXX or UA-XXXXXXX-X
  const isValidId = trackingId && /^(G-[A-Z0-9]+|UA-\d+-\d+)$/.test(trackingId);

  if (!trackingId) {
    return null;
  } else if (!isValidId) {
    console.warn('Invalid Google Analytics ID format detected. Analytics disabled.');
    return null;
  }

  // 🛡️ Sentinel: Validate trackingId format to prevent injection attacks
  if (!/^(G-[A-Z0-9]+|UA-\d+-\d+)$/.test(trackingId)) {
    console.warn('Invalid Google Analytics ID format');
    return null;
  }

  // Validate the ID against strict pattern to prevent script injection (XSS)
  // Ensure it matches either a G-XXXXXXXX format (GA4) or UA-XXXXX-Y format (Universal Analytics)
  const isValidFormat = /^(G-[A-Z0-9]+|UA-\d+-\d+)$/.test(trackingId);

  if (!isValidFormat) {
    console.error('🛡️ Sentinel: Invalid Google Analytics ID format detected. Initialization aborted to prevent potential script injection.');
    return null;
  }

  // 🛡️ Sentinel: Validate trackingId to prevent script injection
  const isValidTrackingId = /^(G-[A-Z0-9]+|UA-\d+-\d+)$/.test(trackingId);
  if (!isValidTrackingId) {
    console.error('Invalid Google Analytics ID format');
    return null;
  }

  return {
    trackingId,
    enabled: true
  };
};