import DOMPurify from 'dompurify';

/**
 * Post utility functions for F3RVA archive pages
 * Provides consistent date formatting and parsing across the application
 */

// Configure DOMPurify hook to add rel="noopener noreferrer" to target="_blank" links
DOMPurify.addHook('afterSanitizeAttributes', function (node) {
  // Check if node is an element and has target="_blank"
  if (node instanceof Element && node.getAttribute('target') === '_blank') {
    const rel = node.getAttribute('rel') || '';
    if (!rel.includes('noopener') || !rel.includes('noreferrer')) {
      const newRel = [rel, 'noopener', 'noreferrer']
        .filter(Boolean)
        .join(' ')
        .split(' ')
        .filter((item, index, self) => self.indexOf(item) === index) // Unique
        .join(' ');

      node.setAttribute('rel', newRel.trim());
    }
  }
});

/**
 * Sanitize HTML content to prevent XSS and add security attributes to links
 * @param content - HTML content string
 * @returns Sanitized HTML string
 */
export const sanitizeHtml = (content: string): string => {
  // Allow target attribute for links
  return DOMPurify.sanitize(content, { ADD_ATTR: ['target'] });
};

/**
 * Create excerpt from HTML content by stripping tags and truncating
 * @param content - HTML content string
 * @param maxLength - Maximum length of excerpt (default: 200)
 * @returns Plain text excerpt with ellipsis if truncated
 */
export const getPostExcerpt = (content: string, maxLength: number = 200): string => {
  const textContent = content.replace(/<[^>]*>/g, '');
  return textContent.length > maxLength
    ? textContent.substring(0, maxLength).trim() + '...'
    : textContent;
};
