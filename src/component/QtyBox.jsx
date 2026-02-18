"use client";
import { Button } from "@mui/material";
import React, { useState, useEffect } from "react";
import { LiaAngleDownSolid } from "react-icons/lia";
import { TfiAngleUp } from "react-icons/tfi";

/**
 * QtyBox
 * - quantity: nilai quantity yang dikontrol dari parent
 * - setQuantity: setter dari parent
 * - max: stok maksimum (opsional). Jika di-set, quantity tidak bisa melebihi max.
 * - disabled: apakah QtyBox dinonaktifkan (opsional)
 */
const QtyBox = ({
  quantity: externalQuantity,
  setQuantity: setExternalQuantity,
  max,
  disabled = false,
}) => {
  const [qtyValue, setQtyValue] = useState(externalQuantity || 1);

  useEffect(() => {
    if (externalQuantity !== undefined) {
      setQtyValue(externalQuantity);
    }
  }, [externalQuantity]);

  const clamp = (value) => {
    let v = Math.max(1, value);
    if (typeof max === "number" && max > 0) {
      v = Math.min(v, max);
    }
    return v;
  };

  const handleChange = (newValue) => {
    const value = clamp(newValue);
    setQtyValue(value);
    if (setExternalQuantity) {
      setExternalQuantity(value);
    }
  };

  const minusQty = () => {
    if (disabled) return;
    if (qtyValue > 1) {
      handleChange(qtyValue - 1);
    }
  };

  const plusQty = () => {
    if (disabled) return;
    if (typeof max === "number" && max > 0 && qtyValue >= max) {
      return;
    }
    handleChange(qtyValue + 1);
  };

  const handleInputChange = (e) => {
    const raw = parseInt(e.target.value, 10);
    if (Number.isNaN(raw)) {
      handleChange(1);
    } else {
      handleChange(raw);
    }
  };

  const maxAttr =
    typeof max === "number" && max > 0 ? { max: max.toString() } : {};

  return (
    <div className={`qtyBox border border-[rgba(0,0,0,0.2)] rounded-md flex items-center gap-1 w-[100px] h-[40px] relative ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <input
        type="number"
        className="border-0 outline-none w-full h-full px-4 text-[14px] text-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed"
        value={qtyValue}
        onChange={handleInputChange}
        min="1"
        disabled={disabled}
        {...maxAttr}
      />
      <div className="flex flex-col absolute top-0 right-0 h-full">
        <Button
          className="!w-[24px] !min-w-[25px] !h-[20px] !text-gray-800"
          onClick={plusQty}
          disabled={disabled}
        >
          <TfiAngleUp size={20} />
        </Button>
        <Button
          className="!w-[24px] !min-w-[25px] !h-[20px] !text-gray-800"
          onClick={minusQty}
          disabled={disabled}
        >
          <LiaAngleDownSolid size={20} />
        </Button>
      </div>
    </div>
  );
};

export default QtyBox;
