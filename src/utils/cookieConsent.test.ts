import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  hasAcceptedCookies,
  hasDeclinedCookies,
  hasConsentChoice,
  getConsentData,
  setConsentData,
  resetConsentCache,
  CONSENT_KEY,
  CONSENT_VERSION
} from './cookieConsent';

describe('cookieConsent utility', () => {
  beforeEach(() => {
    localStorage.clear();
    resetConsentCache();
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

  describe('setConsentData', () => {
    it('should set consent data to accepted and update cache', () => {
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
      const data = setConsentData(true);
      expect(data.accepted).toBe(true);
      expect(data.version).toBe(CONSENT_VERSION);
      expect(hasAcceptedCookies()).toBe(true);

      const stored = localStorage.getItem(CONSENT_KEY);
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored as string).accepted).toBe(true);

      expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event));
      expect(dispatchEventSpy.mock.calls[0][0].type).toBe('cookieConsentAccepted');
    });

    it('should set consent data to declined and update cache', () => {
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
      const data = setConsentData(false);
      expect(data.accepted).toBe(false);
      expect(data.version).toBe(CONSENT_VERSION);
      expect(hasDeclinedCookies()).toBe(true);

      const stored = localStorage.getItem(CONSENT_KEY);
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored as string).accepted).toBe(false);

      expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event));
      expect(dispatchEventSpy.mock.calls[0][0].type).toBe('cookieConsentDeclined');
    });
  });

  describe('cache invalidation on storage event', () => {
    it('should invalidate cache when storage event occurs', () => {
      setConsentData(true);
      expect(hasAcceptedCookies()).toBe(true);

      // Simulate storage event from another tab updating consent to false
      const data = {
        accepted: false,
        timestamp: new Date().toISOString(),
        version: CONSENT_VERSION
      };
      localStorage.setItem(CONSENT_KEY, JSON.stringify(data));

      const event = new StorageEvent('storage', {
        key: CONSENT_KEY,
        newValue: JSON.stringify(data)
      });
      window.dispatchEvent(event);

      // Cache should be invalidated and read the new value from localStorage
      expect(hasAcceptedCookies()).toBe(false);
      expect(hasDeclinedCookies()).toBe(true);
    });
  });
});
