"use client";
import React, { useEffect, useState } from "react";
import ProductItem from "./ProductItem";
import { productsAPI } from "@/lib/api";
import Link from "next/link";
import { Button } from "@mui/material";
import { MdOutlineArrowRightAlt } from 'react-icons/md';

const RecentlyViewed = () => {
  const [productIds, setProductIds] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      if (typeof window === "undefined") {
        setLoading(false);
        return;
      }
      const raw = window.localStorage.getItem("recentlyViewedProducts");
      const ids = raw ? JSON.parse(raw) : [];
      if (Array.isArray(ids) && ids.length > 0) {
        setProductIds(ids.slice(0, 8));
      } else {
        setLoading(false);
      }
    } catch (e) {
      console.error("Error reading recently viewed products:", e);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!productIds.length) return;
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productIds.join(",")]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productPromises = productIds.map((id) =>
        productsAPI.getById(id).then((res) => res.product || res).catch(() => null)
      );
      const result = await Promise.all(productPromises);
      const validProducts = result.filter((p) => p && p.id);

      const ordered = productIds
        .map((id) => validProducts.find((p) => p.id === id))
        .filter(Boolean);

      setProducts(ordered);
    } catch (err) {
      console.error("Error fetching recently viewed products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading && productIds.length === 0) {
    return null;
  }

  if (!loading && (!Array.isArray(products) || products.length === 0)) {
    return null;
  }

  return (
    <section className="recently-viewed-section">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 md:mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl text-gray-900 font-bold mb-2">
            👀 Recently Viewed
          </h2>
          <p className="text-sm md:text-base text-gray-600">
            Lanjutkan belanja produk yang terakhir kamu lihat.
          </p>
        </div>
        <button
          type="button"
          className="text-sm md:text-base text-primary font-semibold hover:text-primary/80 transition-colors flex items-center gap-2 group whitespace-nowrap"
          onClick={() => {
            try {
              if (typeof window !== "undefined") {
                window.localStorage.removeItem("recentlyViewedProducts");
              }
            } catch (e) {
              console.error("Error clearing recently viewed:", e);
            }
            setProductIds([]);
            setProducts([]);
          }}
        >
          Hapus riwayat
          <MdOutlineArrowRightAlt size={20} className='group-hover:translate-x-1 transition-transform'/>
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="animate-pulse bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-3"
              >
                <div className="w-full h-40 bg-gray-200 rounded-xl" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-2/3 mt-1" />
                <div className="h-10 bg-gray-100 rounded-xl mt-2" />
              </div>
            ))
          : products.map((product) => (
              <ProductItem key={product.id} product={product} view="list" />
            ))}
      </div>
    </section>
  );
};

export default RecentlyViewed;

