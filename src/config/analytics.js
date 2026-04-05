// Analytics configuration
// The Google Analytics ID is injected at build time via environment variables.

export const getAnalyticsConfig = () => {
  // Vite exposes env variables here
  const trackingId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;

  // 🛡️ Sentinel: Validate Tracking ID format to prevent injection via env vars
  // Validates both GA4 (G-XXXXXX) and Universal Analytics (UA-XXXXX-Y) formats
  if (!trackingId || !/^(G-[A-Z0-9]+|UA-\d+-\d+)$/.test(trackingId)) {
    if (trackingId) {
      console.warn('Invalid Google Analytics Tracking ID format provided.');
    }
    return null;
  }

  return {
    trackingId,
    enabled: true
  };
};