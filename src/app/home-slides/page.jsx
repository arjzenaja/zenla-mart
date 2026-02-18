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

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
    "http://localhost:5000";

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
    <main className="flex-1 min-h-screen" style={{
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)'
    }}>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 animate-fadeIn">
          <div>
            <h1 className="text-4xl font-extrabold gradient-text mb-2">Home Slides</h1>
            <p className="text-gray-600 text-lg">Manage homepage slideshow</p>
          </div>
          <Link href={"/home-slides/add-home-slide"}>
            <Button className="btn-g !px-6 !py-3 !rounded-xl !text-white !font-bold shadow-lg hover:shadow-xl transition-smooth">
              + Add Home Slide
            </Button>
          </Link>
        </div>

        <div className="card-premium p-0 overflow-hidden animate-scaleIn shadow-premium">
          {loading && (
             <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="skeleton w-full h-12 mb-2 rounded-lg"></div>
              <div className="skeleton w-full h-12 mb-2 rounded-lg"></div>
              <div className="skeleton w-full h-12 rounded-lg"></div>
            </div>
          )}
          {error && !loading && (
             <div className="p-6">
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                Terjadi kesalahan: {error}
              </div>
            </div>
          )}

          {!loading && !error && (
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        align={column.align}
                        style={{ minWidth: column.minWidth }}
                        className="!bg-gray-50 !text-gray-500 !font-bold !uppercase !tracking-wider !py-5 !border-b !border-gray-100"
                      >
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {slides
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((slide) => (
                      <TableRow key={slide.id} hover className="transition-colors hover:bg-gray-50">
                        <TableCell className="!py-4 !border-b !border-gray-50">
                          <div className="flex items-center gap-3">
                            {getSlideImageUrl(slide.image || slide.image_url) && (
                              <div className="img bg-gray-100 rounded-xl overflow-hidden shadow-sm border border-gray-100 group">
                                <img
                                  src={getSlideImageUrl(slide.image || slide.image_url)}
                                  alt={slide.title || "home slide"}
                                  className="w-[180px] h-[90px] object-cover group-hover:scale-110 transition-smooth"
                                />
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="!py-4 !border-b !border-gray-50">
                          <div className="flex items-center gap-2">
                            <Button
                              className="w-[42px]! h-[42px]! min-w-[42px]! rounded-xl text-blue-600! hover:!bg-blue-50 transition-smooth"
                              onClick={() => handleEdit(slide.id)}
                              title="Edit"
                            >
                              <RiEdit2Line size={20} />
                            </Button>

                            <Button
                              className={`w-[42px]! h-[42px]! min-w-[42px]! rounded-xl transition-smooth ${
                                slide.isActive 
                                  ? 'text-green-600! hover:!bg-green-50' 
                                  : 'text-gray-400! hover:!bg-gray-100'
                              }`}
                              onClick={() => handleToggleActive(slide.id, slide.isActive)}
                              title={slide.isActive ? "Disable" : "Enable"}
                              disabled={!!actionLoading[slide.id]}
                            >
                              {actionLoading[slide.id] ? (
                                <CircularProgress size={20} color="inherit" />
                              ) : slide.isActive ? (
                                <IoEyeOutline size={20} />
                              ) : (
                                <IoEyeOffOutline size={20} />
                              )}
                            </Button>

                            <Button
                              className="w-[42px]! h-[42px]! min-w-[42px]! rounded-xl text-red-600! hover:!bg-red-50 transition-smooth"
                              onClick={() => handleDeleteClick(slide)}
                              disabled={isDeleting && targetSlide?.id === slide.id}
                              title="Delete"
                            >
                              {isDeleting && targetSlide?.id === slide.id ? (
                                <CircularProgress size={20} color="inherit" />
                              ) : (
                                <FaRegTrashAlt size={20} />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}

                  {slides.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="!border-0">
                        <div className="flex flex-col items-center justify-center py-16">
                          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <span className="text-4xl">🎑</span>
                          </div>
                          <p className="text-gray-500 text-lg font-medium">Belum ada data home slide.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <div className="border-t border-gray-100">
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={slides.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
               sx={{
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  fontSize: '14px',
                  color: '#6b7280'
                }
              }}
            />
          </div>
        </div>
      </div>
      
      <DeleteConfirmModal
        open={confirmOpen}
        title={"Hapus Home Slide?"}
        description={"Home slide yang dihapus tidak dapat dikembalikan. Apakah Anda yakin ingin melanjutkan?"}
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
