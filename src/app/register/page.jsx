"use client";

import { Button, Alert } from "@mui/material";
import Link from "next/link";
import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import Checkbox from '@mui/material/Checkbox';
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";

const label = { slotProps: { input: { 'aria-label': 'Checkbox demo' } } };

const Register = () => {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !email || !password) {
      setError("Name, email, and password are required.");
      return;
    }

    try {
      setLoading(true);

      await authAPI.register({
        name,
        email,
        password,
      });

      setSuccess("Register berhasil. Kode OTP telah dikirim. Silakan cek email Anda.");

      if (typeof window !== "undefined") {
        localStorage.setItem("pendingVerifyEmail", email);
      }

      setTimeout(() => {
        router.push(`/verify?email=${encodeURIComponent(email)}`);
      }, 2000);
      
    } catch (err) {
      setError(err.message || "Register gagal. Silakan coba lagi.");
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
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-scaleIn">
        <div className="card-glass p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-8">
            <div className="bg-white/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3 hover:rotate-6 transition-smooth">
              <img src={"/logo.png"} alt="logo" className="w-[140px] drop-shadow-md"/>
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Join Us Today</h1>
            <p className="text-gray-400 font-medium">Create your Zenla Admin account</p>
          </div>

          <div className="flex flex-col gap-4 mb-6">
            <Button 
               className="!bg-white !text-gray-800 !h-[50px] !rounded-xl !font-bold !normal-case hover:!bg-gray-50 flex items-center justify-center gap-3 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <FcGoogle size={24}/> Sign up with Google
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

          {success && (
            <div className="w-full mb-6 p-4 bg-green-500/10 border border-green-500/30 text-green-200 rounded-xl flex items-center gap-3 animate-fadeIn">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              {success}
            </div>
          )}

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="form-group flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-300 ml-1">Full Name</label>
              <input 
                type="text"
                className="w-full h-[55px] bg-white/5 border border-white/10 rounded-xl px-5 text-white placeholder-gray-500 focus:border-primary focus:bg-white/10 focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-300"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  sx={{
                    color: "rgba(255,255,255,0.5)",
                    '&.Mui-checked': {
                      color: "var(--color-primary)",
                    },
                    padding: 0
                  }}
                  size="small"
                />
                <span className="text-sm text-gray-400 font-medium">Remember me</span>
              </div>

               <Link href={"/forgot-password"} className="text-primary font-bold text-sm hover:text-primary-light transition-colors">
                Forgot Password?
              </Link>
            </div>

            <Button 
              type="submit"
              disabled={loading}
              className="!bg-gradient-to-r !from-primary !to-primary-light !text-white !h-[55px] !rounded-xl !font-bold !text-lg !normal-case hover:!shadow-lg hover:!scale-[1.02] transition-all duration-300 mt-2 shadow-primary/30"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : "Sign Up"}
            </Button>
          </form>

           <div className="mt-8 text-center">
            <p className="text-gray-400 font-medium">
              Already have an account?{" "}
              <Link href="/login" className="text-white font-bold hover:text-primary transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
           <p className="text-gray-500 text-sm">
             &copy; {new Date().getFullYear()} Zenla Admin Panel. All rights reserved.
           </p>
        </div>
      </div>
    </section>
  );
};

export default Register;
