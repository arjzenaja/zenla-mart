"use client";
import React, { useState, useEffect, useMemo } from "react";
import CartItems from "./cartItems";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { formatCurrency } from "@/utils/formatCurrency";
import { cartAPI, productsAPI, addressAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/utils/auth";
import { MdOutlineSecurity } from "react-icons/md";
import { RiRefund2Line } from "react-icons/ri";
import { FiHeadphones } from "react-icons/fi";
import Container from "@/component/ui/Container";

const Page = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const [error, setError] = useState('');

  // Dialog konfirmasi hapus item
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState("");

  // Shipping & address
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [shippingEstimate] = useState("2–4 hari kerja");

  // Promo / voucher
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [promoError, setPromoError] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  // Optional: note for seller
  const [noteForSeller, setNoteForSeller] = useState('');

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    fetchCartAndAddress();
  }, [router]);

  const fetchCartAndAddress = async () => {
    try {
      setLoading(true);
      setError('');

      const [cartResponse, addressesResponse] = await Promise.all([
        cartAPI.getCart(),
        addressAPI.getAll().catch(() => null),
      ]);

      const cart = cartResponse.cart || cartResponse;

      if (!cart || !cart.items || cart.items.length === 0) {
        setCartItems([]);
        setSubtotal(0);
        setDefaultAddress(null);
        setLoading(false);
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

      // Filter out null items (products that couldn't be fetched)
      const validItems = itemsWithProducts.filter(item => item !== null);

      setCartItems(validItems);

      // Calculate subtotal
      const total = validItems.reduce((sum, item) => {
        const variant = item.product.variants?.find(v => v.id === item.variantId);
        const price = variant?.price || item.product.price || 0;
        return sum + (price * item.quantity);
      }, 0);

      setSubtotal(total);

      // Set default shipping address (if available)
      if (addressesResponse) {
        const addresses = addressesResponse.addresses || addressesResponse;
        if (Array.isArray(addresses) && addresses.length > 0) {
          const def =
            addresses.find((addr) => addr.isDefault) || addresses[0];
          setDefaultAddress(def);
        } else {
          setDefaultAddress(null);
        }
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError(error.message || 'Failed to load cart. Please try again.');

      // If unauthorized, redirect to login
      if (error.message?.includes('Authentication') || error.message?.includes('401')) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity, variantId = null) => {
    try {
      await cartAPI.updateCartItem(productId, newQuantity, variantId);
      // Refresh cart after update
      await fetchCartAndAddress();
    } catch (error) {
      console.error('Error updating cart:', error);
      setError(error.message || 'Failed to update quantity. Please try again.');
    }
  };

  const handleAskRemoveItem = (productId, variantId = null) => {
    setItemToRemove({ productId, variantId });
    setRemoveError("");
    setRemoveDialogOpen(true);
  };

  const handleConfirmRemoveItem = async () => {
    if (!itemToRemove) return;

    try {
      setRemoving(true);
      await cartAPI.removeFromCart(itemToRemove.productId, itemToRemove.variantId);
      await fetchCartAndAddress();
      setRemoveDialogOpen(false);
      setItemToRemove(null);
    } catch (error) {
      console.error("Error removing item:", error);
      setRemoveError(error.message || "Gagal menghapus item. Silakan coba lagi.");
    } finally {
      setRemoving(false);
    }
  };

  const handleCloseRemoveDialog = () => {
    if (removing) return;
    setRemoveDialogOpen(false);
    setItemToRemove(null);
    setRemoveError("");
  };

  const handleApplyPromo = (e) => {
    e.preventDefault();

    if (subtotal <= 0) {
      setPromoError('Tidak ada item di keranjang untuk diterapkan promo.');
      setPromoMessage('');
      setDiscountAmount(0);
      return;
    }

    const code = promoCode.trim().toUpperCase();

    if (!code) {
      setPromoError('Masukkan kode promo terlebih dahulu.');
      setPromoMessage('');
      setDiscountAmount(0);
      return;
    }

    let discount = 0;
    let message = '';

    // Simple client-side promo logic
    if (code === 'HEMAT10') {
      discount = subtotal * 0.1;
      message = 'Kode promo berhasil diterapkan: Diskon 10% dari subtotal.';
    } else if (code === 'HEMAT20' && subtotal >= 200000) {
      discount = subtotal * 0.2;
      message = 'Kode promo HEMAT20 berhasil diterapkan (min. belanja Rp200.000).';
    } else {
      setPromoError('Kode promo tidak valid atau tidak memenuhi syarat.');
      setPromoMessage('');
      setDiscountAmount(0);
      return;
    }

    setDiscountAmount(discount);
    setPromoMessage(message);
    setPromoError('');
  };

  const handleProceedToCheckout = () => {
    // Simpan catatan untuk penjual ke localStorage agar bisa di-pre-fill di checkout
    if (typeof window !== 'undefined' && noteForSeller.trim()) {
      localStorage.setItem('checkoutNotes', noteForSeller.trim());
    }

    router.push('/checkout');
  };

  const shippingCost = useMemo(() => 0, []); // tetap gratis untuk sekarang

  const effectiveDiscount = useMemo(() => {
    if (!discountAmount || subtotal <= 0) return 0;
    return Math.min(discountAmount, subtotal);
  }, [discountAmount, subtotal]);

  const grandTotal = useMemo(() => {
    return Math.max(subtotal + shippingCost - effectiveDiscount, 0);
  }, [subtotal, shippingCost, effectiveDiscount]);

  if (loading) {
    return (
      <section className="bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 min-h-screen">
        <Container>
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600 text-base font-medium">Memuat keranjang belanja...</p>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 min-h-screen">
        <Container>
          <div className="flex items-center justify-center py-20">
            <div className="text-center max-w-md bg-white rounded-2xl shadow-xl p-8 border border-red-100">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-red-600 mb-6 font-medium">{error}</p>
              <Button 
                onClick={fetchCartAndAddress} 
                className="btn-g !px-8 !py-3"
              >
                Coba lagi
              </Button>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 min-h-screen relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl -z-10"></div>
      
      <Container>
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left: daftar produk */}
          <div className="col1 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 w-full lg:w-2/3 overflow-hidden transition-all duration-300 hover:shadow-2xl">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl text-gray-900 font-bold flex items-center gap-2">
                    <span className="w-10 h-10 bg-gradient-to-br from-primary to-pink-500 rounded-xl flex items-center justify-center text-white text-lg">
                      🛒
                    </span>
                    Keranjang Belanja
                  </h2>
                  <p className="text-sm text-gray-600 mt-2">
                    Terdapat
                    <span className="text-primary font-bold mx-1">{cartItems.length}</span>
                    produk di keranjangmu
                  </p>
                </div>
                {cartItems.length > 0 && (
                  <Link href="/products">
                    <Button className="!text-primary !border-2 !border-primary !bg-white hover:!bg-primary hover:!text-white !capitalize !text-sm !font-semibold !rounded-lg !px-6 !transition-all !duration-200">
                      Lanjut Belanja
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {cartItems.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <p className="text-gray-600 text-xl font-semibold mb-2">Keranjang kamu masih kosong</p>
                <p className="text-gray-500 text-sm mb-6">Yuk, mulai belanja dan temukan produk favoritmu!</p>
                <Link href="/products">
                  <Button className="btn-g !px-8 !py-3 !text-base">Mulai Belanja</Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {cartItems.map((item, index) => (
                  <div 
                    key={item.productId}
                    style={{
                      animation: `fadeInUp 0.4s ease-out ${index * 0.1}s forwards`,
                      opacity: 0
                    }}
                  >
                    <CartItems
                      item={item}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemove={handleAskRemoveItem}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: ringkasan & info pengiriman */}
          <div className="col2 w-full lg:w-1/3 space-y-6 lg:sticky lg:top-6">
            {/* Informasi pengiriman */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl">
              <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white">
                      🚚
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">Pengiriman ke</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Estimasi <span className="font-semibold text-gray-700">{shippingEstimate}</span>
                      </p>
                    </div>
                  </div>
                  <Link href="/address" aria-label="Ubah alamat pengiriman">
                    <Button className="!text-primary !bg-transparent hover:!bg-primary/10 !capitalize !text-xs !font-semibold !rounded-lg !px-3 !transition-all !duration-200">
                      Ubah
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="p-5 text-sm text-gray-700 space-y-1">
                {defaultAddress ? (
                  <>
                    <p className="font-semibold text-gray-900">
                      {defaultAddress.name} • {defaultAddress.phone}
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                      {defaultAddress.address}, {defaultAddress.city},{' '}
                      {defaultAddress.province} {defaultAddress.postalCode}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500 text-center py-2">
                    Kamu belum memiliki alamat default. Tambahkan atau pilih alamat di halaman alamat.
                  </p>
                )}
              </div>
            </div>

            {/* Promo & voucher */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl">
              <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-green-50/50 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white text-lg">
                    🎫
                  </div>
                  <h3 className="text-base font-bold text-gray-900">Promo & Voucher</h3>
                </div>
              </div>
              <form onSubmit={handleApplyPromo} className="p-5 space-y-3">
                <div className="flex gap-2">
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Masukkan kode promo"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: 'white',
                        '&:hover fieldset': {
                          borderColor: 'hsl(var(--primary))',
                        },
                      },
                    }}
                  />
                  <Button
                    type="submit"
                    className="btn-g !min-w-[100px] !capitalize !rounded-xl !font-semibold"
                  >
                    Terapkan
                  </Button>
                </div>
                {promoMessage && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                    <p className="text-sm text-emerald-700 font-medium flex items-center gap-2">
                      <span className="text-lg">✓</span>
                      {promoMessage}
                    </p>
                  </div>
                )}
                {promoError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-sm text-red-600 font-medium flex items-center gap-2">
                      <span className="text-lg">✕</span>
                      {promoError}
                    </p>
                  </div>
                )}
              </form>
            </div>

            {/* Catatan untuk penjual */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl">
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white text-lg">
                    📝
                  </div>
                  <h3 className="text-base font-bold text-gray-900">
                    Catatan (opsional)
                  </h3>
                </div>
              </div>
              <div className="p-5">
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  placeholder="Contoh: Tolong bungkus rapi, jangan kirim saat hujan deras."
                  value={noteForSeller}
                  onChange={(e) => setNoteForSeller(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: 'white',
                      '&:hover fieldset': {
                        borderColor: 'hsl(var(--primary))',
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Ringkasan pesanan */}
            <div className="bg-gradient-to-br from-white via-white to-gray-50/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent">
                <h2 className="text-xl text-gray-900 font-bold flex items-center gap-2">
                  <span className="text-2xl">💰</span>
                  Ringkasan Pesanan
                </h2>
              </div>

              <div className="info p-6 space-y-4">
                <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                  <span>Subtotal</span>
                  <span className="text-lg font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                  <span>Ongkir</span>
                  <span className="font-semibold text-green-600">
                    {shippingCost === 0 ? 'Gratis' : formatCurrency(shippingCost)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                  <span>Diskon</span>
                  <span className="font-semibold text-emerald-600">
                    {effectiveDiscount > 0 ? `- ${formatCurrency(effectiveDiscount)}` : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-lg font-bold text-gray-900 pt-4 border-t-2 border-gray-200">
                  <span>Total</span>
                  <span className="text-2xl bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed bg-gray-50 rounded-lg p-3">
                  💡 Total sudah termasuk perkiraan biaya yang berlaku. Detail akhir biaya
                  akan dikonfirmasi kembali di halaman pembayaran.
                </p>
              </div>

              <div className="px-6 pb-6">
                {cartItems.length > 0 ? (
                  <Button
                    className="btn-g w-full !py-4 !text-base !font-bold !rounded-xl !shadow-lg hover:!shadow-xl !transition-all !duration-200"
                    onClick={handleProceedToCheckout}
                  >
                    Lanjut ke Pembayaran 🚀
                  </Button>
                ) : (
                  <Button className="btn-g w-full !py-4 !rounded-xl" disabled>
                    Lanjut ke Pembayaran
                  </Button>
                )}
                <p className="text-xs text-gray-500 text-center mt-3 flex items-center justify-center gap-1">
                  <span className="text-green-600">🔒</span>
                  Pembayaran aman & data kamu terlindungi
                </p>
              </div>

              {/* Trust badges */}
              <div className="px-6 pb-6 space-y-3 border-t border-gray-100 pt-5 bg-gradient-to-b from-transparent to-gray-50/50">
                <div className="flex items-start gap-3 text-sm text-gray-700 p-3 rounded-xl bg-white/50 hover:bg-white transition-colors duration-200">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MdOutlineSecurity className="text-white" size={18} />
                  </div>
                  <span className="leading-relaxed">Pembayaran terenkripsi & diawasi sistem keamanan</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-700 p-3 rounded-xl bg-white/50 hover:bg-white transition-colors duration-200">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <RiRefund2Line className="text-white" size={18} />
                  </div>
                  <span className="leading-relaxed">Garansi retur 7 hari untuk pesanan yang bermasalah</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-700 p-3 rounded-xl bg-white/50 hover:bg-white transition-colors duration-200">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiHeadphones className="text-white" size={18} />
                  </div>
                  <span className="leading-relaxed">Butuh bantuan? Hubungi CS di 08xx-xxxx-xxxx</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
      
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      {/* Dialog konfirmasi hapus item */}
      <Dialog
        open={removeDialogOpen}
        onClose={handleCloseRemoveDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            paddingY: 1,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: 18 }}>
          Hapus produk dari keranjang?
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 1.5, pb: 2.5 }}>
          <Typography variant="body2" color="text.secondary">
            Produk ini akan dihapus dari keranjang belanja kamu. Tindakan ini
            tidak bisa dibatalkan.
          </Typography>
          {removeError && (
            <Typography
              variant="body2"
              color="error"
              sx={{ mt: 1.5, fontWeight: 500 }}
            >
              {removeError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2.5, gap: 1.5 }}>
          <Button
            onClick={handleCloseRemoveDialog}
            variant="outlined"
            className="!normal-case"
            disabled={removing}
          >
            Batal
          </Button>
          <Button
            onClick={handleConfirmRemoveItem}
            className="btn-g !normal-case"
            disabled={removing}
          >
            {removing ? "Menghapus..." : "Ya, hapus"}
          </Button>
        </DialogActions>
      </Dialog>
    </section>
  );
};

export default Page;
