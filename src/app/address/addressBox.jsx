"use client";
import { Button } from "@mui/material";
import React from "react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

const AddressBox = ({ address, onDelete, onUpdate }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  
  if (!address) return null;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleClose();
    if (onUpdate) {
      onUpdate(address.id);
    }
  };

  const handleDelete = () => {
    handleClose();
    if (onDelete) {
      onDelete(address.id);
    }
  };

  // Determine address type label (you can customize this based on your data structure)
  const addressType = address.addressType || (address.isDefault ? 'Default' : 'Home');

  return (
    <div className={`addressBox w-full p-4 bg-[#fafafa] rounded-md border flex items-center justify-between ${
      address.isDefault ? 'border-primary bg-primary/5' : 'border-[rgba(0,0,0,0.1)]'
    }`}>
      <div className="info w-[80%]">
        <div className="flex items-center gap-2 mb-2">
          <span className={`inline-block text-[14px] p-2 py-1 rounded-md ${
            address.isDefault 
              ? 'bg-primary/20 text-primary font-[600]' 
              : 'bg-gray-200 text-gray-700'
          }`}>
            {address.isDefault ? 'Default' : addressType}
          </span>
        </div>
        <h3 className="py-1 text-[18px] text-gray-700 font-[500]">
          {address.name || 'Recipient Name'}
        </h3>
        <p className="text-[14px] text-gray-600 mb-1">
          {address.phone || 'Phone number'}
        </p>
        <p className="text-[14px] text-gray-600">
          {address.address || 'Street address'}
          {address.city && `, ${address.city}`}
          {address.province && `, ${address.province}`}
          {address.postalCode && ` ${address.postalCode}`}
        </p>
      </div>

      <div className="action relative">
        <Button 
          className="!w-[50px] !h-[50px] !min-w-[50px] !rounded-full !p-0 !text-gray-700" 
          onClick={handleClick}
        >
          <HiOutlineDotsVertical size={25} />
        </Button>

        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          slotProps={{
            list: {
              "aria-labelledby": "basic-button",
            },
          }}
        >
          <MenuItem onClick={handleEdit}>Edit</MenuItem>
          <MenuItem onClick={handleDelete} className="!text-red-600">
            Delete
          </MenuItem>
        </Menu>
      </div>
    </div>
  );
};

export default AddressBox;
