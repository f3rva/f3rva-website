// Analytics configuration
// The Google Analytics ID is injected at build time via environment variables.

export const getAnalyticsConfig = () => {
  // Vite exposes env variables here
  const trackingId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;

  // Don't initialize if the ID is not set
  if (!trackingId) {
    return null;
  }

  return {
    trackingId,
    enabled: true
  };
};