import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ChevronLeft, 
  Package, 
  MapPin, 
  CreditCard, 
  Truck, 
  FileText, 
  Download,
  Clock,
  ExternalLink
} from 'lucide-react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { COLORS } from '../theme/colors';
import { getOrderById } from '../api/orderService';
import { generateInvoiceHTML } from '../utils/invoiceHelper';

const OrderDetailScreen = ({ navigation, route }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await getOrderById(orderId);
      setOrder(response.order || response);
    } catch (error) {
      console.error('Fetch order detail error:', error);
      Alert.alert('Error', 'Gagal mengambil detail pesanan');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return { bg: 'rgba(245, 158, 11, 0.1)', text: '#F59E0B', label: 'Menunggu Pembayaran' };
      case 'processing':
        return { bg: 'rgba(59, 130, 246, 0.1)', text: '#3B82F6', label: 'Diproses' };
      case 'shipped':
        return { bg: 'rgba(139, 92, 246, 0.1)', text: '#8B5CF6', label: 'Dikirim' };
      case 'completed':
      case 'delivered':
      case 'selesai':
        return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10B981', label: 'Selesai' };
      case 'cancelled':
        return { bg: 'rgba(239, 68, 68, 0.1)', text: '#EF4444', label: 'Dibatalkan' };
      default:
        return { bg: 'rgba(107, 114, 128, 0.1)', text: '#6B7280', label: status };
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      setPrinting(true);
      const html = generateInvoiceHTML(order);
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      console.error('Invoice generation error:', error);
      Alert.alert('Error', 'Gagal membuat invoice');
    } finally {
      setPrinting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const statusStyle = getStatusStyle(order.status);
  const dateStr = new Date(order.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <ChevronLeft size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Pesanan</Text>
        <TouchableOpacity onPress={handleDownloadInvoice} style={styles.headerBtn}>
          <Download size={22} color={printing ? COLORS.gray[300] : COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Order Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View>
              <Text style={styles.orderIdText}>#{order.invoiceNumber || order.orderNumber || order.id}</Text>
              <Text style={styles.dateText}>{dateStr}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>{statusStyle.label}</Text>
            </View>
          </View>
        </View>

        {/* Section: Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Package size={20} color={COLORS.primary} strokeWidth={2.5} />
            <Text style={styles.sectionTitle}>Produk</Text>
          </View>
          {order.items.map((item, index) => (
            <View key={index} style={styles.productItem}>
              <Image source={{ uri: item.productImage }} style={styles.productImage} />
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={styles.productName} numberOfLines={2}>{item.productName}</Text>
                <Text style={styles.productVariant}>{item.variantName || 'No Variant'} • {item.quantity}x</Text>
                <Text style={styles.productPrice}>Rp {item.price.toLocaleString('id-ID')}</Text>
              </View>
              <Text style={styles.productTotal}>Rp {item.total.toLocaleString('id-ID')}</Text>
            </View>
          ))}
        </View>

        {/* Section: Shipping Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color={COLORS.primary} strokeWidth={2.5} />
            <Text style={styles.sectionTitle}>Alamat Pengiriman</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoBold}>{order.address.name}</Text>
            <Text style={styles.infoText}>{order.address.phone}</Text>
            <Text style={styles.infoText}>
              {order.address.address}, {order.address.city}, {order.address.province} {order.address.postalCode}
            </Text>
          </View>
        </View>

        {/* Section: Payment & Shipping Method */}
        <View style={styles.rowSection}>
          <View style={[styles.section, { flex: 1, marginRight: 10 }]}>
            <View style={styles.sectionHeader}>
              <CreditCard size={18} color={COLORS.primary} strokeWidth={2.5} />
              <Text style={styles.sectionTitleSmall}>Pembayaran</Text>
            </View>
            <View style={styles.infoCardCompact}>
              <Text style={styles.infoTextCaps}>{order.paymentMethod}</Text>
              <Text style={[styles.paymentStatusText, { color: order.paymentStatus === 'paid' ? '#10B981' : '#F59E0B' }]}>
                {order.paymentStatus === 'paid' ? 'Lunas' : 'Menunggu'}
              </Text>
            </View>
          </View>
          <View style={[styles.section, { flex: 1 }]}>
            <View style={styles.sectionHeader}>
              <Truck size={18} color={COLORS.primary} strokeWidth={2.5} />
              <Text style={styles.sectionTitleSmall}>Pengiriman</Text>
            </View>
            <View style={styles.infoCardCompact}>
              <Text style={styles.infoTextCaps}>{order.shippingMethod}</Text>
              <Text style={styles.infoTextSmall}>{order.shippingEstimate || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Section: Cost Breakdown */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal Produk</Text>
            <Text style={styles.summaryValue}>Rp {order.subtotal.toLocaleString('id-ID')}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Ongkos Kirim</Text>
            <Text style={styles.summaryValue}>Rp {order.shippingCost.toLocaleString('id-ID')}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Belanja</Text>
            <Text style={styles.totalValue}>Rp {order.total.toLocaleString('id-ID')}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.invoiceBtn}
            onPress={handleDownloadInvoice}
            disabled={printing}
          >
            {printing ? (
                <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
                <>
                    <FileText size={20} color={COLORS.white} style={{ marginRight: 10 }} />
                    <Text style={styles.invoiceBtnText}>Download Invoice (PDF)</Text>
                </>
             )}
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  center: {
    flex: 1,
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
  statusCard: {
    backgroundColor: COLORS.gray[50],
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderIdText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 25,
  },
  rowSection: {
    flexDirection: 'row',
    marginBottom: 10,
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
  sectionTitleSmall: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
    color: COLORS.secondary,
  },
  productItem: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: COLORS.gray[50],
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  productVariant: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  productPrice: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginTop: 4,
  },
  productTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  infoCardCompact: {
    backgroundColor: COLORS.gray[50],
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  infoBold: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.gray[500],
    lineHeight: 20,
  },
  infoTextCaps: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  infoTextSmall: {
    fontSize: 11,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  summaryBox: {
    backgroundColor: COLORS.gray[50],
    borderRadius: 15,
    padding: 20,
    marginTop: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    color: COLORS.gray[500],
    fontSize: 14,
  },
  summaryValue: {
    color: COLORS.secondary,
    fontWeight: '600',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray[200],
    marginVertical: 12,
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
  actionContainer: {
    marginTop: 30,
    marginBottom: 20,
  },
  invoiceBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    height: 55,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  invoiceBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OrderDetailScreen;
