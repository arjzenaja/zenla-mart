import React from 'react'
import ProductsComponent from '../components/Products'

const page = () => {
  return (
    <main className="flex-1 min-h-screen" style={{
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)'
    }}>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-6 animate-fadeIn">
          <h1 className="text-4xl font-extrabold gradient-text mb-2">Products Management</h1>
          <p className="text-gray-600 text-lg">Manage all your products here</p>
        </div>
        
        <div className="card-premium p-6 animate-scaleIn">
          <ProductsComponent />
        </div>
      </div>
    </main>
  )
}

export default page
