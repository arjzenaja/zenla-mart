# Contoh Implementasi Login dengan Redirect ke Cart

## Cara Mengintegrasikan Redirect Setelah Login

Berikut adalah contoh implementasi di halaman login untuk menggunakan `handleRedirectAfterLogin`:

```jsx
'use client'
import React, { useState } from 'react'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import { FaEye } from 'react-icons/fa'
import { FaEyeSlash } from 'react-icons/fa'
import { Button } from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authAPI } from '@/lib/api'
import { handleRedirectAfterLogin } from '@/utils/redirect'

const Login = () => {
  const router = useRouter();
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validasi input
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      
      // Login user via API
      await authAPI.login(email, password);
      
      // Redirect ke cart (atau path yang disimpan) setelah login berhasil
      // Jika user datang dari "Add to Cart", akan redirect ke /cart
      // Jika tidak, akan redirect ke default path '/'
      handleRedirectAfterLogin(router, '/');
      
    } catch (error) {
      console.error('Login error:', error);
      alert(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='py-10 w-full bg-gray-100 flex items-center justify-center relative overflow-hidden'>
      <div className='container'>
        <form onSubmit={handleLogin} className='bg-white p-10 rounded-md shadow-md w-[500px] m-auto'>
          <h1 className='text-center text-[20px] font-[500] text-gray-800 mb-4'>
            Login to your account
          </h1>

          <div className='my-4 w-full'>
            <TextField 
              id='emailField' 
              label='Email' 
              variant='outlined' 
              className='w-full' 
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className='my-4 w-full relative'>
            <TextField 
              id='passwordField' 
              label='Password' 
              variant='outlined' 
              className='w-full' 
              type={isShowPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <IconButton 
              aria-label='password' 
              size='large' 
              className='!absolute top-[5px] right-0 z-50' 
              onClick={() => setIsShowPassword(!isShowPassword)}
            >
              {isShowPassword ? <FaEyeSlash size={20}/> : <FaEye size={20}/>}
            </IconButton>
          </div>

          <div className='py-1'>
            <Link href={"/forgot-password"} className='text-[16px] font-[500] text-gray-700 hover:text-primary'>
              Forgot Password
            </Link>
          </div>

          <div className='my-4 w-full relative'>
            <Button 
              type='submit'
              className='w-full btn-g !py-4 !text-[16px]'
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </div>

          <div className='text-center text-[15px] text-gray-600 mb-3'>
            <span>
              Not Registered?{' '}
              <Link href={'/register'} className='text-primary hover:text-secondary font-[600]'>
                Sign Up
              </Link>
            </span>
          </div>
        </form>
      </div>
    </section>
  )
}

export default Login
```

## Penjelasan

1. **Import yang Diperlukan**:
   - `handleRedirectAfterLogin` dari `@/utils/redirect`
   - `authAPI` dari `@/lib/api`
   - `useRouter` dari `next/navigation`

2. **Function `handleLogin`**:
   - Memanggil `authAPI.login()` untuk login
   - Setelah login berhasil, memanggil `handleRedirectAfterLogin()`
   - Function ini akan otomatis redirect ke `/cart` jika user datang dari "Add to Cart"
   - Jika tidak ada redirect path yang disimpan, akan redirect ke default path (`'/'`)

3. **Alur Lengkap**:
   - User klik "Add to Cart" → belum login → redirect ke `/login` (path `/cart` disimpan)
   - User login berhasil → `handleRedirectAfterLogin()` dipanggil
   - User otomatis diarahkan ke `/cart`

## Catatan

- Function `handleRedirectAfterLogin()` akan otomatis menghapus redirect path setelah digunakan
- Tidak akan terjadi infinite loop karena path dihapus setelah redirect
- Jika user login langsung (bukan dari "Add to Cart"), akan redirect ke default path
