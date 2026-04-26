// Analytics configuration
// The Google Analytics ID is injected at build time via environment variables.

export const getAnalyticsConfig = () => {
  // Vite exposes env variables here
  const trackingId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;

  // Don't initialize if the ID is not set
  if (!trackingId) {
    return null;
  }

  // 🛡️ Sentinel: Validate trackingId format to prevent injection attacks
  if (!/^(G-[A-Z0-9]+|UA-\d+-\d+)$/.test(trackingId)) {
    console.warn('Invalid Google Analytics ID format');
    return null;
  }

  return {
    trackingId,
    enabled: true
  };
};