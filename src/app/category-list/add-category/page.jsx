"use client";
import React, { useState } from "react";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { IoMdClose } from "react-icons/io";
import { MdOutlineArrowBack } from "react-icons/md";
import Link from "next/link";
import Breadcrumbs from "@/app/components/Breadcrumbs";

const AddCategoryPage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [imageInputType, setImageInputType] = useState("url");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData((prev) => ({
      ...prev,
      image: url,
    }));
    setImagePreview(url);
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        setFormData((prev) => ({
          ...prev,
          image: dataUrl,
        }));
        setImagePreview(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: "",
    }));
    setImagePreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const token = localStorage.getItem("adminToken");

      const response = await fetch("http://localhost:5000/api/categories", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          image: formData.image,
          isActive: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create category");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/category-list");
      }, 1500);
    } catch (err) {
      setError(err.message || "Error creating category");
      console.error("Error creating category:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 min-h-screen" style={{
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)'
    }}>
      <div className="p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fadeIn">
          <div>
            <Breadcrumbs items={[
              { label: "Categories", href: "/category-list" },
              { label: "Add Category" }
            ]} />
            <h1 className="text-3xl font-extrabold gradient-text leading-tight mt-1">Add New Category</h1>
            <p className="text-gray-600 text-lg mt-0.5">Create a new product category for your store</p>
          </div>
          <Button
            onClick={() => router.push("/category-list")}
            className="bg-white text-gray-600 normal-case font-bold py-2.5 px-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 transition-smooth"
          >
            Cancel
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="card-premium p-8 animate-scaleIn shadow-premium">
          {/* Alert Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl flex items-center gap-3 animate-fadeIn">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-600 rounded-xl flex items-center gap-3 animate-fadeIn">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Category created successfully! Redirecting...
            </div>
          )}

          <div className="space-y-8">
            {/* Category Name */}
            <div className="space-y-3">
              <label htmlFor="name" className="text-sm font-bold text-gray-700 block">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-smooth outline-none text-gray-700 font-medium"
                placeholder="e.g., Electronic Devices"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500">Enter a descriptive category name for your products</p>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <label htmlFor="description" className="text-sm font-bold text-gray-700 block">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-smooth outline-none text-gray-700 font-medium resize-none"
                placeholder="Brief description of this category (optional)"
                disabled={isSubmitting}
              />
            </div>

            {/* Image Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-gray-700">
                  Category Image
                </label>
                
                {/* Toggle Buttons */}
                <div className="flex p-1 bg-gray-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setImageInputType("url")}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-smooth ${
                      imageInputType === "url"
                        ? "bg-white text-primary shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Image URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageInputType("file")}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-smooth ${
                      imageInputType === "file"
                        ? "bg-white text-primary shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Upload File
                  </button>
                </div>
              </div>

              {/* Image Input Field */}
              <div className="relative group">
                {imageInputType === "url" ? (
                  <input
                    type="text"
                    value={formData.image}
                    onChange={handleImageUrlChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-smooth outline-none text-gray-700 font-medium"
                    placeholder="https://example.com/image.jpg"
                    disabled={isSubmitting}
                  />
                ) : (
                  <div className="relative w-full h-[120px] rounded-xl border-2 border-dashed border-gray-300 hover:border-primary/50 hover:bg-primary/5 transition-all text-center flex flex-col items-center justify-center cursor-pointer bg-gray-50 group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      disabled={isSubmitting}
                    />
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-sm font-bold text-gray-600">Click to upload image</span>
                  </div>
                )}
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 relative group animate-fadeIn">
                  <div className="flex items-start gap-4">
                    <div className="relative w-32 h-24 rounded-lg overflow-hidden shadow-sm border border-gray-200 bg-white">
                      <img
                        src={imagePreview}
                        alt="Category preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                    <div className="flex-1 py-1">
                      <p className="text-sm font-bold text-gray-800">Preview</p>
                      <p className="text-xs text-gray-500 mt-1">This image will be displayed on the category card.</p>
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="w-8 h-8 rounded-full bg-white text-red-500 shadow-md flex items-center justify-center hover:bg-red-50 transition-smooth"
                    >
                      <IoMdClose size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer with Actions */}
          <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-100">
            <Button
              onClick={() => router.push("/category-list")}
               className="bg-white text-gray-600 normal-case font-bold py-3 px-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 transition-smooth"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="btn-g text-white normal-case font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-smooth disabled:opacity-70 disabled:hover:scale-100"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Processing...
                </span>
              ) : (
                "Create Category"
              )}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default AddCategoryPage;
