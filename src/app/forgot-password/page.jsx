"use client";
import { Button } from "@mui/material";
import Link from "next/link";
import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import Checkbox from "@mui/material/Checkbox";
import OtpBox from "@/component/OtpBox";
import { GoArrowLeft } from "react-icons/go";
import TextField from "@mui/material/TextField";


const label = { slotProps: { input: { "aria-label": "Checkbox demo" } } };

const ForgotPassword = () => {
  const [otp, setOtp] = useState("");

  const handleChangeOTP = (value) => {
    setOtp(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(otp);
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
        <div className="bg-white p-10 rounded-md shadow-md w-[500px] m-auto">
          <div className="text-center">
            <img src="/forgot-password.png" alt="image" className="m-auto" />
            <h1 className="text-center text-[20px] font-[500] text-gray-800 mb-6 mt-5">
              Forgot Password?
            </h1>
          </div>

          <div className="my-4 w-full">
            <TextField
              id="emailField"
              label="Email"
              variant="outlined"
              className="w-full"
              type="email"
            />
          </div>

          <div className="my-4 w-full relative">
            <Button className="w-full btn-g !py-4 !text-[16px]">Submit</Button>
          </div>

          <div className="text-center flex">
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
