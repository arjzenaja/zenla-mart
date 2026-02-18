import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL, API_TIMEOUT, DEBUG_API } from '../config/api';

// ⚠️ IMPORTANT: Update your IP address in src/config/api.js
// The BASE_URL is now centrally managed in config/api.js

const client = axios.create({
  baseURL: BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
client.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      // Only log in debug mode
      if (DEBUG_API) {
        console.log('🌐 API Request:', config.url);
        console.log('🔑 Token found:', token ? 'YES' : 'NO');
      }
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('❌ Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default client;
