"use client"
import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import Link from 'next/link';
import { homeSlidesAPI } from '../lib/api';
import { MdArrowForward } from 'react-icons/md';

const HomeSlider = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ||
    'http://localhost:5000';

  const getSlideImageUrl = (image) => {
    if (!image) return null;
    // If it's already a full URL, extract just the path starting from /uploads/
    if (image.startsWith('http://') || image.startsWith('https://')) {
      const uploadsIndex = image.indexOf('/uploads/');
      if (uploadsIndex !== -1) {
        return `${API_BASE}${image.substring(uploadsIndex)}`;
      }
      return image;
    }
    return `${API_BASE}${image}`;
  };

  useEffect(() => {
    let isMounted = true;

    const loadSlides = async () => {
      try {
        const data = await homeSlidesAPI.getAll();
        const list = Array.isArray(data) ? data : [];
        console.log('[HomeSlider] Loaded slides:', list.length, list);
        if (isMounted) {
          setSlides(list);
          if (list.length === 0) {
            console.warn('[HomeSlider] No slides found. Showing fallback banner.');
          }
        }
      } catch (err) {
        console.error('[HomeSlider] Error loading slides:', err);
        if (isMounted) {
          setError(err.message || 'Gagal memuat home slides');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSlides();

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-rotate slides
  useEffect(() => {
    if (slides.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [slides.length]);

  // Loading skeleton
  if (loading) {
    return (
      <div className='homeSlider fade-in-up'>
        <div className='container'>
          <div className='w-full h-[400px] md:h-[600px] bg-gradient-to-br from-orange-50 to-orange-100 animate-pulse rounded-2xl'></div>
        </div>
      </div>
    );
  }

  // Error fallback
  if (error) {
    return (
      <div className='homeSlider'>
        <div className='container'>
          <div className='w-full h-[400px] md:h-[600px] bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center rounded-2xl'>
            <p className='text-gray-500 text-sm'>Gagal memuat slides. Pastikan server backend berjalan.</p>
          </div>
        </div>
      </div>
    );
  }

  // No slides available - show default hero
  if (slides.length === 0) {
    return (
      <div className='homeSlider fade-in-up'>
        <div className='container'>
          <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 shadow-xl'>
            <div className='grid md:grid-cols-2 gap-8 md:gap-12 items-center px-6 md:px-12 lg:px-16 py-12 md:py-16 lg:py-20'>
              {/* Left Column - Text Content */}
              <div className='text-white space-y-6 z-10'>
                <div className='inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-2 animate-fade-in'>
                  🎉 Selamat Datang di Zenla Mart
                </div>
                <h1 className='text-[clamp(1.5rem,5vw,3.75rem)] font-bold leading-tight animate-fade-in'>
                  Belanja Lebih Mudah,
                  <span className='block text-orange-100'>Hidup Lebih Sehat</span>
                </h1>
                <p className='text-base md:text-xl text-orange-50 leading-relaxed max-w-lg animate-fade-in'>
                  Dapatkan produk segar berkualitas premium dengan harga terbaik. 
                  <span className='block mt-2 font-semibold text-white'>Mulai belanja sekarang dan nikmati kemudahan berbelanja online!</span>
                </p>
                <div className='flex flex-col sm:flex-row gap-4 animate-fade-in'>
                    <Link 
                    href="/products"
                    className='inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-orange-600 rounded-xl font-bold text-lg hover:bg-orange-50 transition-all duration-300 hover:scale-110 hover:shadow-2xl group'
                  >
                    Belanja Sekarang
                    <MdArrowForward className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
                  </Link>
                  <Link 
                    href="/products?category=promo"
                    className='inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl font-bold text-lg hover:bg-white/20 hover:border-white/50 transition-all duration-300 hover:scale-105 group'
                  >
                    Lihat Promo
                    <MdArrowForward className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
                  </Link>
                </div>
                <div className='flex items-center gap-6 text-sm text-orange-100 animate-fade-in pt-2'>
                  <div className='flex items-center gap-2'>
                    <span className='text-2xl'>🚚</span>
                    <span>Gratis Ongkir</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-2xl'>💳</span>
                    <span>Bayar Mudah</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-2xl'>⭐</span>
                    <span>Produk Berkualitas</span>
                  </div>
                </div>
              </div>
              
              {/* Right Column - Image */}
              <div className='relative h-[300px] md:h-[500px] flex items-center justify-center'>
                <div className='absolute inset-0 bg-white/10 rounded-3xl backdrop-blur-sm transform rotate-3 animate-pulse'></div>
                <div className='relative z-10 w-full h-full flex items-center justify-center'>
                  <div className='text-8xl md:text-9xl opacity-20'>🛒</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show first slide as hero
  const slide = slides[currentSlide];
  const imageUrl = getSlideImageUrl(slide.image_url);

  return (
    <div className='homeSlider fade-in-up'>
      <div className='container'>
        <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 shadow-xl'>
          <div className='grid md:grid-cols-2 gap-8 md:gap-12 items-center px-6 md:px-12 lg:px-16 py-12 md:py-16 lg:py-20'>
            {/* Left Column - Text Content */}
            <div className='text-white space-y-6 z-10'>
              {slide.subtitle && (
                <div className='inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-2 animate-fade-in'>
                  {slide.subtitle}
                </div>
              )}
              {!slide.subtitle && (
                <div className='inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-2 animate-fade-in'>
                  🎉 Selamat Datang di Zenla Mart
                </div>
              )}
              {slide.title && (
                <h1 className='text-[clamp(1.5rem,5vw,3.75rem)] font-bold leading-tight animate-fade-in'>
                  {slide.title.split('\n').map((line, idx) => (
                    <span key={idx} className={idx > 0 ? 'block text-orange-100' : ''}>
                      {line}
                    </span>
                  ))}
                </h1>
              )}
              {!slide.title && (
                <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-fade-in'>
                  Belanja Lebih Mudah,
                  <span className='block text-orange-100'>Hidup Lebih Sehat</span>
                </h1>
              )}
              {slide.description && (
                <p className='text-lg md:text-xl text-orange-50 leading-relaxed max-w-lg animate-fade-in'>
                  {slide.description}
                </p>
              )}
              {!slide.description && (
                <p className='text-lg md:text-xl text-orange-50 leading-relaxed max-w-lg animate-fade-in'>
                  Dapatkan produk segar berkualitas premium dengan harga terbaik. 
                  <span className='block mt-2 font-semibold text-white'>Mulai belanja sekarang dan nikmati kemudahan berbelanja online!</span>
                </p>
              )}
              <div className='flex flex-col sm:flex-row gap-4 animate-fade-in'>
                {slide.cta_text && slide.cta_link ? (
                  <Link 
                    href={slide.cta_link}
                    className='inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-orange-600 rounded-xl font-bold text-lg hover:bg-orange-50 transition-all duration-300 hover:scale-105 hover:shadow-2xl group'
                  >
                    {slide.cta_text}
                    <MdArrowForward className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
                  </Link>
                ) : (
                  <Link 
                    href="/products"
                    className='inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-orange-600 rounded-xl font-bold text-lg hover:bg-orange-50 transition-all duration-300 hover:scale-105 hover:shadow-2xl group'
                  >
                    Belanja Sekarang
                    <MdArrowForward className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
                  </Link>
                )}
                <Link 
                  href="/products?category=promo"
                  className='inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-300 hover:scale-105 group'
                >
                  Lihat Promo
                  <MdArrowForward className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
                </Link>
              </div>
              <div className='flex items-center gap-4 md:gap-6 text-sm text-orange-100 animate-fade-in pt-2 flex-wrap'>
                <div className='flex items-center gap-2'>
                  <span className='text-2xl'>🚚</span>
                  <span>Gratis Ongkir</span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-2xl'>💳</span>
                  <span>Bayar Mudah</span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-2xl'>⭐</span>
                  <span>Produk Berkualitas</span>
                </div>
              </div>
            </div>
            
            {/* Right Column - Image */}
            <div className='relative h-[300px] md:h-[500px] flex items-center justify-center group'>
              {imageUrl ? (
                <>
                  <div className='absolute inset-0 bg-white/10 rounded-3xl backdrop-blur-sm transform rotate-3 group-hover:rotate-6 transition-transform duration-500'></div>
                  <div className='relative z-10 w-full h-full rounded-2xl overflow-hidden shadow-2xl'>
                    <Image 
                      src={imageUrl} 
                      alt={slide.title || 'hero image'} 
                      fill
                      className='object-cover group-hover:scale-110 transition-transform duration-700'
                      priority
                    />
                  </div>
                </>
              ) : (
                <div className='relative z-10 w-full h-full flex items-center justify-center'>
                  <div className='text-8xl md:text-9xl opacity-20'>🛒</div>
                </div>
              )}
            </div>
          </div>

          {/* Slide Navigation Arrows */}
          {slides.length > 1 && (
            <>
              {/* Left Arrow */}
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                className='absolute left-6 md:left-8 top-1/2 transform -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 text-white p-2 md:p-3 rounded-full transition-all duration-300 backdrop-blur-sm hover:scale-125 shadow-lg'
                aria-label='Previous slide'
              >
                <svg className='w-5 h-5 md:w-6 md:h-6' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z' />
                </svg>
              </button>
              
              {/* Right Arrow */}
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                className='absolute right-6 md:right-8 top-1/2 transform -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 text-white p-2 md:p-3 rounded-full transition-all duration-300 backdrop-blur-sm hover:scale-125 shadow-lg'
                aria-label='Next slide'
              >
                <svg className='w-5 h-5 md:w-6 md:h-6' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M10 6L8.59 7.41 12.17 11 8.59 14.59 10 16l6-6z' />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default HomeSlider
