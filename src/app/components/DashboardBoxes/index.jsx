"use client";
import React, { useEffect, useState } from "react";
import Box from "./Box";
import { TbUser } from "react-icons/tb";
import { GoGift } from "react-icons/go"
import { LiaProductHunt } from "react-icons/lia";
import { MdOutlineCategory } from "react-icons/md";
import { dashboardAPI } from "@/lib/api";

const DashboardBoxes = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCategories: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardAPI.getStats();
        // Response format dari server: { success: true, stats: { totalUsers, totalOrders, ... } }
        if (response.success && response.stats) {
          setStats({
            totalUsers: response.stats.totalUsers || 0,
            totalOrders: response.stats.totalOrders || 0,
            totalProducts: response.stats.totalProducts || 0,
            totalCategories: response.stats.totalCategories || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        // Keep default values (0) on error
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 bg-gray-200 rounded-md animate-pulse h-[120px]"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-6">
      <Box
        title="Total Users"
        count={stats.totalUsers.toString()}
        icon={<TbUser size={40} className="text-white ml-auto" />}
        bg="bg-[#10b981]"
        hoverBg="bg-[#0ea875]"
        link="/users"
      />
      <Box
        title="Total Orders"
        count={stats.totalOrders.toString()}
        icon={<GoGift size={40} className="text-white ml-auto" />}
        bg="bg-[#3872fa]"
        hoverBg="bg-[#0ea875]"
        link="/orders"
      />
      <Box
        title="Total Products"
        count={stats.totalProducts.toString()}
        icon={<LiaProductHunt size={40} className="text-white ml-auto" />}
        bg="bg-[#4f49e4]"
        hoverBg="bg-[#0ea875]"
        link="/products-list"
      />
      <Box
        title="Total Category"
        count={stats.totalCategories.toString()}
        icon={<MdOutlineCategory size={40} className="text-white ml-auto" />}
        bg="bg-[#f22c61]"
        hoverBg="bg-[#0ea875]"
        link="/category-list"
      />
    </div>
  );
};

export default DashboardBoxes;
