/**
 * Phone number validation for Indonesian format
 * Supports formats:
 * - +62xxxxxxxxxxx
 * - 62xxxxxxxxxxx
 * - 08xxxxxxxxxx
 * - 08xx-xxxx-xxxx
 * - 08xx.xxxx.xxxx
 */

/**
 * Validates Indonesian phone number
 * @param {string} phone - Phone number to validate
 * @returns {object} - { isValid: boolean, error: string, normalized: string }
 */
export const validateIndonesianPhone = (phone) => {
  if (!phone || phone.trim() === '') {
    return {
      isValid: false,
      error: 'Phone number is required',
      normalized: ''
    };
  }

  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');

  // Handle different formats
  // +62xxxxxxxxxxx or 62xxxxxxxxxxx
  if (cleaned.startsWith('+62')) {
    cleaned = cleaned.replace('+62', '62');
  }

  // If starts with 62, remove it to normalize
  if (cleaned.startsWith('62')) {
    cleaned = '0' + cleaned.substring(2);
  }

  // Should start with 0 and be 10-13 digits total
  if (!cleaned.startsWith('0')) {
    return {
      isValid: false,
      error: 'Phone number must start with 0 or country code (+62/62)',
      normalized: ''
    };
  }

  // Remove leading 0 for validation
  const digitsOnly = cleaned.substring(1);

  // Check length (Indonesian mobile numbers are typically 9-12 digits after 0)
  if (digitsOnly.length < 9 || digitsOnly.length > 12) {
    return {
      isValid: false,
      error: 'Phone number must be 10-13 digits (including country code)',
      normalized: ''
    };
  }

  // Check if it's a valid Indonesian mobile prefix (08xx)
  const firstTwoDigits = cleaned.substring(0, 2);
  if (firstTwoDigits !== '08') {
    return {
      isValid: false,
      error: 'Indonesian mobile numbers must start with 08',
      normalized: ''
    };
  }

  // Check if all digits are valid
  if (!/^\d+$/.test(digitsOnly)) {
    return {
      isValid: false,
      error: 'Phone number contains invalid characters',
      normalized: ''
    };
  }

  // Normalize to +62 format for storage
  const normalized = '+62' + digitsOnly;

  return {
    isValid: true,
    error: '',
    normalized: normalized
  };
};

/**
 * Formats phone number for display
 * @param {string} phone - Phone number to format
 * @returns {string} - Formatted phone number
 */
export const formatPhoneForDisplay = (phone) => {
  if (!phone) return '';
  
  // If already in +62 format, return as is
  if (phone.startsWith('+62')) {
    return phone;
  }
  
  // If starts with 62, add +
  if (phone.startsWith('62')) {
    return '+' + phone;
  }
  
  // If starts with 0, convert to +62
  if (phone.startsWith('0')) {
    return '+62' + phone.substring(1);
  }
  
  return phone;
};
