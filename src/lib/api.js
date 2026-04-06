const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for authentication
  };

  // Get token from localStorage if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // Handle network errors (when fetch itself fails)
    if (!response) {
      throw new Error('Network error: Unable to connect to the server. Please make sure the server is running.');
    }

    // Try to parse JSON, but handle cases where response might not be JSON
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error('Invalid JSON response from server');
      }
    } else {
      // If response is not JSON, create a data object with the status text
      data = { message: response.statusText || 'Something went wrong' };
    }

    if (!response.ok) {
      throw new Error(data.message || `Server error: ${response.status} ${response.statusText}`);
    }

    return data;
  } catch (error) {
    // Handle network errors (fetch failed completely)
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      const networkError = new Error(`Unable to connect to the server. Please make sure the backend server is running on ${API_URL}`);
      console.error('API Network Error:', networkError.message);
      console.error('Make sure the server is running. You can start it by running: cd server && npm start');
      throw networkError;
    }

    // Untuk error bisnis seperti "Quantity exceeds available stock",
    // kita biarkan saja dilempar ke pemanggil tanpa log error merah di console.
    throw error;
  }
}

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Save token to localStorage if available
    if (typeof window !== 'undefined' && response.token) {
      localStorage.setItem('token', response.token);
    }

    return response;
  },

  register: (userData) =>
    fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    return Promise.resolve({ success: true, message: 'Logged out successfully' });
  },

  verify: (email, otp) =>
    fetchAPI('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    }),

  forgotPassword: (email) =>
    fetchAPI('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  verifyResetOTP: (email, otp) =>
    fetchAPI('/auth/verify-reset-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    }),

  resetPassword: (email, otp, new_password) =>
    fetchAPI('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, new_password }),
    }),
};

// Products API
export const productsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI(`/products${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => fetchAPI(`/products/${id}`),
  search: (query, params = {}) => {
    const searchParams = new URLSearchParams({ q: query, ...params });
    return fetchAPI(`/products?${searchParams.toString()}`);
  },
  addReview: (id, reviewData) =>
    fetchAPI(`/products/${id}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    }),
};

// Categories API
export const categoriesAPI = {
  getAll: () => fetchAPI('/categories'),
  getById: (id) => fetchAPI(`/categories/${id}`),
};

// Cart API
export const cartAPI = {
  getCart: () => fetchAPI('/cart'),
  addToCart: (productId, quantity = 1, variantId = null) =>
    fetchAPI('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity, variantId }),
    }),
  updateCartItem: (productId, quantity, variantId = null) =>
    fetchAPI(`/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity, variantId }),
    }),
  removeFromCart: (productId, variantId = null) =>
    fetchAPI(`/cart/${productId}${variantId ? `?variantId=${variantId}` : ''}`, {
      method: 'DELETE',
    }),
};

// Wishlist API
export const wishlistAPI = {
  getWishlist: () => fetchAPI('/wishlist'),
  addToWishlist: (productId) =>
    fetchAPI('/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    }),
  removeFromWishlist: (productId) =>
    fetchAPI(`/wishlist/${productId}`, {
      method: 'DELETE',
    }),
  removeAllFromWishlist: () =>
    fetchAPI('/wishlist', {
      method: 'DELETE',
    }),
  addToCartFromWishlist: (productId, removeFromWishlist = false) =>
    fetchAPI('/wishlist/add-to-cart', {
      method: 'POST',
      body: JSON.stringify({ productId, removeFromWishlist }),
    }),
  addAllToCart: (removeFromWishlist = false) =>
    fetchAPI('/wishlist/add-all-to-cart', {
      method: 'POST',
      body: JSON.stringify({ removeFromWishlist }),
    }),
};

// Orders API
export const ordersAPI = {
  getMyOrders: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI(`/orders/my-orders${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => fetchAPI(`/orders/${id}`),
  checkout: (orderData) =>
    fetchAPI('/orders/checkout', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),
};

// Address API
export const addressAPI = {
  getAll: () => fetchAPI('/addresses'),
  getById: (id) => fetchAPI(`/addresses/${id}`),
  create: (addressData) =>
    fetchAPI('/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    }),
  update: (id, addressData) =>
    fetchAPI(`/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    }),
  setDefault: (id) =>
    fetchAPI(`/addresses/${id}/set-default`, {
      method: 'PATCH',
    }),
  delete: (id) =>
    fetchAPI(`/addresses/${id}`, {
      method: 'DELETE',
    }),
};

// User API
export const userAPI = {
  getProfile: () => fetchAPI('/users/me'),
  updateProfile: (userData) =>
    fetchAPI('/users/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),
};

// Banners API
export const bannersAPI = {
  getAll: () => fetchAPI('/banners'),
  getById: (id) => fetchAPI(`/banners/${id}`),
};

// Slides API
export const slidesAPI = {
  getAll: () => fetchAPI('/slides'),
  getById: (id) => fetchAPI(`/slides/${id}`),
};

// Home Slides API (for client - returns only active slides)
export const homeSlidesAPI = {
  getAll: () => fetchAPI('/home-slides'),
};
// Upload API
export const uploadAPI = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const response = await fetch(`${API_URL}/upload/image`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || 'Failed to upload image');
    }

    return response.json();
  },
};

export default fetchAPI;
