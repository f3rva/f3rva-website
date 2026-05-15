/**
 * Cookie Consent Utilities
 *
 * Provides functions to check and manage cookie consent status
 * Used by components that need to respect user's privacy choices
 */

export const CONSENT_KEY = 'f3rva-cookie-consent';
export const CONSENT_VERSION = '1.0';

export interface ConsentData {
  accepted: boolean;
  timestamp: string;
  version: string;
}

// In-memory cache to prevent redundant localStorage access and JSON parsing
// undefined means not yet loaded, null means no consent or invalid consent
let consentCache: ConsentData | null | undefined = undefined;

/**
 * Loads and caches the consent data from localStorage
 */
const loadConsent = (): ConsentData | null => {
  try {
    const existingConsent = localStorage.getItem(CONSENT_KEY);
    if (!existingConsent) return null;

    const consentData: ConsentData = JSON.parse(existingConsent);

    if (consentData.version === CONSENT_VERSION) {
      return consentData;
    }
    return null;
  } catch (error) {
    console.warn('Error reading cookie consent:', error);
    return null;
  }
};

/**
 * Initializes the cache if not already loaded
 */
const ensureCache = () => {
  if (consentCache === undefined) {
    consentCache = loadConsent();
  }
};

/**
 * Check if user has given consent for cookies
 * @returns true if user has accepted cookies, false otherwise
 */
export const hasAcceptedCookies = (): boolean => {
  ensureCache();
  return consentCache?.accepted === true;
};

/**
 * Check if user has explicitly declined cookies
 * @returns true if user has declined cookies, false otherwise
 */
export const hasDeclinedCookies = (): boolean => {
  ensureCache();
  return consentCache?.accepted === false;
};

/**
 * Check if user has made any consent choice (accepted or declined)
 * @returns true if user has made a choice, false if no choice yet
 */
export const hasConsentChoice = (): boolean => {
  ensureCache();
  return consentCache !== null && consentCache !== undefined;
};

/**
 * Get the full consent data
 * @returns ConsentData object if it exists, null otherwise
 */
export const getConsentData = (): ConsentData | null => {
  ensureCache();
  return consentCache || null;
};

/**
 * Set the user's cookie consent choice
 * @param accepted - true if accepted, false if declined
 * @returns The saved ConsentData object
 */
export const setConsentData = (accepted: boolean): ConsentData => {
  const consentData: ConsentData = {
    accepted,
    timestamp: new Date().toISOString(),
    version: CONSENT_VERSION
  };

  localStorage.setItem(CONSENT_KEY, JSON.stringify(consentData));
  consentCache = consentData;

  if (accepted) {
    window.dispatchEvent(new Event('cookieConsentAccepted'));
  }

  return consentData;
};

/**
 * Resets the in-memory cache (primarily used for testing)
 */
export const resetConsentCache = (): void => {
  consentCache = undefined;
};

// Listen for storage events to invalidate cache if consent changes in another tab
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === CONSENT_KEY) {
      // Invalidate the cache, so the next read will load the new data
      consentCache = undefined;
    }
  });
}
