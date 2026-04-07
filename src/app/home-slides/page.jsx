"use client";
import { Button, CircularProgress } from "@mui/material";
import React, { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { RiEdit2Line } from "react-icons/ri";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { FaRegTrashAlt } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import { slidesAPI } from "@/lib/api";
import DeleteConfirmModal from "@/app/components/DeleteConfirmModal";

const columns = [
  { id: "IMAGE", label: "IMAGE", minWidth: 300 },
  { id: "ACTION", label: "ACTION", minWidth: 200 },
];

const HomeSlides = () => {
  const router = useRouter();
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetSlide, setTargetSlide] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSlides = slides.filter(slide => 
    (slide.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (slide.link || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedSlides = filteredSlides.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

  const getSlideImageUrl = (image) => {
    if (!image) return null;
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }
    return `${API_BASE}${image}`;
  };

  useEffect(() => {
    let isMounted = true;

    const loadSlides = async () => {
      try {
        const res = await slidesAPI.getAll();
        const list = res?.slides || res?.data?.slides || [];
        if (isMounted) {
          setSlides(list);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Gagal memuat data home slide");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSlides();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleEdit = (id) => {
    router.push(`/home-slides/${id}`);
  };

  const handleView = (id) => {
    router.push(`/home-slides/${id}`);
  };

  const handleToggleActive = async (id, currentStatus) => {
    setActionLoading((s) => ({ ...s, [id]: true }));
    try {
      await slidesAPI.update(id, {
        isActive: !currentStatus,
      });
      setSlides((prev) =>
        prev.map((slide) =>
          slide.id === id ? { ...slide, isActive: !currentStatus } : slide
        )
      );
    } catch (err) {
      alert(err.message || "Gagal mengubah status slide");
    } finally {
      setActionLoading((s) => ({ ...s, [id]: false }));
    }
  };

  const handleDeleteClick = (slide) => {
    setTargetSlide(slide);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!targetSlide) return;
    setIsDeleting(true);
    try {
      await slidesAPI.delete(targetSlide.id);
      setSlides((prev) => prev.filter((s) => s.id !== targetSlide.id));
      alert("Home slide berhasil dihapus.");
    } catch (err) {
      alert(err.message || "Gagal menghapus slide");
    } finally {
      setIsDeleting(false);
      setConfirmOpen(false);
      setTargetSlide(null);
    }
  };

  return (
    <main className="flex-1 min-h-screen bg-[#f8fafc]">
      <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fadeIn">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <Breadcrumbs items={[{ label: "Home Slides" }]} />
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Home <span className="gradient-text">Slideshow</span>
            </h1>
            <p className="text-gray-500 mt-1">Manage your homepage hero banners</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/home-slides/add-home-slide">
              <Button className="btn-g !px-6 !py-2.5 !rounded-xl !text-sm flex items-center gap-2">
                <span className="text-xl">+</span> Add Slide
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="card-premium p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-4 z-10 glass-panel">
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search slides..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-semibold text-gray-900">{filteredSlides.length}</span> slides found
          </div>
        </div>

        {/* Main Content Card */}
        <div className="card-premium overflow-hidden transition-all duration-300 shadow-premium">
          {loading ? (
            <div className="p-6 space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col gap-4 animate-pulse">
                  <div className="w-full h-48 bg-gray-100 rounded-2xl"></div>
                  <div className="flex justify-between items-center px-2">
                    <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                    <div className="h-8 bg-gray-50 rounded w-24"></div>
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Slides</h3>
              <p className="text-gray-500 max-w-md mx-auto">{error}</p>
              <Button onClick={() => window.location.reload()} className="mt-6 !text-primary font-semibold hover:underline">
                Try again
              </Button>
            </div>
          ) : filteredSlides.length === 0 ? (
            <div className="p-20 text-center animate-scaleIn">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No slides found</h3>
              <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                {searchTerm ? `No results for "${searchTerm}"` : "Feature your best content with a homepage slideshow."}
              </p>
              {!searchTerm && (
                <Link href="/home-slides/add-home-slide">
                  <Button className="btn-g !px-8">Add Your First Slide</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <TableContainer>
                <Table className="table-premium">
                  <TableHead>
                    <TableRow>
                      <TableCell>SLIDE PREVIEW</TableCell>
                      <TableCell align="right">ACTIONS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayedSlides.map((slide) => (
                      <TableRow key={slide.id} className="group hover:bg-gray-50/50 transition-colors">
                        <TableCell>
                          <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="relative w-full md:w-64 h-32 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm group-hover:shadow-lg transition-all duration-500">
                              {getSlideImageUrl(slide.image || slide.image_url) ? (
                                <img
                                  src={getSlideImageUrl(slide.image || slide.image_url)}
                                  alt={slide.title || "slide"}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold uppercase text-xs tracking-widest">
                                  No Image
                                </div>
                              )}
                              <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md ${
                                slide.isActive 
                                  ? 'bg-green-500/90 text-white' 
                                  : 'bg-gray-500/90 text-white'
                              }`}>
                                {slide.isActive ? 'Active' : 'Hidden'}
                              </div>
                            </div>
                            
                            <div className="flex-1 py-1">
                              <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors">
                                {slide.title || "Untitled Slide"}
                              </h3>
                              <p className="text-sm text-gray-500 line-clamp-2 max-w-lg mb-3">
                                {slide.description || "No description provided for this slide."}
                              </p>
                              {slide.link && (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.172 13.828a4 4 0 015.656 0l4-4a4 4 0 115.656 5.656l-1.101 1.101" />
                                  </svg>
                                  {slide.link}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell align="right">
                          <div className="flex items-center justify-end gap-2 pr-4">
                            <Button
                              onClick={() => handleToggleActive(slide.id, slide.isActive)}
                              disabled={!!actionLoading[slide.id]}
                              className={`w-10 h-10 min-w-0 !rounded-xl transition-all shadow-sm ${
                                slide.isActive 
                                  ? '!bg-green-50 !text-green-600 hover:!bg-green-600 hover:!text-white' 
                                  : '!bg-gray-100 !text-gray-400 hover:!bg-gray-600 hover:!text-white'
                              }`}
                              title={slide.isActive ? "Hide Slide" : "Show Slide"}
                            >
                              {actionLoading[slide.id] ? (
                                <CircularProgress size={18} color="inherit" />
                              ) : slide.isActive ? (
                                <IoEyeOutline size={18} />
                              ) : (
                                <IoEyeOffOutline size={18} />
                              )}
                            </Button>
                            
                            <Button
                              onClick={() => handleEdit(slide.id)}
                              className="w-10 h-10 min-w-0 !rounded-xl !bg-blue-50 !text-blue-600 hover:!bg-blue-600 hover:!text-white transition-all shadow-sm"
                              title="Edit Slide"
                            >
                              <RiEdit2Line size={18} />
                            </Button>
                            
                            <Button
                              onClick={() => handleDeleteClick(slide)}
                              disabled={isDeleting && targetSlide?.id === slide.id}
                              className="w-10 h-10 min-w-0 !rounded-xl !bg-red-50 !text-red-600 hover:!bg-red-600 hover:!text-white transition-all shadow-sm"
                              title="Delete Slide"
                            >
                              {isDeleting && targetSlide?.id === slide.id ? (
                                <CircularProgress size={18} color="inherit" />
                              ) : (
                                <FaRegTrashAlt size={18} />
                              )}
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
                  count={filteredSlides.length}
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
      </div>
      
      <DeleteConfirmModal
        open={confirmOpen}
        title={"Delete Home Slide?"}
        description={`Are you sure you want to delete "${targetSlide?.title || 'this slide'}"? This action will permanently remove it from the homepage slideshow.`}
        onCancel={() => {
          setConfirmOpen(false);
          setTargetSlide(null);
        }}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </main>
  );

};

export default HomeSlides;
