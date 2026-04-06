"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link';
import Image from 'next/image';
import { categoriesAPI } from '../lib/api';

const CatSlider = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageErrors, setImageErrors] = useState(new Set());

  const handleImageError = (categoryId) => {
    setImageErrors(prev => new Set(prev).add(categoryId));
  };

  const isValidImageUrl = (url) => {
    if (!url) return false;
    // Skip placeholder URLs that are known to fail
    if (url.includes('via.placeholder.com')) return false;
    return true;
  };

  const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || '';
    if (name.includes('fruit') || name.includes('vegetable')) return '🥬';
    if (name.includes('meat') || name.includes('seafood')) return '🥩';
    if (name.includes('dairy') || name.includes('breakfast')) return '🥛';
    if (name.includes('bread') || name.includes('bakery')) return '🍞';
    if (name.includes('beverage') || name.includes('drink')) return '🥤';
    if (name.includes('frozen')) return '🧊';
    if (name.includes('snack') || name.includes('biscuit')) return '🍪';
    if (name.includes('grocery') || name.includes('staple')) return '🛒';
    if (name.includes('baby') || name.includes('pregnancy')) return '👶';
    if (name.includes('health') || name.includes('care')) return '💊';
    return '📦';
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const data = await categoriesAPI.getAll();
        setCategories(data.categories || []);
        setError(null);
      } catch (err) {
        setError(err.message || 'Error loading categories');
        console.error('Error fetching categories:', err);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <div className='py-12 bg-gray-50 fade-in-up'>
        <div className='container'>
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 md:gap-6'>
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className='animate-pulse'>
                <div className='w-full aspect-square bg-gray-200 rounded-2xl mb-3'></div>
                <div className='h-4 bg-gray-200 rounded w-3/4 mx-auto'></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='py-12 bg-gray-50'>
        <div className='container'>
          <div className='bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl'>
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className='py-12 bg-gray-50'>
        <div className='container'>
          <div className='text-center text-gray-500 py-8'>No categories available</div>
        </div>
      </div>
    );
  }

  return (
    <div className='py-12 md:py-16 bg-gray-50 fade-in-up'>
      <div className='container'>
        <div className='mb-8 md:mb-12'>
          <h2 className='text-2xl md:text-3xl font-bold text-gray-900 mb-2'>Shop by Category</h2>
          <p className='text-gray-600 text-sm md:text-base'>Explore our wide range of products</p>
        </div>
        
        <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4 md:gap-6'>
          {categories.map((category) => (
            <Link 
              key={category.id}
              href={`/products?category=${category.slug || category.id}`} 
              className='group flex flex-col items-center'
            >
              <div className='relative w-full aspect-square mb-3'>
                <div className='absolute inset-0 bg-white rounded-2xl shadow-sm group-hover:shadow-lg transition-all duration-300 group-hover:scale-105 flex items-center justify-center overflow-hidden border border-gray-100 group-hover:border-primary/30'>
                  {category.image && isValidImageUrl(category.image) && !imageErrors.has(category.id) ? (
                    category.image.includes('via.placeholder.com') ? (
                      // Use regular img for placeholder URLs to avoid Next.js Image optimization issues
                      <div className='relative w-full h-full p-4 flex items-center justify-center'>
                        <img 
                          src={category.image} 
                          alt={category.name}
                          className='w-full h-full object-contain transition-transform duration-300 group-hover:scale-110'
                          onError={() => handleImageError(category.id)}
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className='relative w-full h-full p-4'>
                        <Image 
                          src={category.image} 
                          alt={category.name}
                          fill
                          className='object-contain transition-transform duration-300 group-hover:scale-110'
                          onError={() => handleImageError(category.id)}
                        />
                      </div>
                    )
                  ) : (
                    <div className='w-16 h-16 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-3xl group-hover:from-orange-200 group-hover:to-orange-300 transition-all duration-300'>
                      {getCategoryIcon(category.name)}
                    </div>
                  )}
                </div>
              </div>
              <h4 className='text-xs md:text-sm font-semibold text-center text-gray-700 group-hover:text-primary transition-colors duration-300 line-clamp-2 px-1'>
                {category.name}
              </h4>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CatSlider
