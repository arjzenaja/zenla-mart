import { Button } from "@mui/material";
import Link from "next/link";
import React from "react";
import { FcGoogle } from "react-icons/fc";
import Checkbox from '@mui/material/Checkbox';

const label = { slotProps: { input: { 'aria-label': 'Checkbox demo' } } };

const Register = () => {
  return (
    <section className="w-full fixed top-0 left-0 z-100 bg-white">
      <img
        src={"/patern1.png"}
        alt="objek"
        className="w-full h-fit object-cover"
      />

      <div className="w-full fixed top-0 left-0 py-3">
        <div className="w-[90%] m-auto flex item-center justify-between">
          <img src={"/logo.png"} alt="logo" width={250} height={250}/>

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
        <h1 className="text-center text-[40px] font-extrabold w-[80%] m-auto">Join us today! Get special benefits and stay up-to-date.</h1>

        <div className="flex items-center justify-center py-3">
          <Button className="bg-gray-100! px-5! py-2! rounded-full! border! border-[rgba(0,0,0,0.1)]! text-gray-900! font-[500] capitalize! gap-2 font-bold!">Sign in with google <FcGoogle size={20}/></Button>
        </div>

        <div className="w-full flex items-center justify-center gap-3 py-3">
          <span className="flex items-center w-[100px] h-[1px] bg-[rgba(0,0,0,0.2)]"></span>
          <span className="text-[10px] lg:text-[14px] font-[500]">Or, Sign up with your email</span>
          <span className="flex items-center w-[100px] h-[1px] bg-[rgba(0,0,0,0.2)]"></span>
        </div>

        <br />

        <form className="w-[50%] m-auto">
          <div className="form-group mb-2 flex flex-col gap-1">
            <span className="text-[15px] text-gray-800">Name</span>
            <input type="text" className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] outline-none rounded-sm focus:border-[rgba(0,0,0,0.4)] px-3 text-[14px]"/>
          </div>

          <div className="form-group mb-2 flex flex-col gap-1">
            <span className="text-[15px] text-gray-800">Email</span>
            <input type="text" className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] outline-none rounded-sm focus:border-[rgba(0,0,0,0.4)] px-3 text-[14px]"/>
          </div>

          <div className="form-group mb-2 flex flex-col gap-1">
            <span className="text-[15px] text-gray-800">Password</span>
            <input type="password" className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] outline-none rounded-sm focus:border-[rgba(0,0,0,0.4)] px-3 text-[14px]"/>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-0 -ml-[10px]">
              <Checkbox {...label} defaultChecked size="small"/>
              <span className="text-[15px] text-gray-800">Remember me</span>
            </div>

            <Link href={"/forgot-password"} className="text-primary font-bold text-[15px] hover:text-gray-800">Forgot Password?</Link>
          </div>

          <div className="flex items-center justify-between my-3">
            <span className="text-[15px] text-gary-800">Already have an account?</span>

            <Link href={"/login"} className="text-primary font-bold text-[15px] hover:text-gray-800">Sign In</Link>
          </div>
          
          <Button className="btn-g !px-7 w-full">SIGN UP</Button>
        </form>
      </div>
    </section>
  );
};

export default Register;
