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
    <section className="w-full min-h-screen flex items-center justify-center p-4 relative overflow-hidden" 
      style={{
        background: 'linear-gradient(135deg, #1a1c23 0%, #111827 100%)'
      }}>
      
      {/* Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-scaleIn">
        <div className="card-glass p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-8">
            <div className="bg-white/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3 hover:rotate-6 transition-smooth">
              <img src={"/logo.png"} alt="logo" className="w-[140px] drop-shadow-md"/>
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Welcome Back</h1>
            <p className="text-gray-400 font-medium">Sign in to Zenla Admin Panel</p>
          </div>

          <div className="flex flex-col gap-4 mb-6">
            <Button 
              className="!bg-white !text-gray-800 !h-[50px] !rounded-xl !font-bold !normal-case hover:!bg-gray-50 flex items-center justify-center gap-3 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <FcGoogle size={24}/> Sign in with Google
            </Button>
            
            <div className="flex items-center gap-4 text-gray-500 my-2">
              <div className="h-[1px] bg-gray-700 flex-1"></div>
              <span className="text-sm font-medium text-gray-400">OR</span>
              <div className="h-[1px] bg-gray-700 flex-1"></div>
            </div>
          </div>

          {error && (
            <div className="w-full mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-200 rounded-xl flex items-center gap-3 animate-fadeIn">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              {error}
            </div>
          )}

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="form-group flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-300 ml-1">Email Address</label>
              <input 
                type="email" 
                className="w-full h-[55px] bg-white/5 border border-white/10 rounded-xl px-5 text-white placeholder-gray-500 focus:border-primary focus:bg-white/10 focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-300"
                placeholder="admin@zenlamart.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-300 ml-1">Password</label>
              <input 
                type="password" 
                className="w-full h-[55px] bg-white/5 border border-white/10 rounded-xl px-5 text-white placeholder-gray-500 focus:border-primary focus:bg-white/10 focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-300"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-2">
                <Checkbox 
                  {...label} 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  size="small"
                  sx={{
                    color: "rgba(255,255,255,0.4)",
                    '&.Mui-checked': { color: "#D96F32" },
                  }}
                />
                <span className="text-sm text-gray-400">Remember me</span>
              </div>

              <Link href={"/forgot-password"} className="text-primary font-bold text-sm hover:text-orange-400 transition-colors">
                Forgot Password?
              </Link>
            </div>
            
            <Button 
              type="submit"
              className="!h-[55px] !rounded-xl !text-lg !font-bold !capitalize !text-white !shadow-lg !shadow-primary/30 hover:!shadow-primary/50 hover:!scale-[1.02] active:!scale-[0.98] transition-all duration-300 mt-2"
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #D96F32 0%, #E88A4D 100%)'
              }}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </div>
              ) : 'Sign In to Dashboard'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Protected by reCAPTCHA and subject to the Zenla <span className="text-gray-400 underline cursor-pointer hover:text-white">Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
