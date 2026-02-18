"use client";
import React, { useEffect, useState } from "react";
import { Button, Alert } from "@mui/material";
import Link from "next/link";
import { GoArrowLeft } from "react-icons/go";
import OtpBox from "@/component/OtpBox";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";

const VerifyResetOTP = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Ambil email dari localStorage
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("resetPasswordEmail");
      if (storedEmail) {
        setEmail(storedEmail);
      } else {
        // Jika tidak ada email, redirect ke forgot-password
        router.push("/forgot-password");
      }
    }
  }, [router]);

  const handleChangeOTP = (value) => {
    setOtp(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Email tidak ditemukan. Silakan mulai dari awal.");
      setTimeout(() => {
        router.push("/forgot-password");
      }, 2000);
      return;
    }

    if (!otp || otp.length !== 6) {
      setError("Masukkan kode OTP 6 digit.");
      return;
    }

    try {
      setLoading(true);

      await authAPI.verifyResetOTP(email, otp);

      // Simpan OTP yang sudah verified untuk digunakan di halaman reset password
      if (typeof window !== "undefined") {
        localStorage.setItem("verifiedResetOTP", otp);
      }

      setSuccess("OTP valid, silakan lanjutkan reset password");

      // Redirect ke halaman reset password setelah sedikit delay
      setTimeout(() => {
        router.push("/reset-password");
      }, 1500);
    } catch (err) {
      setError(err.message || "OTP salah atau sudah kedaluwarsa. Silakan coba lagi.");
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
              Verifikasi OTP Reset Password
            </h1>
            <span className="text-[16px]">
              Kode OTP telah dikirim ke email{" "}
              <span className="text-primary font-bold">
                {email || " (email tidak tersedia)"}
              </span>
              . Silakan cek terminal server untuk melihat OTP (mode development).
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
              {loading ? "Memverifikasi..." : "Verifikasi OTP"}
            </Button>
          </div>

          <div className="text-center flex">
            <Link
              href={"/forgot-password"}
              className="text-center text-[15px] text-primary hover:text-secondary font-[600] flex items-center m-auto gap-1"
            >
              <GoArrowLeft size={20} /> Kembali
            </Link>
          </div>
        </form>
      </div>

      <div className="circle1 bg-primary opacity-15 w-[400px] h-[400px] rounded-full absolute -bottom-[100px] -left-[15%]"></div>

      <div className="circle2 bg-primary opacity-15 w-[400px] h-[400px] rounded-full absolute -top-[100px] -right-[15%]"></div>
    </section>
  );
};

export default VerifyResetOTP;
