"use client";
import { Button } from "@mui/material";
import React, { useState } from "react";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Search from "../components/Search";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Checkbox from "@mui/material/Checkbox";
import Image from "next/image";
import Rating from "@mui/material/Rating";
import { RiEdit2Line } from "react-icons/ri";
import { IoEyeOutline } from "react-icons/io5";
import { FaRegTrashAlt } from "react-icons/fa";
import Link from "next/link";

const label = { slotProps: { input: { "aria-label": "Checkbox demo" } } };

const columns = [
  { id: "IMAGE", label: "IMAGE", minWidth: 300 },
  { id: "ACTION", label: "ACTION", minWidth: 100 },
];

const HomeSlides = () => {
  const handleChangeCategory = (event) => {
    setCategory(event.target.value);
  };

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <section className="w-full py-4 px-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] text-gray-700 font-[600]">Home Slide</h2>
        <Link href={'/home-slides/add-home-slide'}>
          <Button className="btn-g" size="20">
            Add Home Slide
          </Button>
        </Link>
      </div>

      <div className="w-full p-4 rounded-md shadow-md bg-white mt-3">

        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>

                <TableCell className="!px-0">
                  <div className="flex items-center gap-3">
                    <div className="img bg-white rounded-md">
                      <Image
                        src="/bannerzenla2.png"
                        alt="product image"
                        width={50}
                        height={70}
                        className="object-cover hover:scale-105 transition-all"
                      />
                    </div>

                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button className="w-[40px]! h-[40px]! min-w-[40px]! rounded-full text-gray-700!">
                      <RiEdit2Line size={20} className="" />
                    </Button>

                    <Button className="w-[40px]! h-[40px]! min-w-[40px]! rounded-full text-gray-700!">
                      <IoEyeOutline size={20} className="" />
                    </Button>

                    <Button className="w-[40px]! h-[40px]! min-w-[40px]! rounded-full text-gray-700!">
                      <FaRegTrashAlt size={20} className="" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </section>
  );
};

export default HomeSlides;
