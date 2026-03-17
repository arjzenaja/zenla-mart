"use client";
import React, { useState, useEffect } from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, CircularProgress, TextField, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { usersAPI } from "@/lib/api";
import { FiMapPin, FiPhone, FiUser, FiHome, FiBriefcase, FiTag, FiSearch, FiMail } from "react-icons/fi";
import Toast from "@/component/Toast";
import Breadcrumbs from "@/app/components/Breadcrumbs";

const AddressesPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("all");
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0 && selectedUserId) {
      if (selectedUserId !== "all") {
        fetchAddresses(selectedUserId);
      } else {
        fetchAllAddresses();
      }
    }
  }, [selectedUserId]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      const usersData = response?.users || response || [];
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      showToast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAddresses = async () => {
    try {
      setLoading(true);
      const allAddresses = [];
      
      // Fetch addresses for all users
      for (const user of users) {
        try {
          const response = await usersAPI.getAddresses(user.id);
          const addressesData = response?.addresses || response || [];
          // Add userId to each address for display
          const addressesWithUser = addressesData.map(addr => ({
            ...addr,
            userId: user.id,
            userName: user.name,
            userEmail: user.email
          }));
          allAddresses.push(...addressesWithUser);
        } catch (error) {
          console.error(`Error fetching addresses for user ${user.id}:`, error);
        }
      }
      
      // Sort: default first, then by createdAt
      const sorted = allAddresses.sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
      setAddresses(sorted);
    } catch (error) {
      console.error("Error fetching all addresses:", error);
      showToast("Failed to load addresses", "error");
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async (userId) => {
    try {
      setLoading(true);
      const response = await usersAPI.getAddresses(userId);
      const addressesData = response?.addresses || response || [];
      const user = users.find(u => u.id === userId);
      // Add user info to addresses
      const addressesWithUser = addressesData.map(addr => ({
        ...addr,
        userId: user?.id,
        userName: user?.name,
        userEmail: user?.email
      }));
      // Sort: default first
      const sorted = addressesWithUser.sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
      setAddresses(sorted);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      showToast("Failed to load addresses", "error");
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, severity = "info") => {
    setToast({ open: true, message, severity });
  };

  // Filter users by search term
  const filteredUsers = users.filter((user) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.phone?.toLowerCase().includes(search)
    );
  });

  const selectedUser = users.find((u) => u.id === selectedUserId);

  // Get label icon
  const getLabelIcon = (label) => {
    switch (label) {
      case "Office":
        return <FiBriefcase size={16} />;
      case "Custom":
        return <FiTag size={16} />;
      default:
        return <FiHome size={16} />;
    }
  };

  // Get label color
  const getLabelColor = (label, isDefault) => {
    if (isDefault) {
      return "bg-primary/20 text-primary";
    }
    switch (label) {
      case "Office":
        return "bg-blue-100 text-blue-700";
      case "Custom":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  return (
    <>
    <main className="flex-1 min-h-screen" style={{
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)'
    }}>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8 animate-fadeIn">
          <Breadcrumbs items={[{ label: "Addresses" }]} />
          <h1 className="text-4xl font-extrabold gradient-text mb-2 leading-tight mt-1">User Addresses</h1>
          <p className="text-gray-600 text-lg">View and manage addresses for all users</p>
        </div>

        {/* User Selection */}
        <div className="card-premium p-8 mb-10 animate-scaleIn">
          <div className="mb-6">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
              Filter by User
            </label>
            <div className="flex flex-col md:flex-row gap-5">
              <div className="flex-1 relative group">
                <FiSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-[60px] pl-14 pr-6 rounded-[2rem] border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none text-gray-700 font-bold placeholder:font-medium text-sm"
                />
              </div>
              <FormControl size="small" className="!min-w-[320px]">
                <Select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  displayEmpty
                  className="!h-[60px] !rounded-[2rem] !bg-gray-50/50 !border-gray-100 focus:!border-primary !text-gray-900 !font-black !uppercase !tracking-widest !text-[11px]"
                  sx={{
                    '& fieldset': { border: 'none' },
                    '& .MuiSelect-select': { pl: 3 }
                  }}
                >
                  <MenuItem value="all" className="!text-[11px] !font-black !uppercase !tracking-widest">
                    <em>All Customers</em>
                  </MenuItem>
                  {filteredUsers.map((user) => (
                    <MenuItem key={user.id} value={user.id} className="!text-[11px] !font-black !uppercase !tracking-widest">
                      <div className="flex flex-col py-1">
                         <span className="font-black text-gray-900">{user.name}</span>
                         <span className="text-[10px] text-gray-400 font-bold">{user.email}</span>
                      </div>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>
        </div>

        {/* Addresses List */}
        {selectedUserId && (
          <div className="animate-fadeIn" style={{ animationDelay: '100ms' }}>
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                  {selectedUserId === "all" 
                    ? "Global Address Directory" 
                    : `Verified Addresses`}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                   <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">
                    {selectedUserId === "all" 
                      ? `${addresses.length} entries registered across platform`
                      : `${selectedUser?.name} • ${addresses.length} ${addresses.length === 1 ? "address" : "addresses"}`}
                  </p>
                </div>
              </div>
              <div className="w-14 h-14 bg-white shadow-premium rounded-2xl flex items-center justify-center text-primary border border-gray-50">
                <FiMapPin size={28} />
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="skeleton h-[320px] rounded-[2rem]"></div>
                 <div className="skeleton h-[320px] rounded-[2rem]"></div>
              </div>
            ) : addresses.length === 0 ? (
              <div className="card-premium py-32 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner border border-gray-100">
                  <FiMapPin size={40} className="text-gray-300" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">No Records Found</h3>
                <p className="text-gray-500 font-medium max-w-xs">We couldn't find any addresses matching your current selection.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 pb-20">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`p-5 rounded-2xl border-2 transition-smooth hover:shadow-lg ${
                      address.isDefault
                        ? "border-primary/30 bg-gradient-to-br from-orange-50 to-white"
                        : "border-transparent bg-gray-50 hover:bg-white hover:border-gray-100"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Label and Default Badge */}
                        <div className="flex items-center gap-2 mb-4 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm ${getLabelColor(
                              address.label,
                              address.isDefault
                            )}`}
                          >
                            {getLabelIcon(address.label || "Home")}
                            {address.label || "Home"}
                          </span>
                          {address.isDefault && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary to-primary-light text-white shadow-sm">
                              <FiMapPin size={12} />
                              Default
                            </span>
                          )}
                        </div>

                        {/* User Info (if showing all users) */}
                        {selectedUserId === "all" && address.userName && (
                          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200/50">
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">
                              {address.userName.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                               <span className="text-xs font-bold text-gray-700">
                                {address.userName}
                              </span>
                               <span className="text-[10px] text-gray-500">
                                {address.userEmail}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Recipient Name */}
                        <div className="flex items-center gap-2 mb-2">
                          <FiUser size={16} className="text-gray-400 flex-shrink-0" />
                          <h3 className="text-lg font-bold text-gray-800">
                            {address.name || "Recipient Name"}
                          </h3>
                        </div>

                        {/* Phone Number */}
                        <div className="flex items-center gap-2 mb-2">
                          <FiPhone size={16} className="text-gray-400 flex-shrink-0" />
                          <p className="text-sm text-gray-600 font-medium">{address.phone || "Phone number"}</p>
                        </div>

                        {/* Full Address */}
                        <div className="flex items-start gap-2 mb-4">
                          <FiMapPin size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {[
                              address.address,
                              address.city,
                              address.province,
                              address.postalCode,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        </div>

                        {/* Metadata */}
                        <div className="pt-3 border-t border-gray-200/50 flex items-center justify-between">
                          <span className="text-[10px] font-medium text-gray-400 bg-white px-2 py-1 rounded-md border border-gray-100">
                             ID: {address.id.substring(0, 8)}...
                          </span>
                          <span className="text-[10px] text-gray-400">
                             {new Date(address.createdAt).toLocaleDateString("id-ID")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </main>

      {/* Toast Notification */}
      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </>
  );
};

export default AddressesPage;
