"use client";
import { Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import OrderRow from "./tableRow";
import Pagination from "@mui/material/Pagination";
import { ordersAPI } from "@/lib/api";
import { MdSearch, MdOutlineShoppingBag } from "react-icons/md";
import Breadcrumbs from "@/app/components/Breadcrumbs";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  const fetchOrders = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const response = await ordersAPI.getAll({ page: pageNumber, limit: 10 });
      const data = response.orders || response || [];
      setOrders(data);
      if (response.pagination) {
        setPagination(response.pagination);
      } else {
        setPagination((prev) => ({
          ...prev,
          page: pageNumber,
          total: data.length,
          totalPages: 1,
        }));
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (_event, value) => {
    setPage(value);
  };

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.orderNumber?.toLowerCase().includes(query) ||
      order.id?.toLowerCase().includes(query) ||
      order.status?.toLowerCase().includes(query)
    );
  });

  return (
    <main className="flex-1 min-h-screen animate-fadeIn">
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <Breadcrumbs items={[{ label: "Orders" }]} />
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight mt-1">Orders</h1>
            <p className="text-gray-400 mt-1 font-medium">Manage and track customer orders</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Total Badge */}
            <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-4 py-2.5 shadow-sm">
              <MdOutlineShoppingBag className="text-primary" size={18} />
              <span className="text-sm font-bold text-gray-700">{pagination.total}</span>
              <span className="text-xs text-gray-400 font-medium">orders</span>
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all w-full md:w-[280px]">
              <MdSearch size={18} className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                className="w-full outline-none border-0 bg-transparent text-sm text-gray-700 font-medium placeholder:text-gray-400"
                placeholder="Cari nomor pesanan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="card-premium p-0 overflow-hidden animate-scaleIn">
          {loading ? (
            <div className="flex flex-col gap-2 p-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton w-full h-14 rounded-xl"></div>
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 text-4xl border border-gray-100">
                🔍
              </div>
              <p className="text-gray-700 text-base font-bold">Tidak ada pesanan ditemukan</p>
              <p className="text-gray-400 text-sm mt-1">Coba ubah kata kunci pencarian</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto w-full">
                <table className="w-full table-premium">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100">
                      <th className="px-6 py-4 text-left w-10"></th>
                      <th className="text-[11px] text-gray-400 font-bold uppercase tracking-widest px-6 py-4 text-left">Order #</th>
                      <th className="text-[11px] text-gray-400 font-bold uppercase tracking-widest px-6 py-4 text-left">Customer</th>
                      <th className="text-[11px] text-gray-400 font-bold uppercase tracking-widest px-6 py-4 text-left">Method</th>
                      <th className="text-[11px] text-gray-400 font-bold uppercase tracking-widest px-6 py-4 text-center">Payment</th>
                      <th className="text-[11px] text-gray-400 font-bold uppercase tracking-widest px-6 py-4 text-right">Total</th>
                      <th className="text-[11px] text-gray-400 font-bold uppercase tracking-widest px-6 py-4 text-center">Status</th>
                      <th className="text-[11px] text-gray-400 font-bold uppercase tracking-widest px-6 py-4 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredOrders.map((order) => (
                      <OrderRow key={order.id} order={order} />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-gray-100 p-4 flex justify-center">
                <Pagination
                  count={pagination.totalPages || 1}
                  page={pagination.page || page}
                  onChange={handlePageChange}
                  showFirstButton
                  showLastButton
                  sx={{
                    '& .MuiPaginationItem-root': {
                      fontSize: '13px',
                      fontWeight: 600,
                      borderRadius: '8px',
                      margin: '0 2px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#6b7280',
                      '&.Mui-selected': {
                        backgroundColor: '#D96F32',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(217, 111, 50, 0.25)',
                        '&:hover': { backgroundColor: '#C45E21' }
                      },
                      '&:hover': {
                        backgroundColor: '#fff0e5',
                        color: '#D96F32',
                      }
                    }
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default Orders;
