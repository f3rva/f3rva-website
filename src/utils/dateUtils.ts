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
