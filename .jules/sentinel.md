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
