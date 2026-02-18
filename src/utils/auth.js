/**
 * Authentication Utility Functions
 * Handles authentication checks and token management
 */

/**
 * Check if user is logged in by verifying token in localStorage
 * @returns {boolean} True if user is logged in, false otherwise
 */
export const isAuthenticated = () => {
  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    return false;
  }

  // Get token from localStorage
  const token = localStorage.getItem('token');

  // Return true if token exists and is not empty
  return !!token && token.trim() !== '';
};

/**
 * Get the authentication token from localStorage
 * @returns {string|null} The token if exists, null otherwise
 */
export const getToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem('token');
};

/**
 * Remove authentication token from localStorage
 */
export const clearAuth = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};
