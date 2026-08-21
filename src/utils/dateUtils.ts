/**
 * Date utility functions for F3RVA archive pages
 * Provides consistent date formatting and parsing across the application
 */

/**
 * Parse date string in YYYY-MM-DD format to Date object
 * Handles timezone issues by creating date in local timezone
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object in local timezone
 */
export const getDateFromString = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
};

/**
 * Format date string for display in archive listings
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Formatted date string (e.g., "Mon, Jan 15, 2024")
 */
export const formatDisplayDate = (dateString: string): string => {
  const date = getDateFromString(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format date string in YYYY-MM-DD format to full date with weekday in parentheses
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Formatted date string (e.g., "October 17, 2015 (Saturday)")
 */
export const formatFullDisplayDate = (dateString: string | null | undefined): string => {
  if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString || 'N/A';
  const date = getDateFromString(dateString);
  const monthDayYear = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  return `${monthDayYear} (${weekday})`;
};

/**
 * Format date string for URL construction
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Object with year, month, day strings formatted for URLs
 */
export const formatDateForUrl = (dateString: string): { year: string; month: string; day: string } => {
  const date = getDateFromString(dateString);
  return {
    year: date.getFullYear().toString(),
    month: (date.getMonth() + 1).toString().padStart(2, '0'),
    day: date.getDate().toString().padStart(2, '0')
  };
};

/**
 * Format date display for archive page headers
 * @param year - Year string
 * @param month - Month string (1-12)
 * @param day - Day string
 * @returns Formatted date string (e.g., "Monday, January 15, 2024")
 */
export const formatDateDisplay = (year: string, month: string, day: string): string => {
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format month and year for display
 * @param year - Year string
 * @param month - Month string (1-12)
 * @returns Formatted month and year string (e.g., "January 2024")
 */
export const formatMonthName = (year: string, month: string): string => {
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });
};

/**
 * Format Date object to local YYYY-MM-DD string without UTC timezone shift.
 * Avoids off-by-one errors caused by toISOString() late in the evening.
 * @param date - Date object to format
 * @returns YYYY-MM-DD formatted string in local time
 */
export const formatDateToISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get Date object N days prior to a reference date.
 * @param days - Number of days to subtract
 * @param fromDate - Reference date (defaults to today)
 * @returns Calculated Date object
 */
export const getDateDaysAgo = (days: number, fromDate: Date = new Date()): Date => {
  const target = new Date(fromDate);
  target.setDate(target.getDate() - days);
  return target;
};

/**
 * Get Date object N months prior to a reference date.
 * @param months - Number of months to subtract
 * @param fromDate - Reference date (defaults to today)
 * @returns Calculated Date object
 */
export const getDateMonthsAgo = (months: number, fromDate: Date = new Date()): Date => {
  const target = new Date(fromDate);
  target.setMonth(target.getMonth() - months);
  return target;
};

/**
 * Get the start of the current year (January 1st).
 * @param fromDate - Reference date (defaults to today)
 * @returns Date representing January 1st of the reference year
 */
export const getStartOfYearDate = (fromDate: Date = new Date()): Date => {
  return new Date(fromDate.getFullYear(), 0, 1);
};
