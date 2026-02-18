"use client";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, IconButton, Tooltip, Chip } from "@mui/material";
import React, { useState, useEffect, useMemo } from "react";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
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
import { RiEdit2Line, RiBox3Line, RiMoneyDollarCircleLine, RiErrorWarningLine, RiAddLine, RiSearchLine, RiFilter3Line, RiArrowDownSLine } from "react-icons/ri";
import { IoEyeOutline } from "react-icons/io5";
import { FaRegTrashAlt } from "react-icons/fa";
import Link from "next/link";
import { productsAPI, categoriesAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/utils/formatCurrency";

const label = { slotProps: { input: { "aria-label": "Checkbox demo" } } };

const columns = [
  { id: "PRODUCT", label: "Product", minWidth: 280 },
  { id: "CATEGORY", label: "Category", minWidth: 120 },
  { id: "PRICE", label: "Price", minWidth: 120 },
  { id: "STOCK", label: "Stock", minWidth: 100 },
  { id: "RATING", label: "Rating", minWidth: 140 },
  { id: "ACTIONS", label: "Actions", minWidth: 100, align: "right" },
];

const ProductsComponent = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [category, setCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  // Stats derivation
  const stats = useMemo(() => {
    if (!Array.isArray(products)) return { total: 0, value: 0, lowStock: 0 };
    return products.reduce((acc, curr) => ({
      total: acc.total + 1,
      value: acc.value + (curr.price || 0) * (curr.stock || 0),
      lowStock: acc.lowStock + (curr.stock < 10 ? 1 : 0)
    }), { total: 0, value: 0, lowStock: 0 });
  }, [products]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchProducts();
    }, 300);
    
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, category]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      let categoriesData = [];
      if (response?.categories && Array.isArray(response.categories)) {
        categoriesData = response.categories;
      } else if (Array.isArray(response)) {
        categoriesData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        categoriesData = response.data;
      }
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (category) params.category = category;
      
      const response = await productsAPI.getAll(params);
      
      let productsData = [];
      if (response?.products && Array.isArray(response.products)) {
        productsData = response.products;
      } else if (response?.data && Array.isArray(response.data)) {
        productsData = response.data;
      } else if (Array.isArray(response)) {
        productsData = response;
      }
      
      setProducts(productsData);
      setPage(0);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeCategory = (event) => {
    setCategory(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
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
    <section className="w-full space-y-6">
      
      {/* Header and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-4 flex items-center justify-between mb-2">
           <div>
            <h2 className="text-2xl font-bold text-gray-800">Products</h2>
            <p className="text-sm text-gray-500">Manage your product inventory</p>
           </div>
           <Link href={'/products-list/add-product'}>
            <Button 
              className="btn-g !px-6 !py-2.5 !rounded-full !text-white !capitalize flex items-center gap-2"
            >
              <RiAddLine size={20} />
              Add Product
            </Button>
          </Link>
        </div>

        {/* Stat Components */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all duration-300">
           <div className="p-3 rounded-full bg-blue-50 text-blue-600">
             <RiBox3Line size={24} />
           </div>
           <div>
             <p className="text-sm text-gray-500 font-medium">Total Products</p>
             <h3 className="text-xl font-bold text-gray-800">{stats.total}</h3>
           </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all duration-300">
           <div className="p-3 rounded-full bg-green-50 text-green-600">
             <RiMoneyDollarCircleLine size={24} />
           </div>
           <div>
             <p className="text-sm text-gray-500 font-medium">Total Value</p>
             <h3 className="text-xl font-bold text-gray-800">{formatCurrency(stats.value)}</h3>
           </div>
        </div>

         <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all duration-300">
           <div className="p-3 rounded-full bg-red-50 text-red-600">
             <RiErrorWarningLine size={24} />
           </div>
           <div>
             <p className="text-sm text-gray-500 font-medium">Low Stock</p>
             <h3 className="text-xl font-bold text-gray-800">{stats.lowStock}</h3>
           </div>
        </div>
         
         {/* Extra Card or Spacer */}
         <div className="bg-gradient-to-br from-[#D96F32] to-[#E88A4D] p-5 rounded-xl shadow-lg flex flex-col justify-center text-white relative overflow-hidden">
             <div className="absolute -right-5 -bottom-5 opacity-20">
               <RiBox3Line size={100} />
             </div>
             <p className="text-sm font-medium opacity-90">Quick Tip</p>
             <p className="text-xs mt-1 opacity-80">Check low stock items regularly to avoid stockouts.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="card-premium bg-white rounded-xl overflow-hidden border border-gray-100">
        
        {/* Filters */}
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all w-full sm:w-auto min-w-[300px]">
            <RiSearchLine className="text-gray-400" />
            <input 
              type="text"
              placeholder="Search products..." 
              value={searchTerm}
              onChange={handleSearchChange}
              className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder:text-gray-400"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
             <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 transition-all hover:border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 relative">
                <RiFilter3Line className="text-gray-400 absolute left-3" />
                <Select
                  value={category}
                  onChange={handleChangeCategory}
                  displayEmpty
                  inputProps={{ "aria-label": "Category" }}
                  variant="standard"
                  disableUnderline
                  className="text-sm min-w-[140px]"
                  IconComponent={() => <RiArrowDownSLine className="text-gray-500 absolute right-1 pointer-events-none" size={18} />}
                  sx={{ 
                    '& .MuiSelect-select': { 
                      pl: 3.5, // Space for the filter icon
                      pr: 3,   // Space for the arrow
                      py: 0.5,
                      fontSize: '0.875rem',
                      color: category === "" ? '#9ca3af' : '#374151',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                    } 
                  }}
                  renderValue={(selected) => {
                    if (selected === "") {
                      return "All Categories";
                    }
                    const cat = categories.find(c => c.id === selected || c.name === selected);
                    return cat ? cat.name : selected;
                  }}
                >
                  <MenuItem value="" className="!text-sm !font-medium !py-2.5">
                    <span className="text-gray-500">All Categories</span>
                  </MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id} className="!text-sm !font-medium !py-2.5 hover:!bg-orange-50 transition-colors">
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
             </div>
          </div>
        </div>

        {/* Table */}
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader aria-label="customized table">
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
                    className="!font-bold !text-gray-600 !bg-gray-50/80 !border-b !border-gray-200 !py-4"
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" className="py-20">
                    <div className="flex flex-col items-center justify-center">
                       <span className="loading loading-spinner loading-lg text-primary"></span>
                       <p className="text-gray-500 mt-2 font-medium">Loading products...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : !Array.isArray(products) || products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" className="py-20">
                    <div className="flex flex-col items-center justify-center opacity-60">
                      <RiBox3Line size={48} className="text-gray-300 mb-2" />
                      <p className="text-gray-500 font-medium">No products found</p>
                      {searchTerm && <p className="text-sm text-gray-400">Try adjusting your search criteria</p>}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                (Array.isArray(products) ? products : []).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((product) => (
                  <TableRow 
                    key={product.id} 
                    hover 
                    className="group transition-colors duration-200 hover:bg-orange-50/30"
                  >
                    <TableCell padding="checkbox">
                      <Checkbox {...label} size="small" className="text-gray-400" />
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 group-hover:border-primary/30 transition-colors">
                          <Image
                            src={product.images?.[0] || "/taro.png"}
                            alt={product.name || "product"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-800 group-hover:text-primary transition-colors">
                            {product.name || 'N/A'}
                          </h3>
                          <p className="text-xs text-gray-500">{product.brand || product.category?.name || 'N/A'}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {product.category?.name || 'Uncategorized'}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div>
                        <span className="text-sm font-bold text-gray-900">
                          {formatCurrency(product.price || 0)}
                        </span>
                         {product.originalPrice > product.price && (
                          <span className="block text-xs text-gray-400 line-through">
                            {formatCurrency(product.originalPrice)}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                         product.stock > 10 
                           ? 'bg-green-100 text-green-700' 
                           : product.stock > 0 
                             ? 'bg-yellow-100 text-yellow-700' 
                             : 'bg-red-100 text-red-700'
                       }`}>
                         {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                       </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-gray-700">{product.rating || 0}</span>
                        <Rating 
                          value={product.rating || 0} 
                          readOnly 
                          size="small" 
                          className="!text-yellow-400 !text-[14px]"
                        />
                        <span className="text-xs text-gray-400">({Array.isArray(product.reviews) ? product.reviews.length : 0})</span>
                      </div>
                    </TableCell>

                    <TableCell align="right">
                      <div className="flex items-center justify-end gap-2 opacity-100 overflow-hidden transition-all">
                        <Tooltip title="View Details">
                          <IconButton
                            onClick={() => handleView(product)}
                            size="small"
                            className="!bg-blue-50 !text-blue-600 hover:!bg-blue-100 hover:!text-blue-700 !transition-all"
                          >
                            <IoEyeOutline size={18} />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Edit Product">
                          <IconButton
                            onClick={() => handleEdit(product)}
                            size="small"
                            className="!bg-green-50 !text-green-600 hover:!bg-green-100 hover:!text-green-700 !transition-all"
                          >
                            <RiEdit2Line size={18} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete">
                          <IconButton
                            onClick={() => handleDeleteClick(product)}
                            size="small"
                            className="!bg-red-50 !text-red-600 hover:!bg-red-100 hover:!text-red-700 !transition-all"
                          >
                            <FaRegTrashAlt size={16} />
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
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={Array.isArray(products) ? products.length : 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          className="!border-t !border-gray-100"
        />
      </div>

      {/* View Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          elevation: 0,
          className: "!rounded-2xl !overflow-hidden"
        }}
        TransitionProps={{ timeout: 500 }}
      >
         <div className="relative bg-white">
           <IconButton 
            onClick={() => setViewDialogOpen(false)}
            className="!absolute !right-4 !top-4 !z-50 !bg-white/80 hover:!bg-white !shadow-sm !backdrop-blur-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </IconButton>

          <DialogContent className="!p-0">
            {selectedProduct && (
              <div className="flex flex-col md:flex-row h-full min-h-[500px]">
                {/* Image Section */}
                <div className="w-full md:w-5/12 bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center relative">
                  <div className="relative w-full aspect-square max-w-[280px] mix-blend-multiply transition-transform hover:scale-105 duration-500">
                    <Image
                      src={selectedProduct.images?.[0] || "/taro.png"}
                      alt={selectedProduct.name}
                      fill
                      className="object-contain drop-shadow-xl"
                    />
                  </div>
                  
                   <span className="absolute top-6 left-6 px-4 py-1.5 bg-white/90 backdrop-blur-sm shadow-sm rounded-full text-xs font-bold tracking-wide text-gray-700 border border-gray-100">
                    {selectedProduct.category?.name || 'Uncategorized'}
                  </span>
                </div>

                {/* Content Section */}
                <div className="w-full md:w-7/12 p-8 md:p-10 flex flex-col bg-white">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                       <Rating 
                        value={selectedProduct.rating || 0} 
                        readOnly 
                        size="small" 
                        className="!text-yellow-400"
                      />
                       <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-500">
                         ID: #{selectedProduct.id}
                       </span>
                    </div>

                    <h2 className="text-3xl font-extrabold text-gray-900 mb-3 leading-tight tracking-tight">
                      {selectedProduct.name || 'Product Name'}
                    </h2>

                    <div className="flex items-baseline gap-4 mb-8">
                      <h3 className="text-4xl font-black text-primary">
                        {formatCurrency(selectedProduct.price || 0)}
                      </h3>
                      {selectedProduct.originalPrice > selectedProduct.price && (
                        <span className="text-lg text-gray-400 line-through font-medium">
                          {formatCurrency(selectedProduct.originalPrice)}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 hover:border-blue-200 transition-colors">
                        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
                          <RiBox3Line /> Stock Level
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className={`w-3 h-3 rounded-full ${selectedProduct.stock > 0 ? 'bg-blue-500' : 'bg-red-500'}`}></span>
                          <span className="text-2xl font-bold text-gray-800">{selectedProduct.stock || 0}</span>
                          <span className="text-sm text-gray-500 font-medium">units</span>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 hover:border-purple-200 transition-colors">
                         <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600 mb-2">
                           <RiBox3Line /> Brand
                         </span>
                         <span className="text-xl font-bold text-gray-800 truncate block" title={selectedProduct.brand}>
                           {selectedProduct.brand || 'Generic'}
                         </span>
                      </div>
                    </div>

                    <div className="mb-8">
                      <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Description</h4>
                      <p className="text-base text-gray-600 leading-relaxed font-light">
                        {selectedProduct.description || 'No description available for this product.'}
                      </p>
                    </div>
                  </div>

                   <div className="pt-6 border-t border-gray-100 mt-auto flex gap-4">
                     <Button 
                      onClick={() => handleEdit(selectedProduct)}
                      variant="contained"
                      className="flex-1 !bg-primary !text-white !py-3 !rounded-xl !shadow-lg hover:!bg-primary-dark hover:!shadow-xl transition-all normal-case font-bold text-base"
                      startIcon={<RiEdit2Line />}
                    >
                      Edit Product
                    </Button>
                    <Button 
                       onClick={() => handleDeleteClick(selectedProduct)}
                      variant="outlined"
                      className="!px-6 !border-red-200 !text-red-500 !bg-red-50 hover:!bg-red-100 !rounded-xl transition-all normal-case font-bold"
                    >
                       Delete
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          className: "!rounded-2xl"
        }}
      >
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaRegTrashAlt size={28} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Product?</h3>
          <p className="text-gray-500 mb-6">
            Are you sure you want to delete <strong>{selectedProduct?.name}</strong>? <br/>
            This action cannot be undone.
          </p>
          <div className="flex justify-center gap-3">
             <Button 
               onClick={() => setDeleteDialogOpen(false)} 
               variant="outlined"
               className="!border-gray-300 !text-gray-700 hover:!bg-gray-50 !rounded-lg !px-5 normal-case"
             >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteConfirm} 
              variant="contained"
              className="!bg-red-600 hover:!bg-red-700 !shadow-red-200 !shadow-lg !rounded-lg !px-6 normal-case"
            >
              Yes, Delete
            </Button>
          </div>
        </div>
      </Dialog>
    </section>
  );
};

export default ProductsComponent;
