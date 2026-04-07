"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { bannersAPI, uploadAPI } from "@/lib/api";

const BannerDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

  const getBannerImageUrl = (image) => {
    if (!image) return null;
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }
    return `${API_BASE}${image}`;
  };

  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    const loadBanner = async () => {
      try {
        const res = await bannersAPI.getById(id);
        const data = res?.banner || res?.data?.banner || res;
        if (isMounted) {
          setBanner(data);
          setTitle(data?.title || "");
          setLink(data?.link || "");
          setIsActive(data?.isActive !== undefined ? !!data.isActive : true);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Gagal memuat detail banner");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadBanner();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const imgUrl = getBannerImageUrl(banner?.image);
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
      let image = banner?.image || "";

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

      const updateRes = await bannersAPI.update(id, {
        title,
        link,
        image,
        isActive,
      });

      const updatedBanner =
        updateRes?.banner || updateRes?.data?.banner || updateRes;

      setBanner(updatedBanner);
      alert("Banner berhasil diupdate.");
      router.push("/banners");
    } catch (err) {
      alert(err.message || "Gagal update banner.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="w-full py-4 px-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[20px] text-gray-700 font-medium">
          Edit Banner
        </h2>
        <button
          onClick={() => router.push("/banners")}
          className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 text-sm font-medium"
        >
          Kembali
        </button>
      </div>

      {loading && (
        <p className="text-sm text-gray-500">Memuat detail banner...</p>
      )}

      {error && !loading && (
        <p className="text-sm text-red-500">Terjadi kesalahan: {error}</p>
      )}

      {!loading && !error && banner && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-md shadow-md p-5 flex flex-col md:flex-row gap-6"
        >
          <div className="w-full md:w-[340px] space-y-3">
            <div className="w-full h-[200px] rounded-md overflow-hidden bg-gray-100 border border-gray-200">
              {currentPreview ? (
                <img
                  src={currentPreview}
                  alt={title || "banner"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
                  Tidak ada gambar
                </div>
              )}
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">
                Ganti Gambar (opsional)
              </label>
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </div>

            <div className="text-xs text-gray-500">
              <div className="mb-1">ID: <span className="font-mono break-all text-gray-700">{banner.id}</span></div>
              <div>
                Dibuat:{" "}
                {banner.createdAt
                  ? new Date(banner.createdAt).toLocaleString()
                  : "-"}
              </div>
              <div>
                Diupdate:{" "}
                {banner.updatedAt
                  ? new Date(banner.updatedAt).toLocaleString()
                  : "-"}
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-[14px] text-gray-700 font-medium">
                Judul
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-gray-500"
                placeholder="Judul banner"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[14px] text-gray-700 font-medium">
                Link
              </label>
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-gray-500"
                placeholder="Contoh: /promo/ramadhan"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                id="isActive"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                Aktifkan banner
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-md bg-green-600 text-white text-sm font-medium disabled:opacity-60"
              >
                {submitting ? "Menyimpan..." : "Simpan Perubahan"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/banners")}
                className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 text-sm font-medium"
              >
                Batal
              </button>
            </div>
          </div>
        </form>
      )}
    </section>
  );
};

export default BannerDetailPage;

