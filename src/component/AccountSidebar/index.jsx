'use client'
import { Button } from "@mui/material";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { FaRegUser } from "react-icons/fa";
import { FiMapPin } from "react-icons/fi";
import { FaRegHeart } from "react-icons/fa";
import { BsBagCheck } from "react-icons/bs";
import { IoMdLogOut } from "react-icons/io";

import { usePathname, useRouter } from "next/navigation";
import { userAPI, authAPI } from "@/lib/api";
import { isAuthenticated } from "@/utils/auth";

const AccountSidebar = () => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const Navinks = [
    {
      name: "My Profile",
      href: "/my-account",
      icon: <FaRegUser size={20} />,
    },
    {
      name: "Address",
      href: "/address",
      icon: <FiMapPin size={20} />,
    },
    {
      name: "My List",
      href: "/my-list",
      icon: <FaRegHeart size={20} />,
    },
    {
      name: "My Orders",
      href: "/my-orders",
      icon: <BsBagCheck size={20} />,
    }
  ];

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      if (!isAuthenticated()) {
        setLoadingUser(false);
        return;
      }

      try {
        const response = await userAPI.getProfile();
        const userData = response.user || response;
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user in AccountSidebar:", error);
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error logging out from AccountSidebar:", error);
    }
  };

  return (
    <aside className="accountSidebar w-[100%] bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
      <div className="profileSection bg-gradient-to-br from-gray-50 to-white py-8 px-6 border-b border-gray-200">
        <div className="profileImg w-[120px] h-[120px] rounded-full overflow-hidden m-auto relative group mb-5 ring-4 ring-orange-100 shadow-xl">
          <img
            src={user?.profile_image || "/profile.jpg"}
            alt="profile image"
            className="w-full h-full object-cover"
          />
          <div className="overlay w-full h-full rounded-full bg-[rgba(0,0,0,0.6)] z-50 absolute top-0 left-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer">
            <FaCloudUploadAlt size={24} className="text-white" />
            <input
              type="file"
              className="w-full h-full absolute top-0 left-0 z-50 opacity-0 cursor-pointer"
            />
          </div>
        </div>

        <div className="text-center">
          <h4 className="text-[20px] font-[700] text-gray-900 mb-1">
            {user?.name || user?.email?.split('@')[0] || "Your Username"}
          </h4>
          <p className="text-[13px] text-gray-500 font-medium">
            {user?.email || "youremail@gmail.com"}
          </p>
        </div>
      </div>

      <div className="myAcc flex flex-col gap-0 py-3 px-3">
        {Navinks?.map((item, index) => {
          const isActive = pathname == item.href;
          return (
            <Link href={item.href} className="flex" key={index}>
              <Button 
                className={`!capitalize !w-full !justify-start !px-4 !py-[12px] gap-3 !text-[15px] !font-[600] !rounded-lg !transition-all !duration-300 !relative ${
                  isActive === true 
                    ? "!bg-orange-50 !text-orange-600 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-orange-600 before:rounded-r-lg" 
                    : "!text-gray-700 hover:!bg-gray-100"
                }`}
              >
                <span className={isActive ? "text-orange-600" : "text-gray-500"}>
                  {item.icon}
                </span>
                {item.name}
              </Button>
            </Link>
          );
        })}

        <div className="my-3 h-px bg-gray-200"></div>

        <Button
          className="!capitalize !w-full !justify-start !px-4 !py-[12px] gap-3 !text-[15px] !font-[600] !text-red-600 !rounded-lg !transition-all !duration-300 hover:!bg-red-50"
          onClick={handleLogout}
          disabled={loadingUser}
        >
          <IoMdLogOut size={20} /> Logout
        </Button>
      </div>
    </aside>
  );
};

export default AccountSidebar;
