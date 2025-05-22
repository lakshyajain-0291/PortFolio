/**
 * Terminal utility functions for formatting and manipulating terminal output
 */

/**
 * Truncates a string and adds ellipsis if it exceeds the max length
 * @param str The string to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated string with ellipsis if needed
 */
export function truncateWithEllipsis(str: string, maxLength: number = 80): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength)}...`;
}

/**
 * Formats a date for terminal output
 * @param dateStr Date string to format
 * @returns Formatted date string
 */
export function formatTerminalDate(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    return dateStr; // Return original if parsing fails
  }
}

/**
 * Safely access nested properties in an object
 * @param obj Object to access
 * @param path Path to the property, using dot notation
 * @param defaultValue Default value if property doesn't exist
 * @returns The property value or default value
 */
export function getNestedValue(obj: any, path: string, defaultValue: any = null): any {
  if (!obj || !path) return defaultValue;
  
  const keys = path.split('.');
  let value = obj;
  
  for (const key of keys) {
    if (value === undefined || value === null || typeof value !== 'object') {
      return defaultValue;
    }
    value = value[key];
  }
  
  return value !== undefined ? value : defaultValue;
}

/**
 * Format a date string
 * This is a compatibility function for the terminal component
 * @param dateString String to format as date
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    return dateString;
  }
}