'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { adminAuthAPI } from '@/lib/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Public routes yang tidak perlu authentication
  const publicRoutes = ['/login', '/register', '/forgot-password', '/verify'];

  useEffect(() => {
    const checkAuth = async () => {
      const isPublicRoute = publicRoutes.includes(pathname);
      
      // Jika di public route (login, register, dll)
      if (isPublicRoute) {
        // Jika user sudah login dan mengakses public route, redirect ke dashboard
        if (user || adminAuthAPI.isAuthenticated()) {
          router.push('/');
          return;
        }
        setLoading(false);
        return;
      }

      // Cek apakah ada token
      if (!adminAuthAPI.isAuthenticated()) {
        setLoading(false);
        router.push('/login');
        return;
      }

      // Jika user sudah ada, skip check (sudah authenticated)
      if (user) {
        setLoading(false);
        return;
      }

      // Verify token dengan server
      try {
        const userData = await adminAuthAPI.getMe();
        setUser(userData.user || userData);
        setLoading(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        // Token invalid, redirect to login
        await adminAuthAPI.logout();
        setUser(null);
        setLoading(false);
        router.push('/login');
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const login = async (email, password) => {
    try {
      const response = await adminAuthAPI.login(email, password);
      setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await adminAuthAPI.logout();
    setUser(null);
    router.push('/login');
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Jika di public route, render children langsung
  if (publicRoutes.includes(pathname)) {
    return <AuthContext.Provider value={{ user, login, logout, loading, setUser: updateUser }}>{children}</AuthContext.Provider>;
  }

  // Jika belum login dan bukan public route, jangan render children (akan redirect)
  if (!user && !publicRoutes.includes(pathname)) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setUser: updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
