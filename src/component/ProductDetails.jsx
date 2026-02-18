"use client";
import { Button, TextField } from "@mui/material";
import React, { useState, useEffect } from "react";
import ProductZoom from "./ProductZoom";
import Skeleton from '@/component/ui/Skeleton'
import Rating from "@mui/material/Rating";
import QtyBox from "./QtyBox";
import { IoCartOutline, IoChevronDownOutline } from "react-icons/io5";
import { FaRegHeart } from "react-icons/fa";
import { MdLocalShipping, MdVerifiedUser, MdStar } from "react-icons/md";
import { FaWeight, FaBoxOpen } from "react-icons/fa";
import { GiChemicalDrop } from "react-icons/gi";
import { BiInfoCircle } from "react-icons/bi";
import Tooltip from "@mui/material/Tooltip";
import { productsAPI, wishlistAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/utils/formatCurrency";
import { handleAddToCart, handleBuyNow } from "@/utils/cart";
import { isAuthenticated } from "@/utils/auth";
import { useNotification } from "@/utils/useNotification";

const ProductDetailsComponent = ({ productId }) => {
  const router = useRouter();
  const { showSuccess, showError, showInfo, showWarning } = useNotification();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isActiveTab, setIsActiveTab] = useState(0);
  const [value, setValue] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewSort, setReviewSort] = useState("newest"); // newest | highest
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Refresh product data when page becomes visible (user returns from checkout/other pages)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && productId) {
        // Refresh product data when user returns to the page
        fetchProduct();
      }
    };

    const handleFocus = () => {
      if (productId) {
        // Refresh product data when window regains focus
        fetchProduct();
      }
    };

    // Listen for custom event when order is created (from checkout page)
    const handleOrderCreated = () => {
      if (productId) {
        // Small delay to ensure backend has updated
        setTimeout(() => {
          fetchProduct();
        }, 500);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('orderCreated', handleOrderCreated);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('orderCreated', handleOrderCreated);
    };
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      // Force fresh data by adding timestamp to prevent cache
      const response = await productsAPI.getById(productId);
      const productData = response?.product || response;
      if (productData) {
        const safeReviews = Array.isArray(productData.reviews)
          ? productData.reviews.filter((r) => r && typeof r === "object")
          : [];
        setProduct(productData);
        if (productData.variants && productData.variants.length > 0) {
          setSelectedVariant(productData.variants[0]);
        }
        setValue(productData.rating || 0);
        setReviews(safeReviews);
        // Update recently viewed list for personalization on homepage
        if (productData.id) {
          try {
            if (typeof window !== 'undefined') {
              const raw = window.localStorage.getItem('recentlyViewedProducts');
              const existing = raw ? JSON.parse(raw) : [];
              const filtered = Array.isArray(existing)
                ? existing.filter((id) => id !== productData.id)
                : [];
              const updated = [productData.id, ...filtered].slice(0, 10);
              window.localStorage.setItem('recentlyViewedProducts', JSON.stringify(updated));
            }
          } catch (e) {
            console.error('Error updating recently viewed products:', e);
          }
        }
      } else {
        router.push("/products");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      showError("Product not found");
      router.push("/products");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!product || !product.id) {
      console.error('Product data is not available');
      return;
    }

    // Jika belum login, arahkan ke halaman login
    if (!isAuthenticated()) {
      showInfo('Silakan login terlebih dahulu');
      router.push("/login");
      return;
    }

    try {
      await wishlistAPI.addToWishlist(product.id);
      showSuccess('Produk ditambahkan ke wishlist');
      // Opsional: arahkan ke halaman My List agar user bisa lihat wishlist-nya
      router.push("/my-list");
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      showError(error.message || "Gagal menambahkan produk ke wishlist. Silakan coba lagi.");
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!product || !product.id) {
      return;
    }

    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    const text = reviewText.trim();
    if (!text || !value) {
      showWarning("Tulis ulasan dan pilih rating terlebih dahulu.");
      return;
    }

    if (text.length < 5) {
      showWarning("Panjang ulasan minimal 5 karakter.");
      return;
    }

    try {
      const response = await productsAPI.addReview(product.id, {
        comment: text,
        rating: value,
      });
      const updatedProduct = response.product || response;
      const safeReviews = Array.isArray(updatedProduct.reviews)
        ? updatedProduct.reviews.filter((r) => r && typeof r === "object")
        : [];
      setProduct(updatedProduct);
      setReviews(safeReviews);
      setReviewText("");
      setValue(0);
      showSuccess("Review berhasil dikirim");
    } catch (error) {
      console.error("Error submitting review:", error);
      showError(error.message || "Gagal mengirim review. Silakan coba lagi.");
    }
  };

  const getStockStatus = () => {
    const stock = Number(product?.stock || 0);
    if (stock <= 0) {
      return { label: "Habis", color: "bg-red-100 text-red-700" };
    }
    if (stock <= 5) {
      return { label: "Hampir habis", color: "bg-amber-100 text-amber-700" };
    }
    return { label: "Tersedia", color: "bg-emerald-100 text-emerald-700" };
  };

  const isOutOfStock = !product?.stock || Number(product.stock) <= 0;

  const getDiscount = () => {
    const price = Number(product.price || 0);
    const original = Number(product.originalPrice || 0);
    if (!original || original <= price) return null;
    const percent = Math.round(((original - price) / original) * 100);
    return percent > 0 ? percent : null;
  };

  const weightInfo = () => {
    const weight = Number(product.weight || 0);
    const unit = product.unit || "pcs";
    if (weight > 0) return `${weight} ${unit}`;
    if (unit) return `1 ${unit} (perkiraan)`;
    return "Belum ada info berat / isi bersih";
  };

  const safeReviewsForCalc = Array.isArray(reviews)
    ? reviews.filter((r) => r && typeof r === "object")
    : [];

  const sortedReviews = [...safeReviewsForCalc].sort((a, b) => {
    if (reviewSort === "highest") {
      if ((b.rating || 0) !== (a.rating || 0)) {
        return (b.rating || 0) - (a.rating || 0);
      }
    }
    // default & tie-breaker: newest first
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  const baseProductRating =
    product && typeof product.rating === "number" ? product.rating : 0;

  const averageRating =
    safeReviewsForCalc.length > 0
      ? (
          safeReviewsForCalc.reduce(
            (sum, r) => sum + Number((r && r.rating) || 0),
            0
          ) / safeReviewsForCalc.length
        ).toFixed(1)
      : baseProductRating.toFixed(1);

  if (loading) {
    return (
      <div className="flex flex-col lg:flex-row gap-6 items-start py-8">
        <div className="w-full lg:w-1/3">
          <Skeleton height="320px" width="100%" />
        </div>
        <div className="flex-1 space-y-4 w-full">
          <Skeleton height="28px" width="60%" />
          <Skeleton height="18px" width="40%" />
          <Skeleton height="18px" width="30%" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Skeleton height="18px" width="80%" />
            <Skeleton height="18px" width="50%" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton height="40px" width="140px" />
            <Skeleton height="40px" width="140px" />
            <Skeleton height="40px" width="48px" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Product not found</p>
      </div>
    );
  }

  return (
    <div className="product-detail-animate">
      {/* Main Product Section */}
      <div className="flex flex-col lg:flex-row gap-8 items-start mb-8">
        <ProductZoom images={product.images || []} />

        <div className="flex-1 product-info-card">
          {/* Product Header */}
          <div className="product-header">
            {product.brand && (
              <span className="product-badge product-badge-brand mb-3">
                {product.brand}
              </span>
            )}
            <h1 className="product-title">{product.name || "Product Name"}</h1>

            <div className="rating-display">
              <Rating name="read-only" value={Number(averageRating) || 0} readOnly />
              <span className="rating-value">
                {averageRating}/5
              </span>
              <span className="rating-count">
                ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
              </span>
            </div>
          </div>

          {/* Price Section */}
          <div className="product-price-section">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="product-price-main">
                {formatCurrency(selectedVariant && selectedVariant.price ? selectedVariant.price : product.price || 0)}
              </span>
              {product.originalPrice && (
                <span className="product-price-original">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
              {getDiscount() && (
                <span className="product-badge product-badge-discount">
                  {getDiscount()}% OFF
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-3 mt-3">
              <p className="text-[15px] text-gray-600 flex items-center gap-2">
                Stok:
                <span className="text-primary font-bold">
                  {selectedVariant ? selectedVariant.stock : (product.stock || 0)} item
                </span>
              </p>
              <span
                className={`product-badge product-badge-stock ${getStockStatus().color}`}
              >
                {getStockStatus().label}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-[15px] text-gray-600 leading-7 mb-6">
            {product.description ||
              "Belum ada deskripsi produk. Produk ini cocok untuk kebutuhan belanja harian Anda."}
          </p>

          {/* Product Info Grid */}
          <div className="product-info-grid overflow-visible">
            {product.variants && product.variants.length > 1 ? (
              <div className="product-info-item full-width mb-6 p-4 bg-primary/5 rounded-2xl border border-primary/10 overflow-visible relative z-[1]">
                <div className="product-info-label mb-3 font-bold text-gray-800">
                  <FaBoxOpen className="text-primary" />
                  Pilih Varian Produk
                </div>
                
                <div className="relative w-full overflow-visible">
                  <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    className={`w-full rounded-[32px] border-2 px-5 py-4 bg-white shadow-sm flex justify-between items-center transition-all outline-none relative z-[10000] ${
                        open ? "border-orange-500 ring-4 ring-orange-50" : "border-orange-400 hover:border-orange-500"
                    }`}
                  >
                    <span className="font-bold text-gray-700">
                      {selectedVariant 
                        ? `${selectedVariant.name} - ${formatCurrency(selectedVariant.price || product.price)}`
                        : "Pilih Varian"}
                    </span>
                    <IoChevronDownOutline 
                      className={`text-orange-500 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} 
                      size={20} 
                    />
                  </button>

                  {/* Backdrop to close dropdown */}
                  {open && (
                    <div 
                      className="fixed inset-0 z-[9998]" 
                      onClick={() => setOpen(false)}
                    />
                  )}

                  {open && (
                    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[9999] rounded-[24px] bg-white shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                      {product.variants.map((v, index) => (
                        <div
                          key={v.id || index}
                          onClick={() => {
                            setSelectedVariant(v);
                            setOpen(false);
                          }}
                          className={`px-5 py-4 hover:bg-orange-50 cursor-pointer transition-all flex justify-between items-center ${
                            selectedVariant?.id === v.id ? "bg-orange-50" : ""
                          }`}
                        >
                          <span className={`text-[15px] ${selectedVariant?.id === v.id ? "text-primary font-bold" : "text-gray-700"}`}>
                            {v.name}
                          </span>
                          <span className="text-gray-500 font-semibold truncate ml-2">
                            {formatCurrency(v.price || product.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : product.variants?.length === 1 && (
              <div className="product-info-item full-width mb-6 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <div className="product-info-label mb-3 font-bold text-gray-800">
                  <FaBoxOpen className="text-primary" />
                  Varian Produk
                </div>
                <div className="px-5 py-4 bg-white rounded-[32px] border-2 border-gray-100 text-gray-700 font-bold shadow-sm">
                  {product.variants[0].name} - {formatCurrency(product.variants[0].price || product.price)}
                </div>
              </div>
            )}

            <div className="product-info-item">
              <div className="product-info-label">
                <FaBoxOpen className="text-primary" />
                Varian / Rasa
              </div>
              <div className="product-info-value">{selectedVariant?.name || product.variants?.[0]?.name || product.variant || "Varian standar"}</div>
            </div>
            <div className="product-info-item">
              <div className="product-info-label">
                <GiChemicalDrop className="text-primary" />
                Komposisi
              </div>
              <div className="product-info-value">
                {product.composition ||
                  "Informasi komposisi belum tersedia. Silakan cek label kemasan untuk detail lengkap."}
              </div>
            </div>
            <div className="product-info-item">
              <div className="product-info-label">
                <BiInfoCircle className="text-primary" />
                Info Alergi
              </div>
              <div className="product-info-value">
                {product.allergyInfo ||
                  "Produk ini dapat mengandung alergen seperti gluten, susu, atau kacang-kacangan."}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="product-action-buttons">
            <QtyBox
              quantity={quantity}
              setQuantity={setQuantity}
              max={Math.max(Number(selectedVariant ? selectedVariant.stock : (product?.stock || 0)), 0)}
              disabled={isOutOfStock}
            />

            <Button
              className="product-btn-add-cart"
              onClick={() => {
                if (isOutOfStock) {
                  showWarning('Produk ini sedang habis. Stok tidak tersedia.');
                  return;
                }
                if (product.variants && product.variants.length > 1 && !selectedVariant) {
                  showWarning('Silakan pilih varian terlebih dahulu.');
                  return;
                }
                handleAddToCart(product.id, quantity, router, fetchProduct, selectedVariant?.id);
              }}
              disabled={isOutOfStock}
            >
              <IoCartOutline size={22} />
              {isOutOfStock ? 'Stok Habis' : 'Add to cart'}
            </Button>

            <Button
              className="product-btn-buy-now"
              onClick={() => {
                if (isOutOfStock) {
                  showWarning('Produk ini sedang habis. Stok tidak tersedia.');
                  return;
                }
                if (product.variants && product.variants.length > 1 && !selectedVariant) {
                  showWarning('Silakan pilih varian terlebih dahulu.');
                  return;
                }
                handleBuyNow(product.id, quantity, router, fetchProduct, selectedVariant?.id);
              }}
              disabled={isOutOfStock}
            >
              {isOutOfStock ? 'Stok Habis' : 'Beli Sekarang'}
            </Button>

            <Tooltip title="Add to wishlist" placement="top">
              <Button
                className="product-btn-wishlist"
                onClick={handleAddToWishlist}
              >
                <FaRegHeart size={20} />
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="product-tabs">
        <button
          className={`product-tab ${isActiveTab === 0 ? "active" : ""}`}
          onClick={() => setIsActiveTab(0)}
        >
          Description
        </button>
        <button
          className={`product-tab ${isActiveTab === 1 ? "active" : ""}`}
          onClick={() => setIsActiveTab(1)}
        >
          Reviews ({reviews.length})
        </button>
      </div>

      {/* Tab Content */}
      {isActiveTab === 0 && (
        <div className="product-tab-content">
          <p className="text-[15px] text-gray-600 leading-8 max-w-4xl">
            {product.description || "No description available"}
          </p>
        </div>
      )}

      {isActiveTab === 1 && (
        <div className="product-tab-content">
          {/* Review Summary */}
          <div className="review-summary">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <Rating name="summary" value={Number(averageRating) || 0} readOnly size="large" />
                <div className="flex flex-col">
                  <span className="text-[24px] font-[700] text-gray-800">
                    {averageRating}/5
                  </span>
                  <span className="text-[14px] text-gray-500">
                    Berdasarkan {reviews.length} review
                  </span>
                </div>
              </div>

              {reviews.length > 0 && (
                <div className="flex items-center gap-2 text-[14px]">
                  <span className="text-gray-600">Urutkan:</span>
                  <select
                    className="border border-gray-300 rounded-md px-3 py-2 text-[14px] outline-none focus:border-primary"
                    value={reviewSort}
                    onChange={(e) => setReviewSort(e.target.value)}
                  >
                    <option value="newest">Terbaru</option>
                    <option value="highest">Rating tertinggi</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Reviews List */}
          <div className="max-h-[500px] overflow-y-auto space-y-4">
            {reviews.length === 0 ? (
              <p className="text-[15px] text-gray-600 leading-7 text-center py-8">
                There are no reviews yet. Be the first to review this product.
              </p>
            ) : (
              sortedReviews.map((review, index) => (
                <div className="review-card" key={review.id || index}>
                  <div className="flex gap-4">
                    <div className="review-avatar">
                      <img
                        src={"/profile.jpg"}
                        alt="profile image"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="review-author">
                        {review.name || "Customer"}
                      </h3>
                      <p className="review-date">
                        {review.createdAt
                          ? new Date(review.createdAt).toLocaleDateString("id-ID")
                          : ""}
                      </p>
                      <Rating
                        name="read-only"
                        value={review.rating || 0}
                        readOnly
                        size="small"
                        className="my-2"
                      />
                      <p className="review-text">
                        {review.comment}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Review Form */}
          <div className="review-form">
            <h2>Add a review</h2>
            <form className="flex flex-col gap-5" onSubmit={handleSubmitReview}>
              <TextField
                id="reviewInput"
                label="Write a review"
                variant="outlined"
                multiline
                rows={5}
                className="w-full"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />

              <div>
                <p className="text-sm text-gray-600 mb-2">Your Rating:</p>
                <Rating
                  name="simple-controlled"
                  value={value}
                  onChange={(event, newValue) => {
                    setValue(newValue || 0);
                  }}
                  size="large"
                />
              </div>

              <div>
                <Button type="submit" className="btn-g !px-8 !py-3">
                  Submit Review
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trust Badges Section */}
      <div className="trust-badge-grid">
        <div className="trust-badge-card">
          <h3 className="trust-badge-title">
            <MdLocalShipping className="text-primary text-xl" />
            Pengiriman
          </h3>
          <ul className="trust-badge-content space-y-2">
            <li>
              Lokasi pengiriman:{" "}
              <span className="font-[600]">
                {product.shippingOrigin || "Gudang utama Zenla Mart"}
              </span>
            </li>
            <li>
              Estimasi tiba:{" "}
              <span className="font-[600]">
                {product.shippingEstimate || "2–4 hari kerja"}
              </span>
            </li>
            <li>Ongkir menyesuaikan alamat & kurir pilihan Anda.</li>
          </ul>
        </div>

        <div className="trust-badge-card">
          <h3 className="trust-badge-title">
            <MdVerifiedUser className="text-primary text-xl" />
            Retur & Refund
          </h3>
          <ul className="trust-badge-content space-y-2">
            <li>Garansi retur 2x24 jam setelah pesanan diterima.</li>
            <li>Produk rusak / cacat / kedaluwarsa akan diganti atau refund.</li>
            <li>
              Simpan video unboxing sebagai bukti untuk proses klaim yang lebih
              cepat.
            </li>
          </ul>
        </div>

        <div className="trust-badge-card">
          <h3 className="trust-badge-title">
            <MdStar className="text-primary text-xl" />
            Kenapa belanja di Zenla Mart?
          </h3>
          <ul className="trust-badge-content space-y-2">
            <li>✅ 100% Produk asli & resmi dari distributor terpercaya.</li>
            <li>✅ Kemasan aman, dilapisi bubble wrap / kardus berlapis.</li>
            <li>✅ Dukungan CS jika ada kendala dengan pesanan Anda.</li>
          </ul>
        </div>
      </div>
      {/* Custom Styles for Animations */}
      <style jsx>{`
        @keyframes variantPop {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1.05); }
        }
        .animate-variant-pop {
          animation: variantPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .hover\:scale-102:hover {
          transform: scale(1.02);
        }
        .product-detail-animate {
          animation: fadeIn 0.6s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ProductDetailsComponent;
