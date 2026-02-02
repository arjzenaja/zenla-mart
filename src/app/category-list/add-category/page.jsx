import UploadBox from "@/app/components/UploadBox";
import React from "react";
import { IoMdClose } from "react-icons/io";

const AddSlide = () => {
  return (
    <section className="w-full py-3 px-5">
      <h2 className="text-[18px] text-gray-700 font-[600]">Add Category</h2>
      <form className="mt-5 bg-white p-5 sahdow-md rounded-md">
        <div className="form-group mb-4 flex flex-col gap-1">
            <span className="text-[15px] text-gray-800">Category Name</span>
            <input
              type="text"
              className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] outline-none rounded-b-sm focus:border-[rgba(0,0,0,0.4)] px-4"
            />
          </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-[16px] text-gray-700 font-[600]">
            Media & Images
          </h2>

          <div className="flex items-center gap-4 mt-3">
            <div className="w-[150px] h-[120px] rounded-md bg-gray-100 p-5 border border-dashed border-[rgba(0,0,0,0.3)] flex items-center justify-center flex-col gap-2 relative">
              <img
                src="/cat1.png"
                className="w-full h-full object-cover"
              />

              <span className="flex items-center justify-center bg-red-700 rounded-full w-6 h-6 absolute -top-[8px] -right-[8px] cursor-pointer">
                <IoMdClose size={20} className="text-white" />
              </span>
            </div>

            <UploadBox />
          </div>
        </div>
      </form>
    </section>
  );
};

export default AddSlide;
