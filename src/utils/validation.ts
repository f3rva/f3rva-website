/**
 * Validation utilities for URL parameters and user input.
 * These functions help prevent parameter injection and ensure data integrity.
 */

/**
 * Validates if a string represents a valid 4-digit year.
 * @param year - The year string to validate
 * @returns true if valid, false otherwise
 */
export const isValidYear = (year: string): boolean => {
  return /^\d{4}$/.test(year);
};

/**
 * Validates if a string represents a valid 2-digit month.
 * @param month - The month string to validate
 * @returns true if valid, false otherwise
 */
export const isValidMonth = (month: string): boolean => {
  return /^(0[1-9]|1[0-2])$/.test(month);
};

/**
 * Validates if a string represents a valid 2-digit day.
 * @param day - The day string to validate
 * @returns true if valid, false otherwise
 */
export const isValidDay = (day: string): boolean => {
  return /^(0[1-9]|[12]\d|3[01])$/.test(day);
};

/**
 * Validates if a string is a safe slug (alphanumeric, dashes, underscores).
 * @param slug - The slug string to validate
 * @returns true if valid, false otherwise
 */
export const isValidSlug = (slug: string): boolean => {
  return /^[a-zA-Z0-9-_]+$/.test(slug);
};
