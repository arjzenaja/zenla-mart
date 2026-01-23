"use client"
import React from 'react'
// import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import Image from 'next/image';
import { Navigation, Autoplay } from 'swiper/modules';
const HomeSlider = () => {
  return (
    <div className='homeSlider'>
      <div className='container'>
          <Swiper 
            navigation={true} 
            modules={[Navigation, Autoplay]} 
            autoplay= {{
              delay: 2500,
              disableOnInteraction: false,
           }}
            className="mySwiper">
            <SwiperSlide>
              <div className='item'>
                <Image src={"/slide1.png"} alt='slide1' width={1344} height={514} className='w-full'/>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className='item'>
                <Image src={"/slide1.png"} alt='slide1' width={1344} height={514} className='w-full'/>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className='item'>
                <Image src={"/slide1.png"} alt='slide1' width={1344} height={514} className='w-full'/>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className='item'>
                <Image src={"/slide1.png"} alt='slide1' width={1344} height={514} className='w-full'/>
              </div>
            </SwiperSlide>
          </Swiper>
      </div>
    </div>
  )
}

export default HomeSlider