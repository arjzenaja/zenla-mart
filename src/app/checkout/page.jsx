"use client";
import { Button, selectClasses } from "@mui/material";
import React, {useContext} from "react";
import { FiPlus } from "react-icons/fi";
import Radio from "@mui/material/Radio";
import Link from "next/link";
import Image from "next/image";
import { MyContext } from "@/context/ThemeProvider";

const page = () => {

  const context = useContext(MyContext);

  return (
    <section className="bg-gray-100 py-8">
      <div className="container !w-[70%] m-auto flex gap-7">
        <div className="col1 bg-white rounded-md shadow-md w-[70%]">
          <div className="flex item-center justify-between p-5 border-b-[1px] border-[rgba(0,0,0,0.1)]">
            <h2 className="text-[22px] font-[500] text-gray-800">
              Select Delivery Address
            </h2>
            <Button className="!text-primary !border !border-primary !capitalize !font-[600] !px-5" onClick={()=>context.isOpenAddressPanel(true)}>
              <FiPlus size={20} /> Add New Address
            </Button>
          </div>

          <div className="addressSec w-full flex flex-col gap-3 p-5">
            <label className="address border border-[rgba(0,0,0,0.1)] p-4 rounded-md bg-[#f4f4f4] flex gap-5">
              <Radio />

              <div className="info flex flex-col gap-2 pt-2 w-[70%]">
                <span className="text-gray-600 text-[14px]">Home</span>
                <span className="text-gray-800 text-[15px]">Your Name</span>
                <p>
                  Jl. DI Panjaitan No.128, Karangreja, Purwokerto Kidul, Kec.
                  Purwokerto Sel., Kabupaten Banyumas, Jawa Tengah 53141
                </p>
                <span className="text-gray-800 text-[15px]">+621234567890</span>
              </div>

              <div className="btn flex justify-end w-[20%]">
                <div className="ml-auto">
                  <Button
                    variant="text"
                    className="!text-primary !capitalize !font-[600] !px-5"
                  >
                    EDIT
                  </Button>
                </div>
              </div>
            </label>

            <label className="address border border-[rgba(0,0,0,0.1)] p-4 rounded-md bg-[#f4f4f4] flex gap-5">
              <Radio />

              <div className="info flex flex-col gap-2 pt-2 w-[70%]">
                <span className="text-gray-600 text-[14px]">Home</span>
                <span className="text-gray-800 text-[15px]">Your Name</span>
                <p>
                  Jl. DI Panjaitan No.128, Karangreja, Purwokerto Kidul, Kec.
                  Purwokerto Sel., Kabupaten Banyumas, Jawa Tengah 53141
                </p>
                <span className="text-gray-800 text-[15px]">+621234567890</span>
              </div>

              <div className="btn flex justify-end w-[20%]">
                <div className="ml-auto">
                  <Button
                    variant="text"
                    className="!text-primary !capitalize !font-[600] !px-5"
                  >
                    EDIT
                  </Button>
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="col1 w-[30%]">
          <div className="bg-white rounded-md shadow-md w-full">
            <div className="p-5 border-b-[1px] border-[rgba(0,0,0,0.1)]">
              <h2 className="text-[18px] text-gray-700 font-[500]">
                Your Order
              </h2>
            </div>

            <div className="flex items-center justify-between border-b-[1px] border-[rgba(0,0,0,0.1)] py-3 px-5">
              <span className="text-[15px] font-[500] text-gray-700">Product</span>
              <span className="text-[15px] font-[500] text-gray-700">Subtotal</span>
            </div>

            <div className="flex flex-col gap-1 py-4 pt-4 max-h-[300px] overflow-y-scroll">
              <div className="productRow flex items-center gap-2 py-2 px-3">
                <div className="image">
                  <Image src={"/taro.png"} alt="image" width={74} height={64} className="object-cover"/>
                </div>

                <div className="info">
                  <h4 className="text-[14px] font-[500] text-gray-600">taro jos</h4>
                  <span className="text-[14px] font-[500] text-gray-600">Qty: 1</span>
                </div>

                <span className="text-[14px] font-[600] text-gray-600 ml-auto">$99</span>
              </div>

              <div className="productRow flex items-center gap-2 py-2 px-3">
                <div className="image">
                  <Image src={"/taro.png"} alt="image" width={74} height={64} className="object-cover"/>
                </div>

                <div className="info">
                  <h4 className="text-[14px] font-[500] text-gray-600">taro jos</h4>
                  <span className="text-[14px] font-[500] text-gray-600">Qty: 1</span>
                </div>

                <span className="text-[14px] font-[600] text-gray-600 ml-auto">$99</span>
              </div>

              <div className="productRow flex items-center gap-2 py-2 px-3">
                <div className="image">
                  <Image src={"/taro.png"} alt="image" width={74} height={64} className="object-cover"/>
                </div>

                <div className="info">
                  <h4 className="text-[14px] font-[500] text-gray-600">taro jos</h4>
                  <span className="text-[14px] font-[500] text-gray-600">Qty: 1</span>
                </div>

                <span className="text-[14px] font-[600] text-gray-600 ml-auto">$99</span>
              </div>

              <div className="productRow flex items-center gap-2 py-2 px-3">
                <div className="image">
                  <Image src={"/taro.png"} alt="image" width={74} height={64} className="object-cover"/>
                </div>

                <div className="info">
                  <h4 className="text-[14px] font-[500] text-gray-600">taro jos</h4>
                  <span className="text-[14px] font-[500] text-gray-600">Qty: 1</span>
                </div>

                <span className="text-[14px] font-[600] text-gray-600 ml-auto">$99</span>
              </div>

            </div>

            <div className="px-5 flex w-full pb-5 pt-5">
                  <Button className="btn-g w-full">Checkout</Button>
              </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default page;
