'use client';

import { Button } from "@mui/material";
import Link from "next/link";
import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import Checkbox from '@mui/material/Checkbox';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import { adminAuthAPI } from '@/lib/api';

const label = { slotProps: { input: { 'aria-label': 'Checkbox demo' } } };

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // Redirect to dashboard after successful login
      router.push('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full fixed top-0 left-0 z-100 bg-white min-h-screen">
      <img
        src={"/patern1.png"}
        alt="objek"
        className="w-full h-fit object-cover"
      />

      <div className="w-full fixed top-0 left-0 py-3 z-10">
        <div className="w-[90%] m-auto flex item-center justify-between">
          <img src={"/logo.png"} alt="logo" width={250} height={250}/>

          <div className="flex items-center gap-3">
            <Link href={"/login"}>
              <Button className="bg-gray-100! px-5! py-2! rounded-full! border! border-[rgba(0,0,0,0.1)] text-gray-900! font-[500]">
                SIGN IN
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute top-0 left-[20%] z-100 w-[60%] h-fit py-[100px]">
        <h1 className="text-center text-[40px] font-extrabold w-[70%] m-auto">Welcome Back! Sign in with your credentials</h1>

        <div className="flex items-center justify-center py-3">
          <Button className="bg-gray-100! px-5! py-2! rounded-full! border! border-[rgba(0,0,0,0.1)]! text-gray-900! font-[500] capitalize! gap-2 font-bold!">Sign in with google <FcGoogle size={20}/></Button>
        </div>

        <div className="w-full flex items-center justify-center gap-3 py-3">
          <span className="flex items-center w-[100px] h-[1px] bg-[rgba(0,0,0,0.2)]"></span>
          <span className="text-[10px] lg:text-[14px] font-[500]">Or, Sign in with your email</span>
          <span className="flex items-center w-[100px] h-[1px] bg-[rgba(0,0,0,0.2)]"></span>
        </div>

        <br />

        {error && (
          <div className="w-[50%] m-auto mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form className="w-[50%] m-auto" onSubmit={handleSubmit}>
          <div className="form-group mb-2 flex flex-col gap-1">
            <span className="text-[15px] text-gray-800">Email</span>
            <input 
              type="email" 
              className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] outline-none rounded-sm focus:border-[rgba(0,0,0,0.4)] px-3 text-[14px]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group mb-2 flex flex-col gap-1">
            <span className="text-[15px] text-gray-800">Password</span>
            <input 
              type="password" 
              className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] outline-none rounded-sm focus:border-[rgba(0,0,0,0.4)] px-3 text-[14px]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-0 -ml-[10px]">
              <Checkbox 
                {...label} 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                size="small"
              />
              <span className="text-[15px] text-gray-800">Remember me</span>
            </div>

            <Link href={"/forgot-password"} className="text-primary font-bold text-[15px] hover:text-gray-800">Forgot Password?</Link>
          </div>

          <div className="flex items-center justify-between my-3">
            <span className="text-[15px] text-gray-800">Admin Login Only</span>
          </div>
          
          <Button 
            type="submit"
            className="btn-g !px-7 w-full"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'SIGN IN'}
          </Button>
        </form>
      </div>
    </section>
  );
};

export default Login;
