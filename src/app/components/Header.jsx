'use client'
import { Button } from '@mui/material'
import React from 'react'
import Link from 'next/link'
import { useAuth } from './AuthProvider'

const Header = () => {
  const { user, logout } = useAuth()

  return (
    <header className='w-full h-[60px] bg-white shadow-md flex items-center justify-between px-5 sticky top-0 z-50'>
      <div className="flex items-center gap-3">
        {user && (
          <span className="text-sm text-gray-700">
            Welcome, <span className="font-semibold">{user.name || user.email}</span>
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Link href="/profile">
          <Button className='!text-gray-700 !font-medium hover:!text-primary'>
            Profile
          </Button>
        </Link>
        <Button 
          onClick={logout}
          className='!text-gray-700 !font-medium hover:!text-red-600'
        >
          Logout
        </Button>
        <Link href="/profile">
          <Button className='w-[50px]! h-[50px]! min-w-[50px]! rounded-full! p-0! hover:opacity-80'>
            <img src={"/profile.jpg"} alt="profile" className="rounded-full" />
          </Button>
        </Link>
      </div>
    </header>
  )
}

export default Header
