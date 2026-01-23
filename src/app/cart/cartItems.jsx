'use client'
import Link from 'next/link'
import React, { useState } from 'react'
import  Rating  from '@mui/material/Rating'
import { Button } from '@mui/material';
import { IoMdArrowDropdown } from 'react-icons/io';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { IoMdClose } from 'react-icons/io';

const CartItems = () => {

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };


  return (
    <div className="productRow flex items-center gap-5 p-5 border-b-[1px] border-[rgba(0,0,0,0.1)]">
      <Link href={"/product/234232"} className="img w-[15%]">
        <img src={"/taro.png"} alt="image" className="w-full" />
      </Link>

      <div className="info flex p-3 flex-col gap-2 w-[80%]">
        <span className="text-[15px] text-gray-600">Taro</span>
        <Link
          href={"/product/234232"}
          className="text-[18px] text-gray-700 font-[500] hover:text-primary"
        >
          Taro jos
        </Link>
        <Rating name="read-only" value={5} readOnly size="small" />

        <div className="flex items-center gap-5">

          <div className='relative'>
            <Button className='!bg-gray-200 !border !border-[rgba(0,0,0,0.1)] !text-gray-700 !py-[3px] !px-2 !capitalize' onClick={handleClick}>
              Qty: 1
              <IoMdArrowDropdown size={18}/>
            </Button>
            <Menu
              id='qtyDrop'
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              slotProps={{
                list: {
                  'arial-labelledby' : 'basic-button',
                },
              }}
            >
              {Array.from({ length: 15 }).map((_, index)=> ( <MenuItem key={index} onClick={() => handleCloseQty(index + 1)}>{index + 1}</MenuItem>
              ))}
            </Menu>
          </div>

          <div className="flex items-center justify-betwween gap-5">
            <span className="text-[#CB0000] text-[18px] font-[600]">
              $25.99
            </span>
            <span className="text-[#A4A4A4] text-[18px] font-[600] line-through">
              $38.10
            </span>
          </div>

          <span className="text-primary font-bold text-[15px]">14% OFF</span>
        </div>
      </div>


      <IoMdClose size={25} className='cursor-pointer hover:text-primary'/>
    </div>
  );
};

export default CartItems;
