'use client'
import { Button, TextField } from '@mui/material'
import React, { useState } from 'react'
import ProductZoom from './ProductZoom'
import Rating  from '@mui/material/Rating'
import QtyBox from './QtyBox'
import { IoCartOutline } from 'react-icons/io5'
import { FaRegHeart } from 'react-icons/fa'
import Tooltip, {} from '@mui/material/Tooltip'
import TextareaAutosize from '@mui/material/TextField'

const ProductDetailsComponent = () => {

  const [isActiveTab, setIsActiveTab] = useState(0);  
  const [value, setValue] = useState(2);

  return (
    <>
      <div className='flex gap-10'>
        <ProductZoom />

        <div className='content'>
          <h1 className='text-[35px] font-bold text-gray-700'>Taro SEAWEED Snack</h1>

          <div className='flex items-center gap-4 my-4'>
            <p className='text-[18px] text-gray-600 font-[400] flex items-center gap-3'>Brand :
              <span className='font-[500]'>Taro Net</span>
            </p>

            <Rating name="read-only" value={4} readOnly />

            <span className='text-[18px] font-[500] cursor-pointer text-primary hover:text-secondary'>Review (0)</span>
          </div>

          <div className='flex items-center gap-5 my-3'>
            <div className='flex items-center justify-between my-3 gap-4  '>
              <span className='text-[#CB0000] text-[25px] font-bold'>$25.99</span>
              <span className='text-[#A4A4A4] text-[25px] font-bold line-through'>$38.10</span>
            </div>

            <p className='text-[18px] text-grey-600 flex items-center gap-3'>Available In Stock:
              <span className='text-primary font-bold'>74,853 Items</span>
            </p>
          </div>

          <p className='text-[16px] font-light text-gray-600 leading-8 pr-48'>
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's 
            standard dummy text ever since the 1500 s, when an unknown printer took a galley of type and scrambled it to make 
            va type specimen book. Lorem Ipsum is simply dummy text of the printing and typesetting industry. 

            <br /><br />
            Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took 
            a galley of type and scrambled it to make a type specimen book
          </p>

          <div className='flex items-center gap-4 mt-10'>
            <QtyBox/>

            <Button className='btn-g !px-8 !h-[45px] gap-1'>
              <IoCartOutline size={25}/>
              Add to cart
            </Button>

            <Tooltip title="Add to wishlist" placement='top'>
              <Button className='!w-[45px] !min-w-[35px] !h-[45px] !rounded-full !border !border-[rgba(0,0,0,0.2)] !text-gray-700 hover:!bg-gray-200'>
                <FaRegHeart size={20} className='text-gray-700'/>
              </Button>
            </Tooltip>
          </div>

          
        </div>
        
      </div>


      
      <div className='flex items-center gap-8 mt-8 mb-5'>
            <span className={`text-[18px] font-[500] cursor-pointer flex pb-1 border-b-2 ${isActiveTab === 0 ? 'border-primary text-primary' : 'text-gray-800 border-transparent'}`} onClick={()=>setIsActiveTab(0)}>Description</span>
            <span className={`text-[18px] font-[500] cursor-pointer flex pb-1 border-b-2 ${isActiveTab === 1 ? 'border-primary text-primary' : 'text-gray-800 border-transparent'}`} onClick={()=>setIsActiveTab(1)}>Reviews</span>
          </div>





          {
            isActiveTab === 0 && <p className='text-[16px] font-light text-gray-600 leading-8 pr-40 w-[80%]'>
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's 
              standard dummy text ever since the 1500 s, when an unknown printer took a galley of type and scrambled it to make 
              va type specimen book. Lorem Ipsum is simply dummy text of the printing and typesetting industry. 

              <br /><br />
              Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took 
              a galley of type and scrambled it to make a type specimen book                         
            </p>
          }


          {
            isActiveTab === 1 &&
            <div className='reviewsSection w-[70%]'>
              <h2 className='text-[18px] font-[500] text-gray-700 mb-8'>Customer questions & answers</h2>

              <div className='scroll max-h-[300px] overflow-y-scroll flex flex-col gap-5'>
                <div className='flex gap-4'>
                  <div className='imgWrapper'>
                    <div className='flex items-center justify-center w-[60px] h-[60px] rounded-full overflow-hidden'>
                    <img src={"/profile.jpg"} alt="profile image" className='w-full h-full object-cover'/>
                    </div>
                  </div>


                  <div className="info flex flex-col gap-1 w-[70%]">
                    <h3 className='text-[15px] text-gray-700 font-[500]'>Customer</h3>
                    <span>2026-01-21</span>
                    <p className='text-[16px] font-light text-gray-600 leading-7'>
                      Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's 
                      standard dummy text ever since the 1500 s, when an unknown printer took a galley of type and scrambled it to make 
                      va type specimen book. Lorem Ipsum is simply dummy text of the printing and typesetting industry.                        
                    </p>
                  </div>

                  <div className='w-[30%] flex justify-end'>
                    <Rating name='read-only' value={4} readOnly size='small'/>
                  </div>

                </div>

                <div className='flex gap-4'>
                  <div className='imgWrapper'>
                    <div className='flex items-center justify-center w-[60px] h-[60px] rounded-full overflow-hidden'>
                    <img src={"/profile.jpg"} alt="profile image" className='w-full h-full object-cover'/>
                    </div>
                  </div>


                  <div className="info flex flex-col gap-1 w-[70%]">
                    <h3 className='text-[15px] text-gray-700 font-[500]'>Customer</h3>
                    <span>2026-01-21</span>
                    <p className='text-[16px] font-light text-gray-600 leading-7'>
                      Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's 
                      standard dummy text ever since the 1500 s, when an unknown printer took a galley of type and scrambled it to make 
                      va type specimen book. Lorem Ipsum is simply dummy text of the printing and typesetting industry.                        
                    </p>
                  </div>

                  <div className='w-[30%] flex justify-end'>
                    <Rating name='read-only' value={4} readOnly size='small'/>
                  </div>

                </div>
                
                <div className='flex gap-4'>
                  <div className='imgWrapper'>
                    <div className='flex items-center justify-center w-[60px] h-[60px] rounded-full overflow-hidden'>
                    <img src={"/profile.jpg"} alt="profile image" className='w-full h-full object-cover'/>
                    </div>
                  </div>


                  <div className="info flex flex-col gap-1 w-[70%]">
                    <h3 className='text-[15px] text-gray-700 font-[500]'>Customer</h3>
                    <span>2026-01-21</span>
                    <p className='text-[16px] font-light text-gray-600 leading-7'>
                      Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's 
                      standard dummy text ever since the 1500 s, when an unknown printer took a galley of type and scrambled it to make 
                      va type specimen book. Lorem Ipsum is simply dummy text of the printing and typesetting industry.                        
                    </p>
                  </div>

                  <div className='w-[30%] flex justify-end'>
                    <Rating name='read-only' value={4} readOnly size='small'/>
                  </div>

                </div>
              </div>

              <div className='reviewsForm w-[70%] mt-8'>
                <h2 className='text-[18px] font-[500] text-gray-700 mb-3'>Add a review</h2>
                <form className='flex flex-col gap-5'>
                  <TextField 
                    id='reviewInput' 
                    label='Write a review' 
                    variant='outlined'
                    multiline
                    rows={5}
                    className='w-full'
                    defaultValue=""
                  />

                  <Rating 
                    name='simple-controlled'
                    value={value}
                    onChange={(event, newValue) => {
                      setValue(newValue);
                    }}
                  />

                  <div className='btnWrapper'>
                    <Button className='btn-g !px-8 !py-2'>Submit Review</Button>
                  </div>
                </form>
              </div>
            </div>
          }


          


    </>
  )
}

export default ProductDetailsComponent
