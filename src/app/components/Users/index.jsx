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
  const [loading, setLoading] = useState(true);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [category, setCategory] = useState("");

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      // Memastikan users selalu berupa array
      const usersData = response?.data || response || [];
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]); // Set ke array kosong jika error
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
    // Navigate to edit page or open edit modal
    router.push(`/users?edit=${user.id}`);
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

  return (
    <section className="w-full">
      <div className="w-full p-4 rounded-md shadow-md bg-white mt-3">
        <div className="flex items-center justify-between mb-3">
          <div className="col w-[200px]">
            <h2 className="text-[20px] text-gray-700 font-[600]">Users</h2>
          </div>

          <div className="col">
            <Search width="400px" placeholder="Search user..." />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <p className="text-gray-500">Loading users...</p>
          </div>
        ) : !Array.isArray(users) || users.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
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
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Checkbox {...label} size="small" />
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="img p-1 bg-white rounded-md">
                            <Image
                              src="/profile.jpg"
                              alt="user image"
                              width={50}
                              height={70}
                              className="object-cover"
                            />
                          </div>

                          <div className="info">
                            <h3 className="text-[13px] text-gray-800 font-[500]">
                              {user.name || 'N/A'}
                            </h3>
                            <span className="text-gray-700 text-[13px] flex items-center gap-1">
                              <MdOutlineMail size={20} />
                              <span>{user.email || 'N/A'}</span>
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center">
                          <MdOutlinePhone size={20} />
                          <span className="text-gray-700 text-[13px]">
                            {user.phone || 'N/A'}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MdOutlineDateRange size={20} />
                          <span className="text-gray-700 text-[13px]">
                            {formatDate(user.createdAt)}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Tooltip title="Edit">
                            <IconButton
                              onClick={() => handleEdit(user)}
                              className="!w-[40px] !h-[40px] !min-w-[40px] hover:!bg-blue-50"
                              size="small"
                            >
                              <RiEdit2Line size={20} className="text-blue-600" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="View">
                            <IconButton
                              onClick={() => handleView(user)}
                              className="!w-[40px] !h-[40px] !min-w-[40px] hover:!bg-green-50"
                              size="small"
                            >
                              <IoEyeOutline size={20} className="text-green-600" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete">
                            <IconButton
                              onClick={() => handleDeleteClick(user)}
                              className="!w-[40px] !h-[40px] !min-w-[40px] hover:!bg-red-50"
                              size="small"
                            >
                              <FaRegTrashAlt size={20} className="text-red-600" />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[10, 25, 100]}
              component="div"
              count={Array.isArray(users) ? users.length : 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}

        {/* View Dialog */}
        <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>User Details</DialogTitle>
          <DialogContent>
            {selectedUser && (
              <div className="space-y-4 mt-2">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Name</label>
                  <p className="text-gray-800">{selectedUser.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Email</label>
                  <p className="text-gray-800">{selectedUser.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Phone</label>
                  <p className="text-gray-800">{selectedUser.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Role</label>
                  <p className="text-gray-800 capitalize">{selectedUser.role || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Status</label>
                  <p className={`${selectedUser.isVerified ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedUser.isVerified ? 'Verified' : 'Not Verified'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Created At</label>
                  <p className="text-gray-800">{formatDate(selectedUser.createdAt)}</p>
                </div>
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)} className="btn-border-g">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete User</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete user <strong>{selectedUser?.name || selectedUser?.email}</strong>? 
              This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} className="btn-border-g">
              Cancel
            </Button>
            <Button onClick={handleDeleteConfirm} className="btn-g !bg-red-600 hover:!bg-red-700">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </section>
  );
};

export default UsersComponent;
