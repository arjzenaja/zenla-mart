'use client'
import Link from 'next/link'
import React, { useState } from 'react'
import Rating from '@mui/material/Rating'
import Image from 'next/image'
import { formatCurrency } from '@/utils/formatCurrency'
import { useRouter } from 'next/navigation'
import { cartAPI, wishlistAPI } from '@/lib/api'
import { isAuthenticated } from '@/utils/auth'
import { useNotification } from '@/utils/useNotification'
import { FaRegHeart, FaHeart } from 'react-icons/fa6'
import { MdShoppingCart, MdOutlineShoppingCart } from 'react-icons/md'
import { isLebaranSeason } from '@/utils/lebaranDetector'
import { Tooltip } from '@mui/material'

const ProductItem = ({ product, view = 'grid' }) => {
  const router = useRouter();
  const { showSuccess, showError, showInfo } = useNotification();
  const [adding, setAdding] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  if (!product) return null;

  const handleAddToCartClick = async (e) => {
    e.preventDefault(); // Prevent navigation if clicking on the button
    e.stopPropagation();

    if (!product.id) return;

    if (!isAuthenticated()) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('redirectAfterLogin', '/cart');
      }
      router.push('/login');
      return;
    }

    try {
      setAdding(true);
      await cartAPI.addToCart(product.id, 1);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cartUpdated'));
      }

      showSuccess('Produk ditambahkan ke keranjang');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showError(error.message || 'Gagal menambahkan produk ke keranjang. Silakan coba lagi.');
    } finally {
      setAdding(false);
    }
  };

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product.id) return;

    if (!isAuthenticated()) {
      showInfo('Silakan login terlebih dahulu');
      router.push('/login');
      return;
    }

    try {
      setWishlistLoading(true);
      if (inWishlist) {
        await wishlistAPI.removeFromWishlist(product.id);
        setInWishlist(false);
        showInfo('Produk dihapus dari wishlist');
      } else {
        await wishlistAPI.addToWishlist(product.id);
        setInWishlist(true);
        showSuccess('Produk ditambahkan ke wishlist');
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('wishlistUpdated'));
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      showError(error.message || 'Gagal memperbarui wishlist. Silakan coba lagi.');
    } finally {
      setWishlistLoading(false);
    }
  };

  const getStockLabel = () => {
    const stock = Number(product.stock || 0);
    if (stock <= 0) return { label: 'Habis', className: 'bg-red-50 text-red-600 border-red-100' };
    if (stock <= 5) return { label: 'Stok Terbatas', className: 'bg-amber-50 text-amber-600 border-amber-100' };
    return { label: 'Tersedia', className: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
  };

  const getReviewCount = () => {
    if (Array.isArray(product.reviews)) {
      return product.reviews.length;
    }
    return typeof product.reviews === 'number' ? product.reviews : 0;
  };

  const stockInfo = getStockLabel();
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round((1 - (product.price / product.originalPrice)) * 100)
    : 0;
  
  const isLebaran = isLebaranSeason();

  // Grid View (default)
  if (view === 'grid') {
    return (
      <div className={`group relative w-full bg-white rounded-xl border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/20 flex flex-col overflow-hidden ${isLebaran ? 'lebaran-mode' : ''}`}>
        
        {/* Image Container */}
        <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
          <Link href={`/product/${product.id}`} className="block w-full h-full">
            <Image 
              src={product.images?.[0] || "/taro.png"} 
              alt={product.name || 'product image'} 
              fill
              className="object-contain p-6 transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </Link>
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {hasDiscount && (
              <span className="px-2 py-1 text-[10px] font-bold text-white bg-red-500 rounded-md shadow-sm">
                -{discountPercent}%
              </span>
            )}
            {stockInfo.label !== 'Tersedia' && (
              <span className={`px-2 py-1 text-[10px] font-bold rounded-md border shadow-sm ${stockInfo.className}`}>
                {stockInfo.label}
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={toggleWishlist}
            disabled={wishlistLoading}
            className="absolute top-3 right-3 z-10 p-2 text-gray-400 bg-white rounded-full shadow-md transition-all duration-200 hover:text-red-500 hover:scale-110 focus:outline-none disabled:opacity-50"
          >
            {inWishlist ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
          </button>

          {/* Quick Add Overlay (Desktop) */}
          <div className="absolute bottom-4 left-0 right-0 px-4 translate-y-full transition-transform duration-300 group-hover:translate-y-0 hidden lg:block">
             <button
              onClick={handleAddToCartClick}
              disabled={adding || product.stock <= 0}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg shadow-lg hover:bg-primary-dark active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
            >
              {adding ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <MdOutlineShoppingCart size={18} />
              )}
              {product.stock <= 0 ? 'Habis' : 'Add to Cart'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-4">
          {/* Category */}
          <div className="text-[10px] font-semibold tracking-wide text-gray-500 uppercase mb-1">
            {typeof product.category === 'object' && product.category?.name 
              ? product.category.name 
              : product.category || product.brand || 'General'}
          </div>

          {/* Title */}
          <Link href={`/product/${product.id}`} className="block mb-2">
            <h3 className="text-sm font-medium text-gray-800 line-clamp-2 min-h-[40px] group-hover:text-primary transition-colors" title={product.name}>
              {product.name || 'Product Name'}
            </h3>
          </Link>
          
          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <Rating 
              value={Number(product.rating) || 0} 
              readOnly 
              precision={0.5} 
              size="small"
              sx={{
                fontSize: '14px',
                '& .MuiRating-iconFilled': { color: '#FFA41C' },
                '& .MuiRating-iconEmpty': { color: '#E0E0E0' }
              }}
            />
            <span className="text-[11px] text-gray-400 font-medium ml-1">
              ({getReviewCount()})
            </span>
          </div>

          {/* Price & Action (Mobile) */}
          <div className="mt-auto flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(product.price || 0)}
                </span>
              </div>
              {hasDiscount && (
                <span className="text-xs text-gray-400 line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>
            
            {/* Mobile Add Cart Button */}
            <button 
               onClick={handleAddToCartClick}
               disabled={adding || product.stock <= 0}
               className="lg:hidden p-2.5 text-primary bg-primary-50 rounded-lg hover:bg-primary hover:text-white transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
               {adding ? (
                  <span className="block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
               ) : (
                  <MdShoppingCart size={20} />
               )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // List View
  return (
    <div className={`group relative w-full bg-white rounded-xl border border-gray-100 transition-all duration-300 hover:shadow-lg hover:border-primary/20 flex flex-row overflow-hidden ${isLebaran ? 'lebaran-mode' : ''}`}>
      
      {/* Image Container - List View */}
      <div className="relative w-48 h-48 flex-shrink-0 overflow-hidden bg-gray-50">
        <Link href={`/product/${product.id}`} className="block w-full h-full">
          <Image 
            src={product.images?.[0] || "/taro.png"} 
            alt={product.name || 'product image'} 
            fill
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
            sizes="200px"
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {hasDiscount && (
            <span className="px-2 py-1 text-[10px] font-bold text-white bg-red-500 rounded-md shadow-sm">
              -{discountPercent}%
            </span>
          )}
        </div>
      </div>

      {/* Content - List View */}
      <div className="flex flex-col flex-1 p-4 justify-between">
        <div>
          {/* Category */}
          <div className="text-[10px] font-semibold tracking-wide text-gray-500 uppercase mb-1">
            {typeof product.category === 'object' && product.category?.name 
              ? product.category.name 
              : product.category || product.brand || 'General'}
          </div>

          {/* Title */}
          <Link href={`/product/${product.id}`} className="block mb-2">
            <h3 className="text-base font-semibold text-gray-800 line-clamp-1 group-hover:text-primary transition-colors" title={product.name}>
              {product.name || 'Product Name'}
            </h3>
          </Link>
          
          {/* Rating & Stock */}
          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center gap-1">
              <Rating 
                value={Number(product.rating) || 0} 
                readOnly 
                precision={0.5} 
                size="small"
                sx={{
                  fontSize: '14px',
                  '& .MuiRating-iconFilled': { color: '#FFA41C' },
                  '& .MuiRating-iconEmpty': { color: '#E0E0E0' }
                }}
              />
              <span className="text-[11px] text-gray-400 font-medium ml-1">
                ({getReviewCount()})
              </span>
            </div>
            
            {stockInfo.label !== 'Tersedia' && (
              <span className={`px-2 py-1 text-[10px] font-bold rounded-md border shadow-sm ${stockInfo.className}`}>
                {stockInfo.label}
              </span>
            )}
          </div>
        </div>

        {/* Price & Actions */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-gray-900">
                {formatCurrency(product.price || 0)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-400 line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleWishlist}
              disabled={wishlistLoading}
              className="p-2.5 text-gray-400 bg-gray-50 rounded-lg hover:text-red-500 hover:bg-red-50 transition-all focus:outline-none disabled:opacity-50"
            >
              {inWishlist ? <FaHeart className="text-red-500" size={18} /> : <FaRegHeart size={18} />}
            </button>
            
            <button 
               onClick={handleAddToCartClick}
               disabled={adding || product.stock <= 0}
               className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
               {adding ? (
                  <span className="block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
               ) : (
                  <MdShoppingCart size={18} />
               )}
               {product.stock <= 0 ? 'Habis' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductItem
