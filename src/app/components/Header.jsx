'use client'
import { Button, Avatar, Divider, Menu, MenuItem, IconButton } from '@mui/material'
import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { MdLogout, MdPerson, MdSettings, MdMenu } from 'react-icons/md'

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
    <header className='w-full h-[70px] bg-white flex items-center justify-between px-6 sticky top-0 z-50 border-b border-gray-100 shadow-sm'>
      {/* Left: Hamburger + Welcome */}
      <div className="flex items-center gap-4">
        {/* Hamburger toggle */}
        <button
          onClick={toggleSidebar}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:border-primary hover:bg-orange-50 text-gray-500 hover:text-primary transition-all duration-200"
          title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <MdMenu size={20} />
        </button>

        {user && (
          <div className="flex flex-col hidden sm:flex">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Welcome back</span>
            <span className="text-sm font-bold text-gray-800 leading-tight">{user.name || user.email}</span>
          </div>
        )}
      </div>

      {/* Right: Settings + Avatar */}
      <div className="flex items-center gap-3">
        <Link href="/profile">
          <Button
            variant="text"
            size="small"
            className='!text-gray-500 !font-medium hover:!text-primary !text-sm !rounded-lg !px-3 !py-1.5 hover:!bg-orange-50 !transition-all'
            startIcon={<MdSettings size={16} />}
          >
            <span className="hidden sm:inline">Settings</span>
          </Button>
        </Link>

        <Divider orientation="vertical" flexItem className='!h-6 !my-auto !mx-1' />

        <button
          onClick={handleMenuOpen}
          className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all duration-200"
        >
          <Avatar
            src={"/profile.jpg"}
            alt="profile"
            className="!w-8 !h-8 !text-sm border-2 !border-primary/30"
            sx={{ background: 'linear-gradient(135deg, #D96F32 0%, #E88A4D 100%)' }}
          >
            {user?.name?.[0] || user?.email?.[0]}
          </Avatar>
          <span className="text-sm font-semibold text-gray-700 hidden sm:block">{user?.name?.split(' ')[0]}</span>
        </button>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            elevation: 0,
            sx: {
              mt: 1,
              borderRadius: '12px',
              border: '1px solid #f3f4f6',
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
              minWidth: 160,
            }
          }}
        >
          <Link href="/profile">
            <MenuItem onClick={handleMenuClose} className="!gap-2 !text-sm !font-medium !text-gray-700 hover:!bg-orange-50 hover:!text-primary !rounded-lg !mx-1">
              <MdPerson size={18} />
              <span>My Profile</span>
            </MenuItem>
          </Link>
          <Divider className="!my-1" />
          <MenuItem onClick={handleLogout} className="!gap-2 !text-sm !font-medium !text-red-500 hover:!bg-red-50 !rounded-lg !mx-1">
            <MdLogout size={18} />
            <span>Logout</span>
          </MenuItem>
        </Menu>
      </div>
    </header>
  )
}

export default Header
