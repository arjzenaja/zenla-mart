import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { COLORS } from '../theme/colors';
import { ChevronLeft, MapPin, Truck, CreditCard, Upload, Check, Trash2 } from 'lucide-react-native';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import { getAddresses } from '../api/addressService';
import { createOrder } from '../api/orderService';
import { getCurrentUser } from '../api/authService';
import { uploadImage } from '../api/uploadService';

const CheckoutScreen = ({ navigation }) => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { showNotification } = useNotification();
  
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Checkout State
  const [shippingMethod, setShippingMethod] = useState('regular'); // Default: regular
  const [paymentMethod, setPaymentMethod] = useState('transfer'); // Default: transfer (bank/midtrans logic later)
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingEstimate, setShippingEstimate] = useState('');
  const [paymentProof, setPaymentProof] = useState(null);
  const [notes, setNotes] = useState('');

  // Constants
  const SHIPPING_OPTIONS = [
    {
      id: 'instant',
      label: 'Instant',
      description: '1-2 jam',
      eta: '1-2 jam',
      baseCost: 20000
    },
    {
      id: 'same_day',
      label: 'Same Day',
      description: 'Hari yang sama',
      eta: 'Hari ini',
      baseCost: 15000
    },
    {
      id: 'regular',
      label: 'Regular',
      description: '2-4 hari kerja',
      eta: '2-4 Hari',
      baseCost: 10000
    },
    {
      id: 'pickup',
      label: 'Ambil di Toko',
      description: 'Ambil sendiri',
      eta: 'Siap 1x24 jam',
      baseCost: 0
    }
  ];

  const PAYMENT_METHODS = [
    { id: 'transfer', label: 'Transfer Bank (BCA/Mandiri)', icon: CreditCard },
    { id: 'cod', label: 'Bayar di Tempat (COD)', icon: Truck },
    // { id: 'ewallet', label: 'E-Wallet (OVO/Gopay)', icon: CreditCard }, 
  ];

  // Derived State
  const totalAmount = cartTotal + shippingCost;
  const isPickup = shippingMethod === 'pickup';
  const requiresProof = !isPickup && paymentMethod === 'transfer';

  useEffect(() => {
    fetchInitialData();
    
    // Refresh data when screen comes into focus (e.g. after adding address)
    const unsubscribe = navigation.addListener('focus', () => {
      fetchInitialData();
    });

    return unsubscribe;
  }, [navigation]);

  // Update shipping cost on method change or cart total change
  useEffect(() => {
    calculateShipping();
  }, [shippingMethod, cartTotal]);

  const calculateShipping = () => {
    const option = SHIPPING_OPTIONS.find(o => o.id === shippingMethod);
    if (!option) return;

    setShippingEstimate(option.eta);

    // Free shipping logic mirroring web
    if (option.id === 'pickup') {
      setShippingCost(0);
    } else if (cartTotal >= 300000 || (option.id === 'regular' && cartTotal >= 200000)) {
      setShippingCost(0);
    } else {
      setShippingCost(option.baseCost);
    }
  };

  const fetchInitialData = async () => {
    try {
      console.log('Fetching initial checkout data...');
      
      const [user, addressData] = await Promise.all([
        getCurrentUser(),
        getAddresses()
      ]);
      
      setCurrentUser(user);
      
      const addressList = addressData.addresses || addressData || [];
      const prevAddressCount = addresses.length;
      setAddresses(addressList);
      
      if (addressList.length > 0) {
        // If we have more addresses than before, it means an address was just added
        // In that case, we should select the newest one (usually at index 0 or filtered by ID)
        if (addressList.length > prevAddressCount && prevAddressCount > 0) {
           // Find the newest address (assuming backend returns sorted or we just pick the one that wasn't there)
           // For simplicity, we can assume the newest is either default or the first in list if sorted by newest
           const newDefault = addressList.find(a => a.isDefault);
           setSelectedAddress(newDefault || addressList[0]);
        } else if (!selectedAddress) {
           const defaultAddr = addressList.find(a => a.isDefault) || addressList[0];
           setSelectedAddress(defaultAddr);
        }
      }
      
    } catch (error) {
      console.error('Error fetching checkout data:', error);
      if (error.response && error.response.status === 401) {
        handleAuthError();
      } else {
        Alert.alert('Error', 'Gagal memuat data checkout');
      }
    } finally {
      setPageLoading(false);
    }
  };

  const handleAuthError = () => {
    Alert.alert(
      'Sesi Berakhir',
      'Silakan login kembali untuk melanjutkan.',
      [
        { text: 'OK', onPress: () => navigation.replace('Login') }
      ]
    );
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPaymentProof(result.assets[0]);
    }
  };

  const handlePlaceOrder = async () => {
    // 1. Validasi Cart
    if (cartItems.length === 0) {
      Alert.alert("Keranjang Kosong", "Silakan tambahkan produk ke keranjang terlebih dahulu.");
      return;
    }

    // 2. Validasi Alamat
    if (!selectedAddress) {
      Alert.alert("Alamat Belum Dipilih", "Silakan pilih atau tambahkan alamat pengiriman.");
      return;
    }

    // 3. Validasi Bukti Pembayaran (Khusus Transfer)
    if (requiresProof && !paymentProof) {
        Alert.alert("Bukti Pembayaran Diperlukan", "Silakan upload bukti transfer bank Anda.");
        return;
    }

    Alert.alert(
      'Konfirmasi Pesanan',
      'Apakah Anda yakin ingin melakukan pemesanan ini?',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Ya, Pesan', onPress: processOrder }
      ]
    );
  };

  const processOrder = async () => {
    setLoading(true);
    try {
      console.log("Starting order process...");
      let paymentProofUrl = '';

      // Upload proof if exists
      if (paymentProof) {
        console.log("Uploading payment proof...");
        try {
            const uploadRes = await uploadImage(paymentProof.uri);
            if (uploadRes && uploadRes.url) {
                paymentProofUrl = uploadRes.url;
                console.log("Payment proof uploaded:", paymentProofUrl);
            }
        } catch (uploadErr) {
            console.error("Upload error:", uploadErr);
            Alert.alert("Gagal Upload", "Gagal mengupload bukti pembayaran. Silakan coba lagi.");
            setLoading(false);
            return;
        }
      }

      // Construct Payload - STRICTLY MATCHING REQUIREMENT
      const orderItems = cartItems.map((item) => ({
        productId: item.productId || item.id, // Handle potential inconsistent naming
        variantId: item.selectedVariant ? (item.selectedVariant.id || item.selectedVariant._id) : null,
        quantity: item.quantity,
        price: item.price,
      }));

      const orderPayload = {
        items: orderItems,
        totalAmount: totalAmount, // Calculated from state
        addressId: selectedAddress.id || selectedAddress._id,
        shippingMethod,
        paymentMethod,
        shippingCost,
        shippingEstimate,
        paymentProofUrl, 
        notes
      };

      console.log("Order Payload:", JSON.stringify(orderPayload, null, 2));

      // Debug Token (Client interceptor handles it, but good to check)
      const token = await AsyncStorage.getItem("token");
      console.log("Token for request:", token ? "Present" : "Missing");

      if (!token) {
        throw new Error("Sesi kadaluarsa, silakan login kembali.");
      }

      // Call API
      const response = await createOrder(orderPayload);
      console.log("Response:", response);

      if (response && (response.success || response.id || response.order)) {
        console.log("Order success! Clearing cart...");
        await clearCart();
        // Handle different response structures if backend returns just the order object or { success: true, order: ... }
        const orderId = response.order ? (response.order.id || response.order._id) : (response.id || response._id);
        navigation.replace('Success', { orderId: orderId });
      } else {
        throw new Error(response.message || 'Gagal membuat pesanan');
      }

    } catch (error) {
      console.error("Order Creation Error:", error);
      if (error.response && error.response.status === 401) {
        handleAuthError();
      } else {
        const errorMessage = error.response?.data?.message || error.message || "Terjadi kesalahan pada server";
        Alert.alert("Gagal Membuat Pesanan", errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <ChevronLeft size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Address Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
             <MapPin size={20} color={COLORS.primary} />
             <Text style={styles.sectionTitle}>Alamat Pengiriman</Text>
          </View>
          
          {selectedAddress ? (
            <TouchableOpacity style={styles.addressCard} onPress={() => navigation.navigate('Address')}>
              <Text style={styles.addressName}>{selectedAddress.fullName || selectedAddress.name} ({selectedAddress.phone})</Text>
              <Text style={styles.addressText}>
                {selectedAddress.address}, {selectedAddress.district ? `${selectedAddress.district}, ` : ''}{selectedAddress.city}, {selectedAddress.province} {selectedAddress.postalCode}
              </Text>
              <Text style={styles.changeAddressText}>Ubah</Text>
            </TouchableOpacity>
          ) : (
             <TouchableOpacity style={styles.addAddressBox} onPress={() => navigation.navigate('AddAddress')}>
                <Text style={styles.addAddressText}>+ Tambah Alamat Pengiriman</Text>
             </TouchableOpacity>
          )}
        </View>

        {/* Shipping Method */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
             <Truck size={20} color={COLORS.primary} />
             <Text style={styles.sectionTitle}>Metode Pengiriman</Text>
          </View>
          {SHIPPING_OPTIONS.map((option) => (
              <TouchableOpacity 
                key={option.id} 
                style={[styles.selectorItem, shippingMethod === option.id && styles.selectorItemSelected]}
                onPress={() => setShippingMethod(option.id)}
              >
                <View style={{flex: 1}}>
                    <Text style={[styles.selectorTitle, shippingMethod === option.id && styles.textSelected]}>{option.label}</Text>
                    <Text style={styles.selectorSubtitle}>{option.description}</Text>
                </View>
                <View style={{alignItems: 'flex-end'}}>
                     <Text style={[styles.selectorPrice, shippingMethod === option.id && styles.textSelected]}>
                        {option.id === 'pickup' || (option.id === 'regular' && cartTotal >= 200000) || cartTotal >= 300000 ? 'Gratis' : `Rp ${option.baseCost.toLocaleString('id-ID')}`}
                     </Text>
                     <View style={[styles.radio, shippingMethod === option.id && styles.radioActive]}>
                        {shippingMethod === option.id && <View style={styles.radioInner} />}
                     </View>
                </View>
              </TouchableOpacity>
          ))}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
             <CreditCard size={20} color={COLORS.primary} />
             <Text style={styles.sectionTitle}>Metode Pembayaran</Text>
          </View>
          {PAYMENT_METHODS.map((method) => (
             <TouchableOpacity 
                key={method.id} 
                style={[styles.selectorItem, paymentMethod === method.id && styles.selectorItemSelected]}
                onPress={() => setPaymentMethod(method.id)}
             >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <method.icon size={20} color={paymentMethod === method.id ? COLORS.primary : COLORS.gray[500]} style={{ marginRight: 10 }} />
                    <Text style={[styles.selectorTitle, paymentMethod === method.id && styles.textSelected]}>{method.label}</Text>
                </View>
                <View style={[styles.radio, paymentMethod === method.id && styles.radioActive]}>
                    {paymentMethod === method.id && <View style={styles.radioInner} />}
                </View>
             </TouchableOpacity>
          ))}
        </View>

        {/* Payment Proof Upload (Only for Transfer) */}
        {requiresProof && (
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Upload size={20} color={COLORS.primary} />
                    <Text style={styles.sectionTitle}>Bukti Pembayaran</Text>
                </View>
                
                <View style={styles.uploadContainer}>
                    {paymentProof ? (
                        <View style={styles.previewContainer}>
                            <Image source={{ uri: paymentProof.uri }} style={styles.previewImage} resizeMode="cover" />
                            <TouchableOpacity style={styles.removeBtn} onPress={() => setPaymentProof(null)}>
                                <Trash2 size={18} color={COLORS.white} />
                            </TouchableOpacity>
                            <View style={styles.uploadSuccessBadge}>
                                <Check size={14} color={COLORS.white} />
                                <Text style={styles.uploadSuccessText}>Terupload</Text>
                            </View>
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
                            <Upload size={32} color={COLORS.gray[400]} />
                            <Text style={styles.uploadText}>Upload Bukti Transfer</Text>
                            <Text style={styles.uploadSubtext}>Format: JPG, PNG (Max 5MB)</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        )}

        {/* Notes */}
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Catatan Pesanan (Opsional)</Text>
            </View>
            <TextInput
                style={styles.notesInput}
                placeholder="Tulis catatan untuk penjual..."
                value={notes}
                onChangeText={setNotes}
                multiline
            />
        </View>

        {/* Order Items Summary */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Item Pesanan ({cartItems.length})</Text>
            {cartItems.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                    <View style={{flex: 1}}>
                        <Text style={styles.itemName} numberOfLines={1}>
                            {item.name} {item.selectedVariant ? `(${item.selectedVariant.name})` : ''}
                        </Text>
                        <Text style={styles.itemVariant}>Qty: {item.quantity}</Text>
                    </View>
                    <Text style={styles.itemPrice}>
                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                    </Text>
                </View>
            ))}
        </View>

        {/* Payment Summary */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Ringkasan Pembayaran</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>Rp {cartTotal.toLocaleString('id-ID')}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Biaya Pengiriman</Text>
            <Text style={styles.summaryValue}>Rp {shippingCost.toLocaleString('id-ID')}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>Rp {totalAmount.toLocaleString('id-ID')}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
            style={[styles.orderBtn, loading && styles.disabledBtn]} 
            onPress={handlePlaceOrder}
            disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.orderBtnText}>Buat Pesanan</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  headerBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    color: COLORS.secondary,
  },
  addressCard: {
    backgroundColor: COLORS.gray[50],
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  addressName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 5,
  },
  addressText: {
    fontSize: 14,
    color: COLORS.gray[600],
    lineHeight: 20,
  },
  changeAddressText: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 10,
    fontWeight: '600',
  },
  addAddressBox: {
    backgroundColor: COLORS.gray[50],
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addAddressText: {
     color: COLORS.gray[500],
     fontSize: 14
  },
  selectorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    marginBottom: 10,
  },
  selectorItemSelected: {
      borderColor: COLORS.primary,
      backgroundColor: 'rgba(217, 111, 50, 0.05)',
  },
  selectorTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: COLORS.secondary
  },
  textSelected: {
      color: COLORS.primary
  },
  selectorSubtitle: {
      fontSize: 12,
      color: COLORS.gray[500],
      marginTop: 2
  },
  selectorPrice: {
      fontSize: 14,
      fontWeight: '600',
      color: COLORS.secondary,
      marginBottom: 5
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.gray[400],
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
      borderColor: COLORS.primary,
  },
  radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: COLORS.primary,
  },
  uploadContainer: {
      marginTop: 5,
  },
  uploadBox: {
      height: 150,
      borderWidth: 2,
      borderColor: COLORS.gray[300],
      borderStyle: 'dashed',
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.gray[50],
  },
  uploadText: {
      marginTop: 10,
      fontSize: 14,
      fontWeight: '600',
      color: COLORS.gray[600],
  },
  uploadSubtext: {
      marginTop: 4,
      fontSize: 12,
      color: COLORS.gray[400],
  },
  previewContainer: {
      height: 200,
      borderRadius: 12,
      overflow: 'hidden',
      position: 'relative',
      borderWidth: 1,
      borderColor: COLORS.gray[200],
  },
  previewImage: {
      width: '100%',
      height: '100%',
  },
  removeBtn: {
      position: 'absolute',
      top: 10,
      right: 10,
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: 8,
      borderRadius: 20,
  },
  uploadSuccessBadge: {
      position: 'absolute',
      bottom: 10,
      right: 10,
      backgroundColor: COLORS.success,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 15,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5
  },
  uploadSuccessText: {
      color: COLORS.white,
      fontSize: 12,
      fontWeight: 'bold',
  },
  notesInput: {
      backgroundColor: COLORS.gray[50],
      borderRadius: 12,
      padding: 15,
      height: 100,
      textAlignVertical: 'top',
      borderWidth: 1,
      borderColor: COLORS.gray[200],
  },
  itemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.gray[100],
  },
  itemName: {
      fontSize: 14,
      color: COLORS.secondary,
      fontWeight: '500', 
      marginBottom: 4,
  },
  itemVariant: {
      fontSize: 12,
      color: COLORS.gray[500],
  },
  itemPrice: {
      fontSize: 14,
      color: COLORS.primary,
      fontWeight: '600'
  },
  summaryBox: {
    backgroundColor: COLORS.gray[50],
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    color: COLORS.gray[500],
  },
  summaryValue: {
    color: COLORS.secondary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray[200],
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  orderBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
  },
  disabledBtn: {
    backgroundColor: COLORS.gray[400],
  },
  orderBtnText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  }
});

export default CheckoutScreen;
