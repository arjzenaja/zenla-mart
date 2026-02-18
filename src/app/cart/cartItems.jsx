'use client'
import Link from 'next/link'
import React, { useState, useMemo } from 'react'
import Rating from '@mui/material/Rating'
import { Button } from '@mui/material';
import { IoMdArrowDropdown } from 'react-icons/io';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { IoMdClose } from 'react-icons/io';
import { formatCurrency } from '@/utils/formatCurrency';

const CartItems = ({ item, onUpdateQuantity, onRemove }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const open = Boolean(anchorEl);
  
  if (!item || !item.product) {
    return null;
  }

  const { product, quantity, variantId } = item;
  const productId = item.productId || product.id;
  const productImage = product.image || product.images?.[0] || '/placeholder.png';
  const productName = product.name || 'Product';
  const productCategory = product.category?.name || product.categoryName || '';
  
  // Handle variant specific data
  const variant = product.variants?.find(v => v.id === variantId);
  const variantName = variant?.name;
  const productPrice = variant?.price || product.price || 0;
  const productOriginalPrice = product.originalPrice || product.price || 0;
  
  const productRating = product.rating || 0;
  const stock = typeof (variant?.stock ?? product.stock) === 'number' ? (variant?.stock ?? product.stock) : null;
  
  const discount = productOriginalPrice > productPrice 
    ? Math.round(((productOriginalPrice - productPrice) / productOriginalPrice) * 100)
    : 0;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleQuantityChange = (newQuantity) => {
    handleClose();
    if (onUpdateQuantity && newQuantity !== quantity) {
      onUpdateQuantity(productId, newQuantity, variantId);
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove(productId, variantId);
    }
  };

  const subtotal = productPrice * quantity;

  const maxSelectableQty = useMemo(() => {
    if (stock && stock > 0) return stock;
    return 15;
  }, [stock]);

  const remainingStock = useMemo(() => {
    if (!stock && stock !== 0) return null;
    const remaining = stock - quantity;
    return remaining >= 0 ? remaining : 0;
  }, [stock, quantity]);

  return (
    <div 
      className="productRow group flex items-start gap-6 p-6 border-b border-gray-100 hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-transparent transition-all duration-300 ease-out"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        animation: 'fadeInUp 0.4s ease-out forwards'
      }}
    >
      {/* Product Image */}
      <Link 
        href={`/product/${productId}`} 
        className="img w-[120px] flex-shrink-0 relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
      >
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img 
            src={productImage} 
            alt={productName} 
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 ease-out"
            onError={(e) => {
              e.target.src = '/placeholder.png';
            }}
          />
          {discount > 0 && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
              -{discount}%
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="info flex flex-col gap-2.5 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {productCategory}
            </span>
            <Link
              href={`/product/${productId}`}
              className="block text-base font-semibold text-gray-900 hover:text-primary leading-snug line-clamp-2 mt-1 transition-colors duration-200"
            >
              {productName}
              {variantName && (
                <span className="text-sm font-medium text-primary ml-2 bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/10">
                  {variantName}
                </span>
              )}
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Rating 
            name="read-only" 
            value={productRating} 
            readOnly 
            size="small"
            sx={{
              '& .MuiRating-iconFilled': {
                color: '#f59e0b',
              },
            }}
          />
          <span className="text-xs text-gray-500">({productRating.toFixed(1)})</span>
        </div>

        {/* Price and Quantity Section */}
        <div className="flex items-end justify-between gap-4 mt-2">
          <div className="flex flex-col gap-3">
            {/* Price */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                {formatCurrency(productPrice)}
              </span>
              {productOriginalPrice > productPrice && (
                <span className="text-sm text-gray-400 line-through font-medium">
                  {formatCurrency(productOriginalPrice)}
                </span>
              )}
            </div>

            {/* Quantity Selector */}
            <div className='relative'>
              <Button 
                className='!bg-white !border-2 !border-gray-200 hover:!border-primary !text-gray-700 !py-2 !px-4 !capitalize !text-sm !font-semibold !rounded-lg !shadow-sm hover:!shadow-md !transition-all !duration-200' 
                onClick={handleClick}
                endIcon={<IoMdArrowDropdown size={18}/>}
              >
                Qty: {quantity}
              </Button>
              <Menu
                id='qtyDrop'
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                slotProps={{
                  paper: {
                    sx: {
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                      mt: 1,
                      maxHeight: '300px',
                    }
                  },
                  list: {
                    'aria-labelledby': 'basic-button',
                    sx: { py: 1 }
                  },
                }}
              >
                {Array.from({ length: maxSelectableQty }).map((_, index) => {
                  const value = index + 1;
                  const disabled = stock && value > stock;
                  return (
                    <MenuItem 
                      key={value} 
                      onClick={() => !disabled && handleQuantityChange(value)}
                      selected={value === quantity}
                      disabled={disabled}
                      sx={{
                        fontSize: '14px',
                        fontWeight: value === quantity ? 600 : 400,
                        py: 1.5,
                        px: 3,
                        '&.Mui-selected': {
                          backgroundColor: 'hsl(var(--primary) / 0.1)',
                          color: 'hsl(var(--primary))',
                          '&:hover': {
                            backgroundColor: 'hsl(var(--primary) / 0.15)',
                          }
                        }
                      }}
                    >
                      {value}
                      {stock && value === stock && ' (maksimal stok)'}
                    </MenuItem>
                  );
                })}
              </Menu>
              {stock && (
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Stok: <span className="font-semibold text-gray-700">{stock}</span> item
                  {remainingStock !== null && remainingStock <= 3 && remainingStock >= 0 && (
                    <span className="text-red-500 font-semibold ml-1">
                      • Tersisa {remainingStock}
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Subtotal */}
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">Subtotal</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
              {formatCurrency(subtotal)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {quantity} item{quantity > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Delete Button */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <button
          type="button"
          onClick={handleRemove}
          className="group/delete flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
          aria-label="Hapus item"
        >
          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 group-hover/delete:bg-red-500 transition-all duration-200">
            <IoMdClose 
              size={20} 
              className='text-gray-500 group-hover/delete:text-white transition-colors duration-200'
            />
          </div>
          <span className="text-xs text-gray-500 group-hover/delete:text-red-600 font-medium transition-colors duration-200">
            Hapus
          </span>
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default CartItems;
