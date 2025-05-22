import React from 'react';

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

/**
 * Parse text to detect URLs and convert them to clickable links
 * This improved version preserves line breaks and spacing
 * @param text The text to parse for URLs
 * @returns An array of text and JSX link elements
 */
export function parseTextForLinks(text: string): (string | JSX.Element)[] {
  if (!text) return [];
  
  // Split text by newlines to handle line breaks properly
  const lines = text.split('\n');
  
  // Process each line for URLs
  const result: (string | JSX.Element)[] = [];
  
  lines.forEach((line, lineIndex) => {
    // Add line break before each line (except the first)
    if (lineIndex > 0) {
      result.push(React.createElement('br', { key: `br-${lineIndex}` }));
    }
    
    // Skip empty lines but preserve the line break
    if (!line.trim()) {
      return;
    }
    
    // Regex to detect URLs - supports http, https, ftp protocols
    const urlRegex = /(https?:\/\/|ftp:\/\/)[^\s]+/g;
    const urlMatches = line.match(urlRegex);
    
    // If no URLs in this line, just add the text
    if (!urlMatches) {
      result.push(line);
      return;
    }
    
    // Process line with URLs
    let lastIndex = 0;
    let lineResult: (string | JSX.Element)[] = [];
    
    // Iterate through matches
    urlMatches.forEach((url, urlIndex) => {
      const urlIndex1 = line.indexOf(url, lastIndex);
      
      // Add text before URL
      if (urlIndex1 > lastIndex) {
        lineResult.push(line.substring(lastIndex, urlIndex1));
      }
      
      // Convert src/ and public/ URLs to src3/ if needed
      let targetUrl = url;
      if (url.includes('/src/') || url.startsWith('src/')) {
        targetUrl = url.replace(/\/src\/|^src\//, '/src3/');
      } else if (url.includes('/public/') || url.startsWith('public/')) {
        targetUrl = url.replace(/\/public\/|^public\//, '/src3/');
      }
      
      // Add URL as clickable link
      lineResult.push(
        React.createElement('a', {
          key: `link-${lineIndex}-${urlIndex}`,
          href: targetUrl,
          target: '_blank',
          rel: 'noopener noreferrer',
          className: 'terminal-link',
          onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
            // For local file links, prevent default behavior and handle specially
            if (targetUrl.includes('/src3/') || targetUrl.includes('file://')) {
              e.preventDefault();
              // Create custom event to notify terminal of navigation to file
              const event = new CustomEvent('terminalNavigate', {
                detail: { url: targetUrl }
              });
              window.dispatchEvent(event);
            }
          }
        }, url)
      );
      
      lastIndex = urlIndex1 + url.length;
    });
    
    // Add any remaining text after the last URL
    if (lastIndex < line.length) {
      lineResult.push(line.substring(lastIndex));
    }
    
    // Add the processed line elements to the result
    result.push(...lineResult);
  });
  
  return result;
}