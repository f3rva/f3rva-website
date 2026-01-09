import { describe, it, expect } from 'vitest';
import {
  getDateFromString,
  formatDisplayDate,
  formatDateForUrl,
  formatDateDisplay,
  formatMonthName
} from './dateUtils';

describe('dateUtils', () => {
  describe('getDateFromString', () => {
    it('should correctly parse YYYY-MM-DD into a Date object', () => {
      const date = getDateFromString('2024-01-15');
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0); // January
      expect(date.getDate()).toBe(15);
    });

    it('should handle leap years correctly', () => {
      const date = getDateFromString('2024-02-29');
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(1); // February
      expect(date.getDate()).toBe(29);
    });

    it('should handle month boundaries', () => {
      const date = getDateFromString('2024-12-31');
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(11); // December
      expect(date.getDate()).toBe(31);
    });
  });

  describe('formatDisplayDate', () => {
    it('should format a date string for listing display', () => {
      // The exact string depends on the locale in some environments, 
      // but toLocaleDateString('en-US') should be consistent.
      const formatted = formatDisplayDate('2024-01-15');
      expect(formatted).toBe('Mon, Jan 15, 2024');
    });

    it('should format a weekend date correctly', () => {
      const formatted = formatDisplayDate('2024-01-20'); // Saturday
      expect(formatted).toBe('Sat, Jan 20, 2024');
    });
  });

  describe('formatDateForUrl', () => {
    it('should return an object with padded month and day', () => {
      const result = formatDateForUrl('2024-01-05');
      expect(result).toEqual({
        year: '2024',
        month: '01',
        day: '05'
      });
    });

    it('should handle double-digit month and day', () => {
      const result = formatDateForUrl('2024-11-25');
      expect(result).toEqual({
        year: '2024',
        month: '11',
        day: '25'
      });
    });
  });

  describe('formatDateDisplay', () => {
    it('should format a full date string for headers', () => {
      const formatted = formatDateDisplay('2024', '1', '15');
      expect(formatted).toBe('Monday, January 15, 2024');
    });

    it('should handle different year/month/day combinations', () => {
      const formatted = formatDateDisplay('2023', '12', '25');
      expect(formatted).toBe('Monday, December 25, 2023');
    });
  });

  describe('formatMonthName', () => {
    it('should format month and year', () => {
      const formatted = formatMonthName('2024', '1');
      expect(formatted).toBe('January 2024');
    });

    it('should handle december', () => {
      const formatted = formatMonthName('2024', '12');
      expect(formatted).toBe('December 2024');
    });
  });
});
