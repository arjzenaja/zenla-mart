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

const ForgotPassword = () => {
  const [isShowPassword, setIsShowPassword] = useState(false);

  return (
    <section className="py-20 w-full  bg-gray-100 flex items-center justify-center relative overflow-hidden">
      <div className="container">
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
              <GoArrowLeft size={20}/> Back to Login
            </Link>
          </div>
        </div>
      </div>

      <div className="circle1 bg-primary opacity-15 w-[400px] h-[400px] rounded-full absolute -bottom-[100px] -left-[15%]"></div>

      <div className="circle2 bg-primary opacity-15 w-[400px] h-[400px] rounded-full absolute -top-[100px] -right-[15%]"></div>
    </section>
  );
};

export default ForgotPassword;
