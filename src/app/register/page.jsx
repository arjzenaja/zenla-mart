'use client'
import React, {useState} from 'react'
import TextField  from '@mui/material/TextField'
import IconButton  from '@mui/material/IconButton'
import { FaEye } from 'react-icons/fa'
import { FaEyeSlash } from 'react-icons/fa'
import { Button } from '@mui/material'
import Link from 'next/link'
import { FcGoogle } from 'react-icons/fc'

const Register = () => {

  const [isShowPassword, setIsShowPassword] = useState(false)

  return (
    <section className='py-10 w-full  bg-gray-100 flex items-center justify-center relative overflow-hidden'>
      <div className='container'>
        <div className='bg-white p-10 rounded-md shadow-md w-[500px] m-auto'>
          <h1 className='text-center text-[20px] font-[500] text-gray-800 mb-4'>Register with a new account</h1>

          <div className='my-3 w-full'>
            <TextField id='fullName' label='Full Name' variant='outlined' className='w-full'/>
          </div>

          <div className='my-4 w-full'>
            <TextField id='emailField' label='Email' variant='outlined' className='w-full' type='email'/>
          </div>

          <div className='my-4 w-full relative'>
            <TextField id='passswordField' label='Paswword' variant='outlined' className='w-full' type={`${isShowPassword === true ? 'text' : 'password'}`}/>

            <IconButton aria-label='password' size='large' className='!absolute top-[5px] right-0 z-50' onClick={()=>setIsShowPassword(!isShowPassword)}>
              {
                isShowPassword === true ? <FaEyeSlash size={20}/> : <FaEye size={20}/>
              }
            </IconButton>
          </div>

          <div className='my-4 w-full relative'>
            <Button className='w-full btn-g !py-4 !text-[16px]'>Register</Button>
          </div>

          <div className='text-center text-[15px] text-gray-600 mb-3'>
            <span>Already have an account? <Link href={'/login'} className='text-primary hover:text-secondary font-[600]'>Login</Link></span>
          </div>

          <div className='text-center text-[15px] text-gray-700 mb-3'>
            Or continue with social account
          </div>

          <Button
            loading={false}
            loadingPosition='end'
            startIcon={<FcGoogle/>}
            variant='outlined'
            size='large'
            className='w-full !bg-gray-200 !text-gray-800 !font-[600] !py-3 !border !border-[rgba(0,0,0,0.1)]'
          >
            SIGN UP WITH GOOGLE
          </Button>
        </div>
      </div>


      <div className='circle1 bg-primary opacity-15 w-[400px] h-[400px] rounded-full absolute -bottom-[100px] -left-[15%]'></div>

      <div className='circle2 bg-primary opacity-15 w-[400px] h-[400px] rounded-full absolute -top-[100px] -right-[15%]'></div>
    </section>
  )
}

export default Register
