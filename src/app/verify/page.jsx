"use client";
import React, { useEffect, useState } from "react";
import { Button, Alert } from "@mui/material";
import Link from "next/link";
import { GoArrowLeft } from "react-icons/go";
import OtpBox from "@/component/OtpBox";
import { useRouter, useSearchParams } from "next/navigation";
import { authAPI } from "@/lib/api";

import { Suspense } from "react";

const VerifyContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const emailFromQuery = searchParams.get("email");
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    } else if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("pendingVerifyEmail");
      if (storedEmail) {
        setEmail(storedEmail);
      }
    }
  }, [searchParams]);

  const handleChangeOTP = (value) => {
    setOtp(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Email untuk verifikasi tidak ditemukan. Silakan register ulang.");
      return;
    }

    if (!otp || otp.length !== 6) {
      setError("Masukkan kode OTP 6 digit.");
      return;
    }

    try {
      setLoading(true);

      await authAPI.verify(email, otp);

      setSuccess("Verifikasi berhasil. Akun Anda sudah aktif, silakan login.");

      if (typeof window !== "undefined") {
        localStorage.removeItem("pendingVerifyEmail");
      }

      // Redirect ke login setelah sedikit delay
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err) {
      setError(err.message || "Verifikasi gagal. Pastikan OTP benar dan belum kedaluwarsa.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 w-full  bg-gray-100 flex items-center justify-center relative overflow-hidden">
      <div className="container">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-10 rounded-lg shadow-md w-[500px] m-auto"
        >
          <div className="text-center mb-4">
            <h1 className="text-center text-[20px] font-[500] text-gray-800 mt-5 mb-2">
              Verify OTP
            </h1>
            <span className="text-[16px]">
              Kode OTP telah dikirim. Silakan cek email Anda{" "}
              <span className="text-primary font-bold">
                {email || " (email tidak tersedia)"}
              </span>
              .
            </span>
          </div>

          {error && (
            <div className="mb-3">
              <Alert severity="error">{error}</Alert>
            </div>
          )}

          {success && (
            <div className="mb-3">
              <Alert severity="success">{success}</Alert>
            </div>
          )}

          <div className="flex items-center justify-center my-4">
            <OtpBox length={6} onChange={handleChangeOTP} />
          </div>

          <div className="my-4 w-full relative">
            <Button
              type="submit"
              disabled={loading}
              className="w-full btn-g !py-4 !text-[16px]"
            >
              {loading ? "Verifying..." : "Verify"}
            </Button>
          </div>

          <div className="text-center flex">
            <Link
              href={"/login"}
              className="text-center text-[15px] text-primary hover:text-secondary font-[600] flex items-center m-auto gap-1"
            >
              <GoArrowLeft size={20} /> Back to Login
            </Link>
          </div>
        </form>
      </div>

      <div className="circle1 bg-primary opacity-15 w-[400px] h-[400px] rounded-full absolute -bottom-[100px] -left-[15%]"></div>

      <div className="circle2 bg-primary opacity-15 w-[400px] h-[400px] rounded-full absolute -top-[100px] -right-[15%]"></div>
    </section>
  );
};

const Verify = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
};

export default Verify;
