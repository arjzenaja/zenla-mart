import React from 'react'
import { IoSearchOutline } from 'react-icons/io5'


const Search = () => {
  return (
    <div className='search bg-[#E6E6E6] w-[600px] h-[50px] rounded-md px-4 relative border border-[rgba(0,0,0,0.1)] hover:border-[rgba(0,0,0,0.3)]'>
      <input type="text" className='w-full h-full outline-none border-0' placeholder='Search for products...'/>
      <button className='w-10 h-10 rounded-full absolute top-[5px] right-2 z-50 flex items-center justify-center cursor-pointer hover:bg-gray-300'>
        <IoSearchOutline size={25}/>
      </button>
    </div>
  )
}

export default Search
