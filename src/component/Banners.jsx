"use client"
import React, { useEffect, useState, useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import { Navigation } from 'swiper/modules';
import Link from 'next/link';
import { bannersAPI } from '../lib/api';

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const swiperRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const loadBanners = async () => {
      try {
        const res = await bannersAPI.getAll();
        // Response format from backend: { success: true, banners: [...] }
        const list = res?.banners || res?.data?.banners || [];
        if (isMounted) {
          setBanners(list);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Gagal memuat banner');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadBanners();

    return () => {
      isMounted = false;
    };
  }, []);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ||
    'http://localhost:5000';

  const getBannerImageUrl = (image) => {
    if (!image) return null;
    // Jika sudah full URL, langsung pakai
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    // Jika path dari server (misal: /uploads/xxx.png)
    return `${API_BASE}${image}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <p className="text-sm text-gray-500 animate-pulse">Memuat banner...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
        <p className="text-sm">Terjadi kesalahan: {error}</p>
      </div>
    );
  }

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <div className='relative'>
      <Swiper
        ref={swiperRef}
        slidesPerView={1}
        spaceBetween={20}
        navigation={false}
        modules={[Navigation]}
        className="mySwiper"
        breakpoints={{
          320: { slidesPerView: 1, spaceBetween: 12 },
          480: { slidesPerView: 2, spaceBetween: 16 },
          768: { slidesPerView: 2.5, spaceBetween: 20 },
          1024: { slidesPerView: 3, spaceBetween: 24 },
        }}
      >
        {banners.map((banner) => {
          const imgUrl = getBannerImageUrl(banner.image);
          if (!imgUrl) return null;

          return (
            <SwiperSlide key={banner.id}>
              <Link
                href={banner.link || "/"}
                className="item group rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 block"
              >
                <div className='w-full h-[200px] md:h-[240px] overflow-hidden relative'>
                  <img
                    src={imgUrl}
                    alt={banner.title || "banner"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className='absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all'></div>
                </div>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Custom Navigation Buttons - Sides */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() => swiperRef.current?.swiper.slidePrev()}
            className='absolute left-2 md:left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-white/80 hover:bg-white text-orange-600 rounded-full shadow-lg z-20 transition-all duration-300 hover:scale-110 hover:shadow-xl'
            aria-label='Previous banner'
          >
            <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
              <path d='M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z' />
            </svg>
          </button>
          <button
            onClick={() => swiperRef.current?.swiper.slideNext()}
            className='absolute right-2 md:right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-white/80 hover:bg-white text-orange-600 rounded-full shadow-lg z-20 transition-all duration-300 hover:scale-110 hover:shadow-xl'
            aria-label='Next banner'
          >
            <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
              <path d='M10 6L8.59 7.41 12.17 11 8.59 14.59 10 16l6-6z' />
            </svg>
          </button>
        </>
      )}
    </div>
  )
}

export default Banners
