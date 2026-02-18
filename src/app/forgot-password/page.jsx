"use client";
import { Button } from "@mui/material";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { GoArrowLeft } from "react-icons/go";
import TextField from "@mui/material/TextField";
import OtpBox from "@/component/OtpBox";
import { authAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Alert } from "@mui/material";

const ForgotPassword = () => {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: reset password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Debug: Log step changes
  useEffect(() => {
    console.log('📊 Step changed to:', step);
  }, [step]);

  const handleChangeOTP = (value) => {
    setOtp(value);
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔵 handleRequestOTP called', { email, emailLength: email?.length });
    
    if (!email || !email.trim()) {
      console.log('❌ Email kosong');
      setError("Email harus diisi");
      return;
    }

    console.log('✅ Email valid, proceeding...');
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      console.log('📡 Calling API forgotPassword...', email);
      const response = await authAPI.forgotPassword(email.trim());
      console.log('✅ API Response:', response);
      setSuccess(response.message || "Jika email terdaftar, instruksi reset password telah dikirim");
      setTimeout(() => {
        setStep(2);
      }, 500);
    } catch (err) {
      console.error('❌ API Error:', err);
      setError(err.message || "Terjadi kesalahan saat mengirim OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (otp.length !== 6) {
      setError("OTP harus 6 digit");
      return;
    }

    setLoading(true);

    try {
      await authAPI.verifyResetOTP(email, otp);
      setSuccess("OTP valid, silakan masukkan password baru");
      setStep(3);
    } catch (err) {
      setError(err.message || "OTP tidak valid atau telah expired");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok");
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword(email, otp, newPassword);
      setSuccess("Password berhasil diperbarui");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError(err.message || "Gagal memperbarui password");
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

      <div className="absolute top-0 left-[20%] z-100 w-[60%] h-fit py-[100px]" style={{ zIndex: 100 }}>
        <div className="bg-white p-10 rounded-md shadow-md w-[500px] m-auto" style={{ position: 'relative', zIndex: 100 }}>
          <div className="text-center">
            <img src="/forgot-password.png" alt="image" className="m-auto" />
            <h1 className="text-center text-[20px] font-[500] text-gray-800 mb-6 mt-5">
              {step === 1 && "Forgot Password?"}
              {step === 2 && "Verifikasi OTP"}
              {step === 3 && "Reset Password"}
            </h1>
          </div>

          {error && (
            <Alert 
              severity="error" 
              className="mb-4 !rounded-md" 
              onClose={() => setError('')}
              sx={{ 
                '& .MuiAlert-message': { fontSize: '14px' },
                '& .MuiAlert-icon': { fontSize: '20px' }
              }}
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert 
              severity="success" 
              className="mb-4 !rounded-md" 
              onClose={() => setSuccess('')}
              sx={{ 
                '& .MuiAlert-message': { fontSize: '14px' },
                '& .MuiAlert-icon': { fontSize: '20px' }
              }}
            >
              {success}
            </Alert>
          )}

          {/* Step 1: Request OTP */}
          {step === 1 && (
            <div>
              <div className="my-4 w-full">
                <TextField
                  id="emailField"
                  label="Email"
                  variant="outlined"
                  className="w-full"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="my-4 w-full relative">
                <Button 
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log('🔘 Button SUBMIT clicked!', { email, loading });
                    
                    if (!email || !email.trim()) {
                      setError("Email harus diisi");
                      return;
                    }

                    if (loading) {
                      console.log('⚠️ Already loading, ignoring click');
                      return;
                    }

                    setError("");
                    setSuccess("");
                    setLoading(true);

                    try {
                      console.log('📡 Calling API forgotPassword...', email);
                      const response = await authAPI.forgotPassword(email.trim());
                      console.log('✅ API Response:', response);
                      
                      // Set success message
                      const successMsg = response.message || response.data?.message || "Jika email terdaftar, instruksi reset password telah dikirim";
                      setSuccess(successMsg);
                      setError(""); // Clear any previous errors
                      
                      // Pindah ke step 2 (verifikasi OTP) langsung
                      console.log('🔄 Moving to step 2... Current step:', step);
                      setStep(2);
                      console.log('✅ Step set to 2');
                    } catch (err) {
                      console.error('❌ API Error:', err);
                      setError(err.message || "Terjadi kesalahan saat mengirim OTP");
                      setStep(1); // Tetap di step 1 jika error
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="w-full btn-g !py-4 !text-[16px]"
                  disabled={loading || !email.trim()}
                >
                  {loading ? "Mengirim..." : "Kirim OTP"}
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Verify OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP}>
              <div className="my-4 w-full">
                <p className="text-[14px] text-gray-600 mb-4 text-center">
                  Masukkan kode OTP yang telah dikirim ke email <strong>{email}</strong>
                </p>
                <OtpBox length={6} onChange={handleChangeOTP} />
              </div>

              <div className="my-4 w-full relative">
                <button 
                  type="submit"
                  className="w-full btn-g !py-4 !text-[16px]"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? "Memverifikasi..." : "Verifikasi OTP"}
                </button>
              </div>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp("");
                    setError("");
                    setSuccess("");
                  }}
                  className="text-[14px] text-primary hover:text-secondary font-[600]"
                >
                  Kirim ulang OTP
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Reset Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword}>
              <div className="my-4 w-full">
                <TextField
                  id="newPasswordField"
                  label="Password Baru"
                  variant="outlined"
                  className="w-full"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="my-4 w-full">
                <TextField
                  id="confirmPasswordField"
                  label="Konfirmasi Password"
                  variant="outlined"
                  className="w-full"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="my-4 w-full relative">
                <button 
                  type="submit"
                  className="w-full btn-g !py-4 !text-[16px]"
                  disabled={loading}
                >
                  {loading ? "Memperbarui..." : "Reset Password"}
                </button>
              </div>
            </form>
          )}

          <div className="text-center flex mt-6">
            <Link
              href={"/login"}
              className="text-center text-[15px] text-primary hover:text-secondary font-[600] flex items-center m-auto gap-1"
            >
              <GoArrowLeft size={20} /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;
