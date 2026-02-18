'use client'
import { Button, Avatar, Divider, Menu, MenuItem, IconButton } from '@mui/material'
import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { MdLogout, MdPerson, MdSettings, MdMenu, MdMenuOpen } from 'react-icons/md'

const Header = ({ toggleSidebar, isSidebarOpen, isMobile }) => {
  const { user, logout } = useAuth()
  const [anchorEl, setAnchorEl] = useState(null)

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    handleMenuClose()
    logout()
  }

  return (
    <header className='w-full h-[75px] bg-white shadow-premium flex items-center justify-between px-8 sticky top-0 z-50 border-b-2 border-transparent transition-smooth animate-fadeIn' style={{
      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      borderImage: 'linear-gradient(90deg, #D96F32, #E88A4D) 1'
    }}>
      <div className="flex items-center gap-3 lg:gap-4">
        {/* Sidebar Toggle Button */}
        <IconButton 
          onClick={toggleSidebar}
          className="!text-primary lg:mr-2 !bg-orange-50 hover:!bg-orange-100 !rounded-xl transition-all"
        >
          {isSidebarOpen && !isMobile ? <MdMenuOpen size={24} /> : <MdMenu size={24} />}
        </IconButton>

        {user && (
          <div className="flex flex-col animate-slideIn">
            <span className="text-[10px] lg:text-xs text-gray-500 uppercase tracking-wider font-semibold">Welcome Back</span>
            <span className="text-sm lg:text-base font-bold gradient-text truncate max-w-[120px] md:max-w-none">{user.name || user.email}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <Link href="/profile" className="hidden md:block">
          <Button 
            variant="text" 
            className='!text-gray-600 !font-semibold hover:!text-primary !text-sm transition-smooth hover:!bg-orange-50 !rounded-lg !px-4 !py-2'
          >
            <MdSettings className="mr-2" size={18} /> Settings
          </Button>
        </Link>
        
        <Divider orientation="vertical" flexItem className='!mx-2 !bg-gray-300 hidden md:block' />

        <button 
          onClick={handleMenuOpen}
          className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 transition-smooth group"
        >
          <Avatar 
            src={"/profile.jpg"} 
            alt="profile" 
            className="!w-10 !h-10 cursor-pointer !border-2 !border-primary shadow-lg transition-smooth group-hover:!scale-110"
            sx={{ 
              background: 'linear-gradient(135deg, #D96F32 0%, #E88A4D 100%)',
              fontWeight: 700
            }}
          >
            {user?.name?.[0] || user?.email?.[0]}
          </Avatar>
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-sm font-bold text-gray-800">{user?.name?.split(' ')[0]}</span>
            <span className="text-xs text-gray-500">Admin</span>
          </div>
        </button>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            elevation: 8,
            sx: {
              mt: 1.5,
              borderRadius: '12px',
              minWidth: 200,
              overflow: 'visible',
              boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
        >
          <Link href="/profile">
            <MenuItem 
              onClick={handleMenuClose} 
              className="gap-3 !py-3 !px-4 hover:!bg-orange-50 transition-smooth"
            >
              <MdPerson size={20} className="text-gray-600" />
              <span className="font-medium">My Profile</span>
            </MenuItem>
          </Link>
          <Divider className="!my-1" />
          <MenuItem 
            onClick={handleLogout} 
            className="!text-red-600 gap-3 !py-3 !px-4 hover:!bg-red-50 transition-smooth"
          >
            <MdLogout size={20} />
            <span className="font-medium">Logout</span>
          </MenuItem>
        </Menu>
      </div>
    </header>
  )
}

export default Header
