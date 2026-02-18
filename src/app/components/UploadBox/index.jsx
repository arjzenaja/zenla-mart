import React from "react";
import { FaRegImages } from "react-icons/fa6";

const UploadBox = ({ onFileSelect }) => {
  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
  };

  return (
    <div className="w-[150px] h-[120px] rounded-md bg-gray-100 p-5 border border-dashed border-[rgba(0,0,0,0.3)] flex items-center justify-center flex-col gap-2 relative">
      <FaRegImages size={40} className="text-gray-400" />
      <span className="text-gray-600 text-[13px]">Image Upload</span>
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="absolute top-0 left-0 w-full h-full z-50 opacity-0 cursor-pointer"
      />
    </div>
  );
};

export default UploadBox;
