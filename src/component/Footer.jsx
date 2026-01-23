"use client";
import React, { useState, useContext } from "react";
import { LiaShoppingBagSolid } from "react-icons/lia";
import { PiKeyReturnLight } from "react-icons/pi";
import { BsWallet2 } from "react-icons/bs";
import { LiaGiftSolid } from "react-icons/lia";
import { BiSupport } from "react-icons/bi";
import { IoChatboxOutline } from "react-icons/io5";
import Link from "next/link";
import { Button } from "@mui/material";

import { FaFacebookF } from "react-icons/fa6";
import { AiOutlineYoutube } from "react-icons/ai";
import { FaPinterestP } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";

import Drawer from "@mui/material/Drawer";
import { MyContext } from "@/context/ThemeProvider";
import TextField from "@mui/material/TextField";

const Footer = () => {
  const context = useContext(MyContext);

  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  return (
    <>
      <footer className="bg-[#fafafa] py-8 pb-0 mt-5">
        <div className="container">
          <div className="flex items-center justify-center gap-2 py-3 lg:py-8 pb-0 lg:pb-8 px-0 lg:px-5">
            <div className="col flex items-center justify-center flex-col group w-[15%]">
              <LiaShoppingBagSolid className="text-[40px] transition-all duration-300 group-hover:text-primary group-hover:translate-y-1" />
              <h3 className="text-[16px] font-[500] mt-3">Free Shopping</h3>
              <p className="text-[13px] font-[500] text-gray-500">
                For all Orders Over $100
              </p>
            </div>

            <div className="col flex items-center justify-center flex-col group w-[15%]">
              <PiKeyReturnLight className="text-[40px] transition-all duration-300 group-hover:text-primary group-hover:translate-y-1" />
              <h3 className="text-[16px] font-[500] mt-3">30 Days Rerturns</h3>
              <p className="text-[13px] font-[500] text-gray-500">
                For an Exchange Product
              </p>
            </div>

            <div className="col flex items-center justify-center flex-col group w-[15%]">
              <BsWallet2 className="text-[40px] transition-all duration-300 group-hover:text-primary group-hover:translate-y-1" />
              <h3 className="text-[16px] font-[500] mt-3">Secured Payment</h3>
              <p className="text-[13px] font-[500] text-gray-500">
                Payment Cards Accepted
              </p>
            </div>

            <div className="col flex items-center justify-center flex-col group w-[15%]">
              <LiaGiftSolid className="text-[40px] transition-all duration-300 group-hover:text-primary group-hover:translate-y-1" />
              <h3 className="text-[16px] font-[500] mt-3">Special Gift</h3>
              <p className="text-[13px] font-[500] text-gray-500">
                Out First Products Order
              </p>
            </div>

            <div className="col flex items-center justify-center flex-col group w-[15%]">
              <BiSupport className="text-[40px] transition-all duration-300 group-hover:text-primary group-hover:translate-y-1" />
              <h3 className="text-[16px] font-[500] mt-3">Support 24/7</h3>
              <p className="text-[13px] font-[500] text-gray-700">
                Contact us Anytime
              </p>
            </div>
          </div>

          <hr />

          <div className="flex justify-between py-8">
            <div className="col1 w-[20%] flex flex-col gap-4 border-r-[1px] border-[rgba(0,0,0,0.1)]">
              <h3 className="text-[20px] font-[500] text-gray-700">
                Contact Us
              </h3>
              <p className="text-[16px] font-normal">
                Zenla - Mega Super Store
                <br />
                1234 Street Name, City, England
              </p>

              <Link
                href={"mailto:someone@example.com"}
                className="text-gray-700 font-[500] text-[15px] hover:text-primary"
              >
                someone@example.com
              </Link>

              <span className="text-[20px] font-bold text-primary">
                {" "}
                (+62) 123456789
              </span>

              <div className="flex items-center gap-3">
                <IoChatboxOutline className="text-[40px] text-primary" />
                <span className="text-[16px] font-[500] text-gray-700">
                  Online Chat
                  <br />
                  Get Expert Help
                </span>
              </div>
            </div>

            <div className="col2 w-[35%] flex justify-between gap-5 pl-10">
              <div className="box">
                <h3 className="text-[20px] font-[500] text-gray-500">
                  Products
                </h3>
                <ul className="list mt-5">
                  <li className="list-none text-[14px] w-full mb-2">
                    <Link
                      href={"/"}
                      className="link text-[15px] font-[500] text-gray-500 hover:text-primary"
                    >
                      Prices drop
                    </Link>
                  </li>

                  <li className="list-none text-[14px] w-full mb-2">
                    <Link
                      href={"/"}
                      className="link text-[15px] font-[500] text-gray-500 hover:text-primary"
                    >
                      New products
                    </Link>
                  </li>

                  <li className="list-none text-[14px] w-full mb-2">
                    <Link
                      href={"/"}
                      className="link text-[15px] font-[500] text-gray-500 hover:text-primary"
                    >
                      Best sales
                    </Link>
                  </li>

                  <li className="list-none text-[14px] w-full mb-2">
                    <Link
                      href={"/"}
                      className="link text-[15px] font-[500] text-gray-500 hover:text-primary"
                    >
                      Contact us
                    </Link>
                  </li>

                  <li className="list-none text-[14px] w-full mb-2">
                    <Link
                      href={"/"}
                      className="link text-[15px] font-[500] text-gray-500 hover:text-primary"
                    >
                      Sitemap
                    </Link>
                  </li>

                  <li className="list-none text-[14px] w-full mb-2">
                    <Link
                      href={"/"}
                      className="link text-[15px] font-[500] text-gray-500 hover:text-primary"
                    >
                      Stores
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="box">
                <h3 className="text-[20px] font-[500] text-gray-500">
                  Our company
                </h3>
                <ul className="list mt-5">
                  <li className="list-none text-[14px] w-full mb-2">
                    <Link
                      href={"/"}
                      className="link text-[15px] font-[500] text-gray-500 hover:text-primary"
                    >
                      Delivery
                    </Link>
                  </li>

                  <li className="list-none text-[14px] w-full mb-2">
                    <Link
                      href={"/"}
                      className="link text-[15px] font-[500] text-gray-500 hover:text-primary"
                    >
                      Legal Notice
                    </Link>
                  </li>

                  <li className="list-none text-[14px] w-full mb-2">
                    <Link
                      href={"/"}
                      className="link text-[15px] font-[500] text-gray-500 hover:text-primary"
                    >
                      Terms and conditions of use
                    </Link>
                  </li>

                  <li className="list-none text-[14px] w-full mb-2">
                    <Link
                      href={"/"}
                      className="link text-[15px] font-[500] text-gray-500 hover:text-primary"
                    >
                      About us
                    </Link>
                  </li>

                  <li className="list-none text-[14px] w-full mb-2">
                    <Link
                      href={"/"}
                      className="link text-[15px] font-[500] text-gray-500 hover:text-primary"
                    >
                      Secure payment
                    </Link>
                  </li>

                  <li className="list-none text-[14px] w-full mb-2">
                    <Link
                      href={"/"}
                      className="link text-[15px] font-[500] text-gray-500 hover:text-primary"
                    >
                      Login
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col3 w-[45%] pl-20">
              <h3 className="text-[20px] font-[500] text-gray-500">
                Subscribe to newsletter
              </h3>
              <p className="text-[14px] mt-3">
                Subscribe to our latest newsletter to get news about special
                discounts.
              </p>

              <form className="flex flex-col gap-5 w-[500px] mt-5">
                <input
                  type="text"
                  className="w-full h-[40px] bg-white border border-[rgba(0,0,0,0.1)] outline-none rounded-lg px-4"
                  placeholder="Your email address"
                />

                <div className="btn">
                  <Button className="btn-g">Subscribe</Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <hr />

        <div className="bottomStrip py-3">
          <div className="container flex items-center justify-between">
            <div className="socials flex items-center gap-2">
              <Link
                href={"/"}
                className="flex items-center justify-center bg-white rounded-full border border-[rgba(0,0,0,0.1)] w-[30] h-[30] hover:bg-primary hover:text-white group transition"
              >
                <FaFacebookF
                  size={20}
                  className="text-gray-500 group-hover:text-white"
                />
              </Link>

              <Link
                href={"/"}
                className="flex items-center justify-center bg-white rounded-full border border-[rgba(0,0,0,0.1)] w-[30] h-[30] hover:bg-primary hover:text-white group transition"
              >
                <AiOutlineYoutube
                  size={20}
                  className="text-gray-500 group-hover:text-white"
                />
              </Link>

              <Link
                href={"/"}
                className="flex items-center justify-center bg-white rounded-full border border-[rgba(0,0,0,0.1)] w-[30] h-[30] hover:bg-primary hover:text-white group transition"
              >
                <FaPinterestP
                  size={20}
                  className="text-gray-500 group-hover:text-white"
                />
              </Link>

              <Link
                href={"/"}
                className="flex items-center justify-center bg-white rounded-full border border-[rgba(0,0,0,0.1)] w-[30] h-[30] hover:bg-primary hover:text-white group transition"
              >
                <FaInstagram
                  size={20}
                  className="text-gray-500 group-hover:text-white"
                />
              </Link>
            </div>

            <p className="text-center">&copy; Zenla Mart</p>

            <div className="flex item-center gap-1">
              {/* <img src="./qris.jpg" alt="cart" /> */}
              {/* <img src="" alt="cart" />
            <img src="" alt="cart" />
            <img src="" alt="cart" />
            <img src="" alt="cart" /> */}
            </div>
          </div>
        </div>
      </footer>

      <Drawer
        open={context?.isOpenAddressBox}
        onClose={() => context?.isOpenAddressPanel(false)}
        className="addressPanel"
        anchor={"right"}
      >
        <form className="w-[450px] p-5">
          <h3 className="text-[18px] font-[500] text-gray-700">
            Add New Address
          </h3>

          <div className="flex flex-col gap-2 mt-3">
            <div className="form-group w-full">
              <TextField
                label="Address Line 1"
                variant="outlined"
                className=""
              />
            </div>
          </div>
        </form>
      </Drawer>
    </>
  );
};

export default Footer;
