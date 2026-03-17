'use client'
import React, { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { Button as MUIButton } from '@mui/material'
import Link from 'next/link'
import Image from 'next/image'
import { ordersAPI } from '@/lib/api'
import { isAuthenticated } from '@/utils/auth'
import { formatCurrency } from '@/utils/formatCurrency'
import { FiCheckCircle, FiClock, FiPackage, FiTruck, FiHome, FiPhone, FiMapPin, FiArrowLeft, FiUser } from 'react-icons/fi'
import OrderStatusStepper from '@/component/OrderStatusStepper'
import Container from '@/component/ui/Container'
import Button from '@/component/ui/Button'
import Skeleton from '@/component/ui/Skeleton'

const OrderDetailPage = () => {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const orderId = params?.orderId
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copyState, setCopyState] = useState(false)

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }

    if (orderId) {
      fetchOrder()
    }
  }, [orderId, router])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await ordersAPI.getById(orderId)
      const orderData = response.order || response
      
      if (orderData) {
        setOrder(orderData)
      } else {
        setError('Order not found')
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      setError(error.message || 'Failed to load order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'ready_for_pickup':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'delivered':
      case 'picked_up':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <FiClock className="text-yellow-600" size={20} />
      case 'processing':
        return <FiPackage className="text-blue-600" size={20} />
      case 'shipped':
        return <FiTruck className="text-purple-600" size={20} />
      case 'ready_for_pickup':
        return <FiHome className="text-indigo-600" size={20} />
      case 'delivered':
      case 'picked_up':
        return <FiCheckCircle className="text-green-600" size={20} />
      default:
        return <FiClock className="text-gray-600" size={20} />
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPaymentDescription = () => {
    const method = (order?.paymentMethod || '').toLowerCase()
    const status = (order?.paymentStatus || '').toLowerCase()

    if (method === 'cod' || method === 'cash on delivery' || method === 'cash') {
      return {
        title: 'Bayar di Tempat (COD)',
        description:
          'Silakan siapkan uang tunai yang cukup. Pembayaran dilakukan langsung kepada kurir saat pesanan diterima.',
      }
    }

    if (status === 'pending') {
      return {
        title: 'Menunggu Pembayaran',
        description:
          'Segera selesaikan pembayaran sesuai instruksi yang dikirimkan agar pesanan tidak dibatalkan otomatis.',
      }
    }

    if (status === 'paid') {
      return {
        title: 'Pembayaran Berhasil',
        description:
          'Pembayaran Anda sudah kami terima. Pesanan sedang diproses oleh penjual dan akan segera dikirim.',
      }
    }

    return {
      title: 'Status Pembayaran',
      description: 'Status pembayaran pesanan Anda dapat dipantau pada detail ini.',
    }
  }


  const handleCopyOrderId = async () => {
    try {
      const idToCopy = order?.orderNumber || order?.id
      if (!idToCopy || typeof navigator === 'undefined' || !navigator.clipboard) return
      await navigator.clipboard.writeText(idToCopy)
      setCopyState(true)
      setTimeout(() => setCopyState(false), 2000)
    } catch (err) {
      console.error('Failed to copy order id', err)
    }
  }

  if (loading) {
    return (
      <section className="bg-gray-100 py-8 min-h-screen">
        <Container>
          <div className="card">
            <Skeleton height="20px" width="40%" style={{ marginBottom: 8 }} />
            <Skeleton height="14px" width="60%" style={{ marginBottom: 12 }} />
            <Skeleton height="220px" width="100%" />
          </div>
        </Container>
      </section>
    )
  }

  if (error || !order) {
    return (
      <section className="bg-gray-100 py-8 min-h-screen">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-md shadow-md p-6 text-center">
              <div className="mb-4">
                <svg className="h-16 w-16 text-red-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-[24px] font-[600] text-gray-800 mb-2">Order Not Found</h2>
              <p className="text-gray-600 mb-6">{error || 'The order you are looking for does not exist.'}</p>
              <Link href="/my-orders" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-[600] transition-colors group">
                <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
                Back to My Orders
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const showSuccess = searchParams?.get('success') === 'true'
  const paymentInfo = getPaymentDescription()

  return (
    <section className="bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 py-8 min-h-screen">
      <style jsx>{`
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        .animate-slide-in-down {
          animation: slideInDown 0.6s ease-out;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }
        .animate-fade-in-up-delay-1 {
          animation: fadeInUp 0.6s ease-out 0.1s both;
        }
        .animate-fade-in-up-delay-2 {
          animation: fadeInUp 0.6s ease-out 0.2s both;
        }
        .animate-fade-in-up-delay-3 {
          animation: fadeInUp 0.6s ease-out 0.3s both;
        }
        .sparkle {
          animation: sparkle 1.5s ease-in-out infinite;
        }
      `}</style>
      
      <div className="container">
        <div className="max-w-5xl mx-auto">
          {/* Success Message */}
          {showSuccess && (
            <div className="mb-6 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-300 p-6 rounded-2xl shadow-xl animate-slide-in-down relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-300/20 to-transparent rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-300/20 to-transparent rounded-full blur-xl" />
              
              {/* Sparkle Effects */}
              <div className="absolute top-4 right-8 w-2 h-2 bg-yellow-400 rounded-full sparkle" style={{ animationDelay: '0s' }} />
              <div className="absolute top-8 right-16 w-1.5 h-1.5 bg-green-400 rounded-full sparkle" style={{ animationDelay: '0.3s' }} />
              <div className="absolute top-6 right-24 w-1 h-1 bg-emerald-400 rounded-full sparkle" style={{ animationDelay: '0.6s' }} />
              
              <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-start">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-400 rounded-full blur-md opacity-50 animate-pulse" />
                    <FiCheckCircle className="text-green-600 mr-4 mt-1 relative" size={32} />
                  </div>
                  <div>
                    <h3 className="text-green-900 font-[700] text-[20px] mb-2 flex items-center gap-2">
                      Pesanan kamu berhasil dibuat! 
                      <span className="text-2xl">🎉</span>
                    </h3>
                    <p className="text-green-800 text-[15px] leading-relaxed mb-4">
                      Kami sudah menerima pesananmu dan segera memprosesnya. Simpan nomor pesanan di bawah
                      untuk keperluan pelacakan atau jika perlu bantuan.
                    </p>
                    <div className="flex flex-wrap gap-3 items-center">
                      <span className="text-[14px] font-[600] text-green-900">Nomor Pesanan:</span>
                      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border-2 border-green-300 rounded-lg px-4 py-2 shadow-md hover:shadow-lg transition-shadow">
                        <span className="font-mono text-[14px] font-[600] text-green-900">
                          {order.orderNumber || order.id}
                        </span>
                        <Button
                          size="small"
                          onClick={handleCopyOrderId}
                          className="!normal-case !text-xs !py-1.5 !px-3 !bg-green-600 !text-white hover:!bg-green-700 !rounded-md !shadow-sm hover:!shadow-md !transition-all"
                        >
                          {copyState ? '✓ Tersalin' : 'Salin'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-xl px-5 py-4 border-2 border-green-200 max-w-xs shadow-lg">
                  <p className="text-[13px] font-[700] text-green-900 mb-2 flex items-center gap-2">
                    <span className="text-lg">✨</span>
                    Apa selanjutnya?
                  </p>
                  <ul className="space-y-2 text-[13px] text-green-800">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span>Pesanan akan diproses oleh penjual.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span>Kamu akan mendapat notifikasi ketika pesanan dikirim.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span>Nomor resi (jika ada) akan muncul di halaman ini.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <Link 
              href="/my-orders" 
              className="inline-flex items-center gap-2 text-gray-600 hover:text-primary font-[600] text-[15px] transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center group-hover:shadow-md group-hover:border-primary/30 transition-all">
                <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              </div>
              <span>Back to My Orders</span>
            </Link>
          </div>

          {/* Order Header */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6 animate-fade-in-up border border-gray-200">
            <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 px-6 py-6 border-b border-gray-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
              <div className="flex items-center justify-between relative">
                <div>
                  <h1 className="text-[26px] font-[700] text-gray-900 mb-2">
                    Order Details
                  </h1>
                  <p className="text-gray-700 text-[15px]">
                    Order Number: <span className="font-[700] text-primary bg-primary/10 px-2 py-1 rounded">{order.orderNumber}</span>
                  </p>
                </div>
                <div className={`px-5 py-2.5 rounded-full border-2 flex items-center gap-2 backdrop-blur-md bg-white/60 shadow-lg hover:shadow-xl transition-all ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="font-[700] capitalize">
                    {order.status === 'ready_for_pickup' ? 'Ready for Pickup' : 
                     order.status === 'picked_up' ? 'Picked Up' : 
                     (order.status || 'Pending')}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-lg bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:shadow-md transition-shadow">
                  <p className="text-[12px] text-gray-500 mb-2 uppercase tracking-wide">Order Date</p>
                  <p className="text-[16px] font-[600] text-gray-900">{formatDate(order.createdAt)}</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:shadow-md transition-shadow">
                  <p className="text-[12px] text-gray-500 mb-2 uppercase tracking-wide">Payment Method</p>
                  <p className="text-[16px] font-[600] text-gray-900 capitalize">{order.paymentMethod || 'Cash on Delivery'}</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:shadow-md transition-shadow">
                  <p className="text-[12px] text-gray-500 mb-2 uppercase tracking-wide">Payment Status</p>
                  <p className="text-[16px] font-[600] text-gray-900 capitalize">{order.paymentStatus || 'Pending'}</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/30 hover:shadow-lg transition-shadow">
                  <p className="text-[12px] text-primary/80 mb-2 uppercase tracking-wide font-[600]">Total Amount</p>
                  <p className="text-[22px] font-[700] text-primary">{formatCurrency(order.total || 0)}</p>
                </div>
              </div>
              <div className="mt-6 p-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-md">
                <p className="text-[12px] text-blue-600 mb-2 uppercase tracking-wide font-[600]">Informasi Pembayaran</p>
                <p className="text-[15px] font-[700] text-gray-900 mb-2">{paymentInfo.title}</p>
                <p className="text-[14px] text-gray-700 leading-relaxed">{paymentInfo.description}</p>
                {order.paymentStatus?.toLowerCase() === 'pending' && !['cod', 'cash on delivery', 'cash'].includes((order.paymentMethod || '').toLowerCase()) && (
                  <p className="text-[13px] text-red-600 mt-3 font-[500] flex items-center gap-2">
                    <span className="text-red-500">⚠️</span>
                    Jika pembayaran tidak dilakukan dalam waktu wajar, pesanan dapat dibatalkan otomatis.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Order Progress Timeline */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6 animate-fade-in-up-delay-1 border border-gray-200">
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-[20px] font-[700] text-gray-900">Status Pesanan</h2>
              <p className="text-[14px] text-gray-600 mt-1.5">
                Perkembangan pesanan kamu dari dibuat hingga diterima.
              </p>
            </div>
            <div className="p-8 bg-gradient-to-br from-white to-gray-50">
              <OrderStatusStepper 
                status={order.status} 
                isPickup={order.shippingMethod?.toLowerCase() === 'pickup'} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Order Items */}
            <div>
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in-up-delay-2 border border-gray-200">
                <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <h2 className="text-[20px] font-[700] text-gray-900">Order Items</h2>
                </div>
                <div className="p-6">
                  {order.items && order.items.length > 0 ? (
                    <div className="space-y-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 rounded-xl border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-all group">
                          <div className="w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
                            <Image
                              src={item.productImage || '/placeholder.png'}
                              alt={item.productName}
                              width={96}
                              height={96}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.src = '/placeholder.png'
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-[17px] font-[600] text-gray-900 mb-2 group-hover:text-primary transition-colors">
                              {item.productName}
                              {item.variantName && (
                                <span className="text-sm font-medium text-primary ml-2 bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/10">
                                  {item.variantName}
                                </span>
                              )}
                            </h3>
                            <p className="text-[14px] text-gray-600 mb-1">
                              Quantity: <span className="font-[600] text-gray-800">{item.quantity}</span>
                            </p>
                            <p className="text-[14px] text-gray-600">
                              Price: <span className="font-[600] text-gray-800">{formatCurrency(item.price || 0)}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[20px] font-[700] text-primary">
                              {formatCurrency(item.total || 0)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No items found</p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary & Address */}
            <div className="space-y-6 animate-fade-in-up-delay-3">
              {/* Order Summary */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <h2 className="text-[20px] font-[700] text-gray-900">Order Summary</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between text-[15px] p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-gray-600 font-[500]">Subtotal</span>
                    <span className="font-[600] text-gray-900">{formatCurrency(order.subtotal || 0)}</span>
                  </div>
                  <div className="flex justify-between text-[15px] p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-gray-600 font-[500]">Biaya Ongkir</span>
                    <span className="font-[600] text-emerald-600">Gratis</span>
                  </div>
                  {(order.tax || order.tax === 0) && order.tax > 0 && (
                    <div className="flex justify-between text-[15px] p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="text-gray-600 font-[500]">Pajak</span>
                      <span className="font-[600] text-gray-900">{formatCurrency(order.tax)}</span>
                    </div>
                  )}
                  {(order.discount || order.discount === 0) && order.discount > 0 && (
                    <div className="flex justify-between text-[15px] p-3 rounded-lg bg-green-50 border border-green-200">
                      <span className="text-green-700 font-[500]">Diskon</span>
                      <span className="font-[600] text-green-600">-{formatCurrency(order.discount)}</span>
                    </div>
                  )}
                  <div className="pt-4 border-t-2 border-gray-200 flex justify-between p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10">
                    <span className="text-[18px] font-[700] text-gray-900">Total</span>
                    <span className="text-[22px] font-[700] text-primary">
                      {formatCurrency(
                        (order.subtotal || 0) + 
                        (order.shippingCost || 0) + 
                        (order.tax || 0) - 
                        (order.discount || 0)
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Details */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <h2 className="text-[20px] font-[700] text-gray-900 flex items-center gap-2">
                    <FiTruck className="text-primary" size={22} />
                    Detail Pengiriman
                  </h2>
                </div>
                <div className="p-6 space-y-4 text-[14px] text-gray-700">
                  {order.shippingMethod?.toLowerCase() !== 'pickup' && (
                    <div className="flex justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <span className="text-gray-600 font-[500]">Kurir / Metode Pengiriman</span>
                      <span className="font-[600] capitalize text-gray-900">
                        {order.shippingMethod || 'Dikirim'}
                      </span>
                    </div>
                  )}
                  {order.shippingMethod?.toLowerCase() === 'pickup' && (
                    <div className="flex justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <span className="text-gray-600 font-[500]">Metode Pengiriman</span>
                      <span className="font-[600] capitalize text-gray-900">
                        Ambil di Toko
                      </span>
                    </div>
                  )}
                  {order.trackingNumber && (
                    <div className="flex justify-between p-3 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                      <span className="text-blue-700 font-[600]">Nomor Resi</span>
                      <span className="font-mono text-[13px] font-[600] text-blue-900">{order.trackingNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Address */}
              {order.address && (
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                  <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                    <h2 className="text-[20px] font-[700] text-gray-900 flex items-center gap-2">
                      <FiMapPin className="text-primary" size={22} />
                      Delivery Address
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <FiUser className="text-primary mt-1" size={18} />
                        <div>
                          <p className="text-[13px] text-gray-500 mb-1 font-[500]">Recipient</p>
                          <p className="text-[15px] font-[600] text-gray-900">{order.address.name}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <FiPhone className="text-primary mt-1" size={18} />
                        <div>
                          <p className="text-[13px] text-gray-500 mb-1 font-[500]">Phone</p>
                          <p className="text-[15px] font-[600] text-gray-900">{order.address.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <FiHome className="text-primary mt-1" size={18} />
                        <div>
                          <p className="text-[13px] text-gray-500 mb-1 font-[500]">Address</p>
                          <p className="text-[15px] text-gray-900 leading-relaxed">
                            {order.address.address}
                            <br />
                            {order.address.city}, {order.address.province} {order.address.postalCode}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Notes */}
              {order.notes && (
                <div className="bg-white rounded-md shadow-md overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-[18px] font-[600] text-gray-800">Order Notes</h2>
                  </div>
                  <div className="p-6">
                    <p className="text-[14px] text-gray-700 leading-relaxed">{order.notes}</p>
                  </div>
                </div>
              )}

              {/* Trust & Support */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg overflow-hidden border-2 border-blue-200">
                <div className="px-6 py-5 border-b border-blue-200 bg-white/50 backdrop-blur-sm">
                  <h2 className="text-[20px] font-[700] text-gray-900 flex items-center gap-2">
                    <span className="text-xl">🛡️</span>
                    Bantuan & Keamanan
                  </h2>
                </div>
                <div className="p-6 space-y-3 text-[14px] text-gray-800">
                  <p className="leading-relaxed">
                    Jika ada kendala dengan pesanan, kamu bisa menghubungi customer support kami melalui
                    WhatsApp atau email yang tertera di halaman utama.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">✓</span>
                      <span>Transaksi kamu diproses secara aman.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">✓</span>
                      <span>Pesanan yang bermasalah dapat diajukan untuk retur atau refund sesuai kebijakan toko.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Call To Action */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <h2 className="text-[20px] font-[700] text-gray-900">Setelah Ini</h2>
                </div>
                <div className="p-6 flex flex-col gap-3">
                  <Link href={`/orders/${order.id}`} className="w-full">
                    <button className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-[600] py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300">
                      Lacak Pesanan
                    </button>
                  </Link>
                  <Link href={`/orders/${order.id}/invoice`} className="w-full">
                    <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-[600] py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300">
                      Unduh Invoice
                    </button>
                  </Link>
                  <Link href="/products" className="w-full">
                    <button className="w-full bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white font-[600] py-3 px-6 rounded-xl shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300">
                      Belanja Lagi
                    </button>
                  </Link>
                  <Link href="/my-orders" className="w-full">
                    <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-[600] py-3 px-6 rounded-xl shadow-sm hover:shadow-md transform hover:scale-[1.02] transition-all duration-300">
                      Kembali ke Daftar Pesanan
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default OrderDetailPage
