'use client'
import React from 'react'
import { useParams } from 'next/navigation'
import ProductDetailsComponent from '@/component/ProductDetails';
import ProductRow from '@/component/ProductRow';
import Container from '@/component/ui/Container'

const ProductDetails = () => {
  const params = useParams();
  const productId = params?.productId;

  return (
    <section className='product-detail-page py-8 md:py-12'>
      <Container>
        <div className='mb-10'>
          <ProductDetailsComponent productId={productId} />
        </div>

        <ProductRow title='Related Products'/>
      </Container>
    </section>
  )
}

export default ProductDetails
