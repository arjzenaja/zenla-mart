"use client";
import AccountSidebar from "@/component/AccountSidebar";
import React, { useState, useEffect } from "react";
import Rating from "@mui/material/Rating";
import { IoMdClose } from "react-icons/io";
import { Button } from "@mui/material";
import { formatCurrency } from '@/utils/formatCurrency';
import { wishlistAPI } from '@/lib/api';
import { isAuthenticated } from '@/utils/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { CircularProgress } from '@mui/material';
import Container from "@/component/ui/Container";

const MyList = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionStates, setActionStates] = useState({}); // { productId: 'adding' | 'removing' | null }
  const [bulkLoading, setBulkLoading] = useState(false);
  const [removedItems, setRemovedItems] = useState({}); // For undo functionality
  const [undoTimeout, setUndoTimeout] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await wishlistAPI.getWishlist();
      const wishlist = response.wishlist || response;
      
      // Use products from API if available, otherwise fallback to items
      const productsData = wishlist.products || [];
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      alert('Failed to load wishlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId, removeAfterAdd = false) => {
    if (!productId) return;

    const product = products.find(p => p.id === productId);
    if (product && product.stock <= 0) {
      alert('This product is out of stock');
      return;
    }

    try {
      setActionStates(prev => ({ ...prev, [productId]: 'adding' }));
      await wishlistAPI.addToCartFromWishlist(productId, removeAfterAdd);
      
      if (removeAfterAdd) {
        setProducts(products.filter(p => p.id !== productId));
      }
      
      // Show success message
      alert('Product added to cart successfully!');
      
      // Optionally redirect to cart
      // router.push('/cart');
    } catch (error) {
      // Tampilkan notifikasi ramah ke user tanpa spam error merah di console
      alert(error.message || 'Failed to add product to cart. Please try again.');
    } finally {
      setActionStates(prev => ({ ...prev, [productId]: null }));
    }
  };

  const handleRemove = async (productId, showUndo = true) => {
    try {
      setActionStates(prev => ({ ...prev, [productId]: 'removing' }));
      
      const product = products.find(p => p.id === productId);
      
      // Store for undo
      if (showUndo && product) {
        setRemovedItems(prev => ({ ...prev, [productId]: product }));
        
        // Auto-remove after 5 seconds if not undone
        const timeout = setTimeout(() => {
          performRemove(productId);
          setRemovedItems(prev => {
            const newItems = { ...prev };
            delete newItems[productId];
            return newItems;
          });
        }, 5000);
        
        setUndoTimeout(prev => ({ ...prev, [productId]: timeout }));
      }
      
      // Optimistically remove from UI
      setProducts(products.filter(p => p.id !== productId));
      
      // Perform actual removal
      await wishlistAPI.removeFromWishlist(productId);
      
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      // Restore product on error
      const removedProduct = removedItems[productId];
      if (removedProduct) {
        setProducts(prev => [...prev, removedProduct].sort((a, b) => a.id.localeCompare(b.id)));
      }
      alert('Failed to remove item. Please try again.');
    } finally {
      setActionStates(prev => ({ ...prev, [productId]: null }));
    }
  };

  const performRemove = async (productId) => {
    try {
      await wishlistAPI.removeFromWishlist(productId);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const handleUndo = (productId) => {
    const removedProduct = removedItems[productId];
    if (removedProduct) {
      // Clear timeout
      if (undoTimeout[productId]) {
        clearTimeout(undoTimeout[productId]);
      }
      
      // Restore product
      setProducts(prev => [...prev, removedProduct].sort((a, b) => a.id.localeCompare(b.id)));
      
      // Remove from removed items
      setRemovedItems(prev => {
        const newItems = { ...prev };
        delete newItems[productId];
        return newItems;
      });
      
      setUndoTimeout(prev => {
        const newTimeouts = { ...prev };
        delete newTimeouts[productId];
        return newTimeouts;
      });
    }
  };

  const handleBulkAddToCart = async (removeAfterAdd = false) => {
    if (products.length === 0) return;

    try {
      setBulkLoading(true);
      const response = await wishlistAPI.addAllToCart(removeAfterAdd);
      
      if (removeAfterAdd) {
        setProducts([]);
      } else {
        // Remove only successfully added items
        const addedIds = response.results?.added || [];
        setProducts(products.filter(p => !addedIds.includes(p.id)));
      }
      
      const addedCount = response.results?.added?.length || 0;
      const failedCount = response.results?.failed?.length || 0;
      
      if (failedCount > 0) {
        alert(`${addedCount} item(s) added to cart. ${failedCount} item(s) failed (out of stock or error).`);
      } else {
        alert(`${addedCount} item(s) added to cart successfully!`);
      }
    } catch (error) {
      console.error('Error adding all to cart:', error);
      alert(error.message || 'Failed to add items to cart. Please try again.');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkRemove = async () => {
    if (!confirm('Are you sure you want to remove all items from your wishlist?')) {
      return;
    }

    try {
      setBulkLoading(true);
      await wishlistAPI.removeAllFromWishlist();
      setProducts([]);
      alert('All items removed from wishlist');
    } catch (error) {
      console.error('Error removing all from wishlist:', error);
      alert('Failed to remove items. Please try again.');
    } finally {
      setBulkLoading(false);
    }
  };

  const calculateDiscount = (price, originalPrice) => {
    if (!originalPrice || originalPrice <= price) return null;
    const discount = ((originalPrice - price) / originalPrice) * 100;
    return Math.round(discount);
  };

  const getStockStatus = (stock) => {
    if (stock && stock > 0) {
      return { text: 'In stock', color: 'text-green-600', bg: 'bg-green-50' };
    }
    return { text: 'Out of stock', color: 'text-red-600', bg: 'bg-red-50' };
  };

  if (loading) {
    return (
      <section className="bg-gray-100 py-8 min-h-screen">
        <Container>
          <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
            <div className="w-full md:w-64 lg:w-60 flex-shrink-0 mb-4 md:mb-0">
              <AccountSidebar />
            </div>
            <div className="flex-1 max-w-3xl">
              <div className="bg-white shadow-md rounded-xl p-8 border border-[rgba(148,163,184,0.25)]">
                <div className="flex items-center justify-center py-10">
                  <CircularProgress size={24} className="mr-3" />
                  <p className="text-gray-500">Loading your wishlist...</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  const inStockProducts = products.filter(p => p.stock > 0);
  const outOfStockProducts = products.filter(p => !p.stock || p.stock <= 0);

  return (
    <section className="bg-gray-100 py-8 min-h-screen">
      <Container>
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
          <div className="w-full md:w-64 lg:w-60 flex-shrink-0 mb-4 md:mb-0">
            <AccountSidebar />
          </div>
          <div className="flex-1 max-w-3xl">
            <div className="bg-white shadow-md rounded-xl mb-5 border border-[rgba(148,163,184,0.25)]">
              <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[rgba(148,163,184,0.25)] bg-gradient-to-r from-primary/5 via-white to-transparent">
                <div className="info">
                  <h4 className="text-[18px] font-[600] text-gray-800">
                    My Wishlist
                  </h4>
                  <p className="text-[14px] text-gray-500">
                    There {products.length === 1 ? 'is' : 'are'}{' '}
                    <span className="text-primary font-bold">{products.length}</span>
                    {' '}product{products.length !== 1 ? 's' : ''} in your wishlist
                  </p>
                </div>
                
                {products.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleBulkAddToCart(false)}
                      disabled={bulkLoading || inStockProducts.length === 0}
                      className="!capitalize"
                    >
                      {bulkLoading ? (
                        <CircularProgress size={16} className="mr-2" />
                      ) : (
                        <FiShoppingCart className="mr-2" size={16} />
                      )}
                      Add All to Cart
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={handleBulkRemove}
                      disabled={bulkLoading}
                      className="!capitalize"
                    >
                      {bulkLoading ? (
                        <CircularProgress size={16} className="mr-2" />
                      ) : (
                        <FiTrash2 className="mr-2" size={16} />
                      )}
                      Remove All
                    </Button>
                  </div>
                )}
              </div>

              {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="text-6xl mb-4">📋</div>
                  <p className="text-gray-500 text-[18px] mb-2 font-medium">Your wishlist is empty</p>
                  <p className="text-gray-400 text-[14px] mb-6">Start adding products you love to your wishlist!</p>
                  <Link href="/products">
                    <Button className="!bg-primary !text-white !capitalize !px-6">
                      Browse Products
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-2 p-3">
                  {products.map((product) => {
                    const discount = calculateDiscount(product.price, product.originalPrice);
                    const stockStatus = getStockStatus(product.stock);
                    const isOutOfStock = !product.stock || product.stock <= 0;
                    const isAdding = actionStates[product.id] === 'adding';
                    const isRemoving = actionStates[product.id] === 'removing';
                    const isRemoved = removedItems[product.id];
                    
                    return (
                      <div 
                        key={product.id} 
                        className={`myListBox flex flex-col sm:flex-row sm:items-center gap-3 border-b border-[rgba(0,0,0,0.1)] py-4 last:border-b-0 transition-opacity ${isRemoved ? 'opacity-50' : ''}`}
                      >
                        <Link href={`/product/${product.id}`} className="img w-[100px] h-[120px] group flex-shrink-0 mx-auto sm:mx-0">
                          <Image
                            src={product.image || product.images?.[0] || "/taro.png"}
                            alt={product.name || 'Product image'}
                            width={100}
                            height={120}
                            className="w-full h-full object-cover rounded-md transition-all group-hover:scale-105 cursor-pointer"
                          />
                        </Link>

                        <div className="info flex flex-col gap-2 flex-1 min-w-0">
                          <span className="text-[13px] text-gray-600">
                            {typeof product.category === 'object' && product.category?.name
                              ? product.category.name
                              : product.category || product.brand || 'Product'}
                          </span>
                          <Link href={`/product/${product.id}`}>
                            <h3 className="text-[16px] text-gray-800 font-[500] hover:text-primary cursor-pointer line-clamp-2">
                              {product.name || 'Product Name'}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-2">
                            <Rating 
                              name="read-only" 
                              value={product.rating || 0} 
                              readOnly 
                              size="small" 
                            />
                            <span className="text-[12px] text-gray-500">
                              ({product.reviews?.length || 0})
                            </span>
                          </div>

                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-[#CB0000] text-[18px] font-[600]">
                              {formatCurrency(product.price || 0)}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <>
                                <span className="text-[#A4A4A4] text-[16px] font-[500] line-through">
                                  {formatCurrency(product.originalPrice)}
                                </span>
                                {discount && (
                                  <span className="text-primary font-bold text-[14px] px-2 py-1 bg-primary/10 rounded">
                                    {discount}% OFF
                                  </span>
                                )}
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`text-[12px] font-medium px-2 py-1 rounded ${stockStatus.color} ${stockStatus.bg}`}>
                              {stockStatus.text}
                            </span>
                            {product.stock > 0 && (
                              <span className="text-[12px] text-gray-500">
                                {product.stock} available
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleAddToCart(product.id, false)}
                              disabled={isOutOfStock || isAdding || isRemoving}
                              className="!bg-primary !text-white !capitalize !text-[12px] !px-4"
                            >
                              {isAdding ? (
                                <>
                                  <CircularProgress size={14} className="mr-2" />
                                  Adding...
                                </>
                              ) : (
                                <>
                                  <FiShoppingCart className="mr-1" size={14} />
                                  Add to Cart
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleRemove(product.id, true)}
                              disabled={isRemoving || isAdding}
                              className="!capitalize !text-[12px] !px-4"
                            >
                              {isRemoving ? (
                                <>
                                  <CircularProgress size={14} className="mr-2" />
                                  Removing...
                                </>
                              ) : (
                                <>
                                  <FiTrash2 className="mr-1" size={14} />
                                  Remove
                                </>
                              )}
                            </Button>
                          </div>

                          {isRemoved && (
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded flex items-center justify-between">
                              <span className="text-[12px] text-yellow-800">Item removed</span>
                              <Button
                                size="small"
                                onClick={() => handleUndo(product.id)}
                                className="!text-yellow-800 !capitalize !text-[11px] !px-2"
                              >
                                Undo
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default MyList;
