import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IoSearchOutline } from 'react-icons/io5'


const Search = (props) => {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const handleSearch = () => {
    const trimmed = query.trim()
    if (!trimmed) return
    router.push(`/products?search=${encodeURIComponent(trimmed)}`)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  return (
    <div className='search bg-gray-100 w-full h-[48px] rounded-lg px-4 py-2 relative border-2 border-transparent hover:border-primary/30 focus-within:border-primary transition-all duration-300 flex items-center gap-2'>
      <IoSearchOutline size={20} className='text-gray-500'/>
      <input
        type="text"
        className='w-full h-full outline-none border-0 bg-transparent text-[14px] text-gray-700 placeholder-gray-500'
        placeholder={props.placeholder || 'Cari produk...'}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      {query && (
        <button
          type="button"
          className='w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-700'
          onClick={() => setQuery('')}
          title="Clear search"
        >
          ✕
        </button>
      )}
      <button
        type="button"
        className='w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-all hover:shadow-md active:scale-95'
        onClick={handleSearch}
        title="Search"
      >
        <IoSearchOutline size={18}/>
      </button>
    </div>
  )
}

export default Search
