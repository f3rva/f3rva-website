import { describe, it, expect } from 'vitest';
import {
  isValidYear,
  isValidMonth,
  isValidDay,
  isValidSlug,
  isValidNumericId,
  sanitizeRedirectPath,
} from './validation';

describe('Validation Utilities', () => {
  describe('isValidYear', () => {
    it('should validate correct years', () => {
      expect(isValidYear('2024')).toBe(true);
      expect(isValidYear('1999')).toBe(true);
    });

    it('should reject invalid years', () => {
      expect(isValidYear('24')).toBe(false);
      expect(isValidYear('20245')).toBe(false);
      expect(isValidYear('abcd')).toBe(false);
      expect(isValidYear('2024&sql=1')).toBe(false);
    });
  });

  describe('isValidMonth', () => {
    it('should validate correct months', () => {
      expect(isValidMonth('01')).toBe(true);
      expect(isValidMonth('12')).toBe(true);
      expect(isValidMonth('09')).toBe(true);
    });

    it('should reject invalid months', () => {
      expect(isValidMonth('0')).toBe(false);
      expect(isValidMonth('13')).toBe(false);
      expect(isValidMonth('1')).toBe(false); // Expecting 2 digits
      expect(isValidMonth('ab')).toBe(false);
      expect(isValidMonth('01&x=y')).toBe(false);
    });
  });

  describe('isValidDay', () => {
    it('should validate correct days', () => {
      expect(isValidDay('01')).toBe(true);
      expect(isValidDay('31')).toBe(true);
      expect(isValidDay('15')).toBe(true);
    });

    it('should reject invalid days', () => {
      expect(isValidDay('00')).toBe(false);
      expect(isValidDay('32')).toBe(false);
      expect(isValidDay('5')).toBe(false); // Expecting 2 digits
      expect(isValidDay('xy')).toBe(false);
      expect(isValidDay('01;drop')).toBe(false);
    });
  });

  describe('isValidSlug', () => {
    it('should validate correct slugs', () => {
      expect(isValidSlug('my-slug')).toBe(true);
      expect(isValidSlug('My_Slug_123')).toBe(true);
      expect(isValidSlug('simple')).toBe(true);
    });

    it('should reject invalid slugs', () => {
      expect(isValidSlug('my slug')).toBe(false);
      expect(isValidSlug('slug?param=val')).toBe(false);
      expect(isValidSlug('<script>')).toBe(false);
      expect(isValidSlug('slug/path')).toBe(false);
    });
  });

  describe('isValidNumericId', () => {
    it('should validate positive integer strings', () => {
      expect(isValidNumericId('1')).toBe(true);
      expect(isValidNumericId('123')).toBe(true);
      expect(isValidNumericId('99999')).toBe(true);
    });

    it('should reject non-numeric or negative values', () => {
      expect(isValidNumericId('-1')).toBe(false);
      expect(isValidNumericId('abc')).toBe(false);
      expect(isValidNumericId('12.3')).toBe(false);
      expect(isValidNumericId('123; DROP TABLE')).toBe(false);
      expect(isValidNumericId('')).toBe(false);
      expect(isValidNumericId(null)).toBe(false);
      expect(isValidNumericId(undefined)).toBe(false);
    });
  });

  describe('sanitizeRedirectPath', () => {
    it('should accept valid relative paths', () => {
      expect(sanitizeRedirectPath('/bigdata/admin/alias-requests')).toBe('/bigdata/admin/alias-requests');
      expect(sanitizeRedirectPath('/bigdata/pax/77')).toBe('/bigdata/pax/77');
    });

    it('should reject open redirects and external schemes', () => {
      expect(sanitizeRedirectPath('https://evil.com')).toBe('/bigdata/admin/alias-requests');
      expect(sanitizeRedirectPath('http://evil.com')).toBe('/bigdata/admin/alias-requests');
      expect(sanitizeRedirectPath('//evil.com')).toBe('/bigdata/admin/alias-requests');
      expect(sanitizeRedirectPath('/\\evil.com')).toBe('/bigdata/admin/alias-requests');
      expect(sanitizeRedirectPath('javascript:alert(1)')).toBe('/bigdata/admin/alias-requests');
      expect(sanitizeRedirectPath(null)).toBe('/bigdata/admin/alias-requests');
      expect(sanitizeRedirectPath(123)).toBe('/bigdata/admin/alias-requests');
    });
  });
});
