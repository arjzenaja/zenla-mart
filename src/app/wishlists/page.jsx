"use client";
import { Button } from "@mui/material";
import React, { useState, useEffect } from "react";
import Search from "../components/Search";
import Breadcrumbs from "@/app/components/Breadcrumbs";
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 animate-fadeIn">
          <div>
            <Breadcrumbs items={[{ label: "Wishlists" }]} />
            <h1 className="text-4xl font-extrabold gradient-text tracking-tight leading-tight mt-1">Wishlists Management</h1>
            <p className="text-gray-500 mt-2 font-medium">
              Monitoring interested products and user preferences
            </p>
          </div>
          <div className="bg-white/50 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-1.5 flex items-center gap-2 w-full md:w-[350px]">
             <Search width="100%" placeholder="Search wishlist..." className="!border-0 !shadow-none" />
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
          ) : !Array.isArray(wishlists) || wishlists.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50/30">
              <div className="w-24 h-24 bg-white shadow-premium rounded-3xl flex items-center justify-center mb-6 text-4xl border border-gray-100">
                ❤️
              </div>
              <p className="text-gray-900 text-xl font-bold">No wishlists found</p>
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
                          className="!bg-gray-50/80 !font-extrabold !text-[11px] !uppercase !tracking-widest !text-gray-400"
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
                        <TableRow hover key={wishlist.id} className="group transition-all hover:bg-pink-50/20">
                          <TableCell>
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-400 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-pink-100 transition-transform group-hover:scale-105 duration-300">
                                  {wishlist.user?.name?.charAt(0).toUpperCase() || 'U'}
                               </div>
                               <div className="flex flex-col min-w-0">
                                  <span className="font-bold text-gray-900 group-hover:text-pink-600 transition-colors truncate">
                                    {wishlist.user?.name || 'Unknown User'}
                                  </span>
                                  <span className="text-xs text-gray-500 flex items-center gap-1.5 mt-1 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100/50 self-start">
                                    <MdOutlineEmail size={12} className="text-gray-400" />
                                    {wishlist.user?.email || 'N/A'}
                                  </span>
                               </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="badge badge-secondary !bg-pink-50 !text-pink-600 !border-pink-100 !px-4 !py-1 !rounded-xl !font-black !text-[10px] !tracking-wider">
                              {wishlist.itemCount || (wishlist.items ? wishlist.items.length : 0)} Items
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2.5 text-sm font-bold text-gray-600">
                              <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white transition-colors">
                                <MdOutlineDateRange size={14} />
                              </div>
                              {formatDate(wishlist.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2.5 text-sm font-bold text-gray-600">
                               <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white transition-colors">
                                 <MdOutlineDateRange size={14} />
                               </div>
                               {formatDate(wishlist.updatedAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleView(wishlist)}
                              className="!border-gray-100 !text-gray-600 hover:!bg-pink-600 hover:!text-white hover:!border-pink-600 !rounded-xl !capitalize !font-bold !px-5 !py-2 !shadow-sm transition-all"
                            >
                              <IoEyeOutline className="mr-2" size={18} />
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
            style: { borderRadius: 28, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.5)' }
          }}
          className="backdrop-blur-sm"
        >
          <DialogTitle className="!px-8 !py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
                <h3 className="font-black text-gray-900 text-2xl tracking-tight">Wishlist Summary</h3>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">User:</span>
                    <span className="text-xs font-black text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md">{selectedWishlist?.user?.name}</span>
                </div>
            </div>
            <div className="flex gap-2">
                 <span className="bg-gradient-to-br from-pink-500 to-rose-400 text-white px-4 py-1.5 rounded-2xl text-xs font-black shadow-lg shadow-pink-100 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    {products.length} Products
                 </span>
            </div>
          </DialogTitle>
          <DialogContent className="!p-8 bg-gray-50/20">
            {selectedWishlist && (
              <div>
                {loadingProducts ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <CircularProgress size={40} thickness={5} className="!text-pink-500 mb-4" />
                    <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Synchronizing catalog...</span>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-20">
                     <div className="w-24 h-24 bg-white shadow-premium rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-4xl border border-gray-100">🛍️</div>
                     <p className="text-gray-900 text-xl font-black">Wishlist is empty</p>
                     <p className="text-gray-500 font-medium">This user hasn't favorited any products yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => {
                      const stockStatus = getStockStatus(product.stock);
                      const imageSrc = product.image || product.images?.[0] || "/taro.png";
                      const isLocalhostImage = imageSrc?.includes('localhost') || imageSrc?.includes('127.0.0.1');
                      return (
                        <div
                          key={product.id}
                          className="bg-white p-4 rounded-3xl border border-gray-100 hover:shadow-premium transition-all group relative overflow-hidden"
                        >
                           <div className="relative aspect-[4/3] mb-4 overflow-hidden rounded-2xl bg-gray-50 shadow-inner">
                              <Image
                                src={imageSrc}
                                alt={product.name || 'Product'}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                unoptimized={isLocalhostImage}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              
                              {product.originalPrice > product.price && (
                                 <div className="absolute top-3 left-3 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl shadow-lg shadow-rose-200">
                                    Sale
                                 </div>
                              )}
                              
                              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-xl shadow-sm flex items-center gap-1.5">
                                 <span className="text-[10px] font-black text-gray-400">★</span>
                                 <span className="text-[10px] text-gray-900 font-black">{product.rating || 0}</span>
                              </div>
                           </div>

                           <div className="space-y-2">
                                <h5 className="font-black text-gray-900 text-base line-clamp-1 group-hover:text-pink-600 transition-colors" title={product.name}>
                                    {product.name || 'Product Name'}
                                </h5>
                                
                                <div className="flex items-center justify-between items-end">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Price</span>
                                        <span className="text-pink-600 font-black text-lg -mt-1">
                                            {formatCurrency(product.price || 0)}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                         <span className={`text-[10px] font-black uppercase tracking-widest ${stockStatus.color} bg-gray-50 px-2 py-1 rounded-lg border border-gray-100`}>
                                            {stockStatus.text}
                                         </span>
                                    </div>
                                </div>
                                
                                <div className="pt-3 mt-3 border-t border-gray-50 flex items-center justify-between">
                                     <div className="flex items-center gap-1.5 opacity-60">
                                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: {product.id.substring(0,8)}</span>
                                     </div>
                                     <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
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
          <DialogActions className="!px-8 !py-6 border-t border-gray-100 bg-gray-50/50">
            <Button 
                onClick={() => {
                    setViewDialogOpen(false);
                    setSelectedWishlist(null);
                    setProducts([]);
                }}
                className="!bg-white !text-gray-900 !border-2 !border-gray-100 hover:!border-primary hover:!text-primary !px-10 !py-3 !rounded-2xl !font-bold transition-all shadow-sm"
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
