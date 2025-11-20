/**
 * Cookie Consent Utilities
 *
 * Provides functions to check and manage cookie consent status
 * Used by components that need to respect user's privacy choices
 */

const CONSENT_KEY = 'f3rva-cookie-consent';
const CONSENT_VERSION = '1.0';

export interface ConsentData {
  accepted: boolean;
  timestamp: string;
  version: string;
}

/**
 * Check if user has given consent for cookies
 * @returns true if user has accepted cookies, false otherwise
 */
export const hasAcceptedCookies = (): boolean => {
  try {
    const existingConsent = localStorage.getItem(CONSENT_KEY);
    if (!existingConsent) return false;

    const consentData: ConsentData = JSON.parse(existingConsent);

    // Check if consent is for current version and was accepted
    return consentData.version === CONSENT_VERSION && consentData.accepted === true;
  } catch (error) {
    // If there's any error parsing, assume no consent
    console.warn('Error reading cookie consent:', error);
    return false;
  }
};

/**
 * Check if user has explicitly declined cookies
 * @returns true if user has declined cookies, false otherwise
 */
export const hasDeclinedCookies = (): boolean => {
  try {
    const existingConsent = localStorage.getItem(CONSENT_KEY);
    if (!existingConsent) return false;

    const consentData: ConsentData = JSON.parse(existingConsent);

    // Check if consent is for current version and was declined
    return consentData.version === CONSENT_VERSION && consentData.accepted === false;
  } catch (error) {
    // If there's any error parsing, assume no explicit decline
    console.warn('Error reading cookie consent:', error);
    return false;
  }
};

/**
 * Check if user has made any consent choice (accepted or declined)
 * @returns true if user has made a choice, false if no choice yet
 */
export const hasConsentChoice = (): boolean => {
  try {
    const existingConsent = localStorage.getItem(CONSENT_KEY);
    if (!existingConsent) return false;

    const consentData: ConsentData = JSON.parse(existingConsent);

    // Check if consent is for current version
    return consentData.version === CONSENT_VERSION;
  } catch (error) {
    console.warn('Error reading cookie consent:', error);
    return false;
  }
};

/**
 * Get the full consent data
 * @returns ConsentData object if it exists, null otherwise
 */
export const getConsentData = (): ConsentData | null => {
  try {
    const existingConsent = localStorage.getItem(CONSENT_KEY);
    if (!existingConsent) return null;

    const consentData: ConsentData = JSON.parse(existingConsent);

    // Only return if it's for the current version
    if (consentData.version === CONSENT_VERSION) {
      return consentData;
    }

    return null;
  } catch (error) {
    console.warn('Error reading cookie consent:', error);
    return null;
  }
};