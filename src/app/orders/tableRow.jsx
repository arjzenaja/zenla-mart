import React, { useState } from "react";
import { Button, MenuItem, Select } from "@mui/material";
import { MdOutlineDateRange, MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { ordersAPI } from "@/lib/api";

const OrderRow = ({ order }) => {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState(order?.status || "pending");
  const [updating, setUpdating] = useState(false);

  if (!order) return null;

  const handleChange = async (event) => {
    const newStatus = event.target.value;
    try {
      setUpdating(true);
      await ordersAPI.updateStatus(order.id, newStatus);
      setStatus(newStatus);
    } catch (error) {
      console.error("Failed to update order status", error);
      alert("Gagal memperbarui status pesanan");
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (value) => {
    if (value === undefined || value === null) return "Rp0";
    try {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(value);
    } catch {
      return `Rp${value}`;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'selesai':
        return 'badge-success';
      case 'shipped':
      case 'dikirim':
        return 'badge-primary';
      case 'processing':
      case 'diproses':
        return 'badge-info';
      case 'cancelled':
      case 'dibatalkan':
        return 'badge-danger';
      case 'pending':
      case 'menunggu pembayaran':
      default:
        return 'badge-warning';
    }
  };

  const address = order.address || {};
  
  return (
    <>
      <tr className={`border-b border-gray-50 transition-colors ${expanded ? 'bg-gray-50/50' : 'hover:bg-gray-50'}`}>
        <td className="px-6 py-4">
          <Button
            className={`!min-w-[32px] !w-[32px] !h-[32px] !rounded-full !bg-white !border !border-gray-200 !text-gray-500 hover:!bg-gray-100 hover:!text-primary transition-all ${expanded ? '!bg-primary !text-white !border-primary' : ''}`}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <MdKeyboardArrowUp size={20} /> : <MdKeyboardArrowDown size={20} />}
          </Button>
        </td>
        <td className="px-6 py-4">
           <span className="font-bold text-gray-800 text-sm">#{order.orderNumber || order.id?.substring(0, 8).toUpperCase()}</span>
        </td>
        <td className="px-6 py-4">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-700">
              {address.name || order.user?.name || "Customer"}
            </span>
            <span className="text-xs text-gray-500">
              {address.phone || order.user?.phone || order.userId || "No Contact"}
            </span>
          </div>
        </td>
        <td className="px-6 py-4">
           <span className="bg-gray-100 text-gray-600 py-1 px-3 rounded-md text-xs font-bold uppercase tracking-wide">
             {order.paymentMethod || "Cash"}
           </span>
        </td>
        <td className="px-6 py-4 text-center">
            <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                {order.paymentStatus || "Pending"}
            </span>
        </td>
        <td className="px-6 py-4 text-right">
           <span className="text-sm font-bold text-primary">
              {formatCurrency(order.total || 0)}
           </span>
        </td>
        <td className="px-6 py-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Select
              value={status}
              onChange={handleChange}
              displayEmpty
              size="small"
              disabled={updating}
              className={`!h-[32px] !text-xs !font-bold uppercase tracking-wide !rounded-full ${getStatusBadgeClass(status).replace('badge-', 'bg-').replace('text-', '')} !border-0 shadow-sm`}
              sx={{
                '& .MuiSelect-select': { paddingRight: '24px !important', paddingLeft: '12px !important', paddingTop: '4px !important', paddingBottom: '4px !important' },
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '& .MuiSvgIcon-root': { color: 'inherit', right: '4px' },
                color: status === 'pending' ? '#B45309' : status === 'processing' ? '#0369A1' : status === 'shipped' ? '#FFFFFF' : status === 'delivered' ? '#15803D' : '#BE123C',
                backgroundColor: status === 'pending' ? '#FFFBEB' : status === 'processing' ? '#E0F2FE' : status === 'shipped' ? '#D96F32' : status === 'delivered' ? '#DCFCE7' : '#FFE4E6',
              }}
            >
              <MenuItem value={"pending"} className="!text-xs !uppercase !font-medium">Pending</MenuItem>
              <MenuItem value={"processing"} className="!text-xs !uppercase !font-medium">Processing</MenuItem>
              <MenuItem value={"shipped"} className="!text-xs !uppercase !font-medium">Shipped</MenuItem>
              <MenuItem value={"delivered"} className="!text-xs !uppercase !font-medium">Delivered</MenuItem>
              <MenuItem value={"cancelled"} className="!text-xs !uppercase !font-medium">Cancelled</MenuItem>
            </Select>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
            <MdOutlineDateRange className="text-gray-400" size={16} />
            {formatDate(order.createdAt)}
          </div>
        </td>
      </tr>

      {/* Expanded Details */}
      {expanded && (
        <tr>
          <td colSpan={8} className="p-0 border-b border-gray-100 bg-gray-50/30">
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
                {/* Product List */}
                <div className="md:col-span-2 space-y-4">
                    <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide border-b border-gray-200 pb-2">Order Items</h4>
                    <div className="space-y-3">
                        {order.items?.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                                        📦
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800 line-clamp-1">{item.productName || "Unknown Product"}</p>
                                        <p className="text-xs text-gray-500">
                                            {item.quantity} x {formatCurrency(item.price)}
                                        </p>
                                    </div>
                                </div>
                                <span className="font-bold text-gray-800 text-sm">{formatCurrency((item.price * item.quantity) || 0)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Summary & Shipping Info */}
                <div className="space-y-6">
                    <div>
                        <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide border-b border-gray-200 pb-2 mb-3">Shipping Details</h4>
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-sm space-y-2">
                             <p className="flex justify-between"><span className="text-gray-500">Name:</span> <span className="font-medium text-gray-800">{address.name}</span></p>
                             <p className="flex justify-between"><span className="text-gray-500">Phone:</span> <span className="font-medium text-gray-800">{address.phone}</span></p>
                             <p className="flex flex-col mt-2"><span className="text-gray-500 mb-1">Address:</span> <span className="font-medium text-gray-800 leading-relaxed text-xs bg-gray-50 p-2 rounded-lg">{address.fullAddress || "No address provided"}</span></p>
                        </div>
                    </div>

                    <div>
                         <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide border-b border-gray-200 pb-2 mb-3">Payment Summary</h4>
                         <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="font-medium text-gray-800">{formatCurrency(order.subtotal || (order.total - (order.shippingCost || 0)))}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Shipping</span>
                                <span className="font-medium text-gray-800">{formatCurrency(order.shippingCost || 0)}</span>
                            </div>
                            <div className="border-t border-gray-100 my-2 pt-2 flex justify-between items-center">
                                <span className="font-bold text-gray-800">Total Paid</span>
                                <span className="font-extrabold text-primary text-lg">{formatCurrency(order.total || 0)}</span>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default OrderRow;
