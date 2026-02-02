"use client";
import { Button } from "@mui/material";
import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { dashboardAPI, usersAPI } from "@/lib/api";

const SalesAndUsersCharts = () => {
  const [isActiveCard, setIsActiveCard] = useState(0);
  const [salesData, setSalesData] = useState([]);
  const [usersData, setUsersData] = useState([]);
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

      // Fetch users data - get all users and group by month
      try {
        const usersResponse = await usersAPI.getAll();
        const users = usersResponse?.data || usersResponse || [];
        if (Array.isArray(users) && users.length > 0) {
          // Group users by month
          const usersByMonth = months.map((month, index) => {
            const monthIndex = index + 1;
            const monthUsers = users.filter(user => {
              if (!user.createdAt) return false;
              const userDate = new Date(user.createdAt);
              return userDate.getMonth() + 1 === monthIndex;
            });
            return {
              name: month,
              count: monthUsers.length,
            };
          });
          setUsersData(usersByMonth);
        } else {
          setUsersData([]);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsersData([]);
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
          Total Users & Total Sales
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="text"
            className="text-primary! capitalize! font-bold!"
            onClick={()=>setIsActiveCard(0)}
          >
            Total Sales
          </Button>
          <Button
            variant="text"
            className="text-blue-500! capitalize! font-bold!"
            onClick={()=>setIsActiveCard(1)}
          >
            Total Users
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10 mt-5">
          <p className="text-gray-500">Loading chart data...</p>
        </div>
      ) : (
        <>
          {isActiveCard === 0 && (
            <div className="w-full mt-5">
              {!Array.isArray(salesData) || salesData.length === 0 ? (
                <div className="flex items-center justify-center py-10">
                  <p className="text-gray-500">No sales data available</p>
                </div>
              ) : (
                <AreaChart
                  style={{
                    width: "100%",
                    maxHeight: "70vh",
                    aspectRatio: 1.618,
                  }}
                  responsive
                  data={salesData}
                  margin={{
                    top: 20,
                    right: 0,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#555", fontWeight: 500 }}
                  />
                  <YAxis
                    width="auto"
                    tick={{ fontSize: 12, fill: "#555", fontWeight: 500 }}
                  />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#D96F32"
                    fill="#ce9f83"
                  />
                </AreaChart>
              )}
            </div>
          )}

          {isActiveCard === 1 && (
            <div className="w-full mt-5">
              {!Array.isArray(usersData) || usersData.length === 0 ? (
                <div className="flex items-center justify-center py-10">
                  <p className="text-gray-500">No users data available</p>
                </div>
              ) : (
                <AreaChart
                  style={{
                    width: "100%",
                    maxHeight: "70vh",
                    aspectRatio: 1.618,
                  }}
                  responsive
                  data={usersData}
                  margin={{
                    top: 20,
                    right: 0,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#555", fontWeight: 500 }}
                  />
                  <YAxis
                    width="auto"
                    tick={{ fontSize: 12, fill: "#555", fontWeight: 500 }}
                  />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#0263b2"
                    fill="#37a1f7"
                  />
                </AreaChart>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SalesAndUsersCharts;
