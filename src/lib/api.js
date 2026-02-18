/**
 * API Utility Functions
 * Handles all API calls to the backend server
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

  // Get token from localStorage if available (prioritize adminToken for admin panel)
  if (typeof window !== 'undefined') {
    const adminToken = localStorage.getItem('adminToken');
    const token = adminToken || localStorage.getItem('token');
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
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // If not JSON, get text response
      const text = await response.text();
      throw new Error(text || `HTTP ${response.status}: ${response.statusText}`);
    }

    if (!response.ok) {
      throw new Error(data.message || data.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    // If error is already an Error object with message, throw it as is
    if (error instanceof Error) {
      throw error;
    }
    // Otherwise, wrap it in an Error
    throw new Error(error.message || 'Something went wrong');
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
    // Note: Server doesn't have logout endpoint, just remove token locally
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

// Users API
export const usersAPI = {
  getAll: () => fetchAPI('/users'),
  getById: (id) => fetchAPI(`/users/${id}`),
  getMe: () => fetchAPI('/users/me'),
  updateMe: (userData) => 
    fetchAPI('/users/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),
  create: (userData) => 
    fetchAPI('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  update: (id, userData) => 
    fetchAPI(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),
  delete: (id) => 
    fetchAPI(`/users/${id}`, {
      method: 'DELETE',
    }),
  getAddresses: (userId) => fetchAPI(`/users/${userId}/addresses`),
};

// Products API
export const productsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI(`/products${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => fetchAPI(`/products/${id}`),
  create: (productData) => 
    fetchAPI('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    }),
  update: (id, productData) => 
    fetchAPI(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    }),
  delete: (id) => 
    fetchAPI(`/products/${id}`, {
      method: 'DELETE',
    }),
};

// Categories API
export const categoriesAPI = {
  getAll: () => fetchAPI('/categories'),
  getById: (id) => fetchAPI(`/categories/${id}`),
  create: (categoryData) => 
    fetchAPI('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    }),
  update: (id, categoryData) => 
    fetchAPI(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    }),
  delete: (id) => 
    fetchAPI(`/categories/${id}`, {
      method: 'DELETE',
    }),
};

// Orders API
export const ordersAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI(`/orders${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => fetchAPI(`/orders/${id}`),
  updateStatus: (id, status) => 
    fetchAPI(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};

// Banners API
export const bannersAPI = {
  getAll: () => fetchAPI('/banners'),
  getById: (id) => fetchAPI(`/banners/${id}`),
  create: (bannerData) => 
    fetchAPI('/banners', {
      method: 'POST',
      body: JSON.stringify(bannerData),
    }),
  update: (id, bannerData) => 
    fetchAPI(`/banners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bannerData),
    }),
  delete: (id) => 
    fetchAPI(`/banners/${id}`, {
      method: 'DELETE',
    }),
};

// Slides API
export const slidesAPI = {
  getAll: () => fetchAPI('/slides'),
  getById: (id) => fetchAPI(`/slides/${id}`),
  create: (slideData) => 
    fetchAPI('/slides', {
      method: 'POST',
      body: JSON.stringify(slideData),
    }),
  update: (id, slideData) => 
    fetchAPI(`/slides/${id}`, {
      method: 'PUT',
      body: JSON.stringify(slideData),
    }),
  delete: (id) => 
    fetchAPI(`/slides/${id}`, {
      method: 'DELETE',
    }),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => fetchAPI('/dashboard/stats'),
  getSales: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI(`/dashboard/sales${queryString ? `?${queryString}` : ''}`);
  },
};

// Wishlist API (Admin)
export const wishlistAPI = {
  getAll: () => fetchAPI('/wishlist/admin/all'),
};

// Upload API
export const uploadAPI = {
  uploadImage: async (formData) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const url = `${API_URL}/upload/image`;
    
    const defaultOptions = {
      method: 'POST',
      credentials: 'include',
    };

    // Get token from localStorage if available
    if (typeof window !== 'undefined') {
      const adminToken = localStorage.getItem('adminToken');
      const token = adminToken || localStorage.getItem('token');
      if (token) {
        defaultOptions.headers = {
          'Authorization': `Bearer ${token}`,
        };
      }
    }

    try {
      const response = await fetch(url, {
        ...defaultOptions,
        body: formData, // Don't set Content-Type, let browser set it for FormData
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
};

// Admin Auth API
const ADMIN_API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

export const adminAuthAPI = {
  login: async (email, password) => {
    const url = `${ADMIN_API_URL}/admin/login`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      // Check if response is ok before parsing JSON
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        // Handle different error status codes
        if (response.status === 404) {
          throw new Error('Server endpoint not found. Make sure server is running on port 5000');
        }
        throw new Error(data.message || `Login failed (${response.status})`);
      }

      // Handle response format: { success: true, data: { user, token } }
      const user = data.data?.user || data.user;
      const token = data.data?.token || data.token;

      if (!token || !user) {
        throw new Error('Invalid response format from server');
      }

      // Save token to localStorage if available
      if (typeof window !== 'undefined' && token) {
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminUser', JSON.stringify(user));
      }

      return {
        user,
        token,
        ...data
      };
    } catch (error) {
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Make sure server is running on http://localhost:5000');
      }
      throw error;
    }
  },

  getMe: async () => {
    const url = `${ADMIN_API_URL}/admin/me`;
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        // Token invalid, clear storage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
        }
      }
      throw new Error(data.message || 'Failed to get admin profile');
    }

    // Handle response format: { success: true, data: { user } }
    return {
      user: data.data?.user || data.user,
      ...data
    };
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    }
    return Promise.resolve({ success: true, message: 'Logged out successfully' });
  },

  isAuthenticated: () => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('adminToken');
  },

  getToken: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('adminToken');
  },

  getUser: () => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('adminUser');
    return userStr ? JSON.parse(userStr) : null;
  },
};

export default fetchAPI;
