'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import { Drawer } from '@mui/material';

export default function LayoutWrapper({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const publicRoutes = ['/login', '/register', '/forgot-password', '/verify'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <div className="mainWrapper flex bg-[#f8f9fa] min-h-screen">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div 
          className={`sidebarWrapper fixed left-0 top-0 bottom-0 z-40 transition-all duration-300 border-r border-gray-100 shadow-xl ${
            isSidebarOpen ? 'w-[260px]' : 'w-[80px]'
          }`}
        >
          <Sidebar collapsed={!isSidebarOpen} onToggle={toggleSidebar} />
        </div>
      )}

      {/* Mobile Sidebar (Drawer) */}
      {isMobile && (
        <Drawer
          anchor="left"
          open={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          PaperProps={{
            className: '!w-[280px] !max-w-[85vw] !border-none !shadow-2xl'
          }}
        >
          <Sidebar onToggle={() => setIsSidebarOpen(false)} />
        </Drawer>
      )}

      <div 
        className={`mainContent flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          !isMobile && isSidebarOpen ? 'ml-[260px]' : (!isMobile ? 'ml-[80px]' : 'ml-0')
        }`}
      >
        <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} isMobile={isMobile} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
