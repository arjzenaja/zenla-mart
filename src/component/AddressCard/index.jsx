"use client";
import { Button } from "@mui/material";
import React, { useState } from "react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { FiMapPin, FiPhone, FiUser, FiHome, FiBriefcase, FiTag } from "react-icons/fi";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { formatPhoneForDisplay } from "@/utils/phoneValidation";

const MAX_ADDRESS_LENGTH = 80; // Characters before truncating

const AddressCard = ({ address, onEdit, onDelete, onSetDefault, isDefault }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [expanded, setExpanded] = useState(false);
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
    if (onEdit) {
      onEdit(address.id);
    }
  };

  const handleDelete = () => {
    handleClose();
    if (onDelete) {
      onDelete(address.id);
    }
  };

  const handleSetDefault = () => {
    handleClose();
    if (onSetDefault) {
      onSetDefault(address.id);
    }
  };

  // Get label icon
  const getLabelIcon = () => {
    switch (address.label) {
      case 'Office':
        return <FiBriefcase size={16} />;
      case 'Custom':
        return <FiTag size={16} />;
      default:
        return <FiHome size={16} />;
    }
  };

  // Get label color
  const getLabelColor = () => {
    if (isDefault) {
      return 'bg-primary/20 text-primary';
    }
    switch (address.label) {
      case 'Office':
        return 'bg-blue-100 text-blue-700';
      case 'Custom':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  // Format full address
  const fullAddress = [
    address.address,
    address.city,
    address.province,
    address.postalCode
  ].filter(Boolean).join(', ');

  // Check if address needs truncation
  const needsTruncation = fullAddress.length > MAX_ADDRESS_LENGTH;
  const displayAddress = expanded || !needsTruncation 
    ? fullAddress 
    : fullAddress.substring(0, MAX_ADDRESS_LENGTH) + '...';

  // Format phone for display
  const displayPhone = formatPhoneForDisplay(address.phone);

  return (
    <div className={`addressCard w-full p-4 bg-white rounded-lg border-2 transition-all ${
      isDefault 
        ? 'border-primary bg-primary/5 shadow-md' 
        : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className="flex items-start justify-between gap-4">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Label and Default Badge */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md ${getLabelColor()}`}>
              {getLabelIcon()}
              {address.label || 'Home'}
            </span>
            {isDefault && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-primary text-white">
                <FiMapPin size={12} />
                Default
              </span>
            )}
          </div>

          {/* Recipient Name */}
          <div className="flex items-center gap-2 mb-2">
            <FiUser size={16} className="text-gray-400 flex-shrink-0" />
            <h3 className="text-lg font-semibold text-gray-800 truncate">
              {address.name || 'Recipient Name'}
            </h3>
          </div>

          {/* Phone Number */}
          <div className="flex items-center gap-2 mb-2">
            <FiPhone size={16} className="text-gray-400 flex-shrink-0" />
            <p className="text-sm text-gray-600">
              {displayPhone || 'Phone number'}
            </p>
          </div>

          {/* Full Address */}
          <div className="flex items-start gap-2">
            <FiMapPin size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600 leading-relaxed">
                {displayAddress || 'Street address'}
              </p>
              {needsTruncation && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-xs text-primary hover:text-primary/80 font-medium mt-1"
                >
                  {expanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="flex-shrink-0">
          <Button 
            className="!w-10 !h-10 !min-w-[40px] !rounded-full !p-0 !text-gray-600 hover:!bg-gray-100" 
            onClick={handleClick}
            aria-label="Address options"
          >
            <HiOutlineDotsVertical size={20} />
          </Button>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleEdit}>
              <span className="flex items-center gap-2">
                Edit Address
              </span>
            </MenuItem>
            {!isDefault && (
              <MenuItem onClick={handleSetDefault}>
                <span className="flex items-center gap-2">
                  Set as Default
                </span>
              </MenuItem>
            )}
            <MenuItem onClick={handleDelete} className="!text-red-600">
              <span className="flex items-center gap-2">
                Delete Address
              </span>
            </MenuItem>
          </Menu>
        </div>
      </div>
    </div>
  );
};

export default AddressCard;
