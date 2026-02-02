"use client";
import { Button } from "@mui/material";
import React, { useState } from "react";
import { MdDateRange } from "react-icons/md";
import { FaAngleDown } from "react-icons/fa";
import OrderRow from "./tableRow";
import Pagination from "@mui/material/Pagination";
import Search from "../components/Search";

const Orders = () => {
  return (
    <div className="wrapper w-full p-4">
      <div className="bg-white shadow-md rounded-md mb-5 p-5">
        <div className="flex items-center justify-between">
          <div className="info">
            <h1 className="text-[30px] font-[600] text-gray-600">Orders</h1>
            <p className="text-gray-500">
              There is <span className="text-primary font-bold">5</span> orders
            </p>
          </div>
          <Search placeholder="Search Order ..." width="300" />
        </div>

        <div class="overflow-x-auto w-full mt-5 scroll">
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="text-[14px] text-gray-700 font-[600] px-4 py-3 whitespace-nowrap text-left border-b-[1px] border-[rgba(0,0,0,0.1)]"></th>
                <th className="text-[14px] text-gray-700 font-[600] px-4 py-3 whitespace-nowrap text-left">
                  Order Id
                </th>
                <th className="text-[14px] text-gray-700 font-[600] px-4 py-3 whitespace-nowrap text-left">
                  Customer
                </th>
                <th className="text-[14px] text-gray-700 font-[600] px-4 py-3 whitespace-nowrap text-left">
                  Payment Id
                </th>
                <th className="text-[14px] text-gray-700 font-[600] px-4 py-3 whitespace-nowrap text-left">
                  Phone Number
                </th>
                <th className="text-[14px] text-gray-700 font-[600] px-4 py-3 whitespace-nowrap text-left">
                  Address
                </th>
                <th className="text-[14px] text-gray-700 font-[600] px-4 py-3 whitespace-nowrap text-left">
                  Pincode
                </th>
                <th className="text-[14px] text-gray-700 font-[600] px-4 py-3 whitespace-nowrap text-left">
                  Total Amount
                </th>
                <th className="text-[14px] text-gray-700 font-[600] px-4 py-3 whitespace-nowrap text-left">
                  User Id
                </th>
                <th className="text-[14px] text-gray-700 font-[600] px-4 py-3 whitespace-nowrap text-left">
                  Order Status
                </th>
                <th className="text-[14px] text-gray-700 font-[600] px-4 py-3 whitespace-nowrap text-left">
                  Date
                </th>
              </tr>
            </thead>

            <tbody>
              <OrderRow />
              <OrderRow />
              <OrderRow />
              <OrderRow />
              <OrderRow />
              <OrderRow />
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-center py-10">
          <Pagination count={10} showFirstButton showLastButton />
        </div>
      </div>
    </div>
  );
};

export default Orders;
