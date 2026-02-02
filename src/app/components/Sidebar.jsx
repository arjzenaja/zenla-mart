'use client'
import React, { useState } from "react";
import { RxDashboard } from "react-icons/rx";
import { LiaImageSolid } from "react-icons/lia";
import { TbUser } from "react-icons/tb";
import { MdOutlineCategory } from "react-icons/md";
import { TbBrandProducthunt } from "react-icons/tb";
import { IoBagCheckOutline } from "react-icons/io5";
import { PiImagesSquare } from "react-icons/pi";
import { IoIosLogOut } from "react-icons/io";
import { Button } from "@mui/material";
import { LiaAngleDownSolid } from "react-icons/lia";
import { Collapse } from 'react-collapse';
import Link from "next/link";

const Sidebar = () => {

  const [isOpenTab, setIsOpenTab] = useState(null);

  const sidebarTabs = [
    {
      name: "Dashboard",
      icon: <RxDashboard size={20} className="group-hover:text-primary"/>,
      href: "/",
    },
    {
      name: "Home Slides",
      icon: <LiaImageSolid size={20} className="group-hover:text-primary"/>,
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
      icon: <MdOutlineCategory size={20} className="group-hover:text-primary"/>,
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
      icon: <TbBrandProducthunt size={22} className="group-hover:text-primary"/>,
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
      icon: <TbUser size={20} className="group-hover:text-primary"/>,
      href: "/users",
    },
    {
      name: "Profile",
      icon: <TbUser size={20} className="group-hover:text-primary"/>,
      href: "/profile",
    },
    {
      name: "Orders",
      icon: <IoBagCheckOutline size={20} className="group-hover:text-primary"/>,
      href: "/orders",
    },
    {
      name: "Banners",
      icon: <PiImagesSquare size={20} className="group-hover:text-primary"/>,
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
      name: "Logout",
      icon: <IoIosLogOut size={20} className="group-hover:text-primary"/>,
      href: "/",
    },
  ];

  return (
    <aside className="w-full px-2 sticky top-0 z-50">
      <div className="p-4">
        <Link href={"/"}>
          <img src="/logo.png" alt="logo" className="w-[200px]" />
        </Link>
      </div>

      <div className="scrolling">
        {sidebarTabs &&
          sidebarTabs?.map((item, index) => {
            return (
              <div key={index}>
                {item?.href !== null ? (
                  <Link href={item?.href}>
                    <Button className="w-full! text-left! justify-start! capitalize! text-gray-800! text-[16px]! hover:bg-gray-200! px-4! py-[8px]! gap-3 group">
                      {item?.icon} {item?.name}
                      {item?.children && (
                        <LiaAngleDownSolid size={15} className="ml-auto" />
                      )}
                    </Button>
                  </Link>
                ) : (
                  <Button className="w-full! text-left! justify-start! capitalize! text-gray-800! text-[16px]! hover:bg-gray-200! px-4! py-[8px]! gap-3 group" onClick={()=>setIsOpenTab(isOpenTab === index ? null : index)}>
                    {item?.icon} {item?.name}
                    {item?.children && (
                      <LiaAngleDownSolid size={15} className={`ml-auto transition-all ${isOpenTab === index && 'rotate-180'}`} />
                    )}
                  </Button>
                )}

                {item?.children && (
                  <Collapse isOpened={isOpenTab === index ? true : false}>
                  <div className="dropdown w-full flex flex-col gap-3 pl-12 py-1">
                    {item?.children?.map((tab, index_) => {
                      return (
                        <Link
                          href={tab?.href}
                          key={index_}
                          className="text-[14px] flex items-center gap-3 text-gray-600 hover:text-primary"
                        >
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
      </div>
    </aside>
  );
};

export default Sidebar;
