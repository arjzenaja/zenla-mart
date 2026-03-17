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
import Breadcrumbs from "@/app/components/Breadcrumbs";

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
  const [variants, setVariants] = useState([{ name: "", price: "", stock: "" }]);
  const [productWeight, setProductWeight] = useState("");
  const [productUnit, setProductUnit] = useState("pcs");
  const [productComposition, setProductComposition] = useState("");
  const [productAllergyInfo, setProductAllergyInfo] = useState("");
  const [productExpiryEstimate, setProductExpiryEstimate] = useState("");
  const [productShippingOrigin, setProductShippingOrigin] = useState("");
  const [productShippingEstimate, setProductShippingEstimate] = useState("");

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
        if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
          setVariants(product.variants.map(v => ({
            id: v.id,
            name: v.name || "",
            price: v.price?.toString() || "",
            stock: v.stock?.toString() || ""
          })));
        } else {
          setVariants([{ name: "", price: "", stock: "" }]);
        }
        setProductWeight(product.weight?.toString() || "");
        setProductUnit(product.unit || "pcs");
        setProductComposition(product.composition || "");
        setProductAllergyInfo(product.allergyInfo || "");
        setProductExpiryEstimate(product.expiryEstimate || "");
        setProductShippingOrigin(product.shippingOrigin || "");
        setProductShippingEstimate(product.shippingEstimate || "");
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

  const handleAddVariant = () => {
    setVariants([...variants, { name: "", price: "", stock: "" }]);
  };

  const handleRemoveVariant = (index) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    } else {
      setVariants([{ name: "", price: "", stock: "" }]);
    }
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
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
        rating: parseFloat(rating) || 0,
        isFeatured: isFeatureVal === "true",
        variants: variants.filter(v => v.name.trim() !== "").map(v => ({
          id: v.id,
          name: v.name,
          price: v.price ? parseFloat(v.price) : undefined,
          stock: v.stock ? parseInt(v.stock) : 0
        })),
        weight: productWeight ? parseFloat(productWeight) : undefined,
        unit: productUnit || undefined,
        composition: productComposition || undefined,
        allergyInfo: productAllergyInfo || undefined,
        expiryEstimate: productExpiryEstimate || undefined,
        shippingOrigin: productShippingOrigin || undefined,
        shippingEstimate: productShippingEstimate || undefined,
        images: uploadedImages.length > 0 ? uploadedImages : [],
        isActive: true,
      };

      // Debug logging
      console.log("📦 Payload before submit:", {
        stock: productData.stock,
        variants: productData.variants,
        hasVariants: productData.variants.length > 0,
        variantStocks: productData.variants.map(v => ({ name: v.name, stock: v.stock }))
      });

      if (editId) {
        await productsAPI.update(editId, productData);
      } else {
        await productsAPI.create(productData);
      }

      // Force refresh to show new product
      router.refresh();
      router.push('/products-list');
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8 animate-fadeIn">
        <div>
          <Breadcrumbs items={[
            { label: "Products", href: "/products-list" },
            { label: editId ? 'Edit Product' : 'Add Product' }
          ]} />
          <h1 className="text-3xl font-extrabold gradient-text mb-2 leading-tight mt-1">
            {editId ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-gray-600 text-lg">
            {editId ? 'Update product details and inventory' : 'Create a new product for your store'}
          </p>
        </div>
        <Button 
          onClick={() => router.push('/products-list')}
          className="bg-white text-gray-600 normal-case font-bold py-2.5 px-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 transition-smooth"
        >
          Cancel
        </Button>
      </div>

      <div className="card-premium p-8 animate-scaleIn shadow-premium">
        {loading && !editId && (
          <div className="mb-6 p-4 bg-primary/10 border border-primary/20 text-primary rounded-xl flex items-center gap-3 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-primary loading-dot"></span>
            loading data...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* General Information */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-2">
              General Information
            </h2>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-smooth outline-none text-gray-700 font-medium"
                  placeholder="e.g. Premium Chocolate Cake"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Description
                </label>
                <textarea
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  className="w-full h-[120px] px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-smooth outline-none text-gray-700 font-medium resize-none"
                  placeholder="Describe your product..."
                />
              </div>
            </div>
          </div>

          {/* Pricing & Category */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-2">
              Pricing & Organization
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <Select
                  value={categoryVal}
                  onChange={handleChangeCategory}
                  displayEmpty
                  required
                  inputProps={{ "aria-label": "Without label" }}
                  size="small"
                  className="w-full rounded-xl bg-gray-50 focus:bg-white text-gray-700 font-medium field-premium"
                  sx={{ borderRadius: '0.75rem',  '.MuiOutlinedInput-notchedOutline': { borderColor: '#e5e7eb' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#d1d5db' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-primary)' } }}
                >
                  <MenuItem value="">
                    <em className="text-gray-400">{categories.length === 0 ? 'No categories' : 'Select Category'}</em>
                  </MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                {categories.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    No categories found. Please add categories first.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-smooth outline-none text-gray-700 font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Old Price
                </label>
                <input
                  type="number"
                  value={productOldPrice}
                  onChange={(e) => setProductOldPrice(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-smooth outline-none text-gray-700 font-medium"
                />
              </div>

               <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Discount (%)
                </label>
                <input
                  type="number"
                  value={productDiscount}
                  onChange={(e) => setProductDiscount(e.target.value)}
                  min="0"
                  max="100"
                  step="0.01"
                   className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-smooth outline-none text-gray-700 font-medium"
                />
              </div>
            </div>
          </div>
          
           {/* Inventory & Details */}
           <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-2">
              Inventory & Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  value={productStock}
                  onChange={(e) => setProductStock(e.target.value)}
                  min="0"
                   className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-smooth outline-none text-gray-700 font-medium"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Brand
                </label>
                <input
                  type="text"
                  value={productBrand}
                  onChange={(e) => setProductBrand(e.target.value)}
                   className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-smooth outline-none text-gray-700 font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Feature Status</label>
                 <Select
                  value={isFeatureVal}
                  onChange={handleChangeFeatureVal}
                  displayEmpty
                  inputProps={{ "aria-label": "Without label" }}
                  size="small"
                   className="w-full rounded-xl bg-gray-50 focus:bg-white text-gray-700 font-medium"
                  sx={{ borderRadius: '0.75rem', '.MuiOutlinedInput-notchedOutline': { borderColor: '#e5e7eb' } }}
                >
                  <MenuItem value="false">Standard</MenuItem>
                  <MenuItem value="true">Featured Product</MenuItem>
                </Select>
              </div>

               <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block mb-1">
                  Rating (Initial)
                </label>
                 <Rating
                  name="simple-controlled"
                  value={rating}
                  onChange={(event, newValue) => {
                    setRating(newValue || 0);
                  }}
                  size="large"
                />
              </div>
            </div>
            
           {/* Product Variants */}
           <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h2 className="text-xl font-bold text-gray-800">
                Product Variants
              </h2>
              <Button 
                onClick={handleAddVariant}
                className="!bg-primary/10 !text-primary !normal-case !font-bold !rounded-lg !px-4 hover:!bg-primary hover:!text-white transition-all"
              >
                + Add Variant
              </Button>
            </div>
            
            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200 relative group animate-fadeIn">
                  <div className="md:col-span-1 flex items-center justify-center font-bold text-gray-400">
                    {index + 1}
                  </div>
                  <div className="md:col-span-4 space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Nama Varian</label>
                    <input
                      type="text"
                      value={variant.name}
                      onChange={(e) => handleVariantChange(index, "name", e.target.value)}
                      placeholder="e.g. Rasa Vanila / Size XL"
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none text-sm"
                    />
                  </div>
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Harga (Opsional)</label>
                    <input
                      type="number"
                      value={variant.price}
                      onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                      placeholder="Kosongkan jika sama"
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none text-sm"
                    />
                  </div>
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Stok</label>
                    <input
                      type="number"
                      value={variant.stock}
                      onChange={(e) => handleVariantChange(index, "stock", e.target.value)}
                      placeholder="0"
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none text-sm"
                    />
                  </div>
                  <div className="md:col-span-1 flex items-center justify-center pt-5">
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(index)}
                      className="text-red-400 hover:text-red-600 transition-colors p-2"
                    >
                      <IoMdClose size={20} />
                    </button>
                  </div>
                </div>
              ))}
              
              <p className="text-xs text-gray-500 italic px-2">
                * Jika produk memiliki varian, stok total produk akan dihitung otomatis dari jumlah stok semua varian.
              </p>
            </div>
           </div>
            
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
               <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Composition</label>
                <textarea
                  value={productComposition}
                  onChange={(e) => setProductComposition(e.target.value)}
                  className="w-full h-[80px] px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-smooth outline-none text-gray-700 font-medium resize-none"
                  placeholder="Ingredients list..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Allergy Info</label>
                <textarea
                  value={productAllergyInfo}
                  onChange={(e) => setProductAllergyInfo(e.target.value)}
                  className="w-full h-[80px] px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-smooth outline-none text-gray-700 font-medium resize-none"
                  placeholder="Contains milk, soy..."
                />
              </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
               <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Expiry Estimate</label>
                 <input
                  type="text"
                  value={productExpiryEstimate}
                  onChange={(e) => setProductExpiryEstimate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-smooth outline-none text-gray-700 font-medium"
                />
              </div>
               <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Shipping Origin</label>
                 <input
                  type="text"
                  value={productShippingOrigin}
                  onChange={(e) => setProductShippingOrigin(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-smooth outline-none text-gray-700 font-medium"
                />
              </div>
               <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Shipping Estimate</label>
                 <input
                  type="text"
                  value={productShippingEstimate}
                  onChange={(e) => setProductShippingEstimate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-smooth outline-none text-gray-700 font-medium"
                />
              </div>
             </div>
           </div>


          {/* Media & Images */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-2">
             Product Images
            </h2>

            <div className="flex items-center gap-4 mt-3 flex-wrap">
              {uploadedImages.map((imageUrl, index) => (
                <div key={index} className='w-[160px] h-[160px] rounded-2xl bg-white p-2 border border-gray-200 shadow-sm relative group overflow-hidden'>
                   <div className="w-full h-full rounded-xl overflow-hidden">
                    <img 
                      src={imageUrl} 
                      alt={`Product ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-all duration-300 hover:bg-red-600"
                  >
                    <IoMdClose size={18} />
                  </button>
                </div>
              ))}

              <div className='w-[160px] h-[160px] rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition-all duration-300 flex flex-col items-center justify-center relative cursor-pointer group'>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10'
                  disabled={loading}
                />
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                   <FaRegImages size={24} className='text-primary'/>
                </div>
                <span className='text-gray-600 text-xs font-bold'>Upload Image</span>
                <span className='text-gray-400 text-[10px] mt-1'>Max 5MB</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-6 mt-8 border-t border-gray-100">
            <Button 
              type="submit" 
              className="btn-g !px-8 !py-3 !rounded-xl !text-white !font-bold !normal-case shadow-lg hover:shadow-xl hover:scale-105 transition-smooth"
              disabled={loading}
            >
              {loading ? (
                 <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Processing...
                 </div>
              ) : (editId ? 'Update Product' : 'Publish Product')}
            </Button>
            <Button 
              type="button"
              className="!bg-white !text-gray-600 !border !border-gray-200 !px-8 !py-3 !rounded-xl !font-bold !normal-case hover:!bg-gray-50 hover:!shadow-md transition-smooth"
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
