import React from 'react';
import { IoSearchOutline } from "react-icons/io5";

const Search = ({ placeholder, value, onChange, className }) => {
  return ( 
    <div className={`relative flex items-center w-full max-w-md h-12 rounded-lg focus-within:shadow-lg bg-white overflow-hidden border border-gray-200 ${className}`}>
        <div className="grid place-items-center h-full w-12 text-gray-300">
            <IoSearchOutline className="text-xl" />
        </div>

        <input
            className="peer h-full w-full outline-none text-sm text-gray-700 pr-2 bg-transparent placeholder-gray-400"
            type="text"
            id="search"
            placeholder={placeholder || "Search..."}
            value={value}
            onChange={onChange}
        />
    </div>
  );
};

export default Search;
