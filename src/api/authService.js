import client from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEBUG_API } from '../config/api';

export const login = async (email, password) => {
  try {
    if (DEBUG_API) {
      console.log('🔐 Login API call for:', email);
    }

    const response = await client.post('/auth/login', { email, password });
    
    if (DEBUG_API) {
      console.log('✅ Login response:', response.data);
    }

    if (response.data.success) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      
      if (DEBUG_API) {
        console.log('✅ Token and user saved to storage');
      }
    }
    
    return response.data;
  } catch (error) {
    if (DEBUG_API) {
      console.error('❌ Login error:', error.response?.data || error.message);
    }
    throw error;
  }
};

export const register = async (userData) => {
  try {
    if (DEBUG_API) {
      console.log('📝 Register API call for:', userData.email);
    }

    const response = await client.post('/auth/register', userData);
    
    if (DEBUG_API) {
      console.log('✅ Register response:', response.data);
    }

    return response.data;
  } catch (error) {
    if (DEBUG_API) {
      console.error('❌ Register error:', error.response?.data || error.message);
    }
    throw error;
  }
};

export const logout = async () => {
  try {
    if (DEBUG_API) {
      console.log('🚪 Logout: Clearing storage...');
    }

    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    
    if (DEBUG_API) {
      console.log('✅ Storage cleared');
    }
  } catch (error) {
    console.error('Error during logout:', error);
    // Still try to clear even if there's an error
    await AsyncStorage.multiRemove(['token', 'user']);
  }
};

export const getCurrentUser = async () => {
  try {
    const user = await AsyncStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const validateToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      if (DEBUG_API) {
        console.log('❌ No token to validate');
      }
      return false;
    }

    if (DEBUG_API) {
      console.log('🔍 Validating token...');
    }

    // Token validation is done by trying to fetch user profile
    // This is handled in AuthContext
    return true;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};
