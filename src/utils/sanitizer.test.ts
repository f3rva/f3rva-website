import { describe, it, expect } from 'vitest';
import { sanitizeHtml, sanitizeJSON } from './sanitizer';

describe('sanitizeHtml', () => {
  it('should remove script tags', () => {
    const dirty = '<div><script>alert("xss")</script>Safe</div>';
    const clean = sanitizeHtml(dirty);
    expect(clean).toBe('<div>Safe</div>');
  });

  it('should add rel="noopener noreferrer" to links with target="_blank"', () => {
    const dirty = '<a href="https://example.com" target="_blank">External Link</a>';
    const clean = sanitizeHtml(dirty);
    // DOMPurify might reorder attributes, so we check for presence
    expect(clean).toContain('target="_blank"');
    expect(clean).toContain('rel="noopener noreferrer"');
  });

  it('should not add rel attribute to links without target="_blank"', () => {
    const dirty = '<a href="/internal">Internal Link</a>';
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain('rel="');
  });

  it('should preserve other attributes like class', () => {
    const dirty = '<a href="#" class="btn">Button</a>';
    const clean = sanitizeHtml(dirty);
    expect(clean).toContain('class="btn"');
  });
});

describe('sanitizeJSON', () => {
  it('should correctly stringify a simple object', () => {
    const data = { key: 'value', number: 123 };
    const clean = sanitizeJSON(data);
    expect(clean).toBe('{"key":"value","number":123}');
  });

  it('should escape < characters to prevent script injection', () => {
    const data = { key: '</script><script>alert(1)</script>' };
    const clean = sanitizeJSON(data);
    // Expect unicode escape sequence for <
    expect(clean).toBe('{"key":"\\u003c/script>\\u003cscript>alert(1)\\u003c/script>"}');
    expect(clean).not.toContain('<script');
    expect(clean).not.toContain('</script');
  });

  it('should handle arrays', () => {
    const data = ['<foo>', 'bar'];
    const clean = sanitizeJSON(data);
    expect(clean).toBe('["\\u003cfoo>","bar"]');
  });

  it('should handle null', () => {
    const clean = sanitizeJSON(null);
    expect(clean).toBe('null');
  });
});
