"use client";
import { Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Search from "../components/Search";

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 animate-fadeIn">
          <div>
            <h1 className="text-3xl font-extrabold gradient-text">Banners Management</h1>
            <p className="text-gray-500 mt-1 font-medium">Configure main home screen slides</p>
          </div>
          <Link href={"/banners/add-banner"}>
            <Button className="btn-g !px-6 !py-3 !rounded-xl !text-white !font-bold shadow-lg hover:shadow-xl transition-smooth flex items-center gap-2">
              <span className="text-xl">+</span> Add New Banner
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
              <Table stickyHeader className="table-premium">
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
                  {banners
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((banner) => (
                      <TableRow key={banner.id} hover className="transition-colors hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-4">
                            {getBannerImageUrl(banner.image) ? (
                              <div className="relative group w-[240px] h-[120px] rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-gray-50">
                                <img
                                  src={getBannerImageUrl(banner.image)}
                                  alt={banner.title || "banner"}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                              </div>
                            ) : (
                                <div className="w-[240px] h-[120px] rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200 border-dashed">
                                    No Image
                                </div>
                            )}
                            <div className="flex flex-col">
                                {banner.title && <span className="font-bold text-gray-800">{banner.title}</span>}
                                {banner.description && <span className="text-sm text-gray-500 line-clamp-2 max-w-[300px]">{banner.description}</span>}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Tooltip title="Edit Banner">
                                <Button
                                className="!w-10 !h-10 !min-w-[40px] !rounded-lg !border !border-gray-200 !text-gray-600 hover:!bg-blue-50 hover:!text-blue-600 hover:!border-blue-200 transition-all"
                                onClick={() => handleEdit(banner.id)}
                                >
                                <RiEdit2Line size={18} />
                                </Button>
                            </Tooltip>

                            <Tooltip title="Delete Banner">
                                <Button
                                className="!w-10 !h-10 !min-w-[40px] !rounded-lg !border !border-gray-200 !text-gray-600 hover:!bg-red-50 hover:!text-red-600 hover:!border-red-200 transition-all"
                                onClick={() => handleDelete(banner.id)}
                                >
                                <FaRegTrashAlt size={18} />
                                </Button>
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
