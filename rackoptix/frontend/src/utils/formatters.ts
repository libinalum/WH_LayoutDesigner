/**
 * Formats a number as a measurement with the appropriate unit
 * @param value The value to format
 * @param unit The unit system to use ('imperial' or 'metric')
 * @param precision The number of decimal places to include
 * @returns Formatted string with appropriate unit
 */
export const formatMeasurement = (
  value: number, 
  unit: 'imperial' | 'metric' = 'imperial', 
  precision: number = 2
): string => {
  if (unit === 'imperial') {
    // Convert to feet and inches
    if (value < 12) {
      return `${value.toFixed(precision)}"`;
    } else {
      const feet = Math.floor(value / 12);
      const inches = value % 12;
      if (inches === 0) {
        return `${feet}'`;
      } else {
        return `${feet}' ${inches.toFixed(precision)}"`;
      }
    }
  } else {
    // Metric (mm, cm, m)
    if (value < 10) {
      return `${value.toFixed(precision)} mm`;
    } else if (value < 1000) {
      return `${(value / 10).toFixed(precision)} cm`;
    } else {
      return `${(value / 1000).toFixed(precision)} m`;
    }
  }
};

/**
 * Formats a date string into a human-readable format
 * @param dateString ISO date string
 * @param format The format to use ('short', 'medium', 'long', or 'relative')
 * @returns Formatted date string
 */
export const formatDate = (
  dateString: string, 
  format: 'short' | 'medium' | 'long' | 'relative' = 'medium'
): string => {
  const date = new Date(dateString);
  
  if (format === 'relative') {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);
    
    if (diffSec < 60) {
      return 'just now';
    } else if (diffMin < 60) {
      return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
    } else if (diffHour < 24) {
      return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
    } else if (diffDay < 30) {
      return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  } else if (format === 'short') {
    return date.toLocaleDateString();
  } else if (format === 'long') {
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } else {
    // medium format
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};

/**
 * Formats a number as a file size with appropriate units
 * @param bytes Size in bytes
 * @param decimals Number of decimal places
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

/**
 * Truncates text to a specified length and adds ellipsis if needed
 * @param text The text to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Formats a number as currency
 * @param value The value to format
 * @param currency The currency code (default: USD)
 * @param locale The locale to use for formatting (default: en-US)
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value: number, 
  currency: string = 'USD', 
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
};