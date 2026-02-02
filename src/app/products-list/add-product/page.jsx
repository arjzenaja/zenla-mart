"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Rating from "@mui/material/Rating";
import { IoMdClose } from "react-icons/io";
import { FaRegImages } from "react-icons/fa6";
import { Button } from "@mui/material";
import { productsAPI, categoriesAPI, uploadAPI } from "@/lib/api";

const AddProduct = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);

  // Form states
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [categoryVal, setCategoryVal] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productOldPrice, setProductOldPrice] = useState("");
  const [isFeatureVal, setIsFeatureVal] = useState("");
  const [productStock, setProductStock] = useState("");
  const [productBrand, setProductBrand] = useState("");
  const [productDiscount, setProductDiscount] = useState("");
  const [rating, setRating] = useState(0);

  useEffect(() => {
    fetchCategories();
    if (editId) {
      fetchProduct(editId);
    }
  }, [editId]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      console.log('Categories API Response:', response);
      
      // Handle different response formats
      let categoriesData = [];
      if (response?.categories && Array.isArray(response.categories)) {
        categoriesData = response.categories;
      } else if (Array.isArray(response)) {
        categoriesData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        categoriesData = response.data;
      }
      
      console.log('Categories Data:', categoriesData);
      setCategories(categoriesData);
      
      if (categoriesData.length === 0) {
        console.warn('No categories found. Please add categories first.');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      alert('Failed to load categories: ' + (error.message || 'Unknown error'));
      setCategories([]);
    }
  };

  const fetchProduct = async (id) => {
    try {
      setLoading(true);
      const response = await productsAPI.getById(id);
      const product = response?.product || response;
      if (product) {
        setProductName(product.name || "");
        setProductDescription(product.description || "");
        setCategoryVal(product.categoryId || "");
        setProductPrice(product.price?.toString() || "");
        setProductOldPrice(product.originalPrice?.toString() || "");
        setIsFeatureVal(product.isFeatured ? "true" : "false");
        setProductStock(product.stock?.toString() || "");
        setProductBrand(product.brand || "");
        setProductDiscount(product.discount?.toString() || "");
        setRating(product.rating || 0);
        if (product.images && Array.isArray(product.images)) {
          setUploadedImages(product.images);
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Failed to load product: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleChangeCategory = (event) => {
    setCategoryVal(event.target.value);
  };

  const handleChangeFeatureVal = (event) => {
    setIsFeatureVal(event.target.value);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await uploadAPI.uploadImage(formData);
      let imageUrl = response?.url || response?.imageUrl || response?.data?.url;
      
      // Convert relative URL to absolute URL if needed
      if (imageUrl && imageUrl.startsWith('/uploads/')) {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const baseURL = API_URL.replace('/api', '');
        imageUrl = `${baseURL}${imageUrl}`;
      }
      
      if (imageUrl) {
        setUploadedImages([...uploadedImages, imageUrl]);
      } else {
        alert('Failed to get image URL from server');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
      // Reset input
      event.target.value = '';
    }
  };

  const handleRemoveImage = (index) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!productName || !productPrice || !categoryVal) {
      alert('Please fill in required fields: Product Name, Price, and Category');
      return;
    }

    try {
      setLoading(true);

      const productData = {
        name: productName,
        description: productDescription,
        price: parseFloat(productPrice),
        originalPrice: productOldPrice ? parseFloat(productOldPrice) : undefined,
        stock: productStock ? parseInt(productStock) : 0,
        categoryId: categoryVal,
        brand: productBrand || undefined,
        discount: productDiscount ? parseFloat(productDiscount) : undefined,
        rating: rating || 0,
        isFeatured: isFeatureVal === "true",
        images: uploadedImages.length > 0 ? uploadedImages : [],
        isActive: true,
      };

      if (editId) {
        await productsAPI.update(editId, productData);
        alert('Product updated successfully!');
      } else {
        await productsAPI.create(productData);
        alert('Product created successfully!');
      }

      router.push('/products-list');
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-5 py-5">
      <div className="bg-white shadow-md rounded-md p-5">
        <h2 className="text-[18px] text-gray-700 font-[600]">
          {editId ? 'Edit Product' : 'Add Product'}
        </h2>

        {loading && !editId && (
          <div className="mt-5 p-4 bg-blue-50 rounded-md">
            <p className="text-blue-600">Loading...</p>
          </div>
        )}

        <form className="mt-5" onSubmit={handleSubmit}>
          <div className="form-group mb-4 flex flex-col gap-1">
            <span className="text-[15px] text-gray-800">Product Name <span className="text-red-500">*</span></span>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
              className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] outline-none rounded-b-sm focus:border-[rgba(0,0,0,0.4)] px-4"
            />
          </div>

          <div className="form-group mb-4 flex flex-col gap-1">
            <span className="text-[15px] text-gray-800">
              Product Description
            </span>
            <textarea
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              className="w-full h-[120px] border border-[rgba(0,0,0,0.2)] outline-none rounded-sm focus:border-[rgba(0,0,0,0.4)] px-3 py-3 text-[14px] resize-none"
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="col flex flex-col gap-1">
              <span className="text-[15px] text-gray-800">
                Product Category <span className="text-red-500">*</span>
              </span>
              <Select
                value={categoryVal}
                onChange={handleChangeCategory}
                displayEmpty
                required
                inputProps={{ "aria-label": "Without label" }}
                size="small"
              >
                <MenuItem value="">
                  <em>{categories.length === 0 ? 'No categories available' : 'Select Category'}</em>
                </MenuItem>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="" disabled>
                    <em>Please add categories first</em>
                  </MenuItem>
                )}
              </Select>
              {categories.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  No categories found. Please add categories in Category List first.
                </p>
              )}
            </div>

            <div className="col mb-4 flex flex-col gap-1">
              <span className="text-[15px] text-gray-800">Product Price <span className="text-red-500">*</span></span>
              <input
                type="number"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                required
                min="0"
                step="0.01"
                className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] outline-none rounded-sm focus:border-[rgba(0,0,0,0.4)] px-3 py-3 text-[14px]"
              />
            </div>

            <div className="col mb-4 flex flex-col gap-1">
              <span className="text-[15px] text-gray-800">
                Product Old Price
              </span>
              <input
                type="number"
                value={productOldPrice}
                onChange={(e) => setProductOldPrice(e.target.value)}
                min="0"
                step="0.01"
                className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] outline-none rounded-sm focus:border-[rgba(0,0,0,0.4)] px-3 py-3 text-[14px]"
              />
            </div>

            <div className="col flex flex-col gap-1">
              <span className="text-[15px] text-gray-800">Is Featured?</span>
              <Select
                value={isFeatureVal}
                onChange={handleChangeFeatureVal}
                displayEmpty
                inputProps={{ "aria-label": "Without label" }}
                size="small"
              >
                <MenuItem value="true">True</MenuItem>
                <MenuItem value="false">False</MenuItem>
              </Select>
            </div>

            <div className="col mb-4 flex flex-col gap-1">
              <span className="text-[15px] text-gray-800">Product Stock</span>
              <input
                type="number"
                value={productStock}
                onChange={(e) => setProductStock(e.target.value)}
                min="0"
                className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] outline-none rounded-sm focus:border-[rgba(0,0,0,0.4)] px-3 py-3 text-[14px]"
              />
            </div>

            <div className="col mb-4 flex flex-col gap-1">
              <span className="text-[15px] text-gray-800">Product Brand</span>
              <input
                type="text"
                value={productBrand}
                onChange={(e) => setProductBrand(e.target.value)}
                className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] outline-none rounded-sm focus:border-[rgba(0,0,0,0.4)] px-3 py-3 text-[14px]"
              />
            </div>

            <div className="col mb-4 flex flex-col gap-1">
              <span className="text-[15px] text-gray-800">
                Product Discount (%)
              </span>
              <input
                type="number"
                value={productDiscount}
                onChange={(e) => setProductDiscount(e.target.value)}
                min="0"
                max="100"
                step="0.01"
                className="w-full h-[40px] border border-[rgba(0,0,0,0.2)] outline-none rounded-sm focus:border-[rgba(0,0,0,0.4)] px-3 py-3 text-[14px]"
              />
            </div>

            <div className="col mb-4 flex flex-col gap-1">
              <span className="text-[15px] text-gray-800">
                Product Rating
              </span>
              <Rating
                name="simple-controlled"
                value={rating}
                onChange={(event, newValue) => {
                  setRating(newValue || 0);
                }}
              />
            </div>
          </div>


          <div className="flex flex-col gap-1 mt-5">
            <h2 className="text-[16px] text-gray-700 font-[600]">Media & Images</h2>

            <div className="flex items-center gap-4 mt-3 flex-wrap">
              {uploadedImages.map((imageUrl, index) => (
                <div key={index} className='w-[150px] h-[120px] rounded-md bg-gray-100 p-5 border border-dashed border-[rgba(0,0,0,0.3)] flex items-center justify-center flex-col gap-2 relative overflow-hidden'>
                  <img 
                    src={imageUrl} 
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <span 
                    onClick={() => handleRemoveImage(index)}
                    className="flex items-center justify-center bg-red-700 rounded-full w-6 h-6 absolute -top-[8px] -right-[8px] cursor-pointer hover:bg-red-800"
                  >
                    <IoMdClose size={20} className="text-white"/>
                  </span>
                </div>
              ))}

              <div className='w-[150px] h-[120px] rounded-md bg-gray-100 p-5 border border-dashed border-[rgba(0,0,0,0.3)] flex items-center justify-center flex-col gap-2 relative'>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  className='absolute top-0 left-0 w-full h-full z-50 opacity-0 cursor-pointer'
                  disabled={loading}
                />
                <FaRegImages size={40} className='text-gray-400'/>
                <span className='text-gray-600 text-[13px]'>Image Upload</span>
              </div>
            </div>
          </div>

          <br />

          <div className="flex items-center gap-3">
            <Button 
              type="submit" 
              className="btn-g !px-8"
              disabled={loading}
            >
              {loading ? 'Saving...' : (editId ? 'Update Product' : 'Publish & View')}
            </Button>
            <Button 
              type="button"
              className="btn-border-g !px-8"
              onClick={() => router.push('/products-list')}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
