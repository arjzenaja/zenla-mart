"use client"
import React, { useState, useEffect } from 'react'
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import ProductSlider from './ProductSlider';
import { categoriesAPI } from '@/lib/api';

const PopularProducts = () => {
  const [value, setValue] = useState(0);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getAll();
        const data = response.categories || response.data || response || [];
        // Map to just names for the tabs, or keep objects if we want more data later
        // The original code used names array. Let's keep it simple for now but use the fetched names.
        const categoryNames = Array.isArray(data) ? data.map(c => c.name) : [];
        setCategories(categoryNames);
      } catch (error) {
        console.error('Error fetching categories for popular products:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  }

  const selectedCategory = value === 0 ? null : categories[value];

  return (
    <div>
      <div className='flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 md:mb-10 gap-6'>
        <div className='lhs'>
          <h2 className='text-2xl md:text-3xl lg:text-4xl text-gray-900 font-bold mb-2'>🔥 Popular Products</h2>
          <p className='text-sm md:text-base text-gray-600'>Jangan lewatkan penawaran terbaik kami</p>
        </div>

        <div className='rhs w-full lg:w-auto flex items-center justify-start lg:justify-end overflow-hidden'>
          <div className='categoryTabsWrapper overflow-x-auto scrollbar-hide flex-1'>
            <Tabs
              value={value}
              onChange={handleChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="scrollable auto tabs example"
              sx={{
                '& .MuiTabs-indicator': {
                  backgroundColor: '#D96F32',
                  height: '3px',
                  borderRadius: '3px'
                },
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#666',
                  padding: '12px 16px',
                  minHeight: '48px',
                  '&.Mui-selected': {
                    color: '#D96F32',
                    fontWeight: '700'
                  },
                  '&:hover': {
                    color: '#D96F32',
                    backgroundColor: 'rgba(217, 111, 50, 0.05)'
                  }
                }
              }}
            >
              {categories.map((category, index) => (
                <Tab key={index} label={category} />
              ))}
            </Tabs> 
          </div>
        </div>
      </div>

      <div className='relative popularProductsSlider'>
        <ProductSlider category={selectedCategory} limit={8} />
      </div>
    </div>
  )
}

export default PopularProducts
