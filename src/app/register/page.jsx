"use client"
import React, { useState } from 'react'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import { FaEye } from 'react-icons/fa'
import { FaEyeSlash } from 'react-icons/fa'
import { Button as MUIButton, Alert } from '@mui/material'
import Link from 'next/link'
import { FcGoogle } from 'react-icons/fc'
import { useRouter } from 'next/navigation'
import { authAPI } from '@/lib/api'
import { signIn } from 'next-auth/react'
import Container from '@/component/ui/Container'
import FormField from '@/component/ui/FormField'
import Button from '@/component/ui/Button'

const Register = () => {
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isShowPassword, setIsShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const getPasswordStrength = (pwd) => {
    if (!pwd) return 0
    if (pwd.length < 6) return 1
    if (pwd.length < 8) return 2
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) return 4
    return 3
  }

  const passwordStrength = getPasswordStrength(password)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!fullName || !email || !password) {
      setError('Please fill all required fields (Full Name, Email, Password).')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    try {
      setLoading(true)

      await authAPI.register({
        name: fullName,
        email,
        password,
      })

      setSuccess('Registration successful! OTP has been sent to your email.')

      if (typeof window !== 'undefined') {
        localStorage.setItem('pendingVerifyEmail', email)
      }

      router.push(`/verify?email=${encodeURIComponent(email)}`)
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className='page-shell-auth'>
      <Container>
        <div className='page-panel page-panel--narrow'>
          {/* Header */}
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>Create Account</h1>
            <p className='text-gray-600'>Join us and start shopping today</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className='mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md'>
              <p className='text-red-700 text-sm font-medium'>{error}</p>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className='mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-md'>
              <p className='text-green-700 text-sm font-medium'>{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Full Name Field */}
            <FormField label="Full Name" required>
              <TextField
                id='fullName'
                placeholder='John Doe'
                variant='outlined'
                className='w-full'
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
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

            {/* Email Field */}
            <FormField label="Email Address" required>
              <TextField
                id='emailField'
                placeholder='you@example.com'
                variant='outlined'
                className='w-full'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
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
                  placeholder='••••••••'
                  variant='outlined'
                  className='w-full'
                  type={isShowPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
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
                  onClick={() => setIsShowPassword(!isShowPassword)}
                  disabled={loading}
                >
                  {isShowPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </IconButton>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className='mt-2 flex items-center gap-2'>
                  <div className='flex gap-1 flex-1'>
                    {[...Array(4)].map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          idx < passwordStrength 
                            ? passwordStrength === 1 ? 'bg-red-500' : passwordStrength === 2 ? 'bg-yellow-500' : passwordStrength === 3 ? 'bg-blue-500' : 'bg-green-500'
                            : 'bg-gray-200'
                        }`}
                      ></div>
                    ))}
                  </div>
                  <span className='text-xs text-gray-600 whitespace-nowrap'>
                    {passwordStrength === 1 ? 'Weak' : passwordStrength === 2 ? 'Fair' : passwordStrength === 3 ? 'Good' : 'Strong'}
                  </span>
                </div>
              )}
            </FormField>

            {/* Submit Button */}
            <div className='mb-6 mt-8'>
              <Button type='submit' loading={loading} full>
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </div>
          </form>

          {/* Divider */}
          <div className='flex items-center gap-3 mb-6'>
            <div className='flex-1 h-px bg-gray-200'></div>
            <span className='text-sm text-gray-500'>Or continue with</span>
            <div className='flex-1 h-px bg-gray-200'></div>
          </div>

          {/* Google Sign Up */}
          <MUIButton
            onClick={() => signIn("google", { callbackUrl: "/" })}
            startIcon={<FcGoogle />}
            variant='outlined'
            size='large'
            fullWidth
            disabled={loading}
            className='!py-3 !text-gray-700 !font-semibold !border-gray-300 !hover:bg-gray-50 !transition-colors !mb-6'
          >
            Continue with Google
          </MUIButton>

          {/* Login Link */}
          <div className='text-center'>
            <p className='text-gray-600 text-sm'>
              Already have an account?{' '}
              <Link href={'/login'} className='font-semibold text-primary hover:text-secondary transition-colors'>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </Container>

      {/* Decorative Elements */}
      <div className='circle1 bg-primary opacity-10 w-[400px] h-[400px] rounded-full absolute -bottom-[100px] -left-[15%]'></div>
      <div className='circle2 bg-primary opacity-10 w-[400px] h-[400px] rounded-full absolute -top-[100px] -right-[15%]'></div>
    </section>
  )
}

export default Register
