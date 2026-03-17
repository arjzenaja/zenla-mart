"use client";
import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { dashboardAPI } from "@/lib/api";
import { MdTrendingUp } from "react-icons/md";

const SalesAndUsersCharts = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  const months = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGS", "SEP", "OKT", "NOV", "DES"];

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      setLoading(true);

      try {
        const salesResponse = await dashboardAPI.getSales();
        const sales = salesResponse?.data || salesResponse || [];
        if (Array.isArray(sales) && sales.length > 0) {
          const formattedSales = sales.map((item, index) => {
            if (item.name && (item.sales !== undefined || item.amount !== undefined || item.total !== undefined)) {
              return {
                name: item.name || months[index] || `Month ${index + 1}`,
                sales: item.sales || item.amount || item.total || 0,
              };
            }
            return {
              name: months[index] || `Month ${index + 1}`,
              sales: typeof item === 'number' ? item : (item.value || item.count || 0),
            };
          });
          setSalesData(formattedSales);
        } else {
          setSalesData([]);
        }
      } catch (error) {
        console.error('Error fetching sales:', error);
        setSalesData([]);
      }

    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-premium p-6 border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Total Penjualan</h2>
          <p className="text-sm text-gray-400 mt-0.5">Grafik penjualan per bulan</p>
        </div>
        <div className="p-2.5 bg-orange-50 rounded-xl border border-orange-100">
          <MdTrendingUp size={20} className="text-primary" />
        </div>
      </div>

      {loading ? (
        <div className="w-full h-[300px] skeleton rounded-xl"></div>
      ) : (
        <div className="w-full h-[300px]">
          {!Array.isArray(salesData) || salesData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <MdTrendingUp size={48} className="text-gray-200 mb-3" />
              <p className="font-semibold text-gray-500">Belum ada data penjualan</p>
              <p className="text-sm text-gray-400 mt-1">Data akan tampil setelah ada transaksi</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={salesData}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D96F32" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#D96F32" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #f3f4f6',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                  labelStyle={{ color: '#374151', fontWeight: 700 }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#D96F32"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                  dot={{ fill: '#D96F32', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, fill: '#D96F32', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  );
};

export default SalesAndUsersCharts;
