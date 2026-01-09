import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  hasAcceptedCookies,
  hasDeclinedCookies,
  hasConsentChoice,
  getConsentData,
  CONSENT_KEY,
  CONSENT_VERSION
} from './cookieConsent';

describe('cookieConsent utility', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('hasAcceptedCookies', () => {
    it('should return false when no consent data exists', () => {
      expect(hasAcceptedCookies()).toBe(false);
    });

    it('should return true when valid accepted consent exists', () => {
      const data = {
        accepted: true,
        timestamp: new Date().toISOString(),
        version: CONSENT_VERSION
      };
      localStorage.setItem(CONSENT_KEY, JSON.stringify(data));
      expect(hasAcceptedCookies()).toBe(true);
    });

    it('should return false when version mismatch', () => {
      const data = {
        accepted: true,
        timestamp: new Date().toISOString(),
        version: '0.1' // Old version
      };
      localStorage.setItem(CONSENT_KEY, JSON.stringify(data));
      expect(hasAcceptedCookies()).toBe(false);
    });

    it('should return false when accepted is false', () => {
      const data = {
        accepted: false,
        timestamp: new Date().toISOString(),
        version: CONSENT_VERSION
      };
      localStorage.setItem(CONSENT_KEY, JSON.stringify(data));
      expect(hasAcceptedCookies()).toBe(false);
    });

    it('should return false and log warning on malformed JSON', () => {
      localStorage.setItem(CONSENT_KEY, 'invalid-json');
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      expect(hasAcceptedCookies()).toBe(false);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('hasDeclinedCookies', () => {
    it('should return true when valid declined consent exists', () => {
      const data = {
        accepted: false,
        timestamp: new Date().toISOString(),
        version: CONSENT_VERSION
      };
      localStorage.setItem(CONSENT_KEY, JSON.stringify(data));
      expect(hasDeclinedCookies()).toBe(true);
    });

    it('should return false when accepted is true', () => {
      const data = {
        accepted: true,
        timestamp: new Date().toISOString(),
        version: CONSENT_VERSION
      };
      localStorage.setItem(CONSENT_KEY, JSON.stringify(data));
      expect(hasDeclinedCookies()).toBe(false);
    });
  });

  describe('hasConsentChoice', () => {
    it('should return true if any choice for current version exists', () => {
      const data = {
        accepted: false,
        timestamp: new Date().toISOString(),
        version: CONSENT_VERSION
      };
      localStorage.setItem(CONSENT_KEY, JSON.stringify(data));
      expect(hasConsentChoice()).toBe(true);
    });

    it('should return false if no choice exists', () => {
      expect(hasConsentChoice()).toBe(false);
    });
  });

  describe('getConsentData', () => {
    it('should return the full data object if version matches', () => {
      const data = {
        accepted: true,
        timestamp: '2024-01-01T00:00:00.000Z',
        version: CONSENT_VERSION
      };
      localStorage.setItem(CONSENT_KEY, JSON.stringify(data));
      expect(getConsentData()).toEqual(data);
    });

    it('should return null if version mismatches', () => {
      const data = {
        accepted: true,
        timestamp: '2024-01-01T00:00:00.000Z',
        version: 'old'
      };
      localStorage.setItem(CONSENT_KEY, JSON.stringify(data));
      expect(getConsentData()).toBeNull();
    });
  });
});
