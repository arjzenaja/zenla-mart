'use client'
import React, { useState } from "react";
import { RxDashboard } from "react-icons/rx";
import { LiaImageSolid, LiaAngleDownSolid } from "react-icons/lia";
import { TbUsers } from "react-icons/tb";
import { MdOutlineCategory } from "react-icons/md";
import { TbBrandProducthunt } from "react-icons/tb";
import { IoBagCheckOutline } from "react-icons/io5";
import { PiImagesSquare } from "react-icons/pi";
import { IoIosLogOut } from "react-icons/io";
import { FiMapPin, FiUser } from "react-icons/fi";
import { HiOutlineHeart } from "react-icons/hi";
import { Collapse } from 'react-collapse';
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const [isOpenTab, setIsOpenTab] = useState(null);
  const { logout } = useAuth();
  const pathname = usePathname();

  const isActive = (href) => {
    if (!href) return false;
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  const isParentActive = (children) => {
    if (!children) return false;
    return children.some(child => isActive(child.href));
  };

  const sidebarTabs = [
    {
      name: "Dashboard",
      icon: <RxDashboard size={18} />,
      href: "/",
    },
    {
      name: "Home Slides",
      icon: <LiaImageSolid size={19} />,
      href: null,
      children: [
        { name: "Home Slides List", href: "/home-slides" },
        { name: "Add Home Slide", href: "/home-slides/add-home-slide" },
      ],
    },
    {
      name: "Category",
      icon: <MdOutlineCategory size={18} />,
      href: null,
      children: [
        { name: "Category List", href: "/category-list" },
        { name: "Add New Category", href: "/category-list/add-category" },
      ],
    },
    {
      name: "Products",
      icon: <TbBrandProducthunt size={20} />,
      href: null,
      children: [
        { name: "Products List", href: "/products-list" },
        { name: "Add New Products", href: "/products-list/add-product" },
      ],
    },
    {
      name: "Users",
      icon: <TbUsers size={18} />,
      href: "/users",
    },
    {
      name: "Wishlists",
      icon: <HiOutlineHeart size={18} />,
      href: "/wishlists",
    },
    {
      name: "Orders",
      icon: <IoBagCheckOutline size={18} />,
      href: "/orders",
    },
    {
      name: "Addresses",
      icon: <FiMapPin size={18} />,
      href: "/addresses",
    },
    {
      name: "Banners",
      icon: <PiImagesSquare size={18} />,
      href: null,
      children: [
        { name: "Banners List", href: "/banners" },
        { name: "Add New Banners", href: "/banners/add-banner" },
      ],
    },
    {
      name: "Profile",
      icon: <FiUser size={18} />,
      href: "/profile",
    },
  ];

  return (
    <aside className="w-full h-screen overflow-y-auto bg-white border-r border-gray-100 px-3 sticky top-0 z-40 scroll-hidden">
      {/* Logo */}
      <div className="p-5 mb-1 border-b border-gray-100">
        <Link href={"/"} className="flex items-center">
          <img src="/logo.png" alt="logo" className="w-[155px] h-auto" />
        </Link>
      </div>

      {/* Label */}
      <div className="px-4 pt-4 pb-1">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Menu</span>
      </div>

      <nav className="space-y-0.5 pb-24 pt-1">
        {sidebarTabs?.map((item, index) => {
          const active = item.href ? isActive(item.href) : isParentActive(item.children);
          return (
            <div key={index}>
              {item?.href !== null ? (
                <Link href={item?.href}>
                  <div className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 cursor-pointer select-none
                    ${active
                      ? 'bg-orange-50 text-primary border border-orange-200/60 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                    }`}>
                    <span className={`flex-shrink-0 transition-colors duration-200 ${active ? 'text-primary' : 'text-gray-400'}`}>
                      {item?.icon}
                    </span>
                    <span className={`flex-1 ${active ? 'font-semibold' : ''}`}>{item?.name}</span>
                    {active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 animate-pulse"></span>
                    )}
                  </div>
                </Link>
              ) : (
                <div
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 cursor-pointer select-none
                    ${active
                      ? 'bg-orange-50 text-primary border border-orange-200/60 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                    }`}
                  onClick={() => setIsOpenTab(isOpenTab === index ? null : index)}
                >
                  <span className={`flex-shrink-0 transition-colors duration-200 ${active ? 'text-primary' : 'text-gray-400'}`}>
                    {item?.icon}
                  </span>
                  <span className={`flex-1 ${active ? 'font-semibold' : ''}`}>{item?.name}</span>
                  {item?.children && (
                    <LiaAngleDownSolid
                      size={14}
                      className={`flex-shrink-0 text-gray-400 transition-transform duration-300 ${isOpenTab === index ? 'rotate-180' : ''}`}
                    />
                  )}
                </div>
              )}

              {item?.children && (
                <Collapse isOpened={isOpenTab === index}>
                  <div className="flex flex-col gap-0.5 pl-3 pr-1 py-1">
                    {item?.children?.map((tab, index_) => {
                      const childActive = isActive(tab.href);
                      return (
                        <Link
                          href={tab?.href}
                          key={index_}
                          className={`text-[12.5px] py-2 px-3 rounded-lg transition-all duration-200 flex items-center gap-2.5
                            ${childActive
                              ? 'text-primary font-semibold bg-orange-50/80'
                              : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                            }`}
                        >
                          <span className={`w-1 h-1 rounded-full flex-shrink-0 ${childActive ? 'bg-primary' : 'bg-gray-300'}`}></span>
                          {tab?.name}
                        </Link>
                      );
                    })}
                  </div>
                </Collapse>
              )}
            </div>
          );
        })}

        <div className="pt-3 border-t border-gray-100 mt-3">
          <div
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-red-500 hover:bg-red-50 hover:text-red-600 border border-transparent transition-all duration-200 cursor-pointer select-none"
          >
            <IoIosLogOut size={18} className="flex-shrink-0" />
            <span>Logout</span>
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
