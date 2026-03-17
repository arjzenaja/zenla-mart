'use client'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Search from './Search'
import { FaRegHeart } from 'react-icons/fa6'
import { HiOutlineShoppingBag } from 'react-icons/hi'
import { FiUser, FiLogOut, FiChevronDown, FiMenu, FiX } from 'react-icons/fi'
import Nav from './Nav'
import { isAuthenticated } from '@/utils/auth'
import { useSession, signOut } from 'next-auth/react'
import { userAPI, authAPI, cartAPI, wishlistAPI, addressAPI, categoriesAPI } from '@/lib/api'
import { Button, Menu, MenuItem, Drawer, Box, IconButton } from '@mui/material'

const Header = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [categories, setCategories] = useState([])

  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [activeAddress, setActiveAddress] = useState(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      localStorage.setItem('token', session.accessToken);
      checkAuthAndData();
    }
  }, [session, status]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getAll()
        let catData = response.categories || response.data || response || []
        setCategories(Array.isArray(catData) ? catData : [])
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    fetchCategories()
    checkAuthAndData()

    const handleCartUpdated = () => {
      if (isAuthenticated()) {
        fetchCartSummary()
      }
    }

    const handleWishlistUpdated = () => {
      if (isAuthenticated()) {
        fetchWishlistSummary()
      }
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('cartUpdated', handleCartUpdated)
      window.addEventListener('wishlistUpdated', handleWishlistUpdated)
      window.addEventListener('scroll', handleScroll)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('cartUpdated', handleCartUpdated)
        window.removeEventListener('wishlistUpdated', handleWishlistUpdated)
        window.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  const checkAuthAndData = async () => {
    const authed = isAuthenticated()

    if (!authed) {
      setLoadingUser(false)
      setCartCount(0)
      setWishlistCount(0)
      setActiveAddress(null)
      return
    }

    try {
      setLoadingUser(true)
      const profileRes = await userAPI.getProfile()
      const userData = profileRes.user || profileRes
      setUser(userData)

      await Promise.all([fetchCartSummary(), fetchWishlistSummary(), fetchActiveAddress()])
    } catch (error) {
      console.error('Error initializing header data:', error)
      setUser(null)
      setCartCount(0)
      setWishlistCount(0)
      setActiveAddress(null)
    } finally {
      setLoadingUser(false)
    }
  }

  const fetchCartSummary = async () => {
    try {
      const response = await cartAPI.getCart()
      const cart = response.cart || response
      if (!cart || !Array.isArray(cart.items)) {
        setCartCount(0)
        return
      }
      const totalItems = cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
      setCartCount(totalItems)
    } catch (error) {
      console.error('Error fetching cart summary:', error)
      setCartCount(0)
    }
  }

  const fetchWishlistSummary = async () => {
    try {
      const response = await wishlistAPI.getWishlist()
      const wishlist = response.wishlist || response
      const count =
        (Array.isArray(wishlist.products) && wishlist.products.length) ||
        (Array.isArray(wishlist.items) && wishlist.items.length) ||
        0
      setWishlistCount(count)
    } catch (error) {
      console.error('Error fetching wishlist summary:', error)
      setWishlistCount(0)
    }
  }

  const fetchActiveAddress = async () => {
    try {
      const response = await addressAPI.getAll()
      const addresses = response.addresses || response || []
      if (!Array.isArray(addresses) || addresses.length === 0) {
        setActiveAddress(null)
        return
      }

      const defaultAddress =
        addresses.find((addr) => addr.isDefault) ||
        addresses[0]
      setActiveAddress(defaultAddress)
    } catch (error) {
      console.error('Error fetching active address:', error)
      setActiveAddress(null)
    }
  }

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    try {
      await authAPI.logout()
      localStorage.removeItem('token');
      if (status === 'authenticated') {
        await signOut({ redirect: false })
      }
      setUser(null)
      setCartCount(0)
      setWishlistCount(0)
      setActiveAddress(null)
      handleClose()
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const addressLabel = activeAddress
    ? activeAddress.label || 'Home'
    : 'Belum ada alamat'

  const addressLocation = activeAddress
    ? `${activeAddress.city || ''}${activeAddress.city && activeAddress.province ? ' / ' : ''}${activeAddress.province || ''}`
    : 'Tambah alamat pengiriman'

  const toggleMobileMenu = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }
    setMobileMenuOpen(open)
  }

  return (
    <>
      <div className={`headerWrapper sticky top-0 z-50 ${scrolled ? 'scrolled' : ''}`}>
        <header className='py-3.5 lg:py-4'>
          <div className="container">
            <div className="flex items-center justify-between gap-3 lg:gap-5">
              {/* Mobile Hamburger - Left on Mobile */}
              <div className="lg:hidden">
                <IconButton onClick={toggleMobileMenu(true)} className="!text-gray-700">
                  <FiMenu size={24} />
                </IconButton>
              </div>

              {/* Logo */}
              <div className="logo shrink-0 flex-1 lg:flex-none flex justify-center lg:justify-start">
                <Link href={"/"}>
                  <Image src={"/logo.png"} width={140} height={38} alt='Zenla Mart' className='hover:opacity-85 transition-opacity duration-200 lg:w-[160px] lg:h-[44px]'/>
                </Link>
              </div>

              {/* Search Bar - Hidden on small mobile, shown on tablet/desktop */}
              <div className="hidden sm:block flex-1 max-w-2xl px-2 lg:px-0">
                <Search placeholder="Cari produk segar untuk harianmu" width="100%"/>
              </div>

              {/* User Actions */}
              <div className='flex items-center gap-3 lg:gap-4'>
                {!loadingUser && (
                  <>
                    {user ? (
                      <>
                        <Button
                          onClick={handleClick}
                          className='text-gray-700 px-2 py-2 hover:bg-gray-50 rounded-xl transition normal-case duration-200'
                          endIcon={<FiChevronDown size={16} />}
                        >
                          <div className='flex items-center gap-2'>
                            <div className='w-8 h-8 rounded-full bg-linear-to-br from-primary to-orange-600 flex items-center justify-center shadow-sm'>
                              <FiUser className='text-white' size={16} />
                            </div>
                            <span className='text-sm font-semibold hidden md:inline text-gray-800 truncate max-w-30'>{user.name || user.email}</span>
                          </div>
                        </Button>
                        <Menu
                          anchorEl={anchorEl}
                          open={open}
                          onClose={handleClose}
                          slotProps={{
                            paper: {
                              className: '!mt-2 !min-w-[220px] !rounded-2xl !shadow-xl !border !border-gray-100'
                            }
                          }}
                        >
                          <MenuItem onClick={() => { handleClose(); router.push('/my-account'); }} className='py-3! hover:bg-orange-50'>
                            <div className='flex items-center gap-3 w-full'>
                              <FiUser size={18} className='text-primary' />
                              <span className='text-sm font-medium'>My Account</span>
                            </div>
                          </MenuItem>
                          <MenuItem onClick={() => { handleClose(); router.push('/my-orders'); }} className='py-3! hover:bg-orange-50'>
                            <div className='flex items-center gap-3 w-full'>
                              <HiOutlineShoppingBag size={18} className='text-primary' />
                              <span className='text-sm font-medium'>My Orders</span>
                            </div>
                          </MenuItem>
                          <MenuItem onClick={handleLogout} className='py-3! hover:bg-red-50 border-t border-gray-100 mt-1'>
                            <div className='flex items-center gap-3 w-full text-red-600'>
                              <FiLogOut size={18} />
                              <span className='text-sm font-medium'>Logout</span>
                            </div>
                          </MenuItem>
                        </Menu>
                      </>
                    ) : (
                      <div className='flex items-center gap-3'>
                        <Link href={"/login"} className='text-sm font-semibold text-gray-700 hover:text-primary transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-gray-50'>Login</Link>
                        <Link href={"/register"} className='text-sm font-semibold text-white bg-primary hover:bg-orange-600 transition-colors duration-200 px-4 py-2 rounded-lg shadow-sm hover:shadow-md'>Register</Link>
                      </div>
                    )}
                  </>
                )}

                {/* Wishlist & Cart */}
                <div className='flex items-center gap-1 sm:gap-3'>
                  <Link href={"/my-list"} className='relative group p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200'>
                    {wishlistCount > 0 && (
                      <span className='absolute top-0 right-0 bg-linear-to-br from-red-500 to-red-600 min-w-4.5 h-5 px-1 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg lg:min-w-5.5 lg:h-6 lg:px-1.5 lg:text-xs'>
                        {wishlistCount}
                      </span>
                    )}
                    <FaRegHeart className='text-gray-600 group-hover:text-primary transition-colors duration-200 text-[20px] lg:text-[22px]'/>
                  </Link>

                  <Link href={"/cart"} className='relative group p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200'>
                    {cartCount > 0 && (
                      <span className='absolute top-0 right-0 bg-linear-to-br from-red-500 to-red-600 min-w-4.5 h-5 px-1 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg lg:min-w-5.5 lg:h-6 lg:px-1.5 lg:text-xs'>
                        {cartCount}
                      </span>
                    )}
                    <HiOutlineShoppingBag className='text-gray-600 group-hover:text-primary transition-colors duration-200 text-[24px] lg:text-[26px]'/>
                  </Link>
                </div>
              </div>
            </div>

            {/* Mobile Search Bar - Shown only on extra small mobile */}
            <div className="sm:hidden mt-3">
              <Search placeholder="Cari produk segar..." width="100%"/>
            </div>

            {/* Delivery Info - Enhanced - Adjusted for mobile */}
            {user && (
              <div className="mt-3 lg:mt-3.5 pt-3 lg:pt-3.5 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => router.push('/address')}
                  className="flex items-center gap-2 overflow-hidden text-sm text-gray-700 hover:text-primary transition-colors duration-200 w-full"
                >
                  <span className='text-base lg:text-lg'>📍</span>
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="font-semibold text-gray-800 whitespace-nowrap">{addressLabel}</span>
                    <span className="text-gray-400 truncate text-[12px] lg:text-sm">({addressLocation})</span>
                  </div>
                  <span className="ml-auto text-xs text-primary font-bold shrink-0">Change</span>
                </button>
              </div>
            )}
          </div>
        </header>

        <Nav />
      </div>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={toggleMobileMenu(false)}
        PaperProps={{
          className: '!w-[280px] !max-w-[85vw]'
        }}
      >
        <Box className="flex flex-col h-full bg-white">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <Link href="/" onClick={toggleMobileMenu(false)}>
              <Image src="/logo.png" width={120} height={33} alt="Zenla Mart" />
            </Link>
            <IconButton onClick={toggleMobileMenu(false)}>
              <FiX size={20} />
            </IconButton>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <div className="px-5 mb-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Menu Utama</h3>
              <nav className="flex flex-col gap-1">
                <Link href="/" onClick={toggleMobileMenu(false)} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-orange-50 text-gray-700 font-semibold group transition-all">
                  <span className="text-xl group-hover:scale-110 transition-transform">🏠</span>
                  <span>Home</span>
                </Link>
                <Link href="/products" onClick={toggleMobileMenu(false)} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-orange-50 text-gray-700 font-semibold group transition-all">
                  <span className="text-xl group-hover:scale-110 transition-transform">🛍️</span>
                  <span>Semua Produk</span>
                </Link>
              </nav>
            </div>

            <div className="px-5 mb-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Kategori</h3>
              <nav className="flex flex-col gap-1">
                {categories.map((cat) => (
                  <Link 
                    key={cat.id}
                    href={`/products?category=${cat.slug || cat.name}`} 
                    onClick={toggleMobileMenu(false)}
                    className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-orange-50 text-gray-700 font-semibold group transition-all"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">
                      {/* Using simple deterministic icon logic mirroring Nav.jsx */}
                      {cat.name?.toLowerCase().includes('fruit') ? '🥬' : 
                       cat.name?.toLowerCase().includes('meat') ? '🥩' :
                       cat.name?.toLowerCase().includes('milk') ? '🥛' : '📦'}
                    </span>
                    <span className="truncate">{cat.name}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {!user && (
            <div className="p-5 border-t border-gray-100 grid grid-cols-2 gap-3">
              <Link href="/login" onClick={toggleMobileMenu(false)} className="text-center py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50">
                Login
              </Link>
              <Link href="/register" onClick={toggleMobileMenu(false)} className="text-center py-2.5 rounded-xl bg-primary text-sm font-bold text-white hover:bg-orange-600 shadow-sm shadow-primary/20">
                Register
              </Link>
            </div>
          )}
        </Box>
      </Drawer>
    </>
  )
}

export default Header
