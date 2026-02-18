"use client"
import React, { useState, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import { Navigation } from 'swiper/modules';
import ProductItem from './ProductItem';
import { productsAPI, categoriesAPI } from '@/lib/api';

const ProductSlider = ({ category, limit = 8 }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryId, setCategoryId] = useState(null);

  useEffect(() => {
    if (category && !category.startsWith('cat-')) {
      // Category is a name, need to find the ID
      fetchCategoryId();
    } else {
      setCategoryId(category || null);
      fetchProducts(category || null);
    }
  }, [category]);

  useEffect(() => {
    if (categoryId !== null) {
      fetchProducts(categoryId);
    }
  }, [categoryId]);

  const fetchCategoryId = async () => {
    try {
      const response = await categoriesAPI.getAll();
      const categories = response?.categories || response || [];
      const categoryObj = categories.find(cat => cat.name === category);
      if (categoryObj) {
        setCategoryId(categoryObj.id);
      } else {
        setCategoryId(null);
        fetchProducts(null);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategoryId(null);
      fetchProducts(null);
    }
  };

  const fetchProducts = async (catId) => {
    try {
      setLoading(true);
      const params = {};
      
      if (catId) {
        params.category = catId;
      }
      
      if (limit) {
        params.limit = limit;
      }
      
      const response = await productsAPI.getAll(params);
      console.log('ProductSlider API Response:', response);
      
      // Handle different response formats
      let productsData = [];
      if (response?.products && Array.isArray(response.products)) {
        productsData = response.products;
      } else if (response?.data && Array.isArray(response.data)) {
        productsData = response.data;
      } else if (Array.isArray(response)) {
        productsData = response;
      }
      
      console.log('ProductSlider Products Data:', productsData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='productSlider'>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 py-3">
          {Array.from({ length: limit || 6 }).map((_, idx) => (
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
    );
  }

  if (!Array.isArray(products) || products.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-10'>
        <div className="text-4xl mb-3">🛒</div>
        <p className='text-gray-600 text-[15px] mb-1'>Belum ada produk di kategori ini.</p>
        <p className='text-gray-400 text-[13px]'>Coba jelajahi kategori lain atau kembali nanti.</p>
      </div>
    );
  }

  return (
    <div className='productSlider'>
      <Swiper 
        slidesPerView={6}
        spaceBetween={28} 
        navigation={true} 
        modules={[Navigation]}
        className="mySwiper"
        breakpoints={{
          320: { slidesPerView: 2, spaceBetween: 12 },
          480: { slidesPerView: 2.5, spaceBetween: 16 },
          640: { slidesPerView: 3, spaceBetween: 20 },
          768: { slidesPerView: 4, spaceBetween: 24 },
          1024: { slidesPerView: 5, spaceBetween: 28 },
          1440: { slidesPerView: 6, spaceBetween: 32 },
        }}
      >
        {products.map((product) => (
          <SwiperSlide key={product.id} className='!h-auto'>
            <ProductItem product={product} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

export default ProductSlider