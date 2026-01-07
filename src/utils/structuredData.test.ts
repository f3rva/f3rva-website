import { describe, it, expect } from 'vitest';
import {
  generateOrganizationSchema,
  generateLocalBusinessSchema,
  generateWebsiteSchema,
  generateBreadcrumbSchema,
  F3RVA_ORGANIZATION_DATA,
  F3RVA_LOCAL_BUSINESS_DATA,
  F3RVA_WEBSITE_DATA
} from './structuredData';

describe('structuredData', () => {
  describe('generateOrganizationSchema', () => {
    it('should generate valid organization schema', () => {
      const schema = generateOrganizationSchema(F3RVA_ORGANIZATION_DATA);
      expect(schema['@type']).toBe('Organization');
      expect(schema.name).toBe('F3RVA');
      expect(schema.url).toBe('https://f3rva.org');
      expect(schema.logo).toEqual({
        '@type': 'ImageObject',
        url: 'https://f3rva.org/images/f3-logo.webp'
      });
      expect(schema.address).toBeDefined();
      expect(schema.address?.['@type']).toBe('PostalAddress');
      expect(schema.contactPoint).toBeDefined();
    });

    it('should omit optional fields if not provided', () => {
      const minimalData = {
        name: 'Test Org',
        url: 'https://test.com',
        logo: 'https://test.com/logo.png',
        description: 'Description',
        sameAs: []
      };
      const schema = generateOrganizationSchema(minimalData);
      expect(schema.address).toBeUndefined();
      expect(schema.contactPoint).toBeUndefined();
    });
  });

  describe('generateLocalBusinessSchema', () => {
    it('should generate valid local business schema', () => {
      const schema = generateLocalBusinessSchema(F3RVA_LOCAL_BUSINESS_DATA);
      expect(schema['@type']).toBe('SportsActivityLocation');
      expect(schema.geo).toEqual({
        '@type': 'GeoCoordinates',
        latitude: 37.541102,
        longitude: -77.482440
      });
      expect(schema.areaServed).toBe('Richmond Metropolitan Area, Virginia');
      expect(schema.priceRange).toBe('Free');
    });
  });

  describe('generateWebsiteSchema', () => {
    it('should generate valid website schema', () => {
      const schema = generateWebsiteSchema(F3RVA_WEBSITE_DATA);
      expect(schema['@type']).toBe('WebSite');
      expect(schema.name).toBe('F3RVA');
      expect(schema.publisher['@type']).toBe('Organization');
    });
  });

  describe('generateBreadcrumbSchema', () => {
    it('should generate valid breadcrumb schema', () => {
      const data = {
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://f3rva.org' },
          { '@type': 'ListItem', position: 2, name: 'Archives', item: 'https://f3rva.org/archives' }
        ]
      };
      const schema = generateBreadcrumbSchema(data);
      expect(schema['@type']).toBe('BreadcrumbList');
      expect(schema.itemListElement).toHaveLength(2);
      expect(schema.itemListElement[0].position).toBe(1);
      expect(schema.itemListElement[1].name).toBe('Archives');
    });
  });
});
