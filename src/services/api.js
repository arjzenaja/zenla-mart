import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL, API_TIMEOUT, DEBUG_API } from "../config/api";

/**
 * Centralized API Request Handler
 * 
 * @param {string} endpoint - API endpoint (e.g., "/auth/login", "/products")
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {object} body - Request body (will be JSON stringified)
 * @param {boolean} requiresAuth - Whether to include Authorization header (default: true)
 * @returns {Promise<object>} - Response data
 * @throws {Error} - API error with message
 */
export const apiRequest = async (
  endpoint,
  method = "GET",
  body = null,
  requiresAuth = true
) => {
  try {
    // Debug logging
    if (DEBUG_API) {
      console.log("🌐 API Request:", {
        url: `${BASE_URL}${endpoint}`,
        method,
        body,
      });
    }

    // Get token from AsyncStorage
    const token = await AsyncStorage.getItem("token");

    // Setup headers
    const headers = {
      "Content-Type": "application/json",
    };

    // Add Authorization header if required and token exists
    if (requiresAuth && token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Setup abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    // Make the request
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
      signal: controller.signal,
    });

    // Clear timeout
    clearTimeout(timeoutId);

    // Parse response
    const data = await response.json();

    // Debug logging
    if (DEBUG_API) {
      console.log("✅ API Response:", {
        status: response.status,
        data,
      });
    }

    // Handle error responses
    if (!response.ok) {
      const errorMessage = data.message || data.error || "API Error";
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    // Handle timeout
    if (error.name === "AbortError") {
      console.error("❌ API Timeout:", endpoint);
      throw new Error("Request timeout. Please check your connection.");
    }

    // Handle network errors
    if (error.message === "Network request failed") {
      console.error("❌ Network Error:", endpoint);
      throw new Error(
        "Cannot connect to server. Please check your internet connection."
      );
    }

    // Debug logging
    if (DEBUG_API) {
      console.error("❌ API Error:", {
        endpoint,
        error: error.message,
      });
    }

    // Re-throw the error
    throw error;
  }
};

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
  get: (endpoint, requiresAuth = true) =>
    apiRequest(endpoint, "GET", null, requiresAuth),

  post: (endpoint, body, requiresAuth = true) =>
    apiRequest(endpoint, "POST", body, requiresAuth),

  put: (endpoint, body, requiresAuth = true) =>
    apiRequest(endpoint, "PUT", body, requiresAuth),

  delete: (endpoint, requiresAuth = true) =>
    apiRequest(endpoint, "DELETE", null, requiresAuth),

  patch: (endpoint, body, requiresAuth = true) =>
    apiRequest(endpoint, "PATCH", body, requiresAuth),
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async () => {
  const token = await AsyncStorage.getItem("token");
  return !!token;
};

/**
 * Get current auth token
 */
export const getAuthToken = async () => {
  return await AsyncStorage.getItem("token");
};

/**
 * Save auth token
 */
export const saveAuthToken = async (token) => {
  await AsyncStorage.setItem("token", token);
};

/**
 * Remove auth token (logout)
 */
export const removeAuthToken = async () => {
  await AsyncStorage.removeItem("token");
};
