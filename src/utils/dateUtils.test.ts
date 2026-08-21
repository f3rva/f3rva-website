import { describe, it, expect } from 'vitest';
import {
  getDateFromString,
  formatDisplayDate,
  formatFullDisplayDate,
  formatDateForUrl,
  formatDateDisplay,
  formatMonthName,
  formatDateToISO,
  getDateDaysAgo,
  getDateMonthsAgo,
  getStartOfYearDate,
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

  describe('formatFullDisplayDate', () => {
    it('should format a date string to full text with day of week in parentheses', () => {
      const formatted = formatFullDisplayDate('2015-10-17');
      expect(formatted).toBe('October 17, 2015 (Saturday)');
    });

    it('should handle invalid or null dates gracefully', () => {
      expect(formatFullDisplayDate(null)).toBe('N/A');
      expect(formatFullDisplayDate('')).toBe('N/A');
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

  describe('formatDateToISO', () => {
    it('should format date to local YYYY-MM-DD string', () => {
      const d = new Date(2024, 0, 5); // Jan 5, 2024
      expect(formatDateToISO(d)).toBe('2024-01-05');
    });

    it('should pad single-digit months and days', () => {
      const d = new Date(2024, 8, 9); // Sep 9, 2024
      expect(formatDateToISO(d)).toBe('2024-09-09');
    });
  });

  describe('relative date helpers', () => {
    it('should compute days ago correctly', () => {
      const ref = new Date(2024, 5, 15); // June 15, 2024
      const result = getDateDaysAgo(30, ref);
      expect(formatDateToISO(result)).toBe('2024-05-16');
    });

    it('should compute months ago correctly', () => {
      const ref = new Date(2024, 5, 15); // June 15, 2024
      const result = getDateMonthsAgo(12, ref);
      expect(formatDateToISO(result)).toBe('2023-06-15');
    });

    it('should get start of year correctly', () => {
      const ref = new Date(2024, 5, 15);
      const result = getStartOfYearDate(ref);
      expect(formatDateToISO(result)).toBe('2024-01-01');
    });
  });
});
