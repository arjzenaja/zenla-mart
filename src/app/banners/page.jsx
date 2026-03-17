"use client";
import { Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Search from "../components/Search";
import Breadcrumbs from "@/app/components/Breadcrumbs";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Checkbox from "@mui/material/Checkbox";
import Rating from "@mui/material/Rating";
import Tooltip from "@mui/material/Tooltip";
import { RiEdit2Line } from "react-icons/ri";
import { IoEyeOutline } from "react-icons/io5";
import { FaRegTrashAlt } from "react-icons/fa";
import { MdAdd, MdImage } from "react-icons/md";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { bannersAPI } from "@/lib/api";

const label = { slotProps: { input: { "aria-label": "Checkbox demo" } } };

const columns = [
  { id: "IMAGE", label: "IMAGE", minWidth: 300 },
  { id: "ACTION", label: "ACTION", minWidth: 200 },
];

const HomeSlides = () => {
  const router = useRouter();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
    "http://localhost:5000";

  const getBannerImageUrl = (image) => {
    if (!image) return null;
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }
    return `${API_BASE}${image}`;
  };

  useEffect(() => {
    let isMounted = true;

    const loadBanners = async () => {
      try {
        const res = await bannersAPI.getAll();
        const list = res?.banners || res?.data?.banners || [];
        if (isMounted) {
          setBanners(list);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Gagal memuat data banner");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadBanners();

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
    router.push(`/banners/${id}`);
  };

  const handleView = (id) => {
    router.push(`/banners/${id}`);
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus banner ini?")) return;

    try {
      await bannersAPI.delete(id);
      setBanners((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      alert(err.message || "Gagal menghapus banner");
    }
  };

  return (
    <main className="flex-1 min-h-screen">
      <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 animate-fadeIn">
        <div>
          <Breadcrumbs items={[{ label: "Banners" }]} />
          <h1 className="text-4xl font-extrabold gradient-text tracking-tight leading-tight mt-1">Marketing Banners</h1>
          <p className="text-gray-500 mt-2 font-medium uppercase tracking-widest text-[11px] font-black">Configure main home screen promotions</p>
        </div>
        <Link href={"/banners/add-banner"}>
          <Button className="btn-g !h-[55px] !px-8 !rounded-2xl !text-white !font-black !uppercase !tracking-widest !text-[11px] shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-3">
            <MdAdd size={22} />
            <span>Add New Banner</span>
          </Button>
        </Link>
      </div>

        <div className="card-premium p-0 overflow-hidden animate-scaleIn shadow-premium">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="skeleton w-full h-12 mb-2 rounded-lg"></div>
              <div className="skeleton w-full h-12 mb-2 rounded-lg"></div>
              <div className="skeleton w-full h-12 rounded-lg"></div>
            </div>
          ) : error ? (
             <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500 mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Error Loading Banners</h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} className="btn-border-g">
                Retry
              </Button>
            </div>
          ) : (
            <>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead className="!bg-gray-50/80">
                  <TableRow>
                     <TableCell className="!font-black !text-[10px] !uppercase !tracking-[0.2em] !text-gray-400 !py-6">Banner Visual</TableCell>
                     <TableCell align="right" className="!font-black !text-[10px] !uppercase !tracking-[0.2em] !text-gray-400 !pr-10">Management</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {banners
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((banner) => (
                      <TableRow key={banner.id} hover className="group transition-all hover:bg-orange-50/20">
                        <TableCell className="!py-6">
                          <div className="flex items-center gap-8 px-2">
                            {getBannerImageUrl(banner.image) ? (
                              <div className="relative group/img w-[280px] h-[140px] rounded-[2rem] overflow-hidden shadow-premium border border-gray-100 bg-gray-50/50">
                                <img
                                  src={getBannerImageUrl(banner.image)}
                                  alt={banner.title || "banner"}
                                  className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-500" />
                              </div>
                            ) : (
                                <div className="w-[280px] h-[140px] rounded-[2rem] bg-gray-50 flex items-center justify-center text-gray-300 border border-gray-100 border-dashed">
                                    <MdImage size={32} />
                                </div>
                            )}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                   <div className="w-2 h-2 rounded-full bg-primary"></div>
                                   <span className="font-black text-gray-900 group-hover:text-primary transition-colors text-lg tracking-tight uppercase">{banner.title}</span>
                                </div>
                                {banner.description && (
                                  <p className="text-sm text-gray-500 font-bold max-w-[400px] line-clamp-2 pl-4 leading-relaxed border-l-2 border-gray-100 italic">
                                    {banner.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-3 pl-4 mt-2">
                                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                                      Platform Promo
                                   </span>
                                </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell align="right" className="!pr-10">
                          <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                            <Tooltip title="Modify Banner" arrow>
                                <button
                                  className="w-12 h-12 rounded-2xl bg-white border border-gray-100 text-primary hover:bg-primary hover:text-white transition-all shadow-premium flex items-center justify-center"
                                  onClick={() => handleEdit(banner.id)}
                                >
                                  <RiEdit2Line size={20} />
                                </button>
                            </Tooltip>

                            <Tooltip title="Remove Permanent" arrow>
                                <button
                                  className="w-12 h-12 rounded-2xl bg-white border border-gray-100 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-premium flex items-center justify-center"
                                  onClick={() => handleDelete(banner.id)}
                                >
                                  <FaRegTrashAlt size={20} />
                                </button>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}

                  {banners.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="!border-0">
                        <div className="flex flex-col items-center justify-center py-20">
                          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                            <span className="text-4xl text-gray-300">🖼️</span>
                          </div>
                          <p className="text-gray-500 text-lg font-medium">No banners active</p>
                          <p className="text-gray-400 text-sm">Add a banner to display on the home screen</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <div className="border-t border-gray-100 p-2">
                <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={banners.length}
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
          </>
          )}
        </div>
      </div>
    </main>
  );
};

export default HomeSlides;
