import React, { useState } from "react";
import { Button } from "@mui/material";
import { MdDateRange } from "react-icons/md";
import { FaAngleDown } from "react-icons/fa";

import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormHelperText from "@mui/material/FormHelperText";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

const OrderRow = () => {
  const [expendIndex, setExpendIndex] = useState(false);

  const [orderStatus, setOrderStatus] = React.useState('Confrim');

  const handleChange = (event) => {
    setOrderStatus(event.target.value);
  };

  return (
    <>
      <tr className="border-b-[1px] border-[rgba(0,0,0,0.1)] hover:bg-sky-100">
        <td className="text-[14px] text-gray-700 px-4 py-2 font-bold">
          <Button
            className="!min-w-[40px] !h-[40px] !w-[40px] !rounded-full !text-gray-500 !bg-gray-100 hover:!bg-gray-200"
            onClick={() => setExpendIndex(!expendIndex)}
          >
            <FaAngleDown
              size={25}
              className={`transition-all ${expendIndex === true && "rotate-180"}`}
            />
          </Button>
        </td>
        <td className="text-[14px] text-gray-700 px-4 py-2 font-bold">#5413</td>
        <td className="text-[14px] text-gray-700 font-[500] px-4 py-2">
          <div className="flex items-center gap-3 w-[300px]">
            <div className="rounded-cicle w-[50px] h-[50px] overflow-hidden">
              <img src={"/profile.jpg"} alt="iamge" />
            </div>

            <div className="info flex flex-col gap-0">
              <span className="text-gray-600 text-[14px]">Your name</span>
              <span className="text-gray-500 text-[14px]">
                youremail@gmail.com
              </span>
            </div>
          </div>
        </td>
        <td className="text-[14px] text-gray-700 font-[500] px-4 py-2 whitespace-nowrap">
          pay_541231231
        </td>
        <td className="text-[14px] text-gray-700 font-[500] px-4 py-2 whitespace-nowrap">
          +62 81234567
        </td>
        <td className="text-[14px] text-gray-700 font-[500] px-4 py-2">
          <div className="w-[350px] py-3">
            <span className="bg-gray-100 rounded-md px-2 py-1 border border-[rgba(0,0,0,0.1)]">
              Home
            </span>
            <p className="pt-2">
              Jl. DI Panjaitan No.128, Karangreja, Purwokerto Kidul, Kec.
              Purwokerto Sel., Kabupaten Banyumas, Jawa Tengah 53141
            </p>
          </div>
        </td>
        <td className="text-[14px] text-gray-700 font-[500] px-4 py-2">
          53141
        </td>
        <td className="text-[14px] text-gray-700 font-[500] px-4 py-2">$540</td>
        <td className="text-[14px] text-gray-700 font-[500] px-4 py-2 whitespace-nowrap text-primary font-bold">
          youruserid
        </td>
        <td className="text-[14px] text-gray-700 font-[500] px-4 py-2">
          <Select
            value={orderStatus}
            onChange={handleChange}
            displayEmpty
            inputProps={{ "aria-label": "Without label" }}
            size="small"
          >
            <MenuItem value={"Confrim"}>Confrim</MenuItem>
            <MenuItem value={"Ordered"}>Ordered</MenuItem>
            <MenuItem value={"Delivered"}>Delivered</MenuItem>
          </Select>
        </td>
        <td className="text-[14px] text-gray-700 font-[500] px-4 py-2 whitespace-nowrap">
          <div className="flex items-center gap-1">
            <MdDateRange size={20} /> 2026-1-26
          </div>
        </td>
      </tr>

      {expendIndex === true && (
        <tr className="bg-gray-100">
          <td colSpan={3} className="p-5">
            <div className="flex items-center gap-3">
              <div className="img rounded-md overflow-hidden w-[80px] h-[80px]">
                <img
                  src={
                    "https://kliktobuy.com/wp-content/uploads/2023/09/nabati-siip-bites-roasted-corn-50-gr_8993175538909.jpg"
                  }
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="info flex flex-col">
                <h2 className="text-gray-900 text-[15px] font-[500]">
                  Siip Nabati
                </h2>
                <span className="text-gray-600 text-[13px] font-[500]">
                  Snacks
                </span>
                <span className="text-gray-600 text-[13px] font-[500]">
                  Unit Price: $5.00
                </span>
              </div>
            </div>
          </td>
          <td colSpan={1} className="p-5">
            X2
          </td>
          <td colSpan={1} className="p-5">
            <span className="text-gray-950 font-[500]">$10.00</span>
          </td>
          <td colSpan={1} className="p-5"></td>
          <td colSpan={1} className="p-5"></td>
          <td colSpan={1} className="p-5"></td>
          <td colSpan={1} className="p-5"></td>
          <td colSpan={1} className="p-5"></td>
          <td colSpan={1} className="p-5"></td>
        </tr>
      )}
    </>
  );
};

export default OrderRow;
