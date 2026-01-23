"use client";
import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { Button } from "@mui/material";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { GoArrowLeft } from "react-icons/go"
import OtpBox from "@/component/OtpBox";

const Verify = () => {
  const [otp, setOtp] = useState("");

  const handleChangeOTP = (value) => {
    setOtp(value);
  }

  const handleSubmit=(e)=>{
    e.preventDefault(); 
    alert(otp);
  }

  return (
    <section className="py-20 w-full  bg-gray-100 flex items-center justify-center relative overflow-hidden">
      <div className="container">
        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-lg shadow-md w-[500px] m-auto">
          <div className="text-center">
            <h1 className="text-center text-[20px] font-[500] text-gray-800 mt-5">
              Verify OTP
            </h1>
            <span className="text-[16px]">OTP send to <span className="text-primary font-bold">yourmail@gmail.com</span></span>
          </div>


          <div className="flex items-center justify-center my-4">
            <OtpBox length={6} onChange={handleChangeOTP}/>
          </div>


          <div className="my-4 w-full relative">
            <Button type="submit" className="w-full btn-g !py-4 !text-[16px]">Verify</Button>
          </div>

          <div className="text-center flex">
            <Link
              href={"/login"}
              className="text-center text-[15px] text-primary hover:text-secondary font-[600] flex items-center m-auto gap-1"
            >
              <GoArrowLeft size={20}/> Back to Login
            </Link>
          </div>
        </form>
      </div>

      <div className="circle1 bg-primary opacity-15 w-[400px] h-[400px] rounded-full absolute -bottom-[100px] -left-[15%]"></div>

      <div className="circle2 bg-primary opacity-15 w-[400px] h-[400px] rounded-full absolute -top-[100px] -right-[15%]"></div>
    </section>
  );
};

export default Verify;
