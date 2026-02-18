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

import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";

const Footer = () => {
  const [phone, setPhone] = useState("");
  const context = useContext(MyContext);

  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  return (
    <>
      <footer className="site-footer mt-6">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <Link href="/" className="flex items-center gap-3 mb-3">
                <LiaShoppingBagSolid size={28} className="text-primary" />
                <span className="text-xl font-semibold">Zenla Mart</span>
              </Link>

              <p className="text-sm">Perum Permata Hamoni Reciden Blok E1 No. 2</p>
              <p className="text-sm">Ledug, Kembaran, Banyumas, Jawa Tengah</p>
              <p className="mt-3 text-sm">zenlamart@gmail.com</p>
              <p className="mt-1 text-sm font-semibold text-primary">(+62) 857-7111-3678</p>
            </div>

            <div className="footer-links">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4>Products</h4>
                  <ul>
                    <li><Link href="/">Prices drop</Link></li>
                    <li><Link href="/">New products</Link></li>
                    <li><Link href="/">Best sales</Link></li>
                  </ul>
                </div>

                <div>
                  <h4>Company</h4>
                  <ul>
                    <li><Link href="/">Delivery</Link></li>
                    <li><Link href="/">Terms &amp; Conditions</Link></li>
                    <li><Link href="/">About us</Link></li>
                    <li><Link href="/">Secure payment</Link></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="newsletter">
              <h4>Subscribe to our newsletter</h4>
              <p className="text-sm mt-2">Get the latest offers and product updates.</p>

              <form className="flex gap-0 mt-4 max-w-md">
                <input aria-label="email" placeholder="Your email address" className="" />
                <Button className="btn-g subscribe-btn">Subscribe</Button>
              </form>

              <div className="mt-5 socials">
                <Link href="/" aria-label="facebook"><FaFacebookF size={16} /></Link>
                <Link href="/" aria-label="youtube"><AiOutlineYoutube size={16} /></Link>
                <Link href="/" aria-label="pinterest"><FaPinterestP size={16} /></Link>
                <Link href="/" aria-label="instagram"><FaInstagram size={16} /></Link>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="text-sm">&copy; {new Date().getFullYear()} Zenla Mart. All rights reserved.</p>
            <div className="text-sm text-gray-500">Designed with care • Built for conversions</div>
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

          <div className="flex flex-col gap-4 mt-3">
            <div className="form-group w-full">
              <TextField
                label="Address Line 1"
                variant="outlined"
                className="w-full"
                size="small"
              />
            </div>

            <div className="form-group w-full">
              <TextField
                label="City"
                variant="outlined"
                className="w-full"
                size="small"
              />
            </div>

            <div className="form-group w-full">
              <TextField
                label="State"
                variant="outlined"
                className="w-full"
                size="small"
              />
            </div>
            <div className="form-group w-full">
              <TextField
                label="Pincode"
                type="number"
                variant="outlined"
                className="w-full"
                size="small"
              />
            </div>

            <div className="form-group w-full">
              <TextField
                label="Country"
                type="text"
                variant="outlined"
                className="w-full"
                size="small"
              />
            </div>

            <div className="form-group w-full">
              <PhoneInput value={phone} onChange={(phone) => setPhone(phone)} />
            </div>

            <div className="form-group w-full">
              <TextField
                label="Landmark"
                type="text"
                variant="outlined"
                className="w-full"
                size="small"
              />
            </div>

            <div className="form-group w-full">
              <FormControl>
                <FormLabel id="demo-row-radio-buttons-group-label">
                  Address Type
                </FormLabel>
                <RadioGroup
                  row
                  aria-labelledby="demo-row-radio-buttons-group-label"
                  name="row-radio-buttons-group"
                >
                  <FormControlLabel
                    value="Home"
                    control={<Radio />}
                    label="Home"
                  />
                  <FormControlLabel
                    value="Office"
                    control={<Radio />}
                    label="Office"
                  />
                </RadioGroup>
              </FormControl>
            </div>

            <div className="form-group w-full">
              <Button className="btn-g w-full">Save</Button>
            </div>
          </div>
        </form>
      </Drawer>
    </>
  );
};

export default Footer;
