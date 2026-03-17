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
import Breadcrumbs from "@/app/components/Breadcrumbs";

const label = { slotProps: { input: { "aria-label": "Checkbox demo" } } };

const columns = [
  { id: "ID", label: "ID", minWidth: 80 },
  { id: "USER", label: "USER", minWidth: 250 },
  { id: "PHONE NUMBER", label: "PHONE", minWidth: 150 },
  { id: "CREATED AT", label: "JOINED DATE", minWidth: 150 },
  { id: "ACTIONS", label: "ACTIONS", minWidth: 120, align: "right" },
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
      case 'admin': return <span className="badge badge-danger shadow-sm"><span className="badge-dot animate-pulse"></span>Admin</span>;
      case 'user': return <span className="badge badge-info shadow-sm"><span className="badge-dot"></span>User</span>;
      default: return <span className="badge badge-secondary shadow-sm"><span className="badge-dot"></span>{role || 'User'}</span>;
    }
  };

  const getStatusBadge = (isVerified) => {
    return isVerified 
      ? <span className="badge badge-success !px-2 !py-0.5"><span className="badge-dot"></span>Verified</span>
      : <span className="badge badge-warning !px-2 !py-0.5"><span className="badge-dot"></span>Unverified</span>;
  };

  return (
    <section className="w-full animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <Breadcrumbs items={[{ label: "Users" }]} />
          <h1 className="text-4xl font-extrabold gradient-text tracking-tight leading-tight mt-1">Users Management</h1>
          <p className="text-gray-500 mt-2 font-medium flex items-center gap-2">
             Managing <span className="text-primary font-bold bg-orange-50 px-2 py-0.5 rounded-md">{allUsers.length}</span> active users
          </p>
        </div>
        <div className="bg-white/50 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-1.5 flex items-center gap-2 w-full md:w-[400px]">
          <Search 
            placeholder="Search name, email, or phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="!border-0 !shadow-none !max-w-none w-full"
          />
        </div>
      </div>

      <div className="card-premium p-0 overflow-hidden shadow-premium border-gray-100/50 animate-scaleIn">
        {loading ? (
          <div className="flex flex-col gap-3 p-6">
             <div className="skeleton w-full h-14 rounded-xl"></div>
             <div className="skeleton w-full h-14 rounded-xl"></div>
             <div className="skeleton w-full h-14 rounded-xl"></div>
             <div className="skeleton w-full h-14 rounded-xl"></div>
          </div>
        ) : !Array.isArray(users) || users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50/30">
            <div className="w-24 h-24 bg-white shadow-premium rounded-3xl flex items-center justify-center mb-6 text-4xl border border-gray-100">
              👥
            </div>
            <p className="text-gray-900 text-xl font-bold">No users found</p>
            <p className="text-gray-500 font-medium mt-1">Try adjusting your search terms</p>
          </div>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
              <Table stickyHeader className="table-premium">
                <TableHead>
                  <TableRow>
                     <TableCell padding="checkbox">
                        <Checkbox {...label} size="small" className="text-gray-300" />
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
                    <TableRow key={user.id} hover className="group transition-all hover:bg-orange-50/30">
                       <TableCell padding="checkbox">
                        <Checkbox {...label} size="small" className="text-gray-300 group-hover:text-primary transition-colors" />
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">#{user.id.toString().substring(0,8).toUpperCase()}</span>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-4">
                          <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 duration-300">
                                {user.image ? (
                                    <Image
                                    src={user.image}
                                    alt="user"
                                    width={48}
                                    height={48}
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-xl">
                                    {user.name?.charAt(0).toUpperCase() || 'U'}
                                  </div>
                                )}
                            </div>
                            {user.isVerified && (
                               <div className="absolute -bottom-1 -right-1 bg-green-500 border-2 border-white rounded-full p-1 shadow-sm">
                                 <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                                 </svg>
                               </div>
                            )}
                          </div>

                          <div className="flex flex-col min-w-0">
                            <h3 className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors truncate">
                              {user.name || 'Unknown User'}
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5 truncate bg-gray-50/50 self-start px-2 py-0.5 rounded-full border border-gray-100/50">
                                <MdOutlineMail className="text-gray-400 flex-shrink-0" />
                                <span className="truncate">{user.email || 'No Email'}</span>
                            </div>
                            <div className="mt-2 flex">
                               {getRoleBadge(user.role)}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2.5">
                           <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0 group-hover:bg-white transition-colors">
                              <MdOutlinePhone size={14} />
                           </div>
                           <span className="text-sm font-bold text-gray-600 font-mono">
                            {user.phone || '-'}
                           </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2.5">
                           <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0 group-hover:bg-white transition-colors">
                              <MdOutlineDateRange size={14} />
                           </div>
                          <span className="text-sm text-gray-600 font-bold whitespace-nowrap">
                            {formatDate(user.createdAt)}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell align="right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                          <Tooltip title="View Profile" arrow>
                            <IconButton
                              onClick={() => handleView(user)}
                              className="!w-9 !h-9 !bg-white !border !border-gray-100 !rounded-xl hover:!bg-blue-50 hover:!border-blue-200 hover:!text-blue-600 transition-all shadow-sm !p-0"
                            >
                              <IoEyeOutline size={18} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Edit User" arrow>
                            <IconButton
                              onClick={() => handleEdit(user)}
                              className="!w-9 !h-9 !bg-white !border !border-gray-100 !rounded-xl hover:!bg-orange-50 hover:!border-orange-200 hover:!text-orange-600 transition-all shadow-sm !p-0"
                            >
                              <RiEdit2Line size={18} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete User" arrow>
                            <IconButton
                              onClick={() => handleDeleteClick(user)}
                              className="!w-9 !h-9 !bg-white !border !border-gray-100 !rounded-xl hover:!bg-red-50 hover:!border-red-200 hover:!text-red-600 transition-all shadow-sm !p-0"
                            >
                              <FaRegTrashAlt size={16} />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <div className="border-t border-gray-100 p-3 bg-gray-50/30">
                <TablePagination
                  rowsPerPageOptions={[10, 25, 100]}
                  component="div"
                  count={Array.isArray(users) ? users.length : 0}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  sx={{
                    '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#6b7280'
                    }
                  }}
                />
            </div>
          </>
        )}
      </div>

        <Dialog 
            open={viewDialogOpen} 
            onClose={() => setViewDialogOpen(false)} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{
                style: { borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.5)' }
            }}
            className="backdrop-blur-sm"
        >
          {selectedUser && (
            <div className="relative">
                {/* Header Cover - Professional Pattern */}
                <div className="h-40 bg-gradient-to-br from-[#D96F32] to-[#ff9d63] relative overflow-hidden">
                     <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                     <button 
                        onClick={() => setViewDialogOpen(false)}
                        className="absolute top-5 right-5 w-10 h-10 bg-black/10 hover:bg-black/20 text-white rounded-2xl flex items-center justify-center backdrop-blur-md transition-all z-10"
                     >
                        ✕
                     </button>
                </div>
                
                {/* Profile Content */}
                <div className="px-8 pb-10 relative">
                     {/* Avatar */}
                     <div className="relative -mt-20 mb-8 flex flex-col items-center">
                        <div className="w-40 h-40 rounded-[2rem] border-[6px] border-white shadow-premium bg-white flex items-center justify-center overflow-hidden transition-transform hover:scale-105 duration-500">
                             {selectedUser.image ? (
                                <Image src={selectedUser.image} alt="User" width={160} height={160} className="object-cover" />
                             ) : (
                                <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                                    <span className="text-6xl font-black text-primary/30">
                                        {selectedUser.name?.charAt(0).toUpperCase() || 'U'}
                                    </span>
                                </div>
                             )}
                        </div>
                        <div className="mt-4">
                             {getStatusBadge(selectedUser.isVerified)}
                        </div>
                     </div>

                     <div className="text-center mb-10">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">{selectedUser.name || 'Unknown'}</h2>
                        <p className="text-gray-500 font-bold text-lg mt-1">{selectedUser.email || 'No Email'}</p>
                        <div className="mt-4 flex justify-center">
                            <span className="bg-orange-50 text-primary border border-orange-100 px-4 py-1.5 rounded-2xl text-sm font-black uppercase tracking-widest shadow-sm">
                                {selectedUser.role || 'User'}
                            </span>
                        </div>
                     </div>

                     {/* Details Grid */}
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 bg-gray-50/50 rounded-3xl border border-gray-100 group hover:bg-white hover:shadow-premium transition-all duration-300">
                             <div className="flex items-center gap-3 mb-2 text-gray-400 group-hover:text-primary transition-colors">
                                <MdOutlinePhone size={20} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Phone</span>
                             </div>
                             <p className="text-gray-900 font-black text-lg font-mono">{selectedUser.phone || 'Not set'}</p>
                        </div>

                        <div className="p-5 bg-gray-50/50 rounded-3xl border border-gray-100 group hover:bg-white hover:shadow-premium transition-all duration-300">
                             <div className="flex items-center gap-3 mb-2 text-gray-400 group-hover:text-primary transition-colors">
                                <MdOutlineDateRange size={20} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Joined</span>
                             </div>
                             <p className="text-gray-900 font-black text-lg uppercase">{formatDate(selectedUser.createdAt)}</p>
                        </div>
                     </div>

                     <div className="mt-10 flex gap-4">
                         <Button 
                            fullWidth 
                            className="!bg-white !text-gray-900 !border-2 !border-gray-100 hover:!border-primary hover:!text-primary !py-4 !rounded-2xl !font-bold !text-sm transition-all shadow-sm"
                            onClick={() => {
                                setViewDialogOpen(false);
                                handleEdit(selectedUser);
                            }}
                         >
                            Edit Profile
                         </Button>
                         <Button 
                            fullWidth 
                            className="btn-g !py-4 !rounded-2xl !font-bold !text-sm !text-white shadow-lg hover:shadow-xl transition-all"
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
