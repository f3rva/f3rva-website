## 2025-02-18 - [Reusable HTML Sanitization]
**Vulnerability:** Potential for Reverse Tabnabbing in user-generated content rendered via `dangerouslySetInnerHTML`. `DOMPurify` default configuration strips `target` attributes but does not enforce `rel="noopener noreferrer"`.
**Learning:** `DOMPurify` needs explicit configuration (`ADD_ATTR: ['target']`) to allow targets, and a hook to enforce `rel="noopener noreferrer"`.
**Prevention:** Use `src/utils/sanitizer.ts` for all HTML content rendering instead of direct `DOMPurify` usage.

## 2025-02-18 - [Input Validation for URL Parameters]
**Vulnerability:** Potential for Parameter Injection/Pollution via URL parameters if backend is vulnerable.
**Learning:** React Router extracts parameters as strings, but doesn't validate their format. Directly passing these to API calls can expose the backend to injection attacks.
**Prevention:** Implemented strict regex-based validation in `src/utils/validation.ts` and applied it before API calls.
