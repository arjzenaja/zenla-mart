'use client'
import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { FaAngleDown } from 'react-icons/fa6';
import { categoriesAPI } from '@/lib/api';

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getAll();
        console.log("Nav - Categories API response:", response);
        
        let categoriesData = [];
        
        // Handle different response formats
        if (response?.categories && Array.isArray(response.categories)) {
          categoriesData = response.categories;
        } else if (response?.data && Array.isArray(response.data)) {
          categoriesData = response.data;
        } else if (Array.isArray(response)) {
          categoriesData = response;
        }
        
        // Deduplicate categories by id
        const uniqueCategories = categoriesData.reduce((acc, category) => {
          const exists = acc.find(cat => cat.id === category.id);
          if (!exists) {
            acc.push(category);
          }
          return acc;
        }, []);
        
        console.log("Nav - Unique categories:", uniqueCategories);
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching categories for nav:', error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
  };

  // Close dropdown
  const closeDropdown = () => {
    setIsOpen(false);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        closeDropdown();
      }
    };

    if (isOpen) {
      // Use mousedown instead of click for better UX
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        closeDropdown();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen]);

  const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || '';
    if (name.includes('fruit') || name.includes('vegetable')) return '🥬';
    if (name.includes('meat') || name.includes('seafood')) return '🥩';
    if (name.includes('dairy') || name.includes('breakfast')) return '🥛';
    if (name.includes('bread') || name.includes('bakery')) return '🍞';
    if (name.includes('beverage') || name.includes('drink')) return '🥤';
    if (name.includes('frozen')) return '❄️'; // Fixed icon code
    if (name.includes('snack') || name.includes('biscuit')) return '🍪';
    if (name.includes('grocery') || name.includes('staple')) return '🛒';
    if (name.includes('baby') || name.includes('pregnancy')) return '👶';
    if (name.includes('health') || name.includes('care')) return '💊';
    return '📦';
  };

  // Determine which categories to show in the main bar vs dropdown
  // Show up to 8 categories in the main bar (plus Home), rest in dropdown
  // If no categories, we still show Home
  const maxVisibleCategories = 8;
  const visibleCategories = categories.slice(0, maxVisibleCategories);
  const hiddenCategories = categories.slice(maxVisibleCategories);

  return (
    <nav className='hidden lg:block border-t border-gray-100 bg-white'>
      <div className='container'>
        <div className='flex items-center gap-0.5 lg:gap-1 overflow-x-auto scrollbar-hide py-2.5'>
          <Link href="/" className='flex items-center gap-1.5 text-sm text-gray-700 font-semibold hover:text-primary transition-all duration-200 whitespace-nowrap px-3.5 py-2 rounded-xl hover:bg-orange-50 active:bg-orange-100 group'>
            <span className='text-lg group-hover:scale-110 transition-transform duration-200'>🏠</span>
            <span>Home</span>
          </Link>
          
          {visibleCategories.map((category) => (
             <Link 
                key={category.id} 
                href={`/products?category=${category.slug || category.name}`} 
                className='hidden lg:flex items-center gap-1.5 text-sm text-gray-700 font-semibold hover:text-primary transition-all duration-200 whitespace-nowrap px-3.5 py-2 rounded-xl hover:bg-orange-50 active:bg-orange-100 group'
             >
                <span className='text-lg group-hover:scale-110 transition-transform duration-200'>
                    {getCategoryIcon(category.name)}
                </span>
                <span>{category.name}</span>
             </Link>
          ))}

          {/* Show a "More" dropdown if there are hidden categories */}
          {hiddenCategories.length > 0 && (
            <div className='relative ml-auto lg:ml-0'>
                <button 
                ref={buttonRef}
                onClick={toggleDropdown}
                className='flex shrink-0 items-center gap-1.5 text-sm text-gray-700 font-semibold hover:text-primary transition-all duration-200 whitespace-nowrap px-3.5 py-2 rounded-xl hover:bg-orange-50 active:bg-orange-100'
                >
                More
                <FaAngleDown 
                    size={14} 
                    className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
                </button>

                {isOpen && (
                <div 
                    ref={dropdownRef}
                    className='absolute top-full right-0 mt-2 bg-white shadow-xl rounded-2xl overflow-hidden min-w-60 z-50 border border-gray-100 animate-in fade-in-50'
                >
                    {hiddenCategories.map((category) => (
                        <Link 
                        key={category.id}
                        href={`/products?category=${category.slug || category.name}`} 
                        className='flex items-center gap-3 text-sm text-gray-800 font-medium hover:text-primary py-3 px-4 hover:bg-orange-50 transition-all duration-200 border-b border-gray-100 last:border-b-0 group'
                        onClick={closeDropdown}
                        >
                        <span className='text-lg group-hover:scale-125 transition-transform duration-200'>
                            {getCategoryIcon(category.name)}
                        </span>
                        <span>{category.name}</span>
                        </Link>
                    ))}
                </div>
                )}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Nav
