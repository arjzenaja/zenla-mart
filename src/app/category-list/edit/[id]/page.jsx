"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { IoMdClose } from "react-icons/io";
import { MdOutlineArrowBack } from "react-icons/md";
import Link from "next/link";

const EditCategoryPage = () => {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [imageInputType, setImageInputType] = useState("url");

  // Fetch category data
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/backend-api/api/categories/${categoryId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch category");
        }

        const data = await response.json();
        const category = data.category;

        setFormData({
          name: category.name || "",
          description: category.description || "",
          image: category.image || "",
        });

        if (category.image) {
          setImagePreview(category.image);
          setImageInputType("url");
        }

        setError(null);
      } catch (err) {
        setError(err.message || "Error loading category");
        console.error("Error fetching category:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

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
      alert("Category name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        `/backend-api/api/categories/${categoryId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            image: formData.image,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update category");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/category-list");
      }, 1500);
    } catch (err) {
      setError(err.message || "Error updating category");
      console.error("Error updating category:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-white py-5 px-5">
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">Loading category...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-white py-6 px-5">
      {/* Header */}
      <div className="mb-8">
        <Link href="/category-list" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4">
          <MdOutlineArrowBack size={20} />
          Back to Categories
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Category</h1>
            <p className="text-gray-500 text-sm mt-1">Update category details and image</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        {/* Alert Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-pulse">
            <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3 animate-pulse">
            <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-green-900">Success</h3>
              <p className="text-green-700 text-sm mt-1">Category updated successfully! Redirecting...</p>
            </div>
          </div>
        )}

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8">
            {/* Category Name */}
            <div className="mb-8">
              <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-3">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder-gray-400"
                placeholder="e.g., Fruits & Vegetables"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-2">Enter a descriptive category name</p>
            </div>

            {/* Description */}
            <div className="mb-8">
              <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-3">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder-gray-400 resize-none"
                placeholder="Brief description of this category (optional)"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-2">Provide a short description to help customers</p>
            </div>

            {/* Image Section */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-900 mb-4">
                Category Image
              </label>

              {/* Toggle Buttons */}
              <div className="flex gap-2 mb-5 p-1 bg-gray-100 rounded-lg inline-flex">
                <button
                  type="button"
                  onClick={() => setImageInputType("url")}
                  className={`px-4 py-2 rounded-md font-medium transition ${
                    imageInputType === "url"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Image URL
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputType("file")}
                  className={`px-4 py-2 rounded-md font-medium transition ${
                    imageInputType === "file"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Upload File
                </button>
              </div>

              {/* Image Input Field */}
              <div className="mb-5">
                {imageInputType === "url" ? (
                  <input
                    type="text"
                    value={formData.image}
                    onChange={handleImageUrlChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder-gray-400"
                    placeholder="https://example.com/image.jpg"
                    disabled={isSubmitting}
                  />
                ) : (
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isSubmitting}
                    />
                    <div className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 transition text-center bg-gray-50 hover:bg-blue-50 cursor-pointer">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-sm text-gray-600 font-medium">Click to upload image</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="relative mb-5 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="w-32 h-32 bg-white rounded-lg overflow-hidden border border-gray-300 shadow-sm">
                        <img
                          src={imagePreview}
                          alt="Category preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow-lg transition"
                        title="Remove image"
                      >
                        <IoMdClose size={18} />
                      </button>
                    </div>
                    <div className="flex-1 pt-2">
                      <p className="text-sm font-medium text-gray-900 mb-1">✓ Image Preview</p>
                      <p className="text-sm text-gray-600">This is how your category image will appear on the website</p>
                      <p className="text-xs text-gray-500 mt-2">Click the × button above to remove and change</p>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-500">
                Recommended size: 200x150px. Max file size: 5MB
              </p>
            </div>
          </div>

          {/* Footer with Actions */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <Link href="/category-list">
              <Button
                className="!text-gray-700 !bg-white !border !border-gray-300 hover:!bg-gray-100 !normal-case !font-semibold !px-6"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              className="!text-white !bg-blue-600 hover:!bg-blue-700 disabled:!bg-gray-400 disabled:!cursor-not-allowed !normal-case !font-semibold !px-8"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                "Update Category"
              )}
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
};

export default EditCategoryPage;
