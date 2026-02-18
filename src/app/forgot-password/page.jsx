"use client";
import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import { Button as MUIButton } from "@mui/material";
import { Alert } from "@mui/material";
import Link from "next/link";
import { GoArrowLeft } from "react-icons/go";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";
import Container from '@/component/ui/Container'
import FormField from '@/component/ui/FormField'
import Button from '@/component/ui/Button'

const ForgotPassword = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Email harus diisi");
      return;
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Format email tidak valid");
      return;
    }

    try {
      setLoading(true);
      
      await authAPI.forgotPassword(email);
      
      setSuccess("Jika email terdaftar, instruksi reset password telah dikirim");
      
      // Simpan email untuk step berikutnya
      if (typeof window !== "undefined") {
        localStorage.setItem("resetPasswordEmail", email);
      }

      // Redirect ke halaman verify OTP setelah sedikit delay
      setTimeout(() => {
        router.push("/verify-reset-otp");
      }, 1500);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 w-full bg-gray-100 flex items-center justify-center relative overflow-hidden">
      <Container>
        <form onSubmit={handleSubmit} className="card w-[500px] m-auto max-w-full">
          <div className="text-center">
            <img src="/forgot-password.png" alt="image" className="m-auto" />
            <h1 className="text-center text-[20px] font-[500] text-gray-800 mb-6 mt-5">
              Forgot Password?
            </h1>
            <p className="text-[14px] text-gray-600 mb-4">
              Masukkan email Anda untuk menerima kode OTP reset password
            </p>
          </div>

          {error && (
            <div className="mb-4">
              <Alert severity="error">{error}</Alert>
            </div>
          )}

          {success && (
            <div className="mb-4">
              <Alert severity="success">{success}</Alert>
            </div>
          )}

          <FormField label="Email" required>
            <TextField
              id="emailField"
              variant="outlined"
              className="w-full input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </FormField>

          <div className="my-4 w-full relative">
            <Button type="submit" loading={loading} full>
              {loading ? "Mengirim..." : "Kirim OTP"}
            </Button>
          </div>

          <div className="text-center flex">
            <Link
              href={'/login'}
              className="text-center text-[15px] text-primary hover:text-secondary font-[600] flex items-center m-auto gap-1"
            >
              <GoArrowLeft size={20}/> Back to Login
            </Link>
          </div>
        </form>
      </Container>

      <div className="circle1 bg-primary opacity-15 w-[400px] h-[400px] rounded-full absolute -bottom-[100px] -left-[15%]"></div>

      <div className="circle2 bg-primary opacity-15 w-[400px] h-[400px] rounded-full absolute -top-[100px] -right-[15%]"></div>
    </section>
  );
};

export default ForgotPassword;
