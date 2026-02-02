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
import Rating from "@mui/material/Rating";
import { RiEdit2Line } from "react-icons/ri";
import { IoEyeOutline } from "react-icons/io5";
import { FaRegTrashAlt } from "react-icons/fa";
import Link from "next/link";
import { productsAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/utils/formatCurrency";

const label = { slotProps: { input: { "aria-label": "Checkbox demo" } } };

const columns = [
  { id: "ID", label: "ID", minWidth: 40 },
  { id: "PRODUCT", label: "PRODUCT", minWidth: 300 },
  { id: "CATEGORY", label: "CATEGORY", minWidth: 100 },
  { id: "PRICE", label: "PRICE", minWidth: 100 },
  { id: "STOK", label: "STOK", minWidth: 100 },
  { id: "RATING", label: "RATING", minWidth: 100 },
  { id: "ACTIONS", label: "ACTIONS", minWidth: 100 },
];

const ProductsComponent = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [category, setCategory] = useState("");

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();
      console.log('Products API Response:', response);
      
      // Handle different response formats
      let productsData = [];
      if (response?.products && Array.isArray(response.products)) {
        productsData = response.products;
      } else if (response?.data && Array.isArray(response.data)) {
        productsData = response.data;
      } else if (Array.isArray(response)) {
        productsData = response;
      }
      
      console.log('Products Data:', productsData);
      setProducts(productsData);
      
      if (productsData.length === 0) {
        console.warn('No products found in response');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]); // Set ke array kosong jika error
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

  const handleEdit = (product) => {
    router.push(`/products-list/add-product?edit=${product.id}`);
  };

  const handleView = (product) => {
    setSelectedProduct(product);
    setViewDialogOpen(true);
  };

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;

    try {
      await productsAPI.delete(selectedProduct.id);
      setProducts(Array.isArray(products) ? products.filter(product => product.id !== selectedProduct.id) : []);
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <section className="w-full py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] text-gray-700 font-[600]">Products</h2>
        <Link href={'/products-list/add-product'}>
          <Button className="btn-g" size="20">
            Add Product
          </Button>
        </Link>
      </div>

      <div className="w-full p-4 rounded-md shadow-md bg-white mt-3">
        <div className="flex items-center justify-between mb-3">
          <div className="col w-[200px]">
            <h6 className="mb-1 text-[14px] text-gray-700">Category by</h6>
            <Select
              value={category}
              onChange={handleChangeCategory}
              displayEmpty
              inputProps={{ "aria-label": "Without label" }}
              size="small"
              className="w-full"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value={10}>Ten</MenuItem>
              <MenuItem value={20}>Twenty</MenuItem>
              <MenuItem value={30}>Thirty</MenuItem>
            </Select>
          </div>

          <div className="col">
            <Search width="400px" placeholder="Search product..." />
          </div>
        </div>

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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" className="py-10">
                    <p className="text-gray-500">Loading products...</p>
                  </TableCell>
                </TableRow>
              ) : !Array.isArray(products) || products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" className="py-10">
                    <p className="text-gray-500">No products found</p>
                  </TableCell>
                </TableRow>
              ) : (
                (Array.isArray(products) ? products : []).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((product) => (
                  <TableRow key={product.id} hover>
                    <TableCell>
                      <Checkbox {...label} size="small" />
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="img p-1 bg-white rounded-md">
                          <Image
                            src={product.image || "/taro.png"}
                            alt={product.name || "product image"}
                            width={50}
                            height={70}
                            className="object-cover"
                          />
                        </div>

                        <div className="info">
                          <h3 className="text-[13px] text-gray-800 font-[500]">
                            {product.name || 'N/A'}
                          </h3>
                          <span className="text-gray-700 text-[13px]">
                            {product.brand || product.category || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>{product.category || 'N/A'}</TableCell>

                    <TableCell>
                      <div className="flex flex-col justify-between">
                        <span className="text-[#CB0000] text-[13px] font-[600]">
                          {formatCurrency(product.price || 0)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-[#A4A4A4] text-[13px] font-[600] line-through">
                            {formatCurrency(product.originalPrice)}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-primary font-bold">{product.stock || 0}</span>
                    </TableCell>

                    <TableCell>
                      <Rating 
                        name="read-only" 
                        value={product.rating || 0} 
                        readOnly 
                        size="small" 
                      />
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Tooltip title="Edit">
                          <IconButton
                            onClick={() => handleEdit(product)}
                            className="!w-[40px] !h-[40px] !min-w-[40px] hover:!bg-blue-50"
                            size="small"
                          >
                            <RiEdit2Line size={20} className="text-blue-600" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="View">
                          <IconButton
                            onClick={() => handleView(product)}
                            className="!w-[40px] !h-[40px] !min-w-[40px] hover:!bg-green-50"
                            size="small"
                          >
                            <IoEyeOutline size={20} className="text-green-600" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete">
                          <IconButton
                            onClick={() => handleDeleteClick(product)}
                            className="!w-[40px] !h-[40px] !min-w-[40px] hover:!bg-red-50"
                            size="small"
                          >
                            <FaRegTrashAlt size={20} className="text-red-600" />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={Array.isArray(products) ? products.length : 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </div>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Product Details</DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <div className="space-y-4 mt-2">
              <div className="flex gap-4">
                <div className="w-32 h-40 bg-gray-100 rounded-md overflow-hidden">
                  <Image
                    src={selectedProduct.image || "/taro.png"}
                    alt={selectedProduct.name}
                    width={128}
                    height={160}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedProduct.name || 'N/A'}</h3>
                  <p className="text-gray-600 mb-4">{selectedProduct.description || 'No description'}</p>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-semibold text-gray-600">Price: </span>
                      <span className="text-[#CB0000] font-bold">{formatCurrency(selectedProduct.price || 0)}</span>
                      {selectedProduct.originalPrice && (
                        <span className="text-[#A4A4A4] line-through ml-2">{formatCurrency(selectedProduct.originalPrice)}</span>
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-600">Stock: </span>
                      <span className="text-primary font-bold">{selectedProduct.stock || 0}</span>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-600">Category: </span>
                      <span>{selectedProduct.category || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-600">Rating: </span>
                      <Rating value={selectedProduct.rating || 0} readOnly size="small" />
                    </div>
                  </div>
                </div>
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
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete product <strong>{selectedProduct?.name}</strong>? 
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
    </section>
  );
};

export default ProductsComponent;
