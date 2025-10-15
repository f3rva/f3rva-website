/**
 * Post utility functions for F3RVA archive pages
 * Provides consistent date formatting and parsing across the application
 */

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