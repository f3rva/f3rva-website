## 2024-03-24 - Reverse Tabnabbing Protection in Sanitization
**Vulnerability:** Default usage of `DOMPurify.sanitize()` removes dangerous scripts but allows `target="_blank"` without ensuring `rel="noopener noreferrer"`, exposing users to reverse tabnabbing attacks via user-submitted content.
**Learning:** Sanitization libraries often focus on XSS but might not enforce all best practices for external links by default. Hooks are a powerful way to enforce these policies globally or locally.
**Prevention:** Configured `DOMPurify` with an `afterSanitizeAttributes` hook to automatically append `rel="noopener noreferrer"` to any link with `target="_blank"`. This ensures defense-in-depth for all sanitized content.
