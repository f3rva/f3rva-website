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

  return {
    trackingId,
    enabled: true
  };
};