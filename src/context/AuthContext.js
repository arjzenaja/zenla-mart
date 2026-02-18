import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as apiLogin, logout as apiLogout, getCurrentUser } from '../api/authService';
import { getProfile } from '../api/userService';
import { DEBUG_API } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on app startup
  const checkAuth = async () => {
    try {
      if (DEBUG_API) {
        console.log('🔐 Checking authentication status...');
      }

      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        if (DEBUG_API) {
          console.log('❌ No token found');
        }
        setIsLoggedIn(false);
        setUser(null);
        setLoading(false);
        return;
      }

      if (DEBUG_API) {
        console.log('✅ Token found, validating...');
      }

      // Validate token by fetching user profile
      try {
        const profileData = await getProfile();
        
        if (profileData.success && profileData.user) {
          if (DEBUG_API) {
            console.log('✅ Token valid, user logged in:', profileData.user.email);
          }
          setUser(profileData.user);
          setIsLoggedIn(true);
          
          // Update stored user data
          await AsyncStorage.setItem('user', JSON.stringify(profileData.user));
        } else {
          throw new Error('Invalid profile response');
        }
      } catch (error) {
        // Token is invalid or expired
        if (DEBUG_API) {
          console.log('❌ Token validation failed:', error.message);
        }
        await logout();
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      await logout();
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      if (DEBUG_API) {
        console.log('🔐 Attempting login for:', email);
      }

      const result = await apiLogin(email, password);
      
      if (result.success && result.user) {
        if (DEBUG_API) {
          console.log('✅ Login successful:', result.user.email);
        }
        setUser(result.user);
        setIsLoggedIn(true);
        return { success: true, user: result.user };
      } else {
        throw new Error(result.message || 'Login failed');
      }
    } catch (error) {
      if (DEBUG_API) {
        console.log('❌ Login failed:', error.message);
      }
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      if (DEBUG_API) {
        console.log('🔐 Logging out...');
      }

      await apiLogout();
      setUser(null);
      setIsLoggedIn(false);

      if (DEBUG_API) {
        console.log('✅ Logout successful');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Force logout even if there's an error
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    isLoggedIn,
    user,
    loading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
