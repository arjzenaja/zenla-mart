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
        const response = await fetch("http://localhost:5000/api/categories");
        
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
        `http://localhost:5000/api/categories/${deleteConfirm.id}`,
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

  const displayedCategories = categories.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <main className="flex-1 min-h-screen" style={{
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)'
    }}>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 animate-fadeIn">
          <div>
            <h1 className="text-4xl font-extrabold gradient-text mb-2">Categories</h1>
            <p className="text-gray-600 text-lg">Manage product categories</p>
          </div>
          <Link href={"/category-list/add-category"}>
            <Button className="btn-g !px-6 !py-3">
              + Add Category
            </Button>
          </Link>
        </div>

        <div className="card-premium p-6 animate-scaleIn">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="skeleton w-full h-16 mb-4 rounded-xl"></div>
            <div className="skeleton w-full h-16 mb-4 rounded-xl"></div>
            <div className="skeleton w-full h-16 rounded-xl"></div>
          </div>
        ) : error ? (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 text-red-700 px-6 py-4 rounded-xl font-medium">
            {error}
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <p className="text-gray-500 text-lg">No categories found</p>
            <Link href={"/category-list/add-category"}>
              <Button className="btn-g mt-4">Add First Category</Button>
            </Link>
          </div>
        ) : (
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
                {displayedCategories.map((category) => (
                  <TableRow key={category.id} hover>
                    <TableCell className="!px-0">
                      <div className="flex items-center gap-3">
                        <div className="w-[100px] h-[80px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden flex items-center justify-center shadow-md group-hover:shadow-lg transition-smooth">
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-smooth"
                            />
                          ) : (
                            <span className="text-gray-400 text-sm font-medium">No Image</span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <h3 className="font-semibold text-gray-800">{category.name}</h3>
                        {category.description && (
                          <p className="text-sm text-gray-500">{category.description}</p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          className="w-[42px]! h-[42px]! min-w-[42px]! rounded-xl text-blue-600! hover:!bg-gradient-to-r hover:!from-blue-50 hover:!to-blue-100 transition-smooth shadow-sm hover:shadow-md!"
                          onClick={() => handleEdit(category.id)}
                          title="Edit Category"
                        >
                          <RiEdit2Line size={20} />
                        </Button>

                        <Button
                          className="w-[42px]! h-[42px]! min-w-[42px]! rounded-xl text-red-600! hover:!bg-gradient-to-r hover:!from-red-50 hover:!to-red-100 transition-smooth shadow-sm hover:shadow-md!"
                          onClick={() =>
                            handleDeleteClick(category.id, category.name)
                          }
                          title="Delete Category"
                        >
                          <FaRegTrashAlt size={20} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {!isLoading && categories.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={categories.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 animate-fadeIn">
          <div className="card-premium p-8 max-w-md mx-4 modal-content">
            <h3 className="text-2xl font-extrabold gradient-text mb-3">
              Delete Category?
            </h3>
            <p className="text-gray-600 mb-8 text-lg">
              Are you sure you want to delete{" "}
              <strong className="text-gray-800">{deleteConfirm.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-end">
              <Button
                onClick={() => setDeleteConfirm(null)}
                className="!text-gray-700 !bg-gray-200 hover:!bg-gray-300 !px-6 !py-3 !rounded-xl !font-semibold transition-smooth"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="!text-white !bg-gradient-to-r !from-red-500 !to-red-600 hover:!from-red-600 hover:!to-red-700 disabled:!opacity-50 disabled:!cursor-not-allowed !px-6 !py-3 !rounded-xl !font-semibold !shadow-lg transition-smooth"
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
