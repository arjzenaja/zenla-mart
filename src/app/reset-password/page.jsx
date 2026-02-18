"use client";
import React, { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { Button as MUIButton, Alert } from "@mui/material";
import Link from "next/link";
import { GoArrowLeft } from "react-icons/go";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";
import Container from '@/component/ui/Container'
import FormField from '@/component/ui/FormField'
import Button from '@/component/ui/Button'

const ResetPassword = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isShowConfirmPassword, setIsShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("resetPasswordEmail");
      const storedOTP = localStorage.getItem("verifiedResetOTP");
      
      if (storedEmail) {
        setEmail(storedEmail);
      } else {
        router.push("/forgot-password");
        return;
      }

      if (storedOTP) {
        setOtp(storedOTP);
      } else {
        router.push("/verify-reset-otp");
      }
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Email not found. Please start over.");
      setTimeout(() => {
        router.push("/forgot-password");
      }, 2000);
      return;
    }

    if (!otp || otp.length !== 6) {
      setError("OTP not found. Please verify OTP first.");
      setTimeout(() => {
        router.push("/verify-reset-otp");
      }, 2000);
      return;
    }

    if (!newPassword) {
      setError("New password is required");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await authAPI.resetPassword(email, otp, newPassword);

      setSuccess("Password updated successfully! Redirecting to login...");

      if (typeof window !== "undefined") {
        localStorage.removeItem("resetPasswordEmail");
        localStorage.removeItem("verifiedResetOTP");
      }

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to reset password. Please ensure OTP is still valid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-shell-auth">
      <Container>
        <form onSubmit={handleSubmit} className="page-panel page-panel--narrow">
          {/* Header */}
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>Reset Password</h1>
            <p className='text-gray-600'>
              Create a new password for{' '}
              <span className='font-semibold text-gray-900'>{email || 'your account'}</span>
            </p>
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

          {/* New Password Field */}
          <FormField label="New Password" required>
            <div style={{ position: 'relative' }}>
              <TextField
                id="newPasswordField"
                placeholder="••••••••"
                variant="outlined"
                className='w-full'
                type={isShowPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
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
                aria-label="toggle password"
                size="small"
                className='!absolute top-1/2 -translate-y-1/2 right-2 z-50 text-gray-600 hover:text-primary'
                onClick={() => setIsShowPassword(!isShowPassword)}
                disabled={loading}
              >
                {isShowPassword === true ? (
                  <FaEyeSlash size={18} />
                ) : (
                  <FaEye size={18} />
                )}
              </IconButton>
            </div>
          </FormField>

          {/* Confirm Password Field */}
          <FormField label="Confirm Password" required>
            <div style={{ position: 'relative' }}>
              <TextField
                id="confirmPasswordField"
                placeholder="••••••••"
                variant="outlined"
                className='w-full'
                type={isShowConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
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
                aria-label="toggle confirm password"
                size="small"
                className='!absolute top-1/2 -translate-y-1/2 right-2 z-50 text-gray-600 hover:text-primary'
                onClick={() => setIsShowConfirmPassword(!isShowConfirmPassword)}
                disabled={loading}
              >
                {isShowConfirmPassword === true ? (
                  <FaEyeSlash size={18} />
                ) : (
                  <FaEye size={18} />
                )}
              </IconButton>
            </div>
          </FormField>

          {/* Password Match Indicator */}
          {newPassword && confirmPassword && (
            <div className='mb-6'>
              {newPassword === confirmPassword ? (
                <div className='p-3 bg-green-50 border-l-4 border-green-500 rounded-md'>
                  <p className='text-green-700 text-sm font-medium'>✓ Passwords match</p>
                </div>
              ) : (
                <div className='p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded-md'>
                  <p className='text-yellow-700 text-sm font-medium'>✗ Passwords do not match</p>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="mb-6">
            <Button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
              full
            >
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </div>

          {/* Back Link */}
          <div className="text-center">
            <Link
              href={"/forgot-password"}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-secondary transition-colors"
            >
              <GoArrowLeft size={16} /> Back to Reset Password
            </Link>
          </div>
        </form>
      </Container>

      {/* Decorative Elements */}
      <div className="circle1 bg-primary opacity-10 w-[400px] h-[400px] rounded-full absolute -bottom-[100px] -left-[15%]"></div>
      <div className="circle2 bg-primary opacity-10 w-[400px] h-[400px] rounded-full absolute -top-[100px] -right-[15%]"></div>
    </section>
  );
};

export default ResetPassword;
