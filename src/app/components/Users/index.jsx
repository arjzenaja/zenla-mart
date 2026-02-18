"use client";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, IconButton, Tooltip } from "@mui/material";
import React, { useState, useEffect } from "react";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Search from "../Search";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Checkbox from "@mui/material/Checkbox";
import Image from "next/image";
import { RiEdit2Line } from "react-icons/ri";
import { IoEyeOutline } from "react-icons/io5";
import { FaRegTrashAlt } from "react-icons/fa";
import { MdOutlineMail } from "react-icons/md";
import { MdOutlinePhone } from "react-icons/md";
import { MdOutlineDateRange } from "react-icons/md";
import { usersAPI } from "@/lib/api";
import { useRouter } from "next/navigation";

const label = { slotProps: { input: { "aria-label": "Checkbox demo" } } };

const columns = [
  { id: "ID", label: "ID", minWidth: 40 },
  { id: "USER", label: "USER", minWidth: 300 },
  { id: "PHONE NUMBER", label: "PHONE NUMBER", minWidth: 100 },
  { id: "CREATED AT", label: "CREATED AT", minWidth: 100 },
  { id: "ACTIONS", label: "ACTIONS", minWidth: 100 },
];

const UsersComponent = () => {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // Store all users for filtering
  const [loading, setLoading] = useState(true);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [category, setCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setUsers(allUsers);
      setPage(0); // Reset to first page when search is cleared
      return;
    }

    const filtered = allUsers.filter((user) => {
      const searchLower = searchTerm.toLowerCase();
      const name = (user.name || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      const phone = (user.phone || '').toLowerCase();
      
      return name.includes(searchLower) || 
             email.includes(searchLower) || 
             phone.includes(searchLower);
    });

    setUsers(filtered);
    setPage(0); // Reset to first page when filtering
  }, [searchTerm, allUsers]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();

      // Backend mengembalikan bentuk: { success: true, users: [...] }
      // Jadi kita ambil dari field "users" terlebih dahulu
      const usersData =
        response?.users || // format sekarang di backend
        response?.data?.users || // jaga‑jaga kalau nanti dibungkus di "data"
        [];

      const usersArray = Array.isArray(usersData) ? usersData : [];
      setAllUsers(usersArray); // Store all users
      setUsers(usersArray); // Set initial users
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]); // Set ke array kosong jika error
      setAllUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeCategory = (event) => {
    setCategory(event.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleEdit = (user) => {
    // Navigate to edit page
    router.push(`/users/${user.id}/edit`);
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    try {
      await usersAPI.delete(selectedUser.id);
      setUsers(Array.isArray(users) ? users.filter(user => user.id !== selectedUser.id) : []);
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user: ' + (error.message || 'Unknown error'));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleBadge = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return <span className="badge badge-danger"><span className="badge-dot"></span>Admin</span>;
      case 'user': return <span className="badge badge-info"><span className="badge-dot"></span>User</span>;
      default: return <span className="badge badge-secondary"><span className="badge-dot"></span>{role || 'User'}</span>;
    }
  };

  const getStatusBadge = (isVerified) => {
    return isVerified 
      ? <span className="badge badge-success"><span className="badge-dot"></span>Verified</span>
      : <span className="badge badge-warning"><span className="badge-dot"></span>Unverified</span>;
  };

  return (
    <section className="w-full animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold gradient-text">Users Management</h1>
          <p className="text-gray-500 mt-1 font-medium">
             Total <span className="text-primary font-bold">{allUsers.length}</span> active users
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1">
          <Search 
            width="320px" 
            placeholder="Search by name, email, or phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card-premium p-0 overflow-hidden shadow-premium">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
             <div className="skeleton w-full h-12 mb-2 rounded-lg"></div>
             <div className="skeleton w-full h-12 mb-2 rounded-lg"></div>
             <div className="skeleton w-full h-12 rounded-lg"></div>
          </div>
        ) : !Array.isArray(users) || users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-4xl">
              👥
            </div>
            <p className="text-gray-500 text-lg font-medium">No users found</p>
            <p className="text-gray-400 text-sm">Try adjusting your search terms</p>
          </div>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader className="table-premium">
                <TableHead>
                  <TableRow>
                     <TableCell padding="checkbox">
                        <Checkbox {...label} size="small" />
                     </TableCell>
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        align={column.align}
                        style={{ minWidth: column.minWidth }}
                      >
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(Array.isArray(users) ? users : []).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                    <TableRow key={user.id} hover className="transition-colors hover:bg-gray-50">
                       <TableCell padding="checkbox">
                        <Checkbox {...label} size="small" />
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-gray-500">#{user.id.toString().substring(0,6)}</span>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                                {user.image ? (
                                    <Image
                                    src={user.image}
                                    alt="user"
                                    width={40}
                                    height={40}
                                    className="object-cover"
                                  />
                                ) : (
                                  <span className="text-orange-600 font-bold text-sm">
                                    {user.name?.charAt(0).toUpperCase() || 'U'}
                                  </span>
                                )}
                            </div>
                            {user.isVerified && (
                               <div className="absolute -bottom-1 -right-1 bg-green-500 border-2 border-white rounded-full p-0.5">
                                 <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                                 </svg>
                               </div>
                            )}
                          </div>

                          <div className="flex flex-col">
                            <h3 className="text-sm font-bold text-gray-800">
                              {user.name || 'Unknown User'}
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                                <MdOutlineMail className="text-gray-400" />
                                {user.email || 'No Email'}
                            </div>
                            <div className="mt-1">
                               {getRoleBadge(user.role)}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                              <MdOutlinePhone />
                           </div>
                           <span className="text-sm font-medium text-gray-700 font-mono">
                            {user.phone || '-'}
                           </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {formatDate(user.createdAt)}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Tooltip title="View Profile">
                            <IconButton
                              onClick={() => handleView(user)}
                              className="!w-8 !h-8 !border !border-gray-200 !rounded-lg hover:!bg-blue-50 hover:!border-blue-200 hover:!text-blue-600 transition-all"
                              size="small"
                            >
                              <IoEyeOutline size={16} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Edit">
                            <IconButton
                              onClick={() => handleEdit(user)}
                              className="!w-8 !h-8 !border !border-gray-200 !rounded-lg hover:!bg-orange-50 hover:!border-orange-200 hover:!text-orange-600 transition-all"
                              size="small"
                            >
                              <RiEdit2Line size={16} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete">
                            <IconButton
                              onClick={() => handleDeleteClick(user)}
                              className="!w-8 !h-8 !border !border-gray-200 !rounded-lg hover:!bg-red-50 hover:!border-red-200 hover:!text-red-600 transition-all"
                              size="small"
                            >
                              <FaRegTrashAlt size={14} />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <div className="border-t border-gray-100 p-2">
                <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={Array.isArray(users) ? users.length : 0}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </div>
          </>
        )}
      </div>

        {/* View Dialog - Enhanced */}
        <Dialog 
            open={viewDialogOpen} 
            onClose={() => setViewDialogOpen(false)} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{
                style: { borderRadius: 20, overflow: 'hidden' }
            }}
        >
          {selectedUser && (
            <div className="relative">
                {/* Header Cover */}
                <div className="h-32 bg-gradient-to-r from-orange-400 to-red-500 relative">
                     <button 
                        onClick={() => setViewDialogOpen(false)}
                        className="absolute top-4 right-4 w-8 h-8 bg-black/20 hover:bg-black/30 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all"
                     >
                        ✕
                     </button>
                </div>
                
                {/* Profile Content */}
                <div className="px-8 pb-8 relative">
                     {/* Avatar */}
                     <div className="relative -mt-16 mb-6">
                        <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-white flex items-center justify-center overflow-hidden">
                             {selectedUser.image ? (
                                <Image src={selectedUser.image} alt="User" width={128} height={128} className="object-cover" />
                             ) : (
                                <span className="text-4xl font-bold text-gray-300">
                                    {selectedUser.name?.charAt(0).toUpperCase() || 'U'}
                                </span>
                             )}
                        </div>
                        <div className="absolute bottom-2 right-2">
                             {getStatusBadge(selectedUser.isVerified)}
                        </div>
                     </div>

                     <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-800">{selectedUser.name || 'Unknown'}</h2>
                        <p className="text-gray-500 font-medium">{selectedUser.email || 'No Email'}</p>
                        <div className="mt-3 flex justify-center">
                            {getRoleBadge(selectedUser.role)}
                        </div>
                     </div>

                     {/* Details Grid */}
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                             <div className="flex items-center gap-2 mb-1 text-gray-500">
                                <MdOutlinePhone size={18} />
                                <span className="text-xs font-bold uppercase tracking-wider">Phone</span>
                             </div>
                             <p className="text-gray-800 font-medium">{selectedUser.phone || 'Not set'}</p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                             <div className="flex items-center gap-2 mb-1 text-gray-500">
                                <MdOutlineDateRange size={18} />
                                <span className="text-xs font-bold uppercase tracking-wider">Joined Date</span>
                             </div>
                             <p className="text-gray-800 font-medium">{formatDate(selectedUser.createdAt)}</p>
                        </div>
                     </div>

                     <div className="mt-8 flex gap-3">
                         <Button 
                            fullWidth 
                            variant="outlined" 
                            className="btn-border-g !py-3 !rounded-xl"
                            onClick={() => {
                                setViewDialogOpen(false);
                                handleEdit(selectedUser);
                            }}
                         >
                            Edit Profile
                         </Button>
                         <Button 
                            fullWidth 
                            variant="contained" 
                            className="!bg-gray-100 !text-gray-700 !shadow-none hover:!bg-gray-200 !py-3 !rounded-xl !font-bold"
                            onClick={() => setViewDialogOpen(false)}
                         >
                            Close
                         </Button>
                     </div>
                </div>
            </div>
          )}
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog 
            open={deleteDialogOpen} 
            onClose={() => setDeleteDialogOpen(false)}
            PaperProps={{ style: { borderRadius: 16 } }}
        >
          <div className="p-6 text-center">
             <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                 <FaRegTrashAlt size={24} />
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-2">Delete User?</h3>
             <p className="text-gray-500 mb-6">
                 Are you sure you want to delete <strong>{selectedUser?.name}</strong>? <br/>
                 This action cannot be undone.
             </p>
             <div className="flex gap-3 justify-center">
                <Button 
                    onClick={() => setDeleteDialogOpen(false)} 
                    className="!px-6 !py-2.5 !rounded-lg !text-gray-600 !font-bold hover:!bg-gray-100"
                >
                    Cancel
                </Button>
                <Button 
                    onClick={handleDeleteConfirm} 
                    className="!bg-red-600 !text-white !px-6 !py-2.5 !rounded-lg !font-bold hover:!bg-red-700 shadow-lg shadow-red-200"
                >
                    Yes, Delete
                </Button>
             </div>
          </div>
        </Dialog>
    </section>
  );
};

export default UsersComponent;
