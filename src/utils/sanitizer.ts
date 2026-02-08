import DOMPurify from 'dompurify';

/**
 * Configure DOMPurify hook to prevent reverse tabnabbing.
 * This adds a security layer for user-generated or external content.
 */
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  // Check if the node is an anchor tag and has target="_blank"
  // Cast to Element to access getAttribute safely, though DOMPurify passes Element
  if (node instanceof Element && node.tagName === 'A' && node.getAttribute('target') === '_blank') {
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

/**
 * Sanitizes HTML content using DOMPurify with strict security settings.
 * Enforces rel="noopener noreferrer" on external links to prevent
 * reverse tabnabbing attacks.
 *
 * @param html - The potentially unsafe HTML string.
 * @returns The sanitized HTML string.
 */
export const sanitizeHtml = (html: string): string => {
  // By default DOMPurify might strip 'target', so we explicitly allow it.
  return DOMPurify.sanitize(html, {
    ADD_ATTR: ['target'],
  });
};

/**
 * Sanitizes JSON for safe embedding in <script> tags.
 * Prevents XSS attacks via </script> injection in JSON-LD.
 *
 * @param data - The data to serialize.
 * @returns The sanitized JSON string.
 */
export const sanitizeJSON = (data: unknown): string => {
  return JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
};
