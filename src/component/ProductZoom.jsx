'use client'
import React, { useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css'
import Image from 'next/image';
import InnerImageZoom from 'react-inner-image-zoom';
import 'react-inner-image-zoom/lib/styles.min.css';
const ProductZoom = () => {

  const [slideIndex, setSlideIndex] = useState(0);
  const zoomSliderBig = useRef();
  const zoomSliderSml = useRef();

  const gotToSlide=(index)=>{
    setSlideIndex(index)
    zoomSliderSml.current.swiper.slideTo(index);
    zoomSliderBig.current.swiper.slideTo(index);
  }

  return (
     <div className='imageWrapper w-[30%]'>
        <div className='isliderWrapper border border-[rgba(0,0,0,0.2)] rounded-lg overflow-hidden'>
          <Swiper className='bigSlider' ref={zoomSliderBig}>
            <SwiperSlide>
              <div className="item">
                <InnerImageZoom 
                  zoomType='hover'
                  zoomScale={1}
                  src={'/taro.png'}
                />
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="item">
                <InnerImageZoom 
                  zoomType='hover'
                  zoomScale={1}
                  src={'/taro2.jpg'}
                />
              </div>
            </SwiperSlide>
          </Swiper>
        </div>

        <div className='smlSliderWrapper pt-4'>
          <Swiper 
            className='smlSlider'
            slidesPerView={5}
            spaceBetween={10}
            ref={zoomSliderSml}
          >
            <SwiperSlide>
              <div className={`item border ${slideIndex === 0 ? 'border-[rgba(0,0,0,0.4)]' : 'border-[rgba(0,0,0,0.1)]'} p-3 cursor-pointer rounded-md`} onClick={()=>gotToSlide(0)}>
                <Image src={'/taro.png'} className='w-full' alt='product image' width={80} height={80}/>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className={`item border ${slideIndex === 1 ? 'border-[rgba(0,0,0,0.4)]' : 'border-[rgba(0,0,0,0.1)]'} p-3 cursor-pointer rounded-md`} onClick={()=>gotToSlide(1)}>
                <Image src={'/taro2.jpg'} className='w-full' alt='product image' width={80} height={80}/>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </div>
  )
}

export default ProductZoom
