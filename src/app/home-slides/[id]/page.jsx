"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { slidesAPI, uploadAPI } from "@/lib/api";

const HomeSlideDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [slide, setSlide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaLink, setCtaLink] = useState("");
  const [order, setOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

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
    if (!id) return;

    let isMounted = true;

    const loadSlide = async () => {
      try {
        const res = await slidesAPI.getById(id);
        const data = res?.slide || res?.data?.slide || res;
        if (isMounted) {
          setSlide(data);
          setTitle(data?.title || "");
          setSubtitle(data?.subtitle || "");
          setCtaText(data?.cta_text || data?.ctaText || "");
          setCtaLink(data?.cta_link || data?.ctaLink || data?.link || "");
          setOrder(data?.order || 1);
          setIsActive(data?.isActive !== undefined ? !!data.isActive : true);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Gagal memuat detail home slide");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSlide();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const imgUrl = getSlideImageUrl(slide?.image || slide?.image_url);
  const currentPreview = previewUrl || imgUrl;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id) return;

    setSubmitting(true);
    try {
      let image = slide?.image || slide?.image_url || "";

      if (selectedFile) {
        const formData = new FormData();
        formData.append("image", selectedFile);
        const uploadRes = await uploadAPI.uploadImage(formData);
        const imageUrl = uploadRes?.url;
        if (!imageUrl) {
          throw new Error("Upload berhasil, tapi URL gambar tidak ditemukan.");
        }
        image = imageUrl;
      }

      const updateRes = await slidesAPI.update(id, {
        title,
        subtitle,
        image_url: image,
        cta_text: ctaText,
        cta_link: ctaLink,
        order: parseInt(order) || 1,
        isActive,
      });

      const updatedSlide =
        updateRes?.slide || updateRes?.data?.slide || updateRes;

      setSlide(updatedSlide);
      alert("Home slide berhasil diupdate.");
      router.push("/home-slides");
    } catch (err) {
      alert(err.message || "Gagal update home slide.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Edit Home Slide
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Atur konten dan tampilan slide untuk halaman utama.
            </p>
          </div>
          <button
            onClick={() => router.push("/home-slides")}
            className="group flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
            <svg
              className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Kembali
          </button>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-500 text-sm animate-pulse">
              Memuat data slide...
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-4 flex items-center gap-3">
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && slide && (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
              {/* Left Column: Image & Meta */}
              <div className="lg:col-span-4 p-6 lg:p-8 bg-gray-50/30 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Preview Gambar
                  </label>
                  <div className="relative group w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 hover:border-indigo-400 transition-colors">
                    {currentPreview ? (
                      <img
                        src={currentPreview}
                        alt={title || "Preview"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                        <svg
                          className="w-10 h-10 mb-2 opacity-50"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-xs">Tidak ada gambar</span>
                      </div>
                    )}
                    
                    <label className="absolute inset-0 bg-black/0 group-hover:bg-black/10 cursor-pointer flex items-center justify-center transition-all">
                        <span className="opacity-0 group-hover:opacity-100 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg text-xs font-semibold text-gray-700 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                            Ganti Gambar
                        </span>
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                            className="hidden"
                        />
                    </label>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 text-center">
                    Klik gambar untuk mengganti. Format: JPG, PNG, WEBP.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-3 shadow-sm">
                  <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Informasi Slide
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-1 border-b border-gray-50 pb-1">
                      <span className="text-xs text-gray-500">ID</span>
                      <span className="text-xs font-mono text-gray-700 truncate max-w-[150px]" title={slide.id}>
                        {slide.id}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-gray-50 pb-1">
                      <span className="text-xs text-gray-500">Dibuat</span>
                      <span className="text-xs text-gray-700">
                        {slide.createdAt || slide.created_at
                          ? new Date(
                              slide.createdAt || slide.created_at
                            ).toLocaleDateString("id-ID", {
                                day: 'numeric', month: 'short', year: 'numeric'
                            })
                          : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-xs text-gray-500">Diupdate</span>
                      <span className="text-xs text-gray-700">
                        {slide.updatedAt
                          ? new Date(slide.updatedAt).toLocaleDateString("id-ID", {
                                day: 'numeric', month: 'short', year: 'numeric'
                            })
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Form Inputs */}
              <div className="lg:col-span-8 p-6 lg:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Judul Slide
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all placeholder:text-gray-300"
                      placeholder="Contoh: Big Sale Ramadhan"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all placeholder:text-gray-300"
                      placeholder="Deskripsi singkat slide..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Teks Tombol (CTA)
                    </label>
                    <input
                      type="text"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all placeholder:text-gray-300"
                      placeholder="Contoh: Belanja Sekarang"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Link Tujuan (URL)
                    </label>
                    <input
                      type="text"
                      value={ctaLink}
                      onChange={(e) => setCtaLink(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all placeholder:text-gray-300"
                      placeholder="/products/category atau https://..."
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">
                        Urutan Tampil
                        </label>
                        <div className="relative">
                            <input
                            type="number"
                            value={order}
                            onChange={(e) => setOrder(e.target.value)}
                            min="1"
                            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                              <span className="text-xs">#</span>
                            </div>
                        </div>
                        <p className="text-[11px] text-gray-400">
                            Semakin kecil angkanya, semakin awal munculnya.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 block mb-2">
                            Status Slide
                        </label>
                        <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-indigo-200 transition-all cursor-pointer" onClick={() => setIsActive(!isActive)}>
                            <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${isActive ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                            </div>
                            <span className="text-sm font-medium text-gray-700 select-none">
                                {isActive ? 'Aktif (Ditampilkan)' : 'Nonaktif (Disembunyikan)'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => router.push("/home-slides")}
                    className="px-6 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 transition-all focus:ring-2 focus:ring-gray-200"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-medium hover:from-indigo-700 hover:to-blue-700 focus:ring-4 focus:ring-indigo-100 transition-all shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Menyimpan...
                      </>
                    ) : (
                      "Simpan Perubahan"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};

export default HomeSlideDetailPage;
