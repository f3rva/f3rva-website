import { describe, it, expect, vi } from 'vitest';
import { getAnalyticsConfig } from './analytics.js';

describe('Analytics Configuration', () => {
  it('returns null if no ID is set', () => {
    vi.stubEnv('VITE_GOOGLE_ANALYTICS_ID', '');
    expect(getAnalyticsConfig()).toBeNull();
    vi.unstubAllEnvs();
  });

  it('validates GA4 format', () => {
    vi.stubEnv('VITE_GOOGLE_ANALYTICS_ID', 'G-ABC123XYZ');
    const config = getAnalyticsConfig();
    expect(config).not.toBeNull();
    expect(config.trackingId).toBe('G-ABC123XYZ');
    vi.unstubAllEnvs();
  });

  it('rejects malicious ID', () => {
    vi.stubEnv('VITE_GOOGLE_ANALYTICS_ID', 'G-123"; alert(1); "');
    const config = getAnalyticsConfig();
    expect(config).toBeNull();
    vi.unstubAllEnvs();
  });
});
