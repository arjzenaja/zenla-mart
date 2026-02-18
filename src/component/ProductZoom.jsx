'use client'
import React, { useRef, useState, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css'
import Image from 'next/image';
import InnerImageZoom from 'react-inner-image-zoom';
import 'react-inner-image-zoom/lib/styles.min.css';

const ProductZoom = ({ images = [] }) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const zoomSliderBig = useRef();
  const zoomSliderSml = useRef();

  // Default image jika tidak ada images
  const displayImages = images && images.length > 0 ? images : ['/taro.png'];

  useEffect(() => {
    // Reset slide index ketika images berubah
    setSlideIndex(0);
    if (zoomSliderBig.current?.swiper) {
      zoomSliderBig.current.swiper.slideTo(0);
    }
    if (zoomSliderSml.current?.swiper) {
      zoomSliderSml.current.swiper.slideTo(0);
    }
  }, [images]);

  const gotToSlide = (index) => {
    setSlideIndex(index);
    if (zoomSliderSml.current?.swiper) {
      zoomSliderSml.current.swiper.slideTo(index);
    }
    if (zoomSliderBig.current?.swiper) {
      zoomSliderBig.current.swiper.slideTo(index);
    }
  }

    return (
      <div className='w-full lg:w-[35%] max-w-[600px] mx-auto'>
          <div className='product-image-wrapper relative bg-white rounded-3xl shadow-md border border-gray-200 overflow-hidden'>
            <Swiper className='bigSlider' ref={zoomSliderBig}>
              {displayImages.map((image, index) => {
                // Check if image is from localhost
                const isLocalhostImage = image?.includes('localhost') || image?.includes('127.0.0.1');
                
                return (
                  <SwiperSlide key={index}>
                    <div className="relative w-full aspect-square flex items-center justify-center">
                      <InnerImageZoom 
                        zoomType='hover'
                        zoomScale={1.5}
                        src={image}
                        alt={`Product image ${index + 1}`}
                        className="max-h-full max-w-full"
                        hideHint={true}
                        imgAttributes={{
                          crossOrigin: isLocalhostImage ? 'anonymous' : undefined,
                          className: "max-h-[400px] max-w-full"
                        }}
                      />
                      
                      {/* Magnifier Icon */}
                    <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow pointer-events-none">
                      <svg 
                        stroke="currentColor" 
                        fill="none" 
                        strokeWidth="2" 
                        viewBox="0 0 24 24" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        height="20" 
                        width="20" 
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-gray-600"
                      >
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        <line x1="11" y1="8" x2="11" y2="14"></line>
                        <line x1="8" y1="11" x2="14" y2="11"></line>
                      </svg>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        {displayImages.length > 1 && (
          <div className='pt-4'>
            <Swiper 
              className='smlSlider'
              slidesPerView={Math.min(5, displayImages.length)}
              spaceBetween={10}
              ref={zoomSliderSml}
            >
              {displayImages.map((image, index) => (
                <SwiperSlide key={index}>
                  <div 
                    className={`product-thumbnail ${slideIndex === index ? 'active' : ''}`}
                    onClick={() => gotToSlide(index)}
                  >
                    <Image 
                      src={image} 
                      className='w-full' 
                      alt={`Product thumbnail ${index + 1}`} 
                      width={80} 
                      height={80}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>
  )
}

export default ProductZoom
