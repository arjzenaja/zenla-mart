"use client";

import UploadBox from "@/app/components/UploadBox";
import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { useRouter } from "next/navigation";
import { uploadAPI, bannersAPI } from "@/lib/api";
import Breadcrumbs from "@/app/components/Breadcrumbs";

const AddSlide = () => {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Silakan pilih gambar banner terlebih dahulu.");
      return;
    }

    setSubmitting(true);
    try {
      // Upload gambar dulu
      const formData = new FormData();
      formData.append("image", file);
      const uploadRes = await uploadAPI.uploadImage(formData);
      const imageUrl = uploadRes?.url;

      if (!imageUrl) {
        throw new Error("URL gambar tidak ditemukan dari response upload.");
      }

      // Simpan data banner
      await bannersAPI.create({
        title,
        link,
        image: imageUrl,
        isActive: true,
      });

      alert("Banner berhasil dibuat.");
      router.push("/banners");
    } catch (err) {
      alert(err.message || "Gagal menyimpan banner.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex-1 min-h-screen" style={{
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)'
    }}>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8 animate-fadeIn">
          <div>
            <Breadcrumbs items={[
              { label: "Banners", href: "/banners" },
              { label: "Add Banner" }
            ]} />
            <h1 className="text-3xl font-extrabold gradient-text mb-2 leading-tight mt-1">Add New Banner</h1>
            <p className="text-gray-600 text-lg">Upload and configure a new homepage banner</p>
          </div>
          <button
            onClick={() => router.push("/banners")}
             className="px-5 py-2.5 rounded-xl bg-white text-gray-600 font-bold shadow-sm hover:shadow-md hover:bg-gray-50 transition-smooth border border-gray-100"
          >
            Cancel
          </button>
        </div>

        <div className="card-premium p-8 animate-scaleIn shadow-premium">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Image Upload Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-2">
                Banner Image
              </h2>
              
              <div className="bg-gray-50 rounded-2xl p-6 border-2 border-dashed border-gray-200 hover:border-primary/50 transition-colors">
                <div className="flex flex-col md:flex-row items-start gap-8">
                  {previewUrl ? (
                    <div className="relative group">
                      <div className="w-full md:w-[300px] h-[160px] rounded-xl overflow-hidden shadow-md">
                        <img
                          src={previewUrl}
                          className="w-full h-full object-cover"
                          alt="preview banner"
                        />
                      </div>
                      <button
                        type="button"
                        className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-smooth transform hover:scale-110"
                        onClick={() => {
                          setFile(null);
                          setPreviewUrl(null);
                        }}
                      >
                        <IoMdClose size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full md:w-[300px] h-[160px] rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                      <span className="text-sm">No image selected</span>
                    </div>
                  )}
                  
                  <div className="flex-1 w-full">
                    <p className="text-sm text-gray-500 mb-4">
                      Upload a high-quality image for the banner. Recommended size: 1200x400px.
                    </p>
                    <div className="w-full">
                         <UploadBox onFileSelect={handleFileSelect} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Banner Details Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-2">
                Banner Details
              </h2>
              
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Banner Title <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-smooth outline-none text-gray-700 font-medium"
                    placeholder="e.g., Special Sale Eid Al-Fitr"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Target Link <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-smooth outline-none text-gray-700 font-medium"
                    placeholder="e.g., /promo/ramadhan"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => router.push("/banners")}
                className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-smooth"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={submitting}
                className="btn-g px-8 py-3 rounded-xl text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-smooth disabled:opacity-70 disabled:hover:scale-100"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Saving...
                  </span>
                ) : "Save Banner"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default AddSlide;
