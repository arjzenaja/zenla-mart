'use client'
import { Button, Alert } from "@mui/material";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import Checkbox from "@mui/material/Checkbox";
import OtpBox from "@/component/OtpBox";
import { GoArrowLeft } from "react-icons/go";
import { useRouter, useSearchParams } from "next/navigation";
import { authAPI } from "@/lib/api";

const label = { slotProps: { input: { "aria-label": "Checkbox demo" } } };

const Verify = () => {
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
    <section className="w-full fixed top-0 left-0 z-100 bg-white">
      <img
        src={"/patern1.png"}
        alt="objek"
        className="w-full h-fit object-cover"
      />

      <div className="w-full fixed top-0 left-0 py-3">
        <div className="w-[90%] m-auto flex item-center justify-between">
          <img src={"/logo.png"} alt="logo" width={250} height={250} />

          <div className="flex items-center gap-3">
            <Link href={"/login"}>
              <Button className="bg-gray-100! px-5! py-2! rounded-full! border! border-[rgba(0,0,0,0.1)] text-gray-900! font-[500]">
                SIGN IN
              </Button>
            </Link>
            <Link href={"/register"}>
              <Button className="bg-gray-100! px-5! py-2! rounded-full! border! border-[rgba(0,0,0,0.1)] text-gray-900! font-[500]">
                SIGN UP
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute top-0 left-[20%] z-100 w-[60%] h-fit py-[100px]">
        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-lg shadow-md w-[500px] m-auto">
          <div className="text-center">
            <h1 className="text-center text-[20px] font-[500] text-gray-800 mt-5">
              Verify OTP
            </h1>
            <span className="text-[16px]">
              Kode OTP telah dikirim. Silakan cek email Anda{" "}
              <span className="text-primary font-bold">
                {email || " (email tidak tersedia)"}
              </span>
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
    </section>
  );
};

export default Verify;
