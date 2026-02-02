'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const publicRoutes = ['/login', '/register', '/forgot-password', '/verify'];
  const isPublicRoute = publicRoutes.includes(pathname);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <div className="mainWrapper flex">
      <div className="sidebarWrapper w-[18%] min-h-screen bg-white border-r-[1px] border-[rgba(0,0,0,0.1)] shadow-md">
        <Sidebar />
      </div>

      <div className="mainContent w-[82%]">
        <Header />
        {children}
      </div>
    </div>
  );
}
