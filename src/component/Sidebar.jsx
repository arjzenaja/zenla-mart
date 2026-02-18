'use client'
import React, { useState, useMemo } from 'react'
import { Collapse } from 'react-collapse'
import RangeSlider from 'react-range-slider-input'
import 'react-range-slider-input/dist/style.css'
import { formatCurrency } from '@/utils/formatCurrency'
import { IoIosArrowDown, IoIosArrowUp, IoIosSearch } from 'react-icons/io'
import { FaStar } from 'react-icons/fa6'

const Sidebar = ({ 
  categories = [], 
  selectedCategories = [], 
  selectedRatings = [], 
  onCategoryChange, 
  onRatingChange 
}) => {

  const [isOpenCatFilter, setIsOpenCatFilter] = useState(true);
  const [isOpenRatingFilter, setIsOpenRatingFilter] = useState(true);
  const [isOpenPriceFilter, setIsOpenPriceFilter] = useState(true);
  const [price, setPrice] = useState([0, 30000]);
  const [catSearch, setCatSearch] = useState('');

  // Deduplicate categories in case duplicates are passed as props
  const uniqueCategories = useMemo(() => {
    return categories.reduce((acc, category) => {
      const categoryId = category.id || category;
      const exists = acc.find(cat => (cat.id || cat) === categoryId);
      if (!exists) {
        acc.push(category);
      }
      return acc;
    }, []);
  }, [categories]);

  const filteredCategories = uniqueCategories.filter(cat => {
      const name = cat.name || cat;
      return name.toLowerCase().includes(catSearch.toLowerCase());
  });

  return (
    <aside className='sticky top-[120px] flex flex-col gap-6 pr-4 h-[calc(100vh-120px)] overflow-y-auto pb-10 scrollbar-hide'>
        
        {/* Categories Section */}
        <div className='bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden'>
          <div 
            className='flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors'
            onClick={()=>setIsOpenCatFilter(!isOpenCatFilter)}
          >
            <h3 className='text-[15px] font-bold text-gray-800 uppercase tracking-wider'>Category</h3>
            {isOpenCatFilter ? <IoIosArrowUp className='text-gray-500'/> : <IoIosArrowDown className='text-gray-500'/>}
          </div>

          <Collapse isOpened={isOpenCatFilter}>
            <div className='px-4 pb-4'>
                {/* Optional Search for Categories */}
                <div className="relative mb-3">
                    <input 
                        type="text" 
                        placeholder="Search categories..." 
                        className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                        value={catSearch}
                        onChange={(e) => setCatSearch(e.target.value)}
                    />
                    <IoIosSearch className="absolute left-2.5 top-2.5 text-gray-400 text-sm" />
                </div>

                <div className='max-h-[240px] overflow-y-auto pr-1 custom-scrollbar flex flex-col gap-1'>
                {filteredCategories.length > 0 ? (
                    filteredCategories.map((category, index) => {
                    const categorySlug = category.slug || category.name?.toLowerCase().replace(/\s+/g, '-'); // Fallback to generated slug
                    const categoryName = category.name || category;
                    const isChecked = selectedCategories.includes(categorySlug); // Check by slug
                    return (
                        <label 
                            key={index} 
                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-200 group ${isChecked ? 'bg-primary/5' : 'hover:bg-gray-50'}`}
                            onClick={() => onCategoryChange(categorySlug)} // Pass slug
                        >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-primary border-primary' : 'border-gray-300 bg-white group-hover:border-primary'}`}>
                                    {isChecked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                </div>
                                <span className={`text-sm truncate select-none ${isChecked ? 'font-semibold text-primary' : 'text-gray-600 group-hover:text-gray-900'}`}>{categoryName}</span>
                            </div>
                        </label>
                    );
                    })
                ) : (
                    <div className="text-center py-4 text-gray-400 text-xs">No categories found</div>
                )}
                </div>
            </div>
          </Collapse>
        </div>


        {/* Price Filter */}
        <div className='bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden'>
          <div 
            className='flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors'
            onClick={()=>setIsOpenPriceFilter(!isOpenPriceFilter)}
          >
            <h3 className='text-[15px] font-bold text-gray-800 uppercase tracking-wider'>Price</h3>
            {isOpenPriceFilter ? <IoIosArrowUp className='text-gray-500'/> : <IoIosArrowDown className='text-gray-500'/>}
          </div>

          <Collapse isOpened={isOpenPriceFilter}>
             <div className='px-5 pb-6 pt-2'>
                <RangeSlider 
                    value={price}
                    onInput={setPrice}
                    min={0}
                    max={50000}
                    step={100}
                    className="my-4"
                />

                <div className='flex items-center justify-between mt-4 gap-3'>
                    <div className="flex-1 bg-gray-50 rounded-lg p-2.5 border border-gray-100 text-center">
                        <span className='text-[10px] text-gray-400 block mb-1'>Min</span>
                        <span className='text-xs font-bold text-gray-900'>{formatCurrency(price[0]).replace('Rp', '').trim()}</span>
                    </div>
                    <div className="text-gray-300 text-sm">-</div>
                    <div className="flex-1 bg-gray-50 rounded-lg p-2.5 border border-gray-100 text-center">
                        <span className='text-[10px] text-gray-400 block mb-1'>Max</span>
                        <span className='text-xs font-bold text-gray-900'>{formatCurrency(price[1]).replace('Rp', '').trim()}</span>
                    </div>
                </div>
            </div>
          </Collapse>
        </div>


        {/* Rating Filter */}
        <div className='bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden'>
          <div 
            className='flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors'
            onClick={()=>setIsOpenRatingFilter(!isOpenRatingFilter)}
          >
            <h3 className='text-[15px] font-bold text-gray-800 uppercase tracking-wider'>Rating</h3>
            {isOpenRatingFilter ? <IoIosArrowUp className='text-gray-500'/> : <IoIosArrowDown className='text-gray-500'/>}
          </div>

          <Collapse isOpened={isOpenRatingFilter}>
            <div className='px-4 pb-4 flex flex-col gap-1'>
                {[5, 4, 3, 2, 1].map((rating) => (
                    <label 
                        key={rating} 
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-200 group hover:bg-gray-50`}
                    >
                        <div className="flex items-center gap-2.5">
                             <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedRatings.includes(rating) ? 'bg-primary border-primary' : 'border-gray-300 bg-white group-hover:border-primary'}`}
                                onClick={() => onRatingChange?.(rating)}
                             >
                                {selectedRatings.includes(rating) && <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                            </div>
                            
                            <div className='flex items-center gap-1'>
                                {[...Array(5)].map((_, i) => (
                                    <FaStar 
                                        key={i} 
                                        size={14} 
                                        className={`${i < rating ? 'text-[#FFA41C]' : 'text-gray-200'}`} 
                                    />
                                ))}
                                <span className='text-sm text-gray-600 ml-1 font-medium'>
                                    {rating === 5 ? '5.0' : `& Up`}
                                </span>
                            </div>
                        </div>
                    </label>
                ))}
            </div>
          </Collapse>
        </div>
    </aside>
  )
}

export default Sidebar
