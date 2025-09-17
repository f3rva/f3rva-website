// Analytics configuration
// Set GOOGLE_ANALYTICS_ID on window object or in this file directly

export const getAnalyticsConfig = () => {
  // Check for externally set tracking ID first
  const trackingId = window.GOOGLE_ANALYTICS_ID || 'GA_MEASUREMENT_ID_PLACEHOLDER';

  // Don't initialize if placeholder value is still present
  if (trackingId === 'GA_MEASUREMENT_ID_PLACEHOLDER') {
    return null;
  }

  return {
    trackingId,
    enabled: true
  };
};