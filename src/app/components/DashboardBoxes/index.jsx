"use client";
import React, { useEffect, useState } from "react";
import Box from "./Box";
import { TbUser } from "react-icons/tb";
import { GoGift } from "react-icons/go";
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
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 rounded-2xl skeleton h-[130px] animate-shimmer"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
      <Box
        title="Total Users"
        count={stats.totalUsers.toString()}
        icon={<TbUser size={26} className="text-white" />}
        bg="bg-[#10b981]"
        link="/users"
      />
      <Box
        title="Total Orders"
        count={stats.totalOrders.toString()}
        icon={<GoGift size={26} className="text-white" />}
        bg="bg-[#3872fa]"
        link="/orders"
      />
      <Box
        title="Total Products"
        count={stats.totalProducts.toString()}
        icon={<LiaProductHunt size={26} className="text-white" />}
        bg="bg-[#4f49e4]"
        link="/products-list"
      />
      <Box
        title="Total Category"
        count={stats.totalCategories.toString()}
        icon={<MdOutlineCategory size={26} className="text-white" />}
        bg="bg-[#f22c61]"
        link="/category-list"
      />
    </div>
  );
};

export default DashboardBoxes;
