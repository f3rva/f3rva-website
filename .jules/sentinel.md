## 2025-02-18 - [Reusable HTML Sanitization]
**Vulnerability:** Potential for Reverse Tabnabbing in user-generated content rendered via `dangerouslySetInnerHTML`. `DOMPurify` default configuration strips `target` attributes but does not enforce `rel="noopener noreferrer"`.
**Learning:** `DOMPurify` needs explicit configuration (`ADD_ATTR: ['target']`) to allow targets, and a hook to enforce `rel="noopener noreferrer"`.
**Prevention:** Use `src/utils/sanitizer.ts` for all HTML content rendering instead of direct `DOMPurify` usage.

## 2025-02-18 - [Input Validation for URL Parameters]
**Vulnerability:** Potential for Parameter Injection/Pollution via URL parameters if backend is vulnerable.
**Learning:** React Router extracts parameters as strings, but doesn't validate their format. Directly passing these to API calls can expose the backend to injection attacks.
**Prevention:** Implemented strict regex-based validation in `src/utils/validation.ts` and applied it before API calls.

## 2025-02-18 - [Content Security Policy Implementation]
**Vulnerability:** XSS and data injection risks due to lack of restrictions on resource loading.
**Learning:** Vite dev server requires `ws://localhost:*` for HMR and `'unsafe-inline'` for scripts/styles. CSP must account for this to avoid breaking the dev experience.
**Prevention:** Added a strict-as-possible CSP in `index.html` via meta tag, whitelisting only known external domains and necessary development protocols.

## 2025-02-18 - [Secure JSON Embedding in Script Tags]
**Vulnerability:** Cross-Site Scripting (XSS) via script injection in JSON-LD structured data. An attacker could inject `</script><script>...` to break out of the script context.
**Learning:** Simply using `JSON.stringify` inside a `<script>` tag is unsafe. The browser parses `</script>` even inside strings.
**Prevention:** Implemented `sanitizeJSON` in `src/utils/sanitizer.ts` which escapes `<` as `\u003c`, preventing the browser from interpreting script tags prematurely.

## 2026-02-22 - [Inconsistent Input Validation in Archives]
**Vulnerability:** The `AOArchives` component used the `ao` URL parameter directly in API calls without validation, unlike other archive pages (`YearArchives`, `MonthArchives`, `ArchivePost`). This inconsistency created a potential vector for injection or unexpected behavior with malformed slugs.
**Learning:** Even when security patterns exist (like `isValidSlug`), they must be applied consistently across all similar components. Code duplication (copy-pasting `useEffect` logic) often leads to missed security checks if the original didn't have them or if one copy missed it.
**Prevention:** Added explicit `isValidSlug` validation in `src/pages/Archives/AOArchives.tsx` before initiating API calls.

## 2026-03-15 - [Secure Iframe Embeds]
**Vulnerability:** Embedded iframes from third-party sources (Vimeo, f3nation.com map) lacked the `sandbox` attribute, potentially exposing the application to malicious actions if the external sources were compromised (e.g., executing arbitrary scripts, navigating the top-level window, or presenting malicious popups).
**Learning:** By default, iframes grant full permissions to embedded content. Implementing the `sandbox` attribute restricts these capabilities, enforcing a principle of least privilege.
**Prevention:** Always apply the `sandbox` attribute to `<iframe>` elements, explicitly allowing only the necessary features (e.g., `allow-scripts`, `allow-same-origin`, `allow-presentation`, `allow-popups`) required for the embedded content to function correctly.

## 2026-03-24 - [Environment Variable Validation]
**Vulnerability:** The Google Analytics ID is injected from the environment variable `VITE_GOOGLE_ANALYTICS_ID` and used directly in script source generation, which could lead to an XSS injection if the environment variable is compromised or maliciously crafted.
**Learning:** Even internal configuration injected at build time via environment variables should be treated as untrusted input when used in security-sensitive contexts like script tag URLs.
**Prevention:** Added a strict regex validation for `VITE_GOOGLE_ANALYTICS_ID` (`/^(G-[A-Z0-9]+|UA-\d+-\d+)$/`) before using it in the application.

## 2025-02-28 - [DOM Injection via Unvalidated Env Vars]
**Vulnerability:** XSS vulnerability in `GoogleAnalytics.tsx` resulting from injecting `VITE_GOOGLE_ANALYTICS_ID` into the DOM via a `script.src` tag template without any format validation.
**Learning:** Environment variables cannot be inherently trusted, especially if they are injected directly into DOM script elements.
**Prevention:** Enforce strict validation via regex of all environment variables before they are used in sensitive contexts like DOM node creation or external script sourcing.

## 2026-03-15 - [Secure Environment Variable Validation]
**Vulnerability:** The Google Analytics Measurement ID (`VITE_GOOGLE_ANALYTICS_ID`) was loaded directly from the environment without validation in `src/config/analytics.js`. If the environment variable was maliciously modified or incorrectly configured (e.g., to contain a script or unexpected payload), it could lead to script injection or XSS since it's directly appended to the external Google Tag Manager script URL in `src/components/GoogleAnalytics.tsx`.
**Learning:** Environment variables used in sensitive contexts (like constructing URLs for external scripts) should never be trusted blindly. Even though Vite limits exposure to `VITE_` prefixed variables, validating their format adds a crucial layer of defense in depth against configuration errors or potential CI/CD pipeline compromises.
**Prevention:** Added strict regex validation in `src/config/analytics.js` (`/^(G-[A-Z0-9]+|UA-\d+-\d+)$/`) to ensure the `trackingId` strictly matches expected Google Analytics formats before returning the configuration. If the format is invalid, it securely fails by returning `null`, preventing the external script from loading.

## 2026-03-22 - [Environment Variable Injection Mitigation]
**Vulnerability:** Potential for script injection/XSS through malicious modification or misconfiguration of the `VITE_GOOGLE_ANALYTICS_ID` environment variable. Since it's directly injected into a script tag `src`, an attacker controlling build environment variables could inject arbitrary scripts.
**Learning:** External IDs passed via environment variables that are used to build script URLs or injected directly into HTML must be strictly validated. Never implicitly trust environment variables for external integration identifiers.
**Prevention:** Implemented strict regex validation (`/^(G-[A-Z0-9]+|UA-\d+-\d+)$/`) for the `VITE_GOOGLE_ANALYTICS_ID` before it's used to construct the script tag in `src/config/analytics.js`.

## 2025-03-29 - [Cookie Consent Memory Cache & Centralized Updates]
**Vulnerability:** The cookie consent module repeatedly accessed `localStorage` and performed `JSON.parse` on every read (e.g., during page tracking hooks). Uncached parsing of `localStorage` strings could introduce performance bottlenecks or a sync DoS vector if manipulated by a cross-site script. Additionally, updating `localStorage` directly bypassed state synchronization across tabs.
**Learning:** `localStorage` data should be cached in memory to avoid redundant parsing. Centralized update functions (e.g., `setConsentData`) should be used over direct `localStorage.setItem` to ensure the memory cache and events stay synchronized.
**Prevention:** Implemented an in-memory cache variable in `src/utils/cookieConsent.ts`, updated all read functions to check the cache, added a `setConsentData` function to centralize writes, and added a `storage` event listener for cross-tab cache invalidation.
