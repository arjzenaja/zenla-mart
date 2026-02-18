"use client"
import React, {useState} from 'react'
import TextField  from '@mui/material/TextField'
import IconButton  from '@mui/material/IconButton'
import { FaEye } from 'react-icons/fa'
import { FaEyeSlash } from 'react-icons/fa'
import { Button as MUIButton } from '@mui/material'
import Link from 'next/link'
import { FcGoogle } from 'react-icons/fc'
import { useRouter } from 'next/navigation'
import { authAPI } from '@/lib/api'
import { handleRedirectAfterLogin } from '@/utils/redirect'
import Container from '@/component/ui/Container'
import FormField from '@/component/ui/FormField'
import Button from '@/component/ui/Button'

const Login = () => {
  const router = useRouter()
  const [isShowPassword, setIsShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    
    // Validasi input
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    try {
      setLoading(true)
      
      // Login user via API
      await authAPI.login(email, password)
      
      handleRedirectAfterLogin(router, '/')
      
    } catch (error) {
      console.error('Login error:', error)
      setError(error.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className='page-shell-auth'>
      <Container>
        <form onSubmit={handleLogin} className='page-panel page-panel--narrow'>
          {/* Header */}
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>Welcome Back</h1>
            <p className='text-gray-600'>Sign in to your account to continue shopping</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className='mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md'>
              <p className='text-red-700 text-sm font-medium'>{error}</p>
            </div>
          )}

          {/* Email Field */}
          <FormField label="Email Address" required>
            <TextField
              id='emailField'
              variant='outlined'
              className='w-full'
              type='email'
              placeholder='you@example.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              fullWidth
              size='small'
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  fontSize: '14px',
                  '&:hover fieldset': {
                    borderColor: '#D96F32',
                  },
                }
              }}
            />
          </FormField>

          {/* Password Field */}
          <FormField label="Password" required>
            <div style={{ position: 'relative' }}>
              <TextField
                id='passwordField'
                variant='outlined'
                className='w-full'
                type={isShowPassword ? 'text' : 'password'}
                placeholder='••••••••'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                fullWidth
                size='small'
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    fontSize: '14px',
                    paddingRight: '40px',
                    '&:hover fieldset': {
                      borderColor: '#D96F32',
                    },
                  }
                }}
              />

              <IconButton 
                aria-label='toggle password' 
                size='small' 
                className='!absolute top-1/2 -translate-y-1/2 right-2 z-50 text-gray-600 hover:text-primary' 
                onClick={()=>setIsShowPassword(!isShowPassword)}
                disabled={loading}
              >
                {isShowPassword ? <FaEyeSlash size={18}/> : <FaEye size={18}/>} 
              </IconButton>
            </div>
          </FormField>

          {/* Forgot Password Link */}
          <div className='mb-6 flex justify-end'>
            <Link href={"/forgot-password"} className='text-sm font-medium text-primary hover:text-secondary transition-colors'>
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <div className='mb-6'>
            <Button type='submit' loading={loading} full>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </div>

          {/* Divider */}
          <div className='flex items-center gap-3 mb-6'>
            <div className='flex-1 h-px bg-gray-200'></div>
            <span className='text-sm text-gray-500'>Or continue with</span>
            <div className='flex-1 h-px bg-gray-200'></div>
          </div>

          {/* Google Sign In */}
          <MUIButton
            startIcon={<FcGoogle/>}
            variant='outlined'
            size='large'
            fullWidth
            disabled={loading}
            className='!py-3 !text-gray-700 !font-semibold !border-gray-300 !hover:bg-gray-50 !transition-colors !mb-6'
          >
            Continue with Google
          </MUIButton>

          {/* Sign Up Link */}
          <div className='text-center'>
            <p className='text-gray-600 text-sm'>
              Don't have an account?{' '}
              <Link href={'/register'} className='font-semibold text-primary hover:text-secondary transition-colors'>
                Create one
              </Link>
            </p>
          </div>
        </form>
      </Container>

      {/* Decorative Elements */}
      <div className='circle1 bg-primary opacity-10 w-[400px] h-[400px] rounded-full absolute -bottom-[100px] -left-[15%]'></div>
      <div className='circle2 bg-primary opacity-10 w-[400px] h-[400px] rounded-full absolute -top-[100px] -right-[15%]'></div>
    </section>
  )
}

export default Login
