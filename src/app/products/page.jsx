'use client'
import SideBar from '@/component/Sidebar'
import { Button, Drawer, IconButton } from '@mui/material'
import React, { useState, useEffect, useMemo } from 'react'
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ProductItem from '@/component/ProductItem';
import Pagination from '@mui/material/Pagination';
import { productsAPI, categoriesAPI } from '@/lib/api';
import { useSearchParams, useRouter } from 'next/navigation';
import { IoIosArrowDown, IoMdFunnel } from 'react-icons/io';
import { BsGrid3X3GapFill, BsListUl } from 'react-icons/bs';
import { FiX } from 'react-icons/fi';

import Container from '@/component/ui/Container'
import Skeleton from '@/component/ui/Skeleton'

const ProductPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams.get('search') || '';
  const categoryQuery = searchParams.get('category');

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [categories, setCategories] = useState([]);

  // Product data states
  const [allProducts, setAllProducts] = useState([]); // Store all products for client-side filtering
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("Name, A to Z");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(15);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [view, setView] = useState('grid'); // 'grid' or 'list'

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Fetch categories on mount, then products
  useEffect(() => {
    const initializeData = async () => {
      const cats = await fetchCategories(); // Wait for categories first
      if (cats && cats.length > 0) {
        fetchAllProducts(cats); // Pass categories to fetchAllProducts
      }
    };
    initializeData();
  }, []);

  // Sync state with URL query
  useEffect(() => {
    if (categoryQuery) {
        // If category query exists, set it as the selected category
        const categoriesFromUrl = categoryQuery.split(',').filter(Boolean);
        if (categoriesFromUrl.length > 0) {
            setSelectedCategories(categoriesFromUrl);
        }
    } else {
        // If no category in URL, clear selected categories
        setSelectedCategories([]);
    }
  }, [categoryQuery]);

  // Re-fetch products when search changes
  useEffect(() => {
    if (searchQuery !== undefined && categories.length > 0) {
      fetchAllProducts(categories);
    }
  }, [searchQuery]);

  // Reset to first page when filters or search change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategories, selectedRatings]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      console.log('Products page - Categories API response:', response);
      
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
      
      console.log('Products page - Unique categories:', uniqueCategories);
      setCategories(uniqueCategories);
      return uniqueCategories; // Return for use in initialization
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
      return [];
    }
  };

  const fetchAllProducts = async (categoriesData = categories) => {
    try {
      setLoading(true);
      const params = {
        limit: 1000, // Fetch a large number for client-side filtering
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await productsAPI.getAll(params);
      
      console.log('🔍 API Response:', response);
      
      // Handle different response formats
      let productsData = [];
      if (response?.products && Array.isArray(response.products)) {
        productsData = response.products;
      } else if (response?.data && Array.isArray(response.data)) {
        productsData = response.data;
      } else if (Array.isArray(response)) {
        productsData = response;
      }
      
      console.log('📦 Products count:', productsData.length);
      console.log('📦 Sample product:', productsData[0]);
      console.log('📦 Sample category data:', productsData[0]?.category);
      
      // ALWAYS populate category data (backend might not send it)
      if (productsData.length > 0 && categoriesData.length > 0) {
        console.log('🔄 Populating category data for all products...');
        productsData = productsData.map(product => {
          // If category already exists and has slug, keep it
          if (product.category?.slug) {
            return product;
          }
          // Otherwise populate from categoriesData
          const category = categoriesData.find(c => c.id === product.categoryId);
          return {
            ...product,
            category: category ? {
              id: category.id,
              name: category.name,
              slug: category.slug
            } : null
          };
        });
        console.log('✅ Category data populated. Sample:', productsData[0]?.category);
      }
      
      setAllProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter handler functions
  const handleCategoryChange = (categorySlug) => {
    let newCategories;
    if (selectedCategories.includes(categorySlug)) {
      newCategories = selectedCategories.filter(cat => cat !== categorySlug);
    } else {
      newCategories = [...selectedCategories, categorySlug];
    }
    
    setSelectedCategories(newCategories);

    // Update URL with slug
    const params = new URLSearchParams(searchParams.toString());
    if (newCategories.length > 0) {
      params.set('category', newCategories.join(','));
    } else {
      params.delete('category');
    }
    
    // Reset page to 1
    params.set('page', '1');
    
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleRatingChange = (rating) => {
    setSelectedRatings(prev => {
      if (prev.includes(rating)) {
        return prev.filter(r => r !== rating);
      } else {
        return [...prev, rating];
      }
    });
  };

  // Filter products using useMemo
  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts];

    // Filter by category using SLUG (not name)
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product => {
        // Get the product's category slug
        const productCategorySlug = product.category?.slug;
        
        // Debug logging
        if (process.env.NODE_ENV === 'development') {
          console.log('Product:', product.name, 'Category slug:', productCategorySlug, 'Selected:', selectedCategories);
        }
        
        // Check if product's category slug matches any selected category slug
        return selectedCategories.includes(productCategorySlug);
      });
    }

    // Filter by rating
    if (selectedRatings.length > 0) {
      filtered = filtered.filter(product => {
        const productRating = parseFloat(product.rating) || 0;
        // Check if product rating is >= any selected rating
        return selectedRatings.some(selectedRating => {
          return productRating >= selectedRating;
        });
      });
    }

    return filtered;
  }, [allProducts, selectedCategories, selectedRatings]);

  // Sort filtered products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    
    if (sortBy === "Name, A to Z") {
      sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === "Name, Z to A") {
      sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    } else if (sortBy === "Price Low To High") {
      sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "Price High To Low") {
      sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    return sorted;
  }, [filteredProducts, sortBy]);

  // Paginate sorted products
  const products = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return sortedProducts.slice(startIndex, endIndex);
  }, [sortedProducts, page, rowsPerPage]);

  // Update total products count
  useEffect(() => {
    setTotalProducts(sortedProducts.length);
  }, [sortedProducts]);

  const handleSortChange = (sortOption) => {
    setSortBy(sortOption);
    setPage(1); // Reset to first page when sorting changes
    handleClose();
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const totalPages = Math.ceil(totalProducts / rowsPerPage) || 1;

  return (
    <section className='py-8 bg-[#F8F9FA] min-h-screen'>
      <Container>
        <div className='flex gap-6 flex-col lg:flex-row relative'>
          
          {/* Sidebar - Desktop */}
          <div className='sidebarWrapper hidden lg:block w-[24%] flex-shrink-0'>
            <SideBar 
              categories={categories}
              selectedCategories={selectedCategories}
              selectedRatings={selectedRatings}
              onCategoryChange={handleCategoryChange}
              onRatingChange={handleRatingChange}
            />
          </div>

          {/* Mobile Filter Drawer */}
          <Drawer
            anchor="right"
            open={showMobileFilter}
            onClose={() => setShowMobileFilter(false)}
            PaperProps={{
              className: '!w-[280px] !max-w-[85vw]'
            }}
          >
            <div className="p-5 overflow-y-auto h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Filters</h2>
                <IconButton onClick={() => setShowMobileFilter(false)}>
                  <FiX size={20} />
                </IconButton>
              </div>
              <SideBar 
                categories={categories}
                selectedCategories={selectedCategories}
                selectedRatings={selectedRatings}
                onCategoryChange={(slug) => { handleCategoryChange(slug); setShowMobileFilter(false); }}
                onRatingChange={(rating) => { handleRatingChange(rating); setShowMobileFilter(false); }}
              />
            </div>
          </Drawer>

          {/* Main Content */}
          <div className='rightContent w-full lg:w-[76%]'>
            
            {/* Top Toolbar */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 sticky top-[80px] z-30 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300'>
              <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                  <div className='text-sm text-gray-500 font-medium'>
                    Showing <span className='text-gray-900 font-bold'>{products.length}</span> of <span className='text-gray-900 font-bold'>{totalProducts}</span> products
                  </div>
                  
                  {/* Mobile Filter Toggle */}
                  <button 
                    onClick={() => setShowMobileFilter(true)}
                    className="lg:hidden flex items-center gap-2 text-primary font-semibold text-sm px-3 py-1.5 rounded-lg bg-primary/10"
                  >
                    <IoMdFunnel /> Filter
                  </button>
              </div>

              <div className='flex items-center gap-3 w-full sm:w-auto justify-end'>
                  <div className='hidden sm:flex items-center gap-2 mr-4 border-r border-gray-200 pr-4'>
                      <button 
                        onClick={() => setView('list')}
                        className={`p-2 rounded-md transition-colors ${
                          view === 'list' 
                            ? 'bg-primary/10 text-primary' 
                            : 'bg-gray-100 text-gray-400 hover:text-gray-900'
                        }`}
                      >
                        <BsListUl size={18}/>
                      </button>
                      <button 
                        onClick={() => setView('grid')}
                        className={`p-2 rounded-md transition-colors ${
                          view === 'grid' 
                            ? 'bg-primary/10 text-primary' 
                            : 'bg-gray-100 text-gray-400 hover:text-gray-900'
                        }`}
                      >
                        <BsGrid3X3GapFill size={18}/>
                      </button>
                  </div>

                  <span className='text-sm text-gray-500 font-medium hidden sm:block'>Sort by:</span>
                  <div className='relative'>
                    <Button 
                        className='!bg-gray-50 !capitalize !text-gray-700 !font-semibold !text-sm !py-2 !px-4 !rounded-lg !border !border-gray-200 hover:!bg-gray-100 hover:!border-gray-300' 
                        onClick={handleClick}
                        endIcon={<IoIosArrowDown className="text-gray-400"/>}
                    >
                        {sortBy}
                    </Button>
                    <Menu
                      id='basic-menu'
                      anchorEl={anchorEl}
                      open={open}
                      onClose={handleClose}
                      elevation={2}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      PaperProps={{
                          style: {
                              borderRadius: 12,
                              marginTop: 8,
                              minWidth: 180,
                              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                          }
                      }}
                    >
                      <MenuItem onClick={() => handleSortChange("Name, A to Z")} className="!text-sm !font-medium !text-gray-700 hover:!bg-primary/5 hover:!text-primary">Name, A To Z</MenuItem>
                      <MenuItem onClick={() => handleSortChange("Name, Z to A")} className="!text-sm !font-medium !text-gray-700 hover:!bg-primary/5 hover:!text-primary">Name, Z To A</MenuItem>
                      <MenuItem onClick={() => handleSortChange("Price Low To High")} className="!text-sm !font-medium !text-gray-700 hover:!bg-primary/5 hover:!text-primary">Price Low To High</MenuItem>
                      <MenuItem onClick={() => handleSortChange("Price High To Low")} className="!text-sm !font-medium !text-gray-700 hover:!bg-primary/5 hover:!text-primary">Price High To Low</MenuItem>
                    </Menu>
                  </div>
              </div>
            </div>

            {/* Product Grid */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5'>
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="flex flex-col gap-3">
                                <Skeleton height="280px" className="!rounded-xl" width="100%" />
                                <div className="p-2">
                                    <Skeleton height="15px" width="60%" className="mb-2" />
                                    <Skeleton height="20px" width="90%" className="mb-2" />
                                    <Skeleton height="20px" width="40%" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className='bg-white rounded-xl border border-gray-100 p-12 flex flex-col items-center justify-center text-center shadow-sm'>
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <span className="text-4xl">🔍</span>
                        </div>
                        <h3 className='text-xl font-bold text-gray-800 mb-2'>No products found</h3>
                        <p className='text-gray-500 max-w-md mx-auto mb-6'>
                            We couldn't find any products matching your selection. Try checking different categories or adjusting your filters.
                        </p>
                        <Button 
                            onClick={() => {
                                setSelectedCategories([]);
                                setSelectedRatings([]);
                                if (searchQuery) {
                                    // You might want to clear search query too if you had access to router/pathname
                                }
                            }}
                            className='!bg-primary !text-white !font-bold !px-8 !py-2.5 !rounded-full !capitalize shadow-lg shadow-primary/30 hover:!bg-primary-dark hover:!shadow-primary/40 transition-all'
                        >
                            Clear All Filters
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className={view === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5' : 'flex flex-col gap-4'}>
                            {products.map((product) => (
                                <ProductItem key={product.id} product={product} view={view} />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className='flex items-center justify-center mt-12'>
                                <Pagination 
                                    count={totalPages} 
                                    page={page}
                                    onChange={handlePageChange}
                                    showFirstButton 
                                    showLastButton
                                    size="large"
                                    color="primary"
                                    shape="rounded"
                                    className="!text-primary"
                                    sx={{
                                        '& .MuiPaginationItem-root': {
                                            fontSize: '15px',
                                            fontWeight: 600,
                                            color: '#555',
                                            border: '1px solid #eee',
                                            backgroundColor: '#fff',
                                            '&:hover': {
                                                backgroundColor: '#fff7ed',
                                                borderColor: '#D96F32',
                                                color: '#D96F32'
                                            },
                                            '&.Mui-selected': {
                                                backgroundColor: '#D96F32 !important',
                                                color: '#fff !important',
                                                borderColor: '#D96F32 !important',
                                                boxShadow: '0 4px 12px rgba(217, 111, 50, 0.3)'
                                            }
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

          </div>
        </div>
      </Container>
    </section>
  )
}

export default ProductPage
