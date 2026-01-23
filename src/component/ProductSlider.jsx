"use client"
import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import { Navigation } from 'swiper/modules';
import ProductItem from './ProductItem';
const ProductSlider = () => {
  return (
    <div className='productSlider'>
      <Swiper 
        slidesPerView={6}
        spaceBetween={30} 
        navigation={true} 
        modules={[Navigation]}
        className="mySwiper"
      >
        <SwiperSlide className='py-3 px-3'>
          <ProductItem/>
        </SwiperSlide>

        <SwiperSlide className='py-3 px-3'>
          <ProductItem/>
        </SwiperSlide>

        <SwiperSlide className='py-3 px-3'>
          <ProductItem/>
        </SwiperSlide>

        <SwiperSlide className='py-3 px-3'>
          <ProductItem/>
        </SwiperSlide>

        <SwiperSlide className='py-3 px-3'>
          <ProductItem/>
        </SwiperSlide>

        <SwiperSlide className='py-3 px-3'>
          <ProductItem/>
        </SwiperSlide>

        <SwiperSlide className='py-3 px-3'>
          <ProductItem/>
        </SwiperSlide>

        <SwiperSlide className='py-3 px-3'>
          <ProductItem/>
        </SwiperSlide>
      </Swiper>
    </div>
  )
}

export default ProductSlider