"use client";
import AccountSidebar from "@/component/AccountSidebar";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ordersAPI, userAPI } from "@/lib/api";
import { isAuthenticated } from "@/utils/auth";
import { useNotification } from "@/utils/useNotification";
import OrderRow from "./tableRow";

import Container from '@/component/ui/Container'
import Skeleton from '@/component/ui/Skeleton'

const Orders = () => {
  const router = useRouter();
  const { showError } = useNotification();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    fetchOrders();
    fetchUser();
  }, []);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      if (searchQuery || searchQuery === "") {
        fetchOrders();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = searchQuery ? { search: searchQuery } : {};
      const response = await ordersAPI.getMyOrders(params);
      const ordersData = response.orders || response || [];
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
      showError("Gagal memuat pesanan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await userAPI.getProfile();
      const userData = response.user || response;
      setUser(userData);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  if (loading) {
    return (
      <section className="bg-gray-100 py-8 min-h-screen">
        <Container>
          <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
            <div className="w-full md:w-64 lg:w-60 flex-shrink-0 mb-4 md:mb-0">
              <AccountSidebar />
            </div>
            <div className="flex-1">
              <div className="card">
                <Skeleton height="20px" width="40%" style={{ marginBottom: 12 }} />
                <Skeleton height="14px" width="60%" style={{ marginBottom: 16 }} />
                <Skeleton height="120px" width="100%" />
              </div>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="bg-gray-100 py-8 min-h-screen">
      <Container>
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
          <div className="w-full md:w-64 lg:w-60 flex-shrink-0 mb-4 md:mb-0">
            <AccountSidebar />
          </div>

          <div className="flex-1">
            <div className="card mb-5 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="info">
                  <h1 className="text-[32px] font-bold text-gray-800 mb-2">Pesanan Saya</h1>
                  <p className="text-gray-600">
                    Total <span className="text-primary font-bold">{orders.length}</span> pesanan
                  </p>
                </div>
                <div className="search bg-[#E6E6E6] w-[350px] h-[50px] rounded-lg px-4 relative border border-[rgba(0,0,0,0.1)] hover:border-primary transition-colors">
                  <input
                    type="text"
                    className="w-full h-full outline-none border-0 bg-transparent placeholder-gray-500"
                    placeholder="Cari berdasarkan nomor pesanan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <svg
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="text-6xl mb-4">📦</div>
                  <p className="text-gray-600 text-lg mb-2 font-medium">
                    {searchQuery ? "Pesanan tidak ditemukan" : "Belum ada pesanan"}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {searchQuery 
                      ? "Coba cari dengan nomor pesanan yang berbeda" 
                      : "Mulai berbelanja untuk melihat pesanan Anda di sini"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <OrderRow key={order.id} order={order} user={user} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Orders;
