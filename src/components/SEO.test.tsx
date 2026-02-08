
import { render } from '@testing-library/react';
import React from 'react';
import SEO from './SEO';

describe('SEO Component Security', () => {
  it('should escape script tags in structured data to prevent XSS', () => {
    const maliciousData = {
      name: '</script><script>alert("XSS")</script>'
    };

    const { container } = render(
      <SEO
        title="Test Page"
        structuredData={maliciousData}
      />
    );

    const scriptTag = container.querySelector('script[type="application/ld+json"]');
    expect(scriptTag).not.toBeNull();

    // This is what we want to avoid:
    // {"name":"</script><script>alert("XSS")</script>"}
    //
    // We want something like:
    // {"name":"\u003c/script\u003e\u003cscript\u003ealert(\"XSS\")\u003c/script\u003e"}
    // or at least escaping the forward slash.

    const content = scriptTag?.textContent;

    // If the content contains exactly </script>, it's vulnerable because the browser parser
    // will see it as the end of the script block despite being inside a JSON string.
    expect(content).not.toContain('</script>');
  });
});
