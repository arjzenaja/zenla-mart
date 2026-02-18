"use client";
import React, { useState, useEffect } from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, CircularProgress, TextField, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { usersAPI } from "@/lib/api";
import { FiMapPin, FiPhone, FiUser, FiHome, FiBriefcase, FiTag, FiSearch, FiMail } from "react-icons/fi";
import Toast from "@/component/Toast";

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
          <h1 className="text-4xl font-extrabold gradient-text mb-2">User Addresses</h1>
          <p className="text-gray-600 text-lg">View and manage addresses for all users</p>
        </div>

        {/* User Selection */}
        <div className="card-premium p-6 mb-8 animate-scaleIn">
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Filter by User
            </label>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-[55px] pl-12 pr-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-smooth outline-none text-gray-700"
                />
              </div>
              <FormControl size="small" className="!min-w-[300px]">
                <Select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  displayEmpty
                  className="!h-[55px] !rounded-xl !bg-gray-50 !border-gray-200 focus:!border-primary !text-gray-700"
                  sx={{
                    '& fieldset': { border: '1px solid #e5e7eb !important' },
                    '&:hover fieldset': { border: '1px solid #d1d5db !important' },
                    '&.Mui-focused fieldset': { border: '1px solid #D96F32 !important' },
                  }}
                >
                  <MenuItem value="all">
                    <em>All Users</em>
                  </MenuItem>
                  {filteredUsers.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      <div className="flex flex-col">
                         <span className="font-semibold">{user.name}</span>
                         <span className="text-xs text-gray-500">{user.email}</span>
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
          <div className="card-premium p-6 animate-fadeIn" style={{ animationDelay: '100ms' }}>
            <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">
                  {selectedUserId === "all" 
                    ? "All User Addresses" 
                    : `Addresses for ${selectedUser?.name || "User"}`}
                </h2>
                <p className="text-sm text-gray-500 font-medium">
                  {selectedUserId === "all" 
                    ? `${addresses.length} ${addresses.length === 1 ? "address" : "addresses"} from ${users.length} users`
                    : `${selectedUser?.email} • ${addresses.length} ${addresses.length === 1 ? "address" : "addresses"}`}
                </p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <FiMapPin size={24} />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                 <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-4 text-gray-500 font-medium">Loading addresses...</span>
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiMapPin size={40} className="text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-700 mb-1">No addresses found</h3>
                <p className="text-gray-500">There are no addresses to display for this selection.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
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
