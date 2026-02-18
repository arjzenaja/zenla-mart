/**
 * Cart Utility Functions
 * Handles add to cart functionality with authentication check
 */

import { isAuthenticated } from './auth';
import { cartAPI } from '@/lib/api';

/**
 * Get the redirect path stored in localStorage (set when user tries to add to cart while not logged in)
 * @returns {string|null} The redirect path if exists, null otherwise
 */
export const getRedirectAfterLogin = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem('redirectAfterLogin');
};

/**
 * Clear the redirect path from localStorage
 */
export const clearRedirectAfterLogin = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('redirectAfterLogin');
  }
};

/**
 * Handle add to cart with authentication check
 * - If user is logged in: Add product to cart and redirect to /cart
 * - If user is not logged in: Redirect to /login with return path
 * 
 * @param {string} productId - The ID of the product to add to cart
 * @param {number} quantity - The quantity to add (default: 1)
 * @param {Function} router - Next.js router instance for navigation
 * @param {Function} refreshCallback - Optional callback to refresh product data after success
 * @returns {Promise<void>}
 */
export const handleAddToCart = async (productId, quantity = 1, router, refreshCallback = null, variantId = null) => {
  // Validate required parameters
  if (!productId) {
    console.error('Product ID is required');
    return;
  }

  if (!router) {
    console.error('Router instance is required');
    return;
  }

  // Check if user is authenticated
  if (!isAuthenticated()) {
    // User is not logged in
    // Store the intended destination in localStorage for redirect after login
    if (typeof window !== 'undefined') {
      localStorage.setItem('redirectAfterLogin', '/cart');
    }
    
    // Redirect to login page
    router.push('/login');
    return;
  }

  // User is logged in - proceed with adding to cart
  try {
    await cartAPI.addToCart(productId, quantity, variantId);
    
    // Refresh product data if callback provided (to update stock display)
    if (refreshCallback && typeof refreshCallback === 'function') {
      try {
        await refreshCallback();
      } catch (refreshError) {
        console.error('Error refreshing product data:', refreshError);
      }
    }
    
    // Redirect to cart page after successful add
    router.push('/cart');
  } catch (error) {
    // Handle errors (e.g., network error, product not found, etc.)
    console.error('Error adding to cart:', error);
    
    // Show user-friendly error message
    alert(error.message || 'Failed to add product to cart. Please try again.');
  }
};

/**
 * Handle "Buy Now" with authentication check
 * - Jika belum login: redirect ke /login lalu kembali ke /checkout
 * - Jika sudah login: tambah ke cart lalu langsung ke /checkout
 * 
 * @param {string} productId - The ID of the product to buy
 * @param {number} quantity - The quantity to buy (default: 1)
 * @param {Function} router - Next.js router instance for navigation
 * @param {Function} refreshCallback - Optional callback to refresh product data after success
 */
export const handleBuyNow = async (productId, quantity = 1, router, refreshCallback = null, variantId = null) => {
  if (!productId) {
    console.error('Product ID is required');
    return;
  }

  if (!router) {
    console.error('Router instance is required');
    return;
  }

  if (!isAuthenticated()) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('redirectAfterLogin', '/checkout');
    }
    router.push('/login');
    return;
  }

  try {
    await cartAPI.addToCart(productId, quantity, variantId);
    
    // Refresh product data if callback provided (to update stock display)
    if (refreshCallback && typeof refreshCallback === 'function') {
      try {
        await refreshCallback();
      } catch (refreshError) {
        console.error('Error refreshing product data:', refreshError);
      }
    }
    
    router.push('/checkout');
  } catch (error) {
    console.error('Error in Buy Now:', error);
    alert(error.message || 'Failed to process Buy Now. Please try again.');
  }
};