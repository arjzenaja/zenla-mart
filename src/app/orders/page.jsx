"use client";
import { Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import OrderRow from "./tableRow";
import Pagination from "@mui/material/Pagination";
import Search from "../components/Search";
import { ordersAPI } from "@/lib/api";

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
    <main className="flex-1 min-h-screen">
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
           <div className="animate-fadeIn">
              <h1 className="text-3xl font-extrabold gradient-text">Orders</h1>
              <p className="text-gray-500 mt-1 font-medium">
                Manage and track customer orders
              </p>
           </div>
           
           <div className="flex items-center gap-4 animate-fadeIn">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 flex items-center gap-2">
                 <span className="text-sm font-bold text-gray-500 pl-2">Total:</span>
                 <span className="badge badge-primary !text-sm">{pagination.total}</span>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1">
                 <div className="w-full md:w-[350px] h-[45px] px-3 relative flex items-center">
                    <input
                        type="text"
                        className="w-full h-full outline-none border-0 bg-transparent text-gray-700 font-medium placeholder:text-gray-400"
                        placeholder="Search by order number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </div>
              </div>
           </div>
        </div>

        <div className="card-premium p-0 overflow-hidden animate-scaleIn shadow-premium">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="skeleton w-full h-12 mb-2 rounded-lg"></div>
            <div className="skeleton w-full h-12 mb-2 rounded-lg"></div>
            <div className="skeleton w-full h-12 mb-2 rounded-lg"></div>
            <div className="skeleton w-full h-12 rounded-lg"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-4xl">
              🔍
            </div>
            <p className="text-gray-500 text-lg font-medium">No orders found matching your search</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto w-full">
              <table className="w-full table-premium">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-left w-10"></th>
                    <th className="text-[12px] text-gray-500 font-bold uppercase tracking-wider px-6 py-4 text-left">
                      Order Number
                    </th>
                    <th className="text-[12px] text-gray-500 font-bold uppercase tracking-wider px-6 py-4 text-left">
                      Customer
                    </th>
                    <th className="text-[12px] text-gray-500 font-bold uppercase tracking-wider px-6 py-4 text-left">
                      Method
                    </th>
                    <th className="text-[12px] text-gray-500 font-bold uppercase tracking-wider px-6 py-4 text-center">
                      Payment
                    </th>
                    <th className="text-[12px] text-gray-500 font-bold uppercase tracking-wider px-6 py-4 text-right">
                      Total
                    </th>
                    <th className="text-[12px] text-gray-500 font-bold uppercase tracking-wider px-6 py-4 text-center">
                      Status
                    </th>
                    <th className="text-[12px] text-gray-500 font-bold uppercase tracking-wider px-6 py-4 text-left">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50">
                  {filteredOrders.map((order) => (
                    <OrderRow key={order.id} order={order} />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-gray-100 p-2">
              <Pagination
                count={pagination.totalPages || 1}
                page={pagination.page || page}
                onChange={handlePageChange}
                showFirstButton
                showLastButton
                sx={{
                  '& .MuiPaginationItem-root': {
                    fontSize: '14px',
                    fontWeight: 600,
                    borderRadius: '8px',
                    margin: '0 4px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#6b7280',
                    '&.Mui-selected': {
                      backgroundColor: '#D96F32',
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(217, 111, 50, 0.3)',
                      '&:hover': {
                        backgroundColor: '#C45E21',
                      }
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
