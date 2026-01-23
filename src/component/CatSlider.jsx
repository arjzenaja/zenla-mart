"use client"
import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';
// import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import Link from 'next/link';

const CatSlider = () => {

  return (
    <div className='py-5'>
      <div className='container'>
        <Swiper
          slidesPerView={10}
          spaceBetween={20}
          navigation={true}
          modules={[Navigation]}
          className='mySwiper'
          >
          <SwiperSlide>
            <Link href={"/products"} className='group'>
              <div className='bg-white p-3 w-full h-[110px] rounded-md shadow-md flex items-center justify-center transition group-hover:bg-gray-100'>
                <img src={"/cat1.png"} alt='category' className='transition group-hover:scale-105'/>
              </div>
              <h4 className='text-[15px] font-[500] text-center mt-3 text-gray-700 group-hover:text-primary'>Fruits & Vegetables</h4>
            </Link>
          </SwiperSlide>

          <SwiperSlide>
            <Link href={"/products"} className='group'>
              <div className='bg-white p-3 w-full h-[110px] rounded-md shadow-md flex items-center justify-center transition group-hover:bg-gray-100'>
                <img src={"/cat2.png"} alt='category' className='transition group-hover:scale-105'/>
              </div>
              <h4 className='text-[15px] font-[500] text-center mt-3 text-gray-700 group-hover:text-primary'>Meats & Seafood</h4>
            </Link>
          </SwiperSlide>

          <SwiperSlide>
             <Link href={"/products"} className='group'>
              <div className='bg-white p-3 w-full h-[110px] rounded-md shadow-md flex items-center justify-center transition group-hover:bg-gray-100'>
                <img src={"/cat3.png"} alt='category' className='transition group-hover:scale-105'/>
              </div>
              <h4 className='text-[15px] font-[500] text-center mt-3 text-gray-700 group-hover:text-primary'>Breaksfast & Dairy</h4>
            </Link>
          </SwiperSlide>

          <SwiperSlide>
            <Link href={"/products"} className='group'>
              <div className='bg-white p-3 w-full h-[110px] rounded-md shadow-md flex items-center justify-center transition group-hover:bg-gray-100'>
                <img src={"/cat4.png"} alt='category' className='transition group-hover:scale-105'/>
              </div>
              <h4 className='text-[15px] font-[500] text-center mt-3 text-gray-700 group-hover:text-primary'>Breads & Bakery</h4>
            </Link>
          </SwiperSlide>

          <SwiperSlide>
            <Link href={"/products"} className='group'>
              <div className='bg-white p-3 w-full h-[110px] rounded-md shadow-md flex items-center justify-center transition group-hover:bg-gray-100'>
                <img src={"/cat5.png"} alt='category' className='transition group-hover:scale-105'/>
              </div>
              <h4 className='text-[15px] font-[500] text-center mt-3 text-gray-700 group-hover:text-primary'>Beverages</h4>
            </Link>
          </SwiperSlide>

          <SwiperSlide>
            <Link href={"/products"} className='group'>
              <div className='bg-white p-3 w-full h-[110px] rounded-md shadow-md flex items-center justify-center transition group-hover:bg-gray-100'>
                <img src={"/cat6.png"} alt='category' className='transition group-hover:scale-105'/>
              </div>
              <h4 className='text-[15px] font-[500] text-center mt-3 text-gray-700 group-hover:text-primary'>Frozen Foods</h4>
            </Link>
          </SwiperSlide>

          <SwiperSlide>
            <Link href={"/products"} className='group'>
              <div className='bg-white p-3 w-full h-[110px] rounded-md shadow-md flex items-center justify-center transition group-hover:bg-gray-100'>
                <img src={"/cat7.png"} alt='category' className='transition group-hover:scale-105'/>
              </div>
              <h4 className='text-[15px] font-[500] text-center mt-3 text-gray-700 group-hover:text-primary'>Biscuits & Snacks</h4>
            </Link>
          </SwiperSlide>

          <SwiperSlide>
            <Link href={"/products"} className='group'>
              <div className='bg-white p-3 w-full h-[110px] rounded-md shadow-md flex items-center justify-center transition group-hover:bg-gray-100'>
                <img src={"/cat8.png"} alt='category' className='transition group-hover:scale-105'/>
              </div>
              <h4 className='text-[15px] font-[500] text-center mt-3 text-gray-700 group-hover:text-primary'>Grocery & Staples</h4>
            </Link>
          </SwiperSlide>

          <SwiperSlide>
            <Link href={"/products"} className='group'>
              <div className='bg-white p-3 w-full h-[110px] rounded-md shadow-md flex items-center justify-center transition group-hover:bg-gray-100'>
                <img src={"/cat9.png"} alt='category' className='transition group-hover:scale-105'/>
              </div>
              <h4 className='text-[15px] font-[500] text-center mt-3 text-gray-700 group-hover:text-primary'>Baby & Pregnancy</h4>
            </Link>
          </SwiperSlide>
          
          <SwiperSlide>
            <Link href={"/products"} className='group'>
              <div className='bg-white p-3 w-full h-[110px] rounded-md shadow-md flex items-center justify-center transition group-hover:bg-gray-100'>
                <img src={"/cat10.png"} alt='category' className='transition group-hover:scale-105'/>
              </div>
              <h4 className='text-[15px] font-[500] text-center mt-3 text-gray-700 group-hover:text-primary'>Healthcare</h4>
            </Link>
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  )
}

export default CatSlider
