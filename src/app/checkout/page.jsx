"use client";
import { Button as MUIButton, RadioGroup, FormControlLabel, Radio, TextField, Checkbox } from "@mui/material";
import React, { useState, useEffect } from "react";
import { FiPlus, FiCheck, FiMapPin, FiTruck, FiCreditCard, FiFileText, FiLock, FiArrowRight } from "react-icons/fi";
import { MdOutlineSecurity } from "react-icons/md";
import { RiRefund2Line } from "react-icons/ri";
import { FiHeadphones } from "react-icons/fi";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/utils/formatCurrency";
import { cartAPI } from "@/lib/api";
import { addressAPI } from "@/lib/api";
import { ordersAPI } from "@/lib/api";
import { productsAPI } from "@/lib/api";
import { uploadAPI } from "@/lib/api";
import { isAuthenticated } from "@/utils/auth";
import { useNotification } from "@/utils/useNotification";
import Container from '@/component/ui/Container'
import Button from '@/component/ui/Button'
import Skeleton from '@/component/ui/Skeleton'

const Page = () => {
  const router = useRouter();
  const { showSuccess, showError, showWarning, showLoading, removeNotification } = useNotification();
  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [selectedEwallet, setSelectedEwallet] = useState('');
  const [shippingMethod, setShippingMethod] = useState('regular');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingEstimate, setShippingEstimate] = useState('');
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [error, setError] = useState('');
  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState('');
  const [paymentProofUrl, setPaymentProofUrl] = useState('');
  const [uploadingProof, setUploadingProof] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    // Pre-fill notes from cart page if available
    if (typeof window !== 'undefined') {
      const savedNotes = localStorage.getItem('checkoutNotes');
      if (savedNotes && !notes) {
        setNotes(savedNotes);
      }
    }

    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch cart and addresses in parallel
      const [cartResponse, addressesResponse] = await Promise.all([
        cartAPI.getCart(),
        addressAPI.getAll()
      ]);

      const cart = cartResponse.cart || cartResponse;
      const addressesData = addressesResponse.addresses || addressesResponse;

      // Check if cart is empty
      if (!cart || !cart.items || cart.items.length === 0) {
        router.push('/cart');
        return;
      }

      // Fetch product details for each cart item
      const itemsWithProducts = await Promise.all(
        cart.items.map(async (item) => {
          try {
            const productResponse = await productsAPI.getById(item.productId);
            const product = productResponse.product || productResponse;
            return {
              ...item,
              product
            };
          } catch (error) {
            console.error(`Error fetching product ${item.productId}:`, error);
            return null;
          }
        })
      );

      const validItems = itemsWithProducts.filter(item => item !== null);
      setCartItems(validItems);

      // Calculate subtotal
      const total = validItems.reduce((sum, item) => {
        const variant = item.product.variants?.find(v => v.id === item.variantId);
        const price = variant?.price || item.product.price || 0;
        return sum + (price * item.quantity);
      }, 0);
      setSubtotal(total);

      // Set addresses
      setAddresses(addressesData || []);

      // Set default address if available
      if (addressesData && addressesData.length > 0) {
        const defaultAddress = addressesData.find(addr => addr.isDefault) || addressesData[0];
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        }
      }

      // Default shipping info
      setShippingMethod('regular');
      setShippingEstimate('2–4 hari kerja');
      setShippingCost(5000);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message || 'Failed to load checkout data. Please try again.');
      
      if (error.message?.includes('Authentication') || error.message?.includes('401')) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const getSelectedAddress = () => {
    return addresses.find(addr => addr.id === selectedAddressId) || null;
  };

  const selectedAddress = getSelectedAddress();

  const isCODAvailableForAddress = (address) => {
    if (!address) return false;
    const province = (address.province || "").toLowerCase();
    const city = (address.city || "").toLowerCase();
    // Aturan sederhana: COD hanya untuk area tertentu
    if (province.includes("jawa tengah") || city.includes("purwokerto")) {
      return true;
    }
    return false;
  };

  const SHIPPING_OPTIONS = [
    {
      id: 'instant',
      label: 'Instant',
      description: 'Tiba dalam 1–2 jam setelah pesanan dikonfirmasi',
      eta: '1–2 jam',
      baseCost: 8000
    },
    {
      id: 'same_day',
      label: 'Same Day',
      description: 'Sampai di hari yang sama jika pesan sebelum jam 15.00',
      eta: 'Dalam hari yang sama',
      baseCost: 6000
    },
    {
      id: 'regular',
      label: 'Regular',
      description: 'Pilihan ekonomis dengan estimasi 2–4 hari kerja',
      eta: '2–4 hari kerja',
      baseCost: 5000
    },
    {
      id: 'pickup',
      label: 'Ambil di Toko',
      description: 'Ambil langsung pesananmu di toko tanpa biaya ongkir',
      eta: 'Bisa diambil dalam 1x24 jam setelah pesanan dikonfirmasi',
      baseCost: 0
    }
  ];

  const selectedShippingOption = SHIPPING_OPTIONS.find(opt => opt.id === shippingMethod) || SHIPPING_OPTIONS[2];
  const effectiveShippingCost = shippingCost ?? selectedShippingOption.baseCost;

  const isPickup = shippingMethod === 'pickup';
  const requiresPaymentProof = !isPickup && (paymentMethod === 'bank' || paymentMethod === 'e-wallet');

  // E-Wallet options configuration
  const E_WALLET_OPTIONS = [
    { id: 'ovo', label: 'OVO', icon: '💜' },
    { id: 'gopay', label: 'GoPay', icon: '💚' },
    { id: 'linkaja', label: 'LinkAja', icon: '🔵' }
  ];

  // Bank details configuration
  const BANK_DETAILS = {
    name: 'Bank Mandiri',
    accountNumber: '1234567890',
    accountName: 'Zenla Mart'
  };

  const handlePaymentProofChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simple client-side validation
    if (!file.type.startsWith('image/')) {
      showError('Format file harus gambar (JPG, PNG, atau sejenisnya).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showError('Ukuran file maksimal 5MB.');
      return;
    }

    setPaymentProofFile(file);
    setPaymentProofPreview(URL.createObjectURL(file));

    try {
      setUploadingProof(true);
      const result = await uploadAPI.uploadImage(file);
      if (result?.url) {
        setPaymentProofUrl(result.url);
        showSuccess('Bukti transfer berhasil diunggah');
      } else {
        throw new Error('Upload gagal, coba lagi.');
      }
    } catch (err) {
      console.error('Error uploading payment proof:', err);
      showError(err.message || 'Gagal mengupload bukti transfer. Silakan coba lagi.');
      setPaymentProofFile(null);
      setPaymentProofPreview('');
      setPaymentProofUrl('');
    } finally {
      setUploadingProof(false);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    if (!selectedAddressId) {
      showWarning('Silakan pilih alamat pengiriman terlebih dahulu');
      return;
    }

    if (cartItems.length === 0) {
      showError('Keranjang kamu kosong');
      router.push('/cart');
      return;
    }

    if (!shippingMethod) {
      showWarning('Silakan pilih metode pengiriman');
      return;
    }

    if (!confirmChecked) {
      showWarning('Mohon konfirmasi bahwa kamu sudah memeriksa pesanan dan alamat');
      return;
    }
    
    // Validasi pembayaran hanya jika BUKAN ambil di toko
    if (!isPickup) {
      // Validasi E-Wallet harus dipilih
      if (paymentMethod === 'e-wallet' && !selectedEwallet) {
        showWarning('Silakan pilih e-wallet terlebih dahulu.');
        return;
      }

      if (requiresPaymentProof && !paymentProofUrl) {
        showWarning('Silakan upload bukti transfer sebelum membuat pesanan.');
        return;
      }
    }

    try {
      setSubmitting(true);
      setError('');
      
      const loadingId = showLoading('Memproses pemesanan Anda...');

      const orderData = {
        addressId: selectedAddressId,
        shippingCost: effectiveShippingCost,
        shippingMethod,
        shippingEstimate: selectedShippingOption.eta || shippingEstimate,
        paymentMethod: paymentMethod,
        paymentProofUrl: paymentProofUrl || '',
        notes: notes || ''
      };

      const response = await ordersAPI.checkout(orderData);
      
      removeNotification(loadingId);
      showSuccess('Pesanan berhasil dibuat! Lanjut ke pembayaran...');
      
      // Dispatch event to notify other pages that order was created (stock updated)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('orderCreated'));
      }
      
      // Redirect to order success page or orders page
      setTimeout(() => {
        if (response.order && response.order.id) {
          router.push(`/orders/${response.order.id}?success=true`);
        } else {
          router.push('/orders?success=true');
        }
      }, 1000);
    } catch (error) {
      console.error('Error creating order:', error);
      setError(error.message || 'Failed to create order. Please try again.');
      showError(error.message || 'Gagal membuat pesanan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const isCODAvailable = isCODAvailableForAddress(selectedAddress);
  const isFormValid =
    !!selectedAddressId &&
    !!shippingMethod &&
    confirmChecked &&
    cartItems.length > 0 &&
    (
      isPickup ||
      (
        (paymentMethod !== 'e-wallet' || !!selectedEwallet) &&
        (!requiresPaymentProof || !!paymentProofUrl)
      )
    );

  // Determine current step for progress indicator
  const getCurrentStep = () => {
    if (!selectedAddressId) return 1;
    if (!shippingMethod) return 2;
    // Jika ambil di toko, lewati validasi step pembayaran
    if (!isPickup && (!paymentMethod || (paymentMethod === 'e-wallet' && !selectedEwallet))) return 3;
    if (!confirmChecked) return 4;
    return 4;
  };

  const currentStep = getCurrentStep();

  const steps = [
    { id: 1, label: 'Alamat', icon: FiMapPin },
    { id: 2, label: 'Pengiriman', icon: FiTruck },
    { id: 3, label: 'Pembayaran', icon: FiCreditCard },
    { id: 4, label: 'Konfirmasi', icon: FiFileText },
  ];

  if (loading) {
    return (
      <section className="bg-gradient-to-b from-gray-50 to-white min-h-screen py-12">
        <Container>
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow-md p-8">
              <Skeleton height="18px" width="30%" style={{ marginBottom: 8 }} />
              <Skeleton height="14px" width="50%" style={{ marginBottom: 12 }} />
              <Skeleton height="220px" width="100%" />
            </div>
          </div>
        </Container>
      </section>
    );
  }

  if (error && cartItems.length === 0) {
    return (
      <section className="bg-gradient-to-b from-gray-50 to-white min-h-screen py-12">
        <Container>
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow-md p-12">
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <p className="text-red-500 mb-4">{error}</p>
                  <Link href="/cart">
                    <Button className="btn-g">Back to Cart</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-b from-gray-50 via-white to-gray-50 min-h-screen py-8 lg:py-12">
      <Container>
        <div className="max-w-7xl mx-auto">
          {/* Modern Step Indicator */}
          <div className="mb-8 lg:mb-12">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 lg:p-8">
              <div className="flex items-center justify-between relative">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = currentStep >= step.id;
                  const isCurrent = currentStep === step.id;
                  const isCompleted = currentStep > step.id;

                  return (
                    <React.Fragment key={step.id}>
                      <div className="flex flex-col items-center flex-1 relative z-10">
                        <div
                          className={`w-12 h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isCompleted
                              ? 'bg-[#D96F32] text-white shadow-lg shadow-orange-200'
                              : isCurrent
                              ? 'bg-[#D96F32] text-white shadow-lg shadow-orange-200 scale-110'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {isCompleted ? (
                            <FiCheck className="w-6 h-6 lg:w-7 lg:h-7" />
                          ) : (
                            <Icon className={`w-5 h-5 lg:w-6 lg:h-6 ${isCurrent ? 'text-white' : 'text-gray-400'}`} />
                          )}
                        </div>
                        <span
                          className={`mt-3 text-xs lg:text-sm font-semibold transition-colors ${
                            isActive ? 'text-[#D96F32]' : 'text-gray-400'
                          }`}
                        >
                          {step.label}
                        </span>
                        {isCurrent && (
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[#D96F32] rounded-full animate-pulse" />
                        )}
                      </div>
                      {index < steps.length - 1 && (
                        <div className="flex-1 h-0.5 mx-2 lg:mx-4 relative -z-0">
                          <div
                            className={`h-full transition-all duration-500 ${
                              currentStep > step.id ? 'bg-[#D96F32]' : 'bg-gray-200'
                            }`}
                            style={{ width: currentStep > step.id ? '100%' : '0%' }}
                          />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content - 2 Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              <form onSubmit={handleCheckout} className="space-y-6">
                {/* Step 1: Alamat Pengiriman */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden animate-fade-in">
                  <div className="px-6 lg:px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">Alamat Pengiriman</h2>
                        <p className="text-sm text-gray-600">Pastikan nama penerima, nomor HP, dan alamat sudah benar.</p>
                      </div>
                      <Link
                        href="/addresses/new"
                        onClick={() => {
                          if (typeof window !== 'undefined') {
                            localStorage.setItem('addressReturnPath', '/checkout')
                          }
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#D96F32] text-white rounded-lg font-semibold text-sm hover:bg-[#c85d28] transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
                      >
                        <FiPlus size={18} />
                        Tambah Alamat
                      </Link>
                    </div>
                  </div>

                  <div className="p-6 lg:p-8 space-y-4">
                    {addresses.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                          <FiMapPin className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-600 mb-6">Belum ada alamat. Silakan tambah alamat terlebih dahulu.</p>
                        <Link href="/addresses/new">
                          <Button className="btn-primary">Tambah Alamat</Button>
                        </Link>
                      </div>
                    ) : (
                      <RadioGroup
                        value={selectedAddressId}
                        onChange={(e) => setSelectedAddressId(e.target.value)}
                        className="flex flex-col gap-4"
                      >
                        {addresses.map((address) => (
                          <label
                            key={address.id}
                            className={`group relative block border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                              selectedAddressId === address.id
                                ? 'border-[#D96F32] bg-orange-50/50 shadow-lg shadow-orange-100 scale-[1.02]'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                            }`}
                          >
                            <div className="flex items-start gap-4 p-5 lg:p-6">
                              <div className="flex-shrink-0 pt-1">
                                <Radio 
                                  value={address.id}
                                  sx={{
                                    color: '#D96F32',
                                    '&.Mui-checked': {
                                      color: '#D96F32',
                                    },
                                  }}
                                />
                              </div>

                              <div className="flex-1 flex flex-col gap-2 min-w-0">
                                <div className="flex items-center gap-3 flex-wrap">
                                  <span className="text-gray-900 text-base font-semibold">
                                    {address.name || 'Nama Penerima'}
                                  </span>
                                  <span className="text-gray-600 text-sm">
                                    {address.phone}
                                  </span>
                                  {address.isDefault && (
                                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                                      Alamat Utama
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed">
                                  {address.address}, {address.city}, {address.province} {address.postalCode}
                                </p>
                              </div>

                              <div className="flex-shrink-0">
                                <Link 
                                  href={`/addresses/edit/${address.id}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-[#D96F32] hover:bg-orange-50 rounded-lg transition-colors"
                                >
                                  Edit
                                </Link>
                              </div>
                            </div>
                            {selectedAddressId === address.id && (
                              <div className="absolute top-4 right-4">
                                <div className="w-6 h-6 rounded-full bg-[#D96F32] flex items-center justify-center">
                                  <FiCheck className="w-4 h-4 text-white" />
                                </div>
                              </div>
                            )}
                          </label>
                        ))}
                      </RadioGroup>
                    )}
                  </div>
                </div>

                {/* Step 2: Metode Pengiriman */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden animate-fade-in">
                  <div className="px-6 lg:px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">Metode Pengiriman</h2>
                    <p className="text-sm text-gray-600">Pilih jenis pengiriman yang paling sesuai dengan kebutuhanmu.</p>
                  </div>

                  <div className="p-6 lg:p-8">
                    <RadioGroup
                      value={shippingMethod}
                      onChange={(e) => {
                        const value = e.target.value;
                        setShippingMethod(value);
                        const option = SHIPPING_OPTIONS.find(opt => opt.id === value);
                        if (option) {
                          setShippingEstimate(option.eta);
                          // Gratis ongkir untuk Regular jika subtotal di atas 200k, atau untuk semua metode jika subtotal di atas 300k
                          if (option.id === 'pickup') {
                            // Ambil di toko selalu tanpa ongkir
                            setShippingCost(0);
                          } else if (subtotal >= 300000 || (value === 'regular' && subtotal >= 200000)) {
                            setShippingCost(0);
                          } else {
                            setShippingCost(option.baseCost);
                          }
                        }
                      }}
                      className="space-y-4"
                    >
                      {SHIPPING_OPTIONS.map(option => {
                        const isPickupOption = option.id === 'pickup';
                        const isFreeByPromo = subtotal >= 300000 || (option.id === 'regular' && subtotal >= 200000);
                        const costToShow = isPickupOption ? 0 : (isFreeByPromo ? 0 : option.baseCost);
                        const isSelected = shippingMethod === option.id;
                        
                        return (
                          <label
                            key={option.id}
                            className={`group relative block border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                              isSelected
                                ? 'border-[#D96F32] bg-orange-50/50 shadow-lg shadow-orange-100 scale-[1.02]'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                            }`}
                          >
                            <div className="flex items-start gap-4 p-5 lg:p-6">
                              <div className="flex-shrink-0 pt-1">
                                <Radio 
                                  value={option.id}
                                  sx={{
                                    color: '#D96F32',
                                    '&.Mui-checked': {
                                      color: '#D96F32',
                                    },
                                  }}
                                />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                      <FiTruck className={`w-5 h-5 ${isSelected ? 'text-[#D96F32]' : 'text-gray-400'}`} />
                                      <p className="text-base font-bold text-gray-900">
                                        {option.label}
                                      </p>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">
                                      {option.description}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Estimasi tiba: <span className="font-semibold text-gray-700">{option.eta}</span>
                                    </p>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <p className={`text-lg font-bold ${costToShow === 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                                      {isPickupOption
                                        ? 'Gratis'
                                        : (costToShow === 0 ? 'Gratis' : formatCurrency(costToShow))}
                                    </p>
                                    {!isPickupOption && costToShow === 0 && (
                                      <p className="text-xs text-emerald-600 mt-1 font-medium">
                                        {option.id === 'regular' 
                                          ? 'Pesanan ≥ Rp200k'
                                          : 'Pesanan ≥ Rp300k'}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="absolute top-4 right-4">
                                <div className="w-6 h-6 rounded-full bg-[#D96F32] flex items-center justify-center">
                                  <FiCheck className="w-4 h-4 text-white" />
                                </div>
                              </div>
                            )}
                          </label>
                        );
                      })}
                    </RadioGroup>
                  </div>
                </div>

                {/* Step 3: Metode Pembayaran */}
                {!isPickup && (
                <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden animate-fade-in">
                  <div className="px-6 lg:px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">Metode Pembayaran</h2>
                    <p className="text-sm text-gray-600">Pilih cara pembayaran yang paling nyaman. Beberapa metode menyesuaikan lokasi pengiriman.</p>
                  </div>

                  <div className="p-6 lg:p-8 space-y-4">
                    <RadioGroup
                      value={paymentMethod}
                      onChange={(e) => {
                        setPaymentMethod(e.target.value);
                        // Reset e-wallet selection ketika ganti metode
                        setSelectedEwallet('');
                        // Reset bukti pembayaran ketika ganti metode
                        setPaymentProofFile(null);
                        setPaymentProofPreview('');
                        setPaymentProofUrl('');
                      }}
                      className="space-y-4"
                    >
                      {/* COD Payment Method Card */}
                      <label
                        className={`group relative block border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          paymentMethod === 'cash'
                            ? 'border-[#D96F32] bg-orange-50/50 shadow-lg shadow-orange-100 scale-[1.02]'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                        } ${!isCODAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-start gap-4 p-5 lg:p-6">
                          <div className="flex-shrink-0 pt-1">
                            <Radio 
                              value="cash" 
                              disabled={!isCODAvailable}
                              sx={{
                                color: '#D96F32',
                                '&.Mui-checked': {
                                  color: '#D96F32',
                                },
                                '&.Mui-disabled': {
                                  color: '#d1d5db',
                                },
                              }}
                            />
                          </div>
                          <div className="flex items-start gap-4 flex-1">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                              paymentMethod === 'cash' ? 'bg-orange-100' : 'bg-gray-100'
                            }`}>
                              <svg className={`w-7 h-7 ${paymentMethod === 'cash' ? 'text-[#D96F32]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-base font-bold text-gray-900 mb-1">
                                Bayar di Tempat (COD)
                              </p>
                              <p className="text-sm text-gray-600">
                                Bayar langsung ke kurir ketika pesanan sampai di alamatmu.
                              </p>
                              {!isCODAvailable && (
                                <p className="text-xs text-red-500 mt-2 font-medium">
                                  COD belum tersedia untuk alamat ini. Silakan pilih metode lain.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        {paymentMethod === 'cash' && (
                          <div className="absolute top-4 right-4">
                            <div className="w-6 h-6 rounded-full bg-[#D96F32] flex items-center justify-center">
                              <FiCheck className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                      </label>

                      {/* Bank Transfer Payment Method Card */}
                      <label
                        className={`group relative block border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          paymentMethod === 'bank'
                            ? 'border-[#D96F32] bg-orange-50/50 shadow-lg shadow-orange-100 scale-[1.02]'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-start gap-4 p-5 lg:p-6">
                          <div className="flex-shrink-0 pt-1">
                            <Radio 
                              value="bank"
                              sx={{
                                color: '#D96F32',
                                '&.Mui-checked': {
                                  color: '#D96F32',
                                },
                              }}
                            />
                          </div>
                          <div className="flex items-start gap-4 flex-1">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                              paymentMethod === 'bank' ? 'bg-blue-100' : 'bg-gray-100'
                            }`}>
                              <svg className={`w-7 h-7 ${paymentMethod === 'bank' ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-base font-bold text-gray-900 mb-1">
                                Transfer Bank
                              </p>
                              <p className="text-sm text-gray-600">
                                Pembayaran via transfer ke rekening virtual account atau rekening bersama.
                              </p>
                            </div>
                          </div>
                        </div>
                        {paymentMethod === 'bank' && (
                          <div className="absolute top-4 right-4">
                            <div className="w-6 h-6 rounded-full bg-[#D96F32] flex items-center justify-center">
                              <FiCheck className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                      </label>

                  {/* Bank Details Info - muncul hanya saat Transfer Bank dipilih */}
                  {paymentMethod === 'bank' && (
                    <div className="mt-3 ml-12 animate-fadeIn">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800 mb-2">Informasi Rekening</p>
                            <div className="space-y-1 text-sm text-gray-700">
                              <div className="flex items-center gap-2">
                                <span className="font-medium min-w-[100px]">Bank:</span>
                                <span>{BANK_DETAILS.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium min-w-[100px]">No Rekening:</span>
                                <span className="font-mono font-semibold">{BANK_DETAILS.accountNumber}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium min-w-[100px]">Atas Nama:</span>
                                <span>{BANK_DETAILS.accountName}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                      {/* E-Wallet Payment Method Card */}
                      <label
                        className={`group relative block border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          paymentMethod === 'e-wallet'
                            ? 'border-[#D96F32] bg-orange-50/50 shadow-lg shadow-orange-100 scale-[1.02]'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-start gap-4 p-5 lg:p-6">
                          <div className="flex-shrink-0 pt-1">
                            <Radio 
                              value="e-wallet"
                              sx={{
                                color: '#D96F32',
                                '&.Mui-checked': {
                                  color: '#D96F32',
                                },
                              }}
                            />
                          </div>
                          <div className="flex items-start gap-4 flex-1">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                              paymentMethod === 'e-wallet' ? 'bg-purple-100' : 'bg-gray-100'
                            }`}>
                              <svg className={`w-7 h-7 ${paymentMethod === 'e-wallet' ? 'text-purple-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-base font-bold text-gray-900 mb-1">
                                E-Wallet
                              </p>
                              <p className="text-sm text-gray-600">
                                Dukungan untuk dompet digital populer. Cepat, praktis, dan aman.
                              </p>
                            </div>
                          </div>
                        </div>
                        {paymentMethod === 'e-wallet' && (
                          <div className="absolute top-4 right-4">
                            <div className="w-6 h-6 rounded-full bg-[#D96F32] flex items-center justify-center">
                              <FiCheck className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                      </label>
                    </RadioGroup>

                    {/* E-Wallet Dropdown - muncul hanya saat E-Wallet dipilih */}
                    {paymentMethod === 'e-wallet' && (
                      <div className="mt-4 ml-2 animate-fade-in bg-gray-50 rounded-xl p-5 border border-gray-200">
                        <label className="block text-sm font-bold text-gray-900 mb-3">
                          Pilih E-Wallet <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={selectedEwallet}
                          onChange={(e) => setSelectedEwallet(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D96F32] focus:border-[#D96F32] transition-all"
                        >
                          <option value="">-- Pilih E-Wallet --</option>
                          {E_WALLET_OPTIONS.map((ewallet) => (
                            <option key={ewallet.id} value={ewallet.id}>
                              {ewallet.icon} {ewallet.label}
                            </option>
                          ))}
                        </select>
                        {!selectedEwallet && (
                          <p className="text-xs text-red-500 mt-2 font-medium">Silakan pilih e-wallet terlebih dahulu</p>
                        )}
                      </div>
                    )}

                    {/* Bank Details Info - muncul hanya saat Transfer Bank dipilih */}
                    {paymentMethod === 'bank' && (
                      <div className="mt-4 ml-2 animate-fade-in bg-blue-50 rounded-xl p-5 border border-blue-200">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-900 mb-3">Informasi Rekening</p>
                            <div className="space-y-2 text-sm text-gray-700">
                              <div className="flex items-center gap-3">
                                <span className="font-semibold min-w-[120px]">Bank:</span>
                                <span className="font-medium">{BANK_DETAILS.name}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-semibold min-w-[120px]">No Rekening:</span>
                                <span className="font-mono font-bold text-gray-900">{BANK_DETAILS.accountNumber}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-semibold min-w-[120px]">Atas Nama:</span>
                                <span className="font-medium">{BANK_DETAILS.accountName}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Upload bukti transfer untuk Bank & E-Wallet */}
                    {requiresPaymentProof && (
                      <div className="mt-4 ml-2 bg-amber-50 rounded-xl p-5 border border-amber-200">
                        <p className="text-sm font-bold text-gray-900 mb-2">
                          Upload Bukti Transfer
                        </p>
                        <p className="text-xs text-gray-600 mb-4">
                          Unggah foto struk / screenshot bukti pembayaran untuk mempercepat verifikasi pesananmu.
                          Format yang didukung: JPG, PNG. Maksimal 5MB.
                        </p>

                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          <label className="inline-flex items-center justify-center gap-2 px-5 py-3 border-2 border-dashed border-[#D96F32] text-[#D96F32] text-sm font-semibold rounded-lg cursor-pointer hover:bg-orange-50 transition-all">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handlePaymentProofChange}
                              disabled={uploadingProof}
                            />
                            {uploadingProof ? (
                              <>
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Mengupload...
                              </>
                            ) : (
                              <>
                                <FiPlus size={18} />
                                {paymentProofFile ? 'Ganti File' : 'Pilih File'}
                              </>
                            )}
                          </label>

                          {paymentProofPreview && (
                            <div className="flex items-center gap-4">
                              <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200 bg-white shadow-sm">
                                <img
                                  src={paymentProofPreview}
                                  alt="Bukti transfer"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="text-xs text-gray-700 max-w-[200px]">
                                <p className="font-semibold mb-1">File terpilih:</p>
                                <p className="break-words">{paymentProofFile?.name}</p>
                                {!paymentProofUrl && (
                                  <p className="text-amber-600 mt-2 font-medium">
                                    Menunggu upload selesai...
                                  </p>
                                )}
                                {paymentProofUrl && (
                                  <p className="text-emerald-600 mt-2 font-medium">
                                    ✓ Upload berhasil
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                )}

                {/* Step 4: Konfirmasi & Catatan */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden animate-fade-in">
                  <div className="px-6 lg:px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">Konfirmasi & Catatan</h2>
                    <p className="text-sm text-gray-600">Tambahkan catatan khusus untuk pesananmu (opsional)</p>
                  </div>

                  <div className="p-6 lg:p-8 space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Catatan Pesanan
                      </label>
                      <textarea
                        placeholder="Contoh: Tolong diletakkan di depan pintu, terima kasih..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D96F32] focus:border-[#D96F32] transition-all resize-none"
                      />
                    </div>

                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={confirmChecked}
                            onChange={(e) => setConfirmChecked(e.target.checked)}
                            sx={{
                              color: '#D96F32',
                              '&.Mui-checked': {
                                color: '#D96F32',
                              },
                            }}
                          />
                        }
                        label={
                          <span className="text-sm text-gray-700 font-medium">
                            Saya sudah memeriksa kembali produk, jumlah, metode pengiriman, alamat pengiriman, dan metode pembayaran.
                          </span>
                        }
                      />
                    </div>

                    <div className="flex items-start gap-3 pt-4 border-t border-gray-200">
                      <div className="flex-shrink-0 mt-0.5">
                        <MdOutlineSecurity className="text-[#D96F32]" size={20} />
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Transaksi kamu dilindungi dengan enkripsi dan pemantauan keamanan. Data pribadi dan pembayaranmu aman.
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Right Column - Sticky Order Summary */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-6">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  {/* Header */}
                  <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                    <h2 className="text-xl font-bold text-gray-900">
                      Ringkasan Pesanan
                    </h2>
                  </div>

                  {/* Products List */}
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Produk</span>
                      <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Subtotal</span>
                    </div>
                  </div>

                  <div className="max-h-[320px] overflow-y-auto px-6 py-4 space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.productId} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                            <Image
                              src={item.product.image || item.product.images?.[0] || '/placeholder.png'}
                              alt={item.product.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = '/placeholder.png';
                              }}
                            />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
                            {item.product.name}
                            {(() => {
                              const variant = item.product.variants?.find(v => v.id === item.variantId);
                              return variant ? (
                                <span className="text-xs font-medium text-primary ml-2 bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/10">
                                  {variant.name}
                                </span>
                              ) : null;
                            })()}
                          </h4>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                            <span className="font-medium">Qty: {item.quantity}</span>
                            {item.product.weight && (
                              <span>
                                Berat: {item.product.weight}
                                {item.product.unit ? ' ' + item.product.unit : ' g'}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-bold text-gray-900 mt-2">
                            {(() => {
                              const variant = item.product.variants?.find(v => v.id === item.variantId);
                              const price = variant?.price || item.product.price || 0;
                              return formatCurrency(price * item.quantity);
                            })()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Price Summary */}
                  <div className="px-6 py-5 border-t border-gray-200 bg-gray-50 space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-700">
                      <span className="font-medium">Produk Subtotal</span>
                      <span className="font-semibold">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-700">
                      <span className="font-medium">Ongkir ({selectedShippingOption.label})</span>
                      <span className="font-semibold">
                        {effectiveShippingCost === 0
                          ? <span className="text-emerald-600">Gratis</span>
                          : formatCurrency(effectiveShippingCost)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-700">
                      <span className="font-medium">Diskon / Promo</span>
                      <span className="font-semibold text-emerald-600">
                        - {formatCurrency(0)}
                      </span>
                    </div>
                    <div className="pt-3 border-t-2 border-gray-300 mt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900">Total</span>
                        <span className="text-2xl font-bold text-[#D96F32]">
                          {formatCurrency(subtotal + effectiveShippingCost)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                      Biaya tambahan (jika ada) akan ditampilkan pada halaman konfirmasi pesanan.
                    </p>
                  </div>

                  {/* CTA Button */}
                  <div className="px-6 py-5 border-t border-gray-200 bg-white space-y-4">
                    {/* Secure Checkout Badge */}
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-600 mb-2">
                      <FiLock className="text-[#D96F32]" size={14} />
                      <span className="font-medium">Secure Checkout</span>
                    </div>

                    <button
                      type="submit"
                      onClick={handleCheckout}
                      disabled={submitting || !isFormValid}
                      className={`w-full py-4 px-6 rounded-lg font-bold text-white text-base transition-all duration-200 flex items-center justify-center gap-2 ${
                        submitting || !isFormValid
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-[#D96F32] to-[#c85d28] hover:from-[#c85d28] hover:to-[#b8501f] shadow-lg hover:shadow-xl hover:scale-[1.02]'
                      }`}
                    >
                      {submitting ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Memproses Pesanan...
                        </>
                      ) : (
                        <>
                          Buat Pesanan Sekarang
                          <FiArrowRight size={18} />
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-between text-xs">
                      <Link href="/cart" className="text-[#D96F32] hover:underline font-medium">
                        Kembali ke Keranjang
                      </Link>
                      <Link href="/help/refund" className="text-gray-600 hover:underline">
                        Kebijakan retur & refund
                      </Link>
                    </div>
                  </div>

                  {/* Trust Indicators */}
                  <div className="px-6 py-5 border-t border-gray-200 bg-gray-50 space-y-3">
                    <div className="flex items-start gap-3 text-xs text-gray-700">
                      <MdOutlineSecurity className="text-[#D96F32] flex-shrink-0 mt-0.5" size={16} />
                      <span>Pembayaran aman, data kartu dan akun kamu terenkripsi.</span>
                    </div>
                    <div className="flex items-start gap-3 text-xs text-gray-700">
                      <RiRefund2Line className="text-[#D96F32] flex-shrink-0 mt-0.5" size={16} />
                      <span>Pesanan bermasalah? Tenang, ada kebijakan retur & refund.</span>
                    </div>
                    <div className="flex items-start gap-3 text-xs text-gray-700">
                      <FiHeadphones className="text-[#D96F32] flex-shrink-0 mt-0.5" size={16} />
                      <span>Butuh bantuan? Hubungi CS kami atau chat melalui halaman Bantuan.</span>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    );
  };

export default Page;
