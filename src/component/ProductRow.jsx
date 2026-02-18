import React from 'react'
import ProductSlider from './ProductSlider'
import Container from '@/component/ui/Container'
import Link from 'next/link'
import { MdOutlineArrowRightAlt } from 'react-icons/md'

const ProductRow = (props) => {
  // Map title ke category jika diperlukan
  const categoryMap = {
    "Latest Products": null, // null berarti ambil semua produk terbaru
    "Featured Products": null,
    "Breaksfast & Dairy": "Breaksfast & Dairy",
    "Fruits & Vegetables": "Fruits & Vegetables",
    "Meats & Seafood": "Meats & Seafood",
    "Breads & Bakery": "Breads & Bakery",
    "Beverages": "Beverages",
    "Frozen Foods": "Frozen Foods",
    "Biscuits & Snacks": "Biscuits & Snacks",
    "Grocery & Staples": "Grocery & Staples",
    "Baby & Pregnancy": "Baby & Pregnancy",
    "Healthcare": "Healthcare",
  };

  const category = categoryMap[props?.title] || null;

  return (
    <div className='relative relatedProductsSection'>
      <div className='flex items-center justify-between mb-6 md:mb-8'>
        <div>
          <h2 className='text-2xl md:text-3xl text-gray-900 font-bold mb-1'>{props?.title}</h2>
          <p className='text-sm text-gray-600 hidden md:block'>Discover our curated selection</p>
        </div>
        <Link 
          href={"/products"} 
          className="flex items-center gap-2 text-base md:text-lg text-primary font-semibold hover:gap-3 transition-all duration-300 group"
        >
          View All 
          <MdOutlineArrowRightAlt size={24} className='group-hover:translate-x-1 transition-transform'/>
        </Link>
      </div>
      <div className='relative productSliderWrapper'>
        <ProductSlider category={category} limit={8}/>
      </div>
    </div>
  )
}

export default ProductRow
