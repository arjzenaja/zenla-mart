import React, { useState } from "react";
import { formatCurrency } from '@/utils/formatCurrency';
import { getStatusLabel, getStatusColors, getStatusAction } from '@/utils/orderStatus';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MdDateRange, MdExpandMore, MdExpandLess } from "react-icons/md";
import { FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiClock } from "react-icons/fi";
import Button from '@/component/ui/Button'

const OrderRow = ({ order, user }) => {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();

  if (!order) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const statusColors = getStatusColors(order.status);
  const statusLabel = getStatusLabel(order.status);
  const statusAction = getStatusAction(order.status);

  const handleAction = (action, orderId) => {
    switch (action) {
      case 'pay':
        router.push(`/orders/${orderId}?action=pay`);
        break;
      case 'track':
        router.push(`/orders/${orderId}?action=track`);
        break;
      case 'reorder':
        // TODO: Implement reorder functionality
        alert('Fitur beli lagi akan segera tersedia');
        break;
      case 'detail':
      default:
        router.push(`/orders/${orderId}`);
        break;
    }
  };

  const getStatusIcon = () => {
    const status = order.status?.toLowerCase();
    switch (status) {
      case 'pending':
        return <FiClock className="text-yellow-600" size={20} />;
      case 'processing':
        return <FiPackage className="text-blue-600" size={20} />;
      case 'shipped':
        return <FiTruck className="text-purple-600" size={20} />;
      case 'delivered':
        return <FiCheckCircle className="text-green-600" size={20} />;
      case 'cancelled':
        return <FiXCircle className="text-red-600" size={20} />;
      default:
        return <FiClock className="text-gray-600" size={20} />;
    }
  };

  const getPaymentMethodLabel = (method) => {
    const methods = {
      'cash': 'Tunai',
      'cod': 'Bayar di Tempat',
      'transfer': 'Transfer Bank',
      'e-wallet': 'E-Wallet',
      'credit-card': 'Kartu Kredit'
    };
    return methods[method?.toLowerCase()] || method || 'Tunai';
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {/* Main Order Card */}
      <div className="bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          {/* Left Section: Order Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-gray-500">Nomor Pesanan:</span>
                  <Link 
                    href={`/orders/${order.id}`}
                    className="text-primary font-semibold hover:underline"
                  >
                    {order.orderNumber || order.id}
                  </Link>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MdDateRange size={16} />
                  <span>{formatDate(order.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Status Badge - MOST PROMINENT */}
            <div className="mb-4">
              <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 ${statusColors.border} ${statusColors.bg} ${statusColors.text} font-bold text-base shadow-sm`}>
                {getStatusIcon()}
                <span>{statusLabel}</span>
              </div>
            </div>

            {/* Order Summary */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Total Pembayaran:</span>
                <p className="text-gray-900 font-bold text-lg mt-1">
                  {formatCurrency(order.total || 0)}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Metode Pembayaran:</span>
                <p className="text-gray-700 font-medium mt-1">
                  {getPaymentMethodLabel(order.paymentMethod)}
                </p>
              </div>
            </div>
          </div>

          {/* Right Section: Actions */}
          <div className="flex flex-col gap-2 items-end">
            {/* Primary Action Button */}
            <Button
              onClick={() => handleAction(statusAction.action, order.id)}
              className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                statusAction.variant === 'primary'
                  ? ''
                  : ''
              }`}
            >
              {statusAction.label}
            </Button>

            {/* Secondary Action: Detail */}
            <Link
              href={`/orders/${order.id}`}
              className="px-4 py-2 rounded-lg font-medium text-sm bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Detail Pesanan
            </Link>

            {/* Expand Button */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              {expanded ? (
                <>
                  <MdExpandLess size={20} />
                  <span>Sembunyikan Detail</span>
                </>
              ) : (
                <>
                  <MdExpandMore size={20} />
                  <span>Lihat Detail</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Detail Pesanan</h3>
          
          {/* Products List */}
          {order.items && order.items.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Daftar Produk:</h4>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 bg-white p-4 rounded-lg border border-gray-200"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={item.productImage || '/taro.png'}
                        alt={item.productName}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/taro.png';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <Link href={`/product/${item.productId}`}>
                        <h5 className="text-base font-medium text-gray-900 hover:text-primary transition-colors">
                          {item.productName}
                        </h5>
                      </Link>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>Qty: <strong>{item.quantity}</strong></span>
                        <span>Harga: <strong>{formatCurrency(item.price || 0)}</strong></span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(item.total || 0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Ringkasan Pembayaran:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-medium">{formatCurrency(order.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Ongkir:</span>
                <span className="font-medium">{formatCurrency(order.shippingCost || 0)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between text-base font-bold text-gray-900">
                <span>Total Pembayaran:</span>
                <span>{formatCurrency(order.total || 0)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.address && (
            <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Alamat Pengiriman:</h4>
              <p className="text-sm text-gray-600">
                {order.address.name} - {order.address.phone}
                <br />
                {order.address.address}
                {order.address.city && `, ${order.address.city}`}
                {order.address.province && `, ${order.address.province}`}
                {order.address.postalCode && ` ${order.address.postalCode}`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderRow;
