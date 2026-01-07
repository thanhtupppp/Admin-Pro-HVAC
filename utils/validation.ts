/**
 * Validation Utilities
 * Centralized validation functions for Settings module
 */

/**
 * Validate email format
 * @param email - Email address to validate
 * @returns true if valid email format
 */
export const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

/**
 * Validate SMTP port number
 * @param port - Port number to validate
 * @returns true if port is valid SMTP port
 */
export const validateSMTPPort = (port: number): boolean => {
    const validPorts = [25, 465, 587, 2525];
    return validPorts.includes(port);
};

/**
 * Get SMTP port description
 * @param port - Port number
 * @returns Human-readable description of port usage
 */
export const getSMTPPortDescription = (port: number): string => {
    const descriptions: Record<number, string> = {
        25: 'SMTP Standard (không mã hóa)',
        465: 'SMTP với SSL/TLS',
        587: 'SMTP với STARTTLS (khuyên dùng)',
        2525: 'SMTP thay thế (một số provider)',
    };
    return descriptions[port] || 'Port không phổ biến';
};

/**
 * Mask API key for security display
 * Shows first 4 and last 6 characters, masks the rest
 * @param key - API key to mask
 * @returns Masked API key string
 * @example
 * maskApiKey('AIzaSyD1234567890abcdefghijk') 
 * // Returns: 'AIza**********************hijk'
 */
export const maskApiKey = (key: string): string => {
    if (!key || key.length < 10) return '****';
    const start = key.slice(0, 4);
    const end = key.slice(-6);
    const masked = '*'.repeat(key.length - 10);
    return `${start}${masked}${end}`;
};

/**
 * Validate URL format
 * @param url - URL to validate
 * @returns true if valid URL format
 */
export const validateUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

/**
 * Validate required field
 * @param value - Value to check
 * @returns true if value is not empty
 */
export const validateRequired = (value: string): boolean => {
    return value.trim().length > 0;
};
