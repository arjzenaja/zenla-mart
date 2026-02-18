/**
 * Redirect Utility Functions
 * Handles redirect after login functionality
 */

import { getRedirectAfterLogin, clearRedirectAfterLogin } from './cart';

/**
 * Handle redirect after successful login
 * Checks if there's a stored redirect path (e.g., from add to cart)
 * and redirects to that path, or to default path if none exists
 * 
 * @param {Function} router - Next.js router instance for navigation
 * @param {string} defaultPath - Default path to redirect if no stored path (default: '/')
 */
export const handleRedirectAfterLogin = (router, defaultPath = '/') => {
  if (!router) {
    console.error('Router instance is required');
    return;
  }

  // Get stored redirect path (e.g., '/cart' from add to cart)
  const redirectPath = getRedirectAfterLogin();

  // Clear the stored redirect path
  clearRedirectAfterLogin();

  // Redirect to stored path or default path
  router.push(redirectPath || defaultPath);
};
