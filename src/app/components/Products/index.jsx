"use client";
import {
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Tooltip,
} from "@mui/material";
import React, { useState, useEffect, useMemo } from "react";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
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
import Breadcrumbs from "@/app/components/Breadcrumbs";
import {
  RiEdit2Line,
  RiBox3Line,
  RiMoneyDollarCircleLine,
  RiErrorWarningLine,
  RiAddLine,
  RiSearchLine,
  RiFilter3Line,
  RiDeleteBin6Line,
  RiEyeLine,
  RiCloseLine,
  RiShoppingBag3Line,
  RiStarLine,
  RiArrowRightSLine,
  RiHome4Line,
} from "react-icons/ri";
import { LuArrowUpRight } from "react-icons/lu";
import Link from "next/link";
import { productsAPI, categoriesAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/utils/formatCurrency";

const label = { slotProps: { input: { "aria-label": "Checkbox demo" } } };

const columns = [
  { id: "PRODUCT", label: "Product", minWidth: 260 },
  { id: "CATEGORY", label: "Category", minWidth: 120 },
  { id: "PRICE", label: "Price", minWidth: 130 },
  { id: "STOCK", label: "Stock", minWidth: 110 },
  { id: "RATING", label: "Rating", minWidth: 150 },
  { id: "ACTIONS", label: "Actions", minWidth: 110, align: "right" },
];

/* ------------------------------------------------------------------ */
/*  Stat Card — mirrors DashboardBoxes/Box.jsx pattern                  */
/* ------------------------------------------------------------------ */
const StatCard = ({ icon, title, count, iconBg }) => (
  <div className="group w-full p-6 rounded-2xl bg-white border border-gray-100 hover:border-primary/20 hover:shadow-lg shadow-sm transition-all duration-300 cursor-default relative overflow-hidden">
    {/* bg circle decoration */}
    <div
      className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-[0.06] ${iconBg}`}
    />

    <div className="flex items-start justify-between">
      <div className="flex flex-col gap-1">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
          {title}
        </p>
        <h2 className="text-3xl font-black text-gray-800 mt-1 font-outfit">{count}</h2>
      </div>
      <div
        className={`p-3.5 rounded-2xl ${iconBg} shadow-md group-hover:scale-110 transition-transform duration-300`}
      >
        {icon}
      </div>
    </div>

    <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-gray-400 group-hover:text-primary transition-colors duration-200 uppercase tracking-wider">
      <LuArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      <span>View details</span>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Stock Badge                                                         */
/* ------------------------------------------------------------------ */
const StockBadge = ({ stock }) => {
  if (stock > 10)
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
        {stock} in stock
      </span>
    );
  if (stock > 0)
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
        Low: {stock}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-100">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
      Out of Stock
    </span>
  );
};

/* ================================================================== */
/*  Main Component                                                      */
/* ================================================================== */
const ProductsComponent = ({ isFullPage = false }) => {
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

  const stats = useMemo(() => {
    if (!Array.isArray(products)) return { total: 0, value: 0, lowStock: 0 };
    return products.reduce(
      (acc, curr) => ({
        total: acc.total + 1,
        value: acc.value + (curr.price || 0) * (curr.stock || 0),
        lowStock: acc.lowStock + (curr.stock < 10 ? 1 : 0),
      }),
      { total: 0, value: 0, lowStock: 0 }
    );
  }, [products]);

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => {
    const t = setTimeout(() => fetchProducts(), 300);
    return () => clearTimeout(t);
  }, [searchTerm, category]);

  const fetchCategories = async () => {
    try {
      const res = await categoriesAPI.getAll();
      const data =
        res?.categories ?? (Array.isArray(res) ? res : res?.data ?? []);
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (category) params.category = category;
      const res = await productsAPI.getAll(params);
      const data =
        res?.products ?? res?.data ?? (Array.isArray(res) ? res : []);
      setProducts(Array.isArray(data) ? data : []);
      setPage(0);
    } catch (e) {
      console.error(e);
      setProducts([]);
    } finally { setLoading(false); }
  };

  const handleEdit = (p) => router.push(`/products-list/add-product?edit=${p.id}`);
  const handleView = (p) => { setSelectedProduct(p); setViewDialogOpen(true); };
  const handleDeleteClick = (p) => { setSelectedProduct(p); setDeleteDialogOpen(true); };
  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;
    try {
      await productsAPI.delete(selectedProduct.id);
      setProducts((prev) =>
        Array.isArray(prev) ? prev.filter((p) => p.id !== selectedProduct.id) : []
      );
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
    } catch (e) {
      alert("Failed to delete: " + (e.message || "Unknown error"));
    }
  };

  const paginatedProducts = (Array.isArray(products) ? products : []).slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <section className="w-full space-y-6 animate-fadeIn">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <Breadcrumbs items={[{ label: "Products" }]} />
          <h1 className="text-2xl font-black text-gray-900 tracking-tight font-outfit leading-tight mt-1">
            {isFullPage ? "Products Management" : "Products"}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5 font-medium">
            Manage and track your product inventory
          </p>
        </div>
        <Link href="/products-list/add-product">
          <Button className="btn-g !px-6 !py-3 !rounded-2xl flex items-center gap-2 !text-sm !font-bold !whitespace-nowrap hover:shadow-primary/30 transition-shadow">
            <RiAddLine size={20} />
            Add Product
          </Button>
        </Link>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Total Products"
          count={stats.total}
          iconBg="bg-blue-500"
          icon={<RiShoppingBag3Line size={22} className="text-white" />}
        />
        <StatCard
          title="Inventory Value"
          count={formatCurrency(stats.value)}
          iconBg="bg-emerald-500"
          icon={<RiMoneyDollarCircleLine size={22} className="text-white" />}
        />
        <StatCard
          title="Low Stock Items"
          count={stats.lowStock}
          iconBg="bg-red-400"
          icon={<RiErrorWarningLine size={22} className="text-white" />}
        />
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Filter Bar */}
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {/* Search */}
          <div className="flex items-center gap-3 flex-1 bg-gray-50/80 border border-gray-200 rounded-2xl px-5 py-3 focus-within:bg-white focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/5 transition-all">
            <RiSearchLine size={18} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder:text-gray-400 font-medium"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 bg-gray-50/80 border border-gray-200 rounded-2xl px-5 py-2 focus-within:bg-white focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/5 transition-all min-w-[200px]">
            <RiFilter3Line size={16} className="text-gray-400 flex-shrink-0" />
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              displayEmpty
              variant="standard"
              disableUnderline
              fullWidth
              sx={{
                "& .MuiSelect-select": {
                  py: 0.5,
                  fontSize: "0.875rem",
                  color: category === "" ? "#9ca3af" : "#374151",
                  fontWeight: 600,
                },
              }}
              renderValue={(v) => {
                if (!v) return "All Categories";
                const cat = categories.find((c) => c.id === v || c.name === v);
                return cat ? cat.name : v;
              }}
            >
              <MenuItem value="" className="!text-sm !py-2.5">
                <span className="text-gray-400 font-medium">All Categories</span>
              </MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id} className="!text-sm !py-2.5 hover:!bg-orange-50 font-medium">
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </div>
        </div>

        {/* Table */}
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader aria-label="products table">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" className="!bg-gray-50/50">
                  <Checkbox {...label} size="small" />
                </TableCell>
                {columns.map((col) => (
                  <TableCell
                    key={col.id}
                    align={col.align}
                    style={{ minWidth: col.minWidth }}
                    className="!bg-gray-50/50 !text-[11px] !font-black !text-gray-400 !uppercase !tracking-[0.15em] !py-4"
                  >
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                Array.from({ length: 7 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell padding="checkbox"><Checkbox size="small" disabled /></TableCell>
                    {columns.map((col) => (
                      <TableCell key={col.id}>
                        <div
                          className="skeleton h-3.5 rounded-lg"
                          style={{ width: `${60 + (i * 11) % 40}%` }}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : paginatedProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" className="!py-32">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <RiBox3Line size={64} className="text-gray-400" />
                      <div className="space-y-1">
                        <p className="text-gray-800 font-bold text-lg">No products found</p>
                        {searchTerm && (
                          <p className="text-sm text-gray-500 max-w-xs">
                            Try different keywords or check your spelling
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProducts.map((product) => (
                  <TableRow
                    key={product.id}
                    hover
                    className="group"
                    sx={{
                      "&:hover td": { backgroundColor: "#fff8f5 !important" },
                      "&:last-child td": { borderBottom: "none !important" },
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox {...label} size="small" className="group-hover:text-primary transition-colors" />
                    </TableCell>

                    {/* Product */}
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 group-hover:border-primary/30 group-hover:scale-105 transition-all shadow-sm">
                          <Image
                            src={product.images?.[0] || "/taro.png"}
                            alt={product.name || "product"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800 group-hover:text-primary transition-colors line-clamp-1 font-outfit">
                            {product.name || "N/A"}
                          </p>
                          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                            {product.brand || product.category?.name || "—"}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-[11px] font-bold bg-gray-100 text-gray-600 uppercase tracking-wider">
                        {product.category?.name || "Uncategorized"}
                      </span>
                    </TableCell>

                    {/* Price */}
                    <TableCell>
                      <p className="text-sm font-black text-gray-900 font-outfit">
                        {formatCurrency(product.price || 0)}
                      </p>
                      {product.originalPrice > product.price && (
                        <p className="text-[11px] text-gray-400 line-through font-bold mt-0.5">
                          {formatCurrency(product.originalPrice)}
                        </p>
                      )}
                    </TableCell>

                    {/* Stock */}
                    <TableCell>
                      <StockBadge stock={product.stock} />
                    </TableCell>

                    {/* Rating */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-gray-700 font-outfit">
                          {(product.rating || 0).toFixed(1)}
                        </span>
                        <Rating
                          value={product.rating || 0}
                          readOnly
                          size="small"
                          precision={0.5}
                          className="!text-amber-400 shadow-sm"
                        />
                        <span className="text-[11px] text-gray-400 font-bold">
                          ({Array.isArray(product.reviews) ? product.reviews.length : 0})
                        </span>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right">
                      <div className="flex items-center justify-end gap-2">
                        <Tooltip title="Quick View" arrow>
                          <IconButton
                            onClick={() => handleView(product)}
                            size="small"
                            className="!w-9 !h-9 !bg-blue-50 !text-blue-600 hover:!bg-blue-600 hover:!text-white !rounded-xl !transition-all shadow-sm"
                          >
                            <RiEyeLine size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Details" arrow>
                          <IconButton
                            onClick={() => handleEdit(product)}
                            size="small"
                            className="!w-9 !h-9 !bg-emerald-50 !text-emerald-600 hover:!bg-emerald-600 hover:!text-white !rounded-xl !transition-all shadow-sm"
                          >
                            <RiEdit2Line size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Product" arrow>
                          <IconButton
                            onClick={() => handleDeleteClick(product)}
                            size="small"
                            className="!w-9 !h-9 !bg-red-50 !text-red-500 hover:!bg-red-500 hover:!text-white !rounded-xl !transition-all shadow-sm"
                          >
                            <RiDeleteBin6Line size={18} />
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
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0); }}
          className="!border-t !border-gray-100 !text-xs !text-gray-500 !font-bold py-2"
        />
      </div>

      {/* ── View Dialog ── */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ elevation: 0, sx: { borderRadius: "32px", overflow: "hidden" } }}
      >
        <div className="relative">
          <IconButton
            onClick={() => setViewDialogOpen(false)}
            className="!absolute !right-6 !top-6 !z-50 !bg-white/80 hover:!bg-white hover:!text-primary !shadow-xl !backdrop-blur-md !rounded-2xl !w-10 !h-10 transition-all"
          >
            <RiCloseLine size={24} />
          </IconButton>

          <DialogContent className="!p-0">
            {selectedProduct && (
              <div className="flex flex-col md:flex-row min-h-[500px]">
                {/* Image */}
                <div className="w-full md:w-5/12 bg-gradient-to-br from-gray-50 to-gray-200/50 p-10 flex items-center justify-center relative">
                  <span className="absolute top-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-md shadow-lg rounded-2xl text-[11px] font-bold text-gray-700 border border-white uppercase tracking-widest z-10">
                    {selectedProduct.category?.name || "Uncategorized"}
                  </span>
                  <div className="relative w-full aspect-square max-w-[280px] hover:scale-110 transition-transform duration-700 ease-out">
                    <Image
                      src={selectedProduct.images?.[0] || "/taro.png"}
                      alt={selectedProduct.name}
                      fill
                      className="object-contain drop-shadow-2xl mix-blend-multiply"
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="w-full md:w-7/12 p-10 md:p-12 flex flex-col bg-white">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center p-1.5 px-3 bg-amber-50 rounded-xl border border-amber-100/50">
                        <Rating
                          value={selectedProduct.rating || 0}
                          readOnly
                          size="small"
                          precision={0.5}
                          className="!text-amber-400"
                        />
                      </div>
                      <span className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-gray-100 text-gray-500 uppercase tracking-widest">
                        ID #{selectedProduct.id}
                      </span>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-[1.1] mb-3 font-outfit">
                      {selectedProduct.name || "Product Name"}
                    </h2>

                    <div className="flex items-baseline gap-4 mb-8">
                      <span className="text-4xl font-black text-primary font-outfit tracking-tight">
                        {formatCurrency(selectedProduct.price || 0)}
                      </span>
                      {selectedProduct.originalPrice > selectedProduct.price && (
                        <span className="text-xl text-gray-400 line-through font-bold">
                          {formatCurrency(selectedProduct.originalPrice)}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="p-5 bg-blue-50/50 rounded-3xl border border-blue-100/50 group hover:bg-blue-50 transition-colors">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-3 flex items-center gap-2">
                          <RiBox3Line size={14} /> Stock Level
                        </p>
                        <div className="flex items-baseline gap-2">
                          <span className={`w-3 h-3 rounded-full flex-shrink-0 shadow-sm ${selectedProduct.stock > 0 ? "bg-blue-500 animate-pulse" : "bg-red-400"}`} />
                          <span className="text-3xl font-black text-gray-800 font-outfit">{selectedProduct.stock || 0}</span>
                          <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Units</span>
                        </div>
                      </div>
                      <div className="p-5 bg-purple-50/50 rounded-3xl border border-purple-100/50 group hover:bg-purple-50 transition-colors">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-500 mb-3 flex items-center gap-2">
                          <RiStarLine size={14} /> Brand
                        </p>
                        <span className="text-xl font-black text-gray-800 truncate block font-outfit" title={selectedProduct.brand}>
                          {selectedProduct.brand || "Generic"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                        Product Description
                      </h4>
                      <p className="text-sm text-gray-500 leading-relaxed font-medium line-clamp-4">
                        {selectedProduct.description || "No detailed description provided for this item."}
                      </p>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-gray-100 mt-8 flex gap-4">
                    <Button
                      onClick={() => handleEdit(selectedProduct)}
                      className="flex-1 btn-g !py-4 !rounded-2xl !text-sm !font-black !capitalize !tracking-widest"
                      startIcon={<RiEdit2Line />}
                    >
                      Edit Product
                    </Button>
                    <Button
                      onClick={() => handleDeleteClick(selectedProduct)}
                      className="!px-8 !border-2 !border-red-100 !text-red-500 !bg-red-50/50 hover:!bg-red-500 hover:!text-white hover:!border-red-500 !rounded-2xl !capitalize !font-black !text-sm !transition-all"
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

      {/* ── Delete Dialog ── */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ elevation: 0, sx: { borderRadius: "40px" } }}
      >
        <div className="p-10 text-center w-[360px]">
          <div className="w-20 h-20 bg-red-50 border-2 border-red-100/50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <RiDeleteBin6Line size={32} className="text-red-500" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2 font-outfit">Delete Product?</h3>
          <p className="text-sm text-gray-400 mb-10 leading-relaxed font-medium">
            Are you sure you want to delete<br/>
            <strong className="text-gray-800">{selectedProduct?.name}</strong>?<br/>
            <span className="text-[11px] font-bold text-red-400 uppercase tracking-widest mt-2 block">This action is irreversible</span>
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              fullWidth
              className="!py-3.5 !border-2 !border-gray-100 !text-gray-500 hover:!bg-gray-50 hover:!border-gray-200 !rounded-2xl !capitalize !font-black !text-xs !tracking-widest !transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              fullWidth
              className="!py-3.5 !bg-red-500 hover:!bg-red-600 !text-white !rounded-2xl !capitalize !font-black !shadow-xl !shadow-red-500/20 !text-xs !tracking-widest !transition-all"
            >
              Delete
            </Button>
          </div>
        </div>
      </Dialog>
    </section>
  );
};

export default ProductsComponent;
