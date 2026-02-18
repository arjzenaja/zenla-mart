"use client";
import React, { useEffect, useState } from "react";
import { ordersAPI, productsAPI } from "@/lib/api";
import { isAuthenticated } from "@/utils/auth";
import ProductItem from "./ProductItem";
import Link from "next/link";
import { Button } from "@mui/material";
import { MdOutlineArrowRightAlt } from 'react-icons/md';

const BuyAgain = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      setVisible(false);
      setLoading(false);
      return;
    }
    fetchBuyAgain();
  }, []);

  const fetchBuyAgain = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await ordersAPI.getMyOrders();
      const orders = response.orders || response || [];

      if (!Array.isArray(orders) || orders.length === 0) {
        setProducts([]);
        return;
      }

      const frequencyMap = {};
      orders.forEach((order) => {
        if (Array.isArray(order.items)) {
          order.items.forEach((item) => {
            if (!item.productId) return;
            frequencyMap[item.productId] =
              (frequencyMap[item.productId] || 0) + (item.quantity || 1);
          });
        }
      });

      const sortedIds = Object.entries(frequencyMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([productId]) => productId);

      if (sortedIds.length === 0) {
        setProducts([]);
        return;
      }

      const productPromises = sortedIds.map((id) =>
        productsAPI.getById(id).then((res) => res.product || res).catch(() => null)
      );
      const result = await Promise.all(productPromises);
      const validProducts = result.filter((p) => p && p.id);

      setProducts(validProducts);
    } catch (err) {
      console.error("Error fetching buy again products:", err);
      setError(err.message || "Gagal memuat produk untuk dibeli lagi.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  if (loading) {
    return (
      <section className="bg-white py-6">
        <div className="container">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[20px] text-gray-800 font-[600]">Buy Again</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="animate-pulse bg-white rounded-md shadow-md p-3 flex flex-col gap-3"
              >
                <div className="w-full h-28 bg-gray-200 rounded-md" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-2/3 mt-1" />
                <div className="h-8 bg-gray-100 rounded-md mt-2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !Array.isArray(products) || products.length === 0) {
    return null;
  }

  return (
    <section className="buy-again-section">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 md:mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl text-gray-900 font-bold mb-2">
            🛒 Buy Again
          </h2>
          <p className="text-sm md:text-base text-gray-600">
            Pesan ulang produk yang sering kamu beli sebelumnya.
          </p>
        </div>
        <Link href="/my-orders" className="text-base md:text-lg text-primary font-semibold hover:text-primary/80 flex items-center gap-2 group whitespace-nowrap">
          Lihat semua pesanan
          <MdOutlineArrowRightAlt size={20} className='group-hover:translate-x-1 transition-transform'/>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductItem key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default BuyAgain;

