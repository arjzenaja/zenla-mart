"use client";
import React, { useEffect, useState } from "react";
import ProductItem from "./ProductItem";
import { productsAPI } from "@/lib/api";
import Link from "next/link";
import { Button } from "@mui/material";
import { MdOutlineArrowRightAlt } from 'react-icons/md';

const RecommendedForYou = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecommended();
  }, []);

  const fetchRecommended = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        limit: 8,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      const response = await productsAPI.getAll(params);

      let productsData = [];
      if (response?.products && Array.isArray(response.products)) {
        productsData = response.products;
      } else if (response?.data && Array.isArray(response.data)) {
        productsData = response.data;
      } else if (Array.isArray(response)) {
        productsData = response;
      }

      setProducts(productsData);
    } catch (err) {
      console.error("Error fetching recommended products:", err);
      setError(err.message || "Gagal memuat rekomendasi produk.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl text-gray-900 font-bold">
            Recommended for you
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
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
          ))}
        </div>
      </div>
    );
  }

  if (error || !Array.isArray(products) || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-5xl mb-4">✨</div>
        <p className="text-gray-700 text-base font-medium mb-2">
          Belum ada rekomendasi pribadi untukmu.
        </p>
        <p className="text-gray-500 text-sm mb-6 text-center max-w-md">
          Mulai jelajahi produk dan lakukan pembelian untuk melihat rekomendasi
          yang lebih sesuai dengan kebutuhanmu.
        </p>
        <Link href="/products">
          <Button className="btn-g !text-sm !px-6 !py-2.5">Mulai Belanja</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="recommended-section">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 md:mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl text-gray-900 font-bold mb-2">
            ✨ Recommended for you
          </h2>
          <p className="text-sm md:text-base text-gray-600">
            Dipilih berdasarkan produk terbaru & paling diminati.
          </p>
        </div>
        <Link href="/products" className="text-base md:text-lg text-primary font-semibold hover:text-primary/80 flex items-center gap-2 group whitespace-nowrap">
          Lihat semua
          <MdOutlineArrowRightAlt size={20} className='group-hover:translate-x-1 transition-transform'/>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductItem key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default RecommendedForYou;

