"use client"
import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import { Navigation } from 'swiper/modules';
import Link from 'next/link';

const Banners = () => {
  return (
    <section className='py-5 bg-white pt-0'>
      <div className='container'>
        <Swiper
            slidesPerView={3}
            spaceBetween={25}
            navigation={true}
            modules={[Navigation]}
            className="mySwiper"
          >
          <SwiperSlide>
            <Link href={"/"} className='item group rounded-md overflow-hidden'>
              <img src={"/banner1.jpg"} alt='banner' className='w-full transition group-hover:scale-105 rounded-md'/>
            </Link>
          </SwiperSlide>

          <SwiperSlide>
            <Link href={"/"} className='item group rounded-md overflow-hidden'>
              <img src={"/banner2.jpg"} alt='banner' className='w-full transition group-hover:scale-105 rounded-md'/>
            </Link>
          </SwiperSlide>

          <SwiperSlide>
            <Link href={"/"} className='item group rounded-md overflow-hidden'>
              <img src={"/banner3.jpg"} alt='banner' className='w-full transition group-hover:scale-105 rounded-md'/>
            </Link>
          </SwiperSlide>
        </Swiper>
      </div>
    </section>
  )
}

export default Banners
