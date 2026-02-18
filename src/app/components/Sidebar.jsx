'use client'
import React, { useState } from "react";
import { RxDashboard } from "react-icons/rx";
import { LiaImageSolid } from "react-icons/lia";
import { TbUser, TbUsers } from "react-icons/tb";
import { MdOutlineCategory } from "react-icons/md";
import { TbBrandProducthunt } from "react-icons/tb";
import { IoBagCheckOutline } from "react-icons/io5";
import { PiImagesSquare } from "react-icons/pi";
import { IoIosLogOut } from "react-icons/io";
import { FiMapPin, FiUser, FiX } from "react-icons/fi";
import { HiOutlineHeart } from "react-icons/hi";
import { Button, IconButton } from "@mui/material";
import { LiaAngleDownSolid } from "react-icons/lia";
import { Collapse } from 'react-collapse';
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { usePathname } from "next/navigation";

const Sidebar = ({ collapsed, onToggle }) => {

  const [isOpenTab, setIsOpenTab] = useState(null);
  const { logout } = useAuth();
  const pathname = usePathname();

  const sidebarTabs = [
    {
      name: "Dashboard",
      icon: <RxDashboard size={20} className="transition-smooth"/>,
      href: "/",
    },
    {
      name: "Home Slides",
      icon: <LiaImageSolid size={20} className="transition-smooth"/>,
      href: null,
      children: [
        {
          name: "Home Slides List",
          href: "/home-slides",
        },
        {
          name: "Add Home Slide",
          href: "/home-slides/add-home-slide",
        },
      ],
    },
    {
      name: "Category",
      icon: <MdOutlineCategory size={20} className="transition-smooth"/>,
      href: null,
      children: [
        {
          name: "Category List",
          href: "/category-list",
        },
        {
          name: "Add New Category",
          href: "/category-list/add-category",
        },
      ],
    },
    {
      name: "Products",
      icon: <TbBrandProducthunt size={22} className="transition-smooth"/>,
      href: null,
      children: [
        {
          name: "Products List",
          href: "/products-list",
        },
        {
          name: "Add New Products",
          href: "/products-list/add-product",
        },
      ],
    },
    {
      name: "Users",
      icon: <TbUsers size={20} className="transition-smooth"/>,
      href: "/users",
    },
    {
      name: "Wishlists",
      icon: <HiOutlineHeart size={20} className="transition-smooth"/>,
      href: "/wishlists",
    },
    {
      name: "Orders",
      icon: <IoBagCheckOutline size={20} className="transition-smooth"/>,
      href: "/orders",
    },
    {
      name: "Addresses",
      icon: <FiMapPin size={20} className="transition-smooth"/>,
      href: "/addresses",
    },
    {
      name: "Banners",
      icon: <PiImagesSquare size={20} className="transition-smooth"/>,
      href: null,
      children: [
        {
          name: "Banners List",
          href: "/banners",
        },
        {
          name: "Add New Banners",
          href: "/banners/add-banner",
        },
      ],
    },
    {
      name: "Profile",
      icon: <FiUser size={20} className="transition-smooth"/>,
      href: "/profile",
    },
  ];

  const isActive = (href) => pathname === href;

  return (
    <aside className={`h-screen overflow-y-auto bg-white border-r-2 border-gray-100 sticky top-0 z-40 scroll-smooth shadow-lg animate-slideIn transition-all duration-300 ${
      collapsed ? 'w-[80px] px-2' : 'w-full px-3'
    }`} style={{
      background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)'
    }}>
      <div className={`flex items-center justify-between border-b-2 border-gray-100 mb-3 ${collapsed ? 'p-4' : 'p-6'}`}>
        <Link href={"/"} className="flex items-center group overflow-hidden">
          <img 
            src="/logo.png" 
            alt="logo" 
            className={`transition-smooth group-hover:scale-105 ${collapsed ? 'w-8 h-8 object-contain' : 'w-[140px] lg:w-[160px] h-auto'}`} 
          />
        </Link>
        {!collapsed && (
          <IconButton onClick={onToggle} className="lg:hidden !text-gray-400">
            <FiX size={20} />
          </IconButton>
        )}
      </div>

      <nav className="space-y-2 pb-24 px-2">
        {sidebarTabs &&
          sidebarTabs?.map((item, index) => {
            const active = isActive(item?.href);
            return (
              <div key={index} className="animate-fadeIn" style={{ animationDelay: `${index * 50}ms` }}>
                {item?.href !== null ? (
                  <Link href={item?.href}>
                    <Button className={`w-full! text-left! justify-start! capitalize! text-[14px]! font-semibold px-4! py-3! gap-3 group transition-smooth !rounded-xl ${
                      active 
                        ? '!bg-gradient-to-r !from-orange-50 !to-orange-100 !text-primary shadow-sm' 
                        : '!text-gray-700 hover:!bg-gradient-to-r hover:!from-orange-50 hover:!to-orange-100'
                    }`}>
                      <span className={`transition-smooth flex-shrink-0 ${active ? 'text-primary scale-110' : 'text-gray-600 group-hover:text-primary group-hover:scale-110'}`}>
                        {item?.icon}
                      </span>
                      {!collapsed && <span className="flex-1 truncate">{item?.name}</span>}
                      {active && !collapsed && (
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                      )}
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    className={`w-full! text-left! justify-start! capitalize! text-[14px]! font-semibold px-4! py-3! gap-3 group transition-smooth !rounded-xl ${
                      isOpenTab === index 
                        ? '!bg-gradient-to-r !from-orange-50 !to-orange-100 !text-primary' 
                        : '!text-gray-700 hover:!bg-gradient-to-r hover:!from-orange-50 hover:!to-orange-100'
                    }`}
                    onClick={()=>setIsOpenTab(isOpenTab === index ? null : index)}
                  >
                    <span className={`transition-smooth flex-shrink-0 ${isOpenTab === index ? 'text-primary scale-110' : 'text-gray-600 group-hover:text-primary group-hover:scale-110'}`}>
                      {item?.icon}
                    </span>
                    {!collapsed && <span className="flex-1 truncate">{item?.name}</span>}
                    {item?.children && !collapsed && (
                      <LiaAngleDownSolid 
                        size={16} 
                        className={`transition-smooth ${isOpenTab === index ? 'rotate-180 text-primary' : 'text-gray-400'}`} 
                      />
                    )}
                  </Button>
                )}

                {item?.children && (
                  <Collapse isOpened={isOpenTab === index ? true : false}>
                    <div className="dropdown w-full flex flex-col gap-1 pl-12 pr-2 py-3 mt-1 rounded-xl mx-1 transition-smooth" style={{
                      background: 'linear-gradient(135deg, #fef3e7 0%, #fde8d0 100%)'
                    }}>
                      {item?.children?.map((tab, index_) => {
                        const childActive = isActive(tab?.href);
                        return (
                          <Link
                            href={tab?.href}
                            key={index_}
                            className={`text-[13px] py-2.5 px-4 rounded-lg transition-smooth block font-medium ${
                              childActive
                                ? 'bg-white text-primary shadow-sm font-bold'
                                : 'text-gray-600 hover:text-primary hover:bg-white hover:shadow-sm'
                            }`}
                          >
                            <span className="mr-2">•</span>{tab?.name}
                          </Link>
                        );
                      })}
                    </div>
                  </Collapse>
                )}
              </div>
            );
          })}
        
        <div className="pt-4 border-t-2 border-gray-200 mt-6">
          <Button 
            onClick={logout}
            className={`w-full! text-left! justify-start! capitalize! text-red-600! text-[14px]! font-semibold hover:!bg-red-50! px-4! py-3! gap-3 transition-smooth !rounded-xl group ${collapsed ? 'justify-center!' : ''}`}
          >
            <IoIosLogOut size={20} className="transition-smooth group-hover:scale-110 flex-shrink-0" />
            {!collapsed && <span className="flex-1">Logout</span>}
          </Button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
