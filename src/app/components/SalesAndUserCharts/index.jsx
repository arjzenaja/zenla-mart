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

const SalesAndUsersCharts = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  const months = ["JAN", "FEB", "MAR", "APRIL", "MEI", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      
      // Fetch sales data
      try {
        const salesResponse = await dashboardAPI.getSales();
        const sales = salesResponse?.data || salesResponse || [];
        if (Array.isArray(sales) && sales.length > 0) {
          // Format data untuk chart - pastikan memiliki field 'name' dan 'sales'
          const formattedSales = sales.map((item, index) => {
            // Jika data sudah dalam format yang benar
            if (item.name && (item.sales !== undefined || item.amount !== undefined || item.total !== undefined)) {
              return {
                name: item.name || months[index] || `Month ${index + 1}`,
                sales: item.sales || item.amount || item.total || 0,
              };
            }
            // Jika data perlu diformat
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
    <div className="bg-white p-5 rounded-md shadow-md mt-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] text-gray-700 font-[600]">
          Total Penjualan
        </h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10 mt-5">
          <p className="text-gray-500">Loading chart data...</p>
        </div>
      ) : (
        <div className="w-full h-[300px] md:h-[400px] mt-5">
          {!Array.isArray(salesData) || salesData.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <p className="text-gray-500">Belum ada data penjualan</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={salesData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 500 }}
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
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#D96F32"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D96F32" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D96F32" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  );
};

export default SalesAndUsersCharts;
