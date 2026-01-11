import { describe, it, expect } from 'vitest';
import { getPostExcerpt, sanitizeHtml } from './postUtils';

describe('postUtils', () => {
  describe('getPostExcerpt', () => {
    it('should strip HTML tags from content', () => {
      const html = '<p>Hello <strong>World</strong>!</p>';
      const result = getPostExcerpt(html);
      expect(result).toBe('Hello World!');
    });

    it('should return full text if shorter than default maxLength (200)', () => {
      const text = 'This is a short text.';
      const result = getPostExcerpt(text);
      expect(result).toBe(text);
    });

    it('should truncate and add ellipsis if longer than maxLength', () => {
      const text = 'This is a very long text that should definitely be truncated because it exceeds the limit.';
      const maxLength = 20;
      const result = getPostExcerpt(text, maxLength);
      // "This is a very long " is 20 chars
      expect(result).toBe('This is a very long...');
    });

    it('should trim the result before adding ellipsis', () => {
      const text = 'Hello world this is a test';
      const maxLength = 12; // "Hello world "
      const result = getPostExcerpt(text, maxLength);
      expect(result).toBe('Hello world...'); // should not have space before ellipsis
    });

    it('should handle complex HTML with nested tags', () => {
      const html = '<div><p>Paragraph 1</p><ul><li>Item 1</li><li>Item 2</li></ul></div>';
      const result = getPostExcerpt(html);
      expect(result).toBe('Paragraph 1Item 1Item 2');
    });

    it('should return an empty string if input is empty', () => {
      expect(getPostExcerpt('')).toBe('');
    });
  });

  describe('sanitizeHtml', () => {
    it('should remove dangerous scripts (XSS)', () => {
      const dangerousInput = '<script>alert("XSS")</script><div>Safe content</div>';
      const output = sanitizeHtml(dangerousInput);
      expect(output).not.toContain('<script>');
      expect(output).toContain('Safe content');
    });

    it('should add rel="noopener noreferrer" to links with target="_blank"', () => {
      const input = '<a href="https://example.com" target="_blank">External Link</a>';
      const output = sanitizeHtml(input);
      expect(output).toContain('rel="noopener noreferrer"');
      expect(output).toContain('target="_blank"');
    });

    it('should not modify links without target="_blank"', () => {
      const input = '<a href="/internal">Internal Link</a>';
      const output = sanitizeHtml(input);
      expect(output).not.toContain('rel="noopener noreferrer"');
    });

    it('should preserve existing rel attributes and append noopener noreferrer', () => {
      const input = '<a href="https://example.com" target="_blank" rel="nofollow">External Link</a>';
      const output = sanitizeHtml(input);
      expect(output).toContain('rel="nofollow noopener noreferrer"');
    });
  });
});
