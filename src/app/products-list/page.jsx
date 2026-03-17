import React from 'react'
import ProductsComponent from '../components/Products'

const page = () => {
  return (
    <main className="flex-1 bg-gray-50 min-h-screen">
      <div className="p-8 max-w-7xl mx-auto">
        <ProductsComponent isFullPage={true} />
      </div>
    </main>
  )
}

export default page
