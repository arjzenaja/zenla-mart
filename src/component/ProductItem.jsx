import Link from 'next/link'
import React from 'react'
import Rating from '@mui/material/Rating'
import { Button } from '@mui/material'
const ProductItem = () => {
  return (
    <div className='productItem shadow-md w-full bg-white rounded-md'>
      <Link href={"/product/234232"} className='img overflow-hidden group flex p-3'>
        <img src={"/taro.png"} alt='product image' className= 'transition group-hover:scale-105'/>
      </Link>

      <div className='info p-3 flex flex-col gap-1'>
        <span className='text-[14px] text-gray-700'>Taro</span>
        <Link href={"/product/234232"} className='text-[15px] text-gray-800 font-[500] hover:text-primary'>Taro jos</Link>
        <Rating name="read-only" value={4} readOnly size='small'/>

        <div className='flex items-center justify-between'>
          <span className='text-[#CB0000] text-[18px] font-[600]'>$25.99</span>
          <span className='text-[#A4A4A4] text-[18px] font-[600] line-through'>$38.10</span>
        </div>

        <Button className='btn-border-g'>Add to cart</Button>
      </div>
    </div>
  )
}

export default ProductItem
