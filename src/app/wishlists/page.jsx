"use client";
import { Button } from "@mui/material";
import React, { useState, useEffect } from "react";
import Search from "../components/Search";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { wishlistAPI } from "@/lib/api";
import { CircularProgress } from "@mui/material";
import { MdOutlineEmail } from "react-icons/md";
import { MdOutlineDateRange } from "react-icons/md";
import { IoEyeOutline } from "react-icons/io5";
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText } from "@mui/material";
import Image from "next/image";
import Rating from "@mui/material/Rating";
import { formatCurrency } from "@/utils/formatCurrency";

const columns = [
  { id: "USER", label: "USER", minWidth: 200 },
  { id: "ITEMS", label: "ITEMS COUNT", minWidth: 100 },
  { id: "CREATED AT", label: "CREATED AT", minWidth: 150 },
  { id: "UPDATED AT", label: "UPDATED AT", minWidth: 150 },
  { id: "ACTIONS", label: "ACTIONS", minWidth: 100 },
];

const WishlistsPage = () => {
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedWishlist, setSelectedWishlist] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  useEffect(() => {
    fetchWishlists();
  }, []);

  const fetchWishlists = async () => {
    try {
      setLoading(true);
      const response = await wishlistAPI.getAll();
      const wishlistsData = response?.wishlists || response?.data || [];
      setWishlists(Array.isArray(wishlistsData) ? wishlistsData : []);
    } catch (error) {
      console.error('Error fetching wishlists:', error);
      setWishlists([]);
      alert('Failed to load wishlists: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleView = async (wishlist) => {
    setSelectedWishlist(wishlist);
    setViewDialogOpen(true);
    
    // Fetch product details
    if (wishlist.items && wishlist.items.length > 0) {
      setLoadingProducts(true);
      try {
        const { productsAPI } = await import('@/lib/api');
        const productPromises = wishlist.items.map(productId => 
          productsAPI.getById(productId).catch(() => null)
        );
        const productResponses = await Promise.all(productPromises);
        const validProducts = productResponses
          .filter(response => response && (response.product || response))
          .map(response => response.product || response);
        setProducts(validProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    } else {
      setProducts([]);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStockStatus = (stock) => {
    if (stock && stock > 0) {
      return { text: 'In stock', color: 'text-green-600' };
    }
    return { text: 'Out of stock', color: 'text-red-600' };
  };

  return (
    <main className="flex-1 min-h-screen">
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 animate-fadeIn">
          <div>
            <h1 className="text-3xl font-extrabold gradient-text">Wishlists Management</h1>
            <p className="text-gray-500 mt-1 font-medium">
              Oversee user wishlists and interested products
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1">
             <Search width="320px" placeholder="Search wishlist..." />
          </div>
        </div>

        <div className="card-premium p-0 overflow-hidden shadow-premium animate-scaleIn">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="skeleton w-full h-12 mb-2 rounded-lg"></div>
              <div className="skeleton w-full h-12 mb-2 rounded-lg"></div>
              <div className="skeleton w-full h-12 rounded-lg"></div>
            </div>
          ) : !Array.isArray(wishlists) || wishlists.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-4xl">
                ❤️
              </div>
              <p className="text-gray-500 text-lg font-medium">No wishlists found</p>
            </div>
          ) : (
            <>
              <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader className="table-premium">
                  <TableHead>
                    <TableRow>
                      {columns.map((column) => (
                        <TableCell
                          key={column.id}
                          align="left"
                          style={{ minWidth: column.minWidth }}
                        >
                          {column.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {wishlists
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((wishlist) => (
                        <TableRow hover key={wishlist.id} className="transition-colors hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center font-bold text-lg border border-pink-100">
                                  {wishlist.user?.name?.charAt(0).toUpperCase() || 'U'}
                               </div>
                               <div className="flex flex-col">
                                  <span className="font-bold text-gray-800 text-sm">
                                    {wishlist.user?.name || 'Unknown User'}
                                  </span>
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <MdOutlineEmail size={12} />
                                    {wishlist.user?.email || 'N/A'}
                                  </span>
                               </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="badge badge-secondary">
                              {wishlist.itemCount || (wishlist.items ? wishlist.items.length : 0)} Items
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MdOutlineDateRange className="text-gray-400" />
                              {formatDate(wishlist.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                               <MdOutlineDateRange className="text-gray-400" />
                               {formatDate(wishlist.updatedAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleView(wishlist)}
                              className="!border-gray-200 !text-gray-600 hover:!bg-pink-50 hover:!text-pink-600 hover:!border-pink-200 !rounded-lg !capitalize !font-semibold"
                            >
                              <IoEyeOutline className="mr-1" size={16} />
                              View Items
                            </Button>
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
                    count={wishlists.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
              </div>
            </>
          )}
        </div>

        {/* View Dialog - Enhanced with Grid View */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => {
            setViewDialogOpen(false);
            setSelectedWishlist(null);
            setProducts([]);
          }}
          maxWidth="md"
          fullWidth
          PaperProps={{
            style: { borderRadius: 20, maxHeight: '85vh' }
          }}
        >
          <DialogTitle className="!px-6 !py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
                <h3 className="font-bold text-gray-800 text-lg">Wishlist Items</h3>
                <p className="text-xs text-gray-500 mt-1">user: {selectedWishlist?.user?.name}</p>
            </div>
            <div className="flex gap-2">
                 <span className="badge badge-info">{products.length} Products</span>
            </div>
          </DialogTitle>
          <DialogContent className="!p-6 bg-gray-50/30">
            {selectedWishlist && (
              <div>
                {loadingProducts ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <CircularProgress size={30} className="text-primary mb-3" />
                    <span className="text-sm font-medium text-gray-500">Fetching products...</span>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-12">
                     <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">🛍️</div>
                     <p className="text-gray-500 font-medium">No products found in this wishlist</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => {
                      const stockStatus = getStockStatus(product.stock);
                      const imageSrc = product.image || product.images?.[0] || "/taro.png";
                      const isLocalhostImage = imageSrc?.includes('localhost') || imageSrc?.includes('127.0.0.1');
                      return (
                        <div
                          key={product.id}
                          className="bg-white p-3 rounded-xl border border-gray-200 hover:shadow-md transition-all group"
                        >
                           <div className="relative aspect-square mb-3 overflow-hidden rounded-lg bg-gray-100">
                              <Image
                                src={imageSrc}
                                alt={product.name || 'Product'}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                unoptimized={isLocalhostImage}
                              />
                              {product.originalPrice > product.price && (
                                 <span className="absolute top-2 left-2 badge badge-danger text-[10px] shadow-sm">
                                    Sale
                                 </span>
                              )}
                           </div>

                           <div className="space-y-1">
                                <h5 className="font-bold text-gray-800 text-sm line-clamp-1" title={product.name}>
                                    {product.name || 'Product Name'}
                                </h5>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-primary font-bold text-sm">
                                        {formatCurrency(product.price || 0)}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <span className="text-[10px] font-bold text-gray-400">★</span>
                                        <span className="text-xs text-gray-600 font-medium">{product.rating || 0}</span>
                                    </div>
                                </div>
                                
                                <div className="pt-2 mt-2 border-t border-gray-50 flex items-center justify-between">
                                     <span className={`text-[10px] font-bold uppercase ${stockStatus.color}`}>
                                        {stockStatus.text}
                                     </span>
                                     <span className="text-[10px] text-gray-400">
                                        Stock: {product.stock || 0}
                                     </span>
                                </div>
                           </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
          <DialogActions className="!px-6 !py-4 border-t border-gray-100">
            <Button 
                onClick={() => {
                    setViewDialogOpen(false);
                    setSelectedWishlist(null);
                    setProducts([]);
                }}
                className="btn-border-g !px-6"
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </main>
  );
};

export default WishlistsPage;
