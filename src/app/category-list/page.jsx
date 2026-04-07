"use client";
import { Button } from "@mui/material";
import React, { useState, useEffect } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Image from "next/image";
import { RiEdit2Line } from "react-icons/ri";
import { FaRegTrashAlt } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Breadcrumbs from "@/app/components/Breadcrumbs";

const columns = [
  { id: "IMAGE", label: "IMAGE", minWidth: 200 },
  { id: "CATEGORY NAME", label: "CATEGORY NAME", minWidth: 300 },
  { id: "ACTION", label: "ACTION", minWidth: 150 },
];

const CategoryListPage = () => {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/backend-api/api/categories");
        
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        
        const data = await response.json();
        setCategories(data.categories || []);
        setError(null);
      } catch (err) {
        setError(err.message || "Error loading categories");
        console.error("Error fetching categories:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleEdit = (categoryId) => {
    router.push(`/category-list/edit/${categoryId}`);
  };

  const handleDeleteClick = (categoryId, categoryName) => {
    setDeleteConfirm({ id: categoryId, name: categoryName });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    try {
      setIsDeleting(true);
      const token = localStorage.getItem("adminToken");
      
      const response = await fetch(
        `/backend-api/api/categories/${deleteConfirm.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete category");
      }

      // Remove from local state
      setCategories(categories.filter(cat => cat.id !== deleteConfirm.id));
      setDeleteConfirm(null);
      
      // Show success message
      alert("Category deleted successfully!");
    } catch (err) {
      alert("Error deleting category: " + err.message);
      console.error("Error deleting category:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedCategories = filteredCategories.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  return (
    <main className="flex-1 min-h-screen bg-[#f8fafc]">
      <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fadeIn">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <Breadcrumbs items={[{ label: "Categories" }]} />
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Product <span className="gradient-text">Categories</span>
            </h1>
            <p className="text-gray-500 mt-1">Manage and organize your product catalog</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/category-list/add-category">
              <Button className="btn-g !px-6 !py-2.5 !rounded-xl !text-sm flex items-center gap-2">
                <span className="text-xl">+</span> Add Category
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="card-premium p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-4 z-10 glass-panel">
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-semibold text-gray-900">{filteredCategories.length}</span> categories found
          </div>
        </div>

        {/* Main Content Card */}
        <div className="card-premium overflow-hidden transition-all duration-300">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-50 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Data</h3>
              <p className="text-gray-500 max-w-md mx-auto">{error}</p>
              <Button onClick={() => window.location.reload()} className="mt-6 !text-primary font-semibold hover:underline">
                Try again
              </Button>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-20 text-center animate-scaleIn">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0l-8 8-8-8" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No categories found</h3>
              <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                {searchTerm ? `No results for "${searchTerm}"` : "Get started by adding your first product category."}
              </p>
              {!searchTerm && (
                <Link href="/category-list/add-category">
                  <Button className="btn-g !px-8">Create Category</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <TableContainer>
                <Table className="table-premium">
                  <TableHead>
                    <TableRow>
                      <TableCell width="120">PREVIEW</TableCell>
                      <TableCell>CATEGORY INFORMATION</TableCell>
                      <TableCell align="right">ACTIONS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayedCategories.map((category) => (
                      <TableRow key={category.id} className="group hover:bg-gray-50/50 transition-colors">
                        <TableCell>
                          <div className="relative w-20 h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
                            {category.image ? (
                              <img
                                src={category.image}
                                alt={category.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <div className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter">No Preview</div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 text-base mb-0.5 group-hover:text-primary transition-colors">
                              {category.name}
                            </span>
                            <span className="text-sm text-gray-500 line-clamp-1 max-w-md">
                              {category.description || "No description provided"}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell align="right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button
                              onClick={() => handleEdit(category.id)}
                              className="w-10 h-10 min-w-0 !rounded-xl !bg-blue-50 !text-blue-600 hover:!bg-blue-600 hover:!text-white transition-all shadow-sm"
                              title="Edit"
                            >
                              <RiEdit2Line size={18} />
                            </Button>
                            <Button
                              onClick={() => handleDeleteClick(category.id, category.name)}
                              className="w-10 h-10 min-w-0 !rounded-xl !bg-red-50 !text-red-600 hover:!bg-red-600 hover:!text-white transition-all shadow-sm"
                              title="Delete"
                            >
                              <FaRegTrashAlt size={18} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100">
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredCategories.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  className="!border-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-fadeIn"
              onClick={() => setDeleteConfirm(null)}
            ></div>
            <div className="card-premium relative w-full max-w-md p-8 animate-scaleIn shadow-2xl">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 mb-6 mx-auto">
                <FaRegTrashAlt size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">Delete Category?</h3>
              <p className="text-gray-500 text-center mb-8">
                Are you sure you want to delete <span className="font-bold text-gray-900">"{deleteConfirm.name}"</span>? This will remove it from all associated products.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => setDeleteConfirm(null)}
                  className="!py-3 !rounded-xl !bg-gray-100 !text-gray-700 !font-semibold hover:!bg-gray-200 transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="!py-3 !rounded-xl !bg-red-600 !text-white !font-semibold hover:!bg-red-700 disabled:!opacity-50 transition-all shadow-lg shadow-red-200"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default CategoryListPage;
