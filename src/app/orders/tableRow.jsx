import React, { useState } from "react";
import { Button, MenuItem, Select, Box, Collapse, TableCell, TableRow } from "@mui/material";
import { MdOutlineDateRange, MdKeyboardArrowDown, MdKeyboardArrowUp, MdOutlineMail, MdOutlineLocalShipping, MdOutlineList } from "react-icons/md";
import Image from "next/image";
import { ordersAPI } from "@/lib/api";

const OrderRow = ({ order }) => {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  if (!order) return null;

  const handleStatusChange = async (event) => {
    const newStatus = event.target.value;
    try {
      setUpdating(true);
      await ordersAPI.updateStatus(order.id, newStatus);
      // Note: Ideally, this should trigger a refresh of the parent component's data
      // For now, we'll assume the API call is successful and the status will update on next fetch
    } catch (error) {
      console.error("Failed to update order status", error);
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
      case 'picked_up':
        return 'badge-success';
      case 'shipped':
      case 'dikirim':
        return 'badge-primary';
      case 'processing':
      case 'diproses':
        return 'badge-info';
      case 'ready_for_pickup':
        return 'badge-secondary'; // Assuming badge-secondary exists or using a custom color
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
    <React.Fragment>
      <TableRow 
        hover 
        className={`group transition-all hover:bg-orange-50/20 ${open ? 'bg-orange-50/30' : ''}`}
        onClick={() => setOpen(!open)}
        sx={{ cursor: 'pointer' }}
      >
        <TableCell padding="checkbox">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${open ? 'bg-primary text-white shadow-lg' : 'bg-gray-50 text-gray-400 group-hover:bg-white group-hover:text-primary'}`}>
            {open ? <MdKeyboardArrowUp size={20} /> : <MdKeyboardArrowDown size={20} />}
          </div>
        </TableCell>
        
        <TableCell>
           <div className="flex flex-col">
              <span className="font-mono text-[11px] font-black text-gray-400 bg-gray-100/50 px-2 py-1 rounded-md self-start group-hover:bg-white transition-colors">#{order.id.slice(-8).toUpperCase()}</span>
              <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{formatDate(order.createdAt)}</span>
           </div>
        </TableCell>

        <TableCell>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-primary font-black shadow-sm group-hover:scale-105 transition-transform">
                {order.user?.name?.charAt(0).toUpperCase() || 'U'}
             </div>
             <div className="flex flex-col min-w-0">
                <span className="font-bold text-gray-900 group-hover:text-primary transition-colors truncate">
                  {order.user?.name || 'Guest'}
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1 opacity-70 truncate">
                   <MdOutlineMail size={12} className="text-gray-400" />
                   {order.user?.email || 'N/A'}
                </span>
             </div>
          </div>
        </TableCell>

        <TableCell>
           <div className="flex flex-col">
              <span className="text-sm font-black text-gray-900">{formatCurrency(order.totalAmount || order.total || 0)}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{order.paymentMethod || 'COD'}</span>
           </div>
        </TableCell>

        <TableCell>
           <div className={`badge ${order.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'} !px-3 !py-1 !text-[10px] !rounded-lg`}>
              <div className="badge-dot"></div>
              {order.paymentStatus || 'pending'}
           </div>
        </TableCell>

        <TableCell align="right">
          <div onClick={(e) => e.stopPropagation()} className="relative">
             <Select
                value={order.status}
                onChange={handleStatusChange}
                variant="outlined"
                size="small"
                disabled={updating}
                className="!rounded-xl !text-[11px] !font-black !uppercase !tracking-widest !bg-white !shadow-sm !border-gray-100 hover:!border-primary transition-all min-w-[140px]"
                sx={{
                  '& .MuiSelect-select': { py: 1, pl: 2 },
                  '& fieldset': { borderOpacity: 0.1 }
                }}
             >
                <MenuItem value={"pending"} className="!text-[11px] !font-bold !uppercase !tracking-widest">Pending</MenuItem>
                <MenuItem value={"processing"} className="!text-[11px] !font-bold !uppercase !tracking-widest">Processing</MenuItem>
                {order.shippingMethod?.toLowerCase() === 'pickup' && (
                  <MenuItem value={"ready_for_pickup"} className="!text-[11px] !font-bold !uppercase !tracking-widest">Ready for Pickup</MenuItem>
                )}
                {order.shippingMethod?.toLowerCase() === 'pickup' && (
                  <MenuItem value={"picked_up"} className="!text-[11px] !font-bold !uppercase !tracking-widest">Picked Up</MenuItem>
                )}
                {order.shippingMethod?.toLowerCase() !== 'pickup' && (
                  <MenuItem value={"shipped"} className="!text-[11px] !font-bold !uppercase !tracking-widest">Shipped</MenuItem>
                )}
                {order.shippingMethod?.toLowerCase() !== 'pickup' && (
                  <MenuItem value={"delivered"} className="!text-[11px] !font-bold !uppercase !tracking-widest">Delivered</MenuItem>
                )}
                <MenuItem value={"cancelled"} className="!text-[11px] !font-bold !uppercase !tracking-widest">Cancelled</MenuItem>
             </Select>
          </div>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6} className="!p-0 border-0">
          <Collapse in={open} timeout="auto" unmountOnExit>
            <div className="p-8 bg-gray-50/50">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Product List */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                     <h4 className="font-black text-gray-900 text-lg uppercase tracking-tight flex items-center gap-2">
                        <MdOutlineList className="text-primary" />
                        Order Breakdown
                     </h4>
                     <span className="text-[10px] font-black text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100 uppercase tracking-widest">
                        {order.items?.length || 0} Unique Items
                     </span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6 group hover:shadow-premium transition-all duration-300">
                        <div className="w-20 h-20 rounded-2xl bg-gray-50 relative overflow-hidden flex-shrink-0 border border-gray-100">
                           {item.product?.image ? (
                             <Image src={item.product.image} alt={item.product?.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                           ) : (
                               <div className="w-full h-full flex items-center justify-center text-gray-300">📦</div>
                           )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-black text-gray-900 group-hover:text-primary transition-colors truncate">{item.productName || item.product?.name || 'Unknown Product'}</h5>
                          <div className="flex items-center gap-4 mt-1">
                             <span className="text-sm font-bold text-gray-400">Qty: {item.quantity}</span>
                             <span className="w-1.5 h-1.5 bg-gray-200 rounded-full"></span>
                             <span className="text-secondary font-black">{formatCurrency(item.price)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                           <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Subtotal</span>
                           <span className="text-gray-900 font-black text-lg">{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Logistics Info */}
                <div className="space-y-6">
                   <div>
                      <h4 className="font-black text-gray-900 text-lg uppercase tracking-tight mb-4 flex items-center gap-2">
                        <MdOutlineLocalShipping className="text-secondary" />
                        Logistics Detail
                      </h4>
                      <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-[4rem] -mr-16 -mt-16 opacity-50"></div>
                         <div className="relative space-y-6">
                            <div>
                               <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 block">Recipient</span>
                               <p className="text-gray-900 font-black text-lg">{order.address?.name || order.user?.name || 'N/A'}</p>
                            </div>
                            <div>
                               <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 block">Contact</span>
                               <p className="text-gray-900 font-black text-lg font-mono">{order.address?.phone || order.user?.phone || 'N/A'}</p>
                            </div>
                            <div>
                               <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 block">Address</span>
                               <p className="text-gray-700 font-bold leading-relaxed text-sm">
                                  {order.address?.fullAddress || "No address provided"}
                               </p>
                            </div>
                         </div>
                      </div>
                   </div>
                   
                   <div className="bg-secondary p-8 rounded-[2rem] text-white shadow-lg shadow-gray-200">
                      <span className="text-[10px] font-black opacity-60 uppercase tracking-[0.2em] mb-2 block">Grand Total</span>
                      <div className="flex items-end justify-between">
                         <h3 className="text-3xl font-black">{formatCurrency(order.totalAmount || order.total || 0)}</h3>
                         <span className="text-[10px] font-black bg-white/10 px-3 py-1 rounded-full uppercase tracking-widest">
                            {order.paymentMethod || 'COD'}
                         </span>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

export default OrderRow;
