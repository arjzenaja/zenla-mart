import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS } from '../theme/colors';
import { Package, Clock, ChevronRight, ShoppingBag } from 'lucide-react-native';
import { getUserOrders } from '../api/orderService';

const OrderScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getUserOrders();
      // Adjust based on API structure (common: { success: true, orders: [...] } or just [...])
      const orderList = response.orders || response || [];
      setOrders(orderList);
    } catch (error) {
      console.error('Fetch orders error:', error);
      Alert.alert('Error', 'Gagal mengambil riwayat pesanan');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await getUserOrders();
      const orderList = response.orders || response || [];
      setOrders(orderList);
    } catch (error) {
      console.error('Refresh orders error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return { bg: 'rgba(245, 158, 11, 0.1)', text: '#F59E0B', label: 'Menunggu Pembayaran' }; // Orange
      case 'processing':
        return { bg: 'rgba(59, 130, 246, 0.1)', text: '#3B82F6', label: 'Diproses' }; // Blue
      case 'shipped':
        return { bg: 'rgba(139, 92, 246, 0.1)', text: '#8B5CF6', label: 'Dikirim' }; // Purple
      case 'completed':
      case 'delivered':
      case 'selesai':
        return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10B981', label: 'Selesai' }; // Green
      case 'cancelled':
      case 'dibatalkan':
        return { bg: 'rgba(239, 68, 68, 0.1)', text: '#EF4444', label: 'Dibatalkan' }; // Red
      default:
        return { bg: 'rgba(107, 114, 128, 0.1)', text: '#6B7280', label: status }; // Gray
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconBox}>
        <ShoppingBag size={50} color={COLORS.gray[300]} />
      </View>
      <Text style={styles.emptyTitle}>Belum ada pesanan</Text>
      <Text style={styles.emptySubtitle}>Ayo mulai belanja dan buat pesanan pertamamu!</Text>
      <TouchableOpacity 
        style={styles.shopBtn}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.shopBtnText}>Belanja Sekarang</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pesanan Saya</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id || item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        renderItem={({ item }) => {
          const statusStyle = getStatusStyle(item.status);
          const date = item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }) : 'No date';

          return (
            <TouchableOpacity 
              style={styles.orderCard}
              onPress={() => navigation.navigate('OrderDetail', { orderId: item.id || item._id })}
            >
              <View style={styles.orderTop}>
                <View style={styles.orderHeader}>
                  <Package size={20} color={COLORS.primary} />
                  <Text style={styles.orderId}>#{item.invoiceNumber || item.id?.substring(0, 8).toUpperCase() || 'ORDER'}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                  <Text style={[styles.statusText, { color: statusStyle.text }]}>
                    {statusStyle.label}
                  </Text>
                </View>
              </View>

              <View style={styles.orderBody}>
                 <View style={styles.orderInfo}>
                    <Text style={styles.label}>Tanggal Pesanan</Text>
                    <Text style={styles.value}>{date}</Text>
                 </View>
                 <View style={styles.orderInfo}>
                    <Text style={styles.label}>Total ({item.items?.length || 0} Produk)</Text>
                    <Text style={styles.value}>Rp {item.total?.toLocaleString('id-ID') || 0}</Text>
                 </View>
              </View>

              <View style={styles.orderFooter}>
                <Text style={styles.trackText}>Lihat Detail</Text>
                <ChevronRight size={16} color={COLORS.primary} />
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  list: {
    padding: 20,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderId: {
    marginLeft: 10,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[50],
  },
  orderInfo: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: COLORS.gray[500],
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
    marginTop: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 15,
  },
  trackText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 5,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIconBox: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.gray[50],
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.gray[500],
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 30,
    lineHeight: 20,
  },
  shopBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
  },
  shopBtnText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default OrderScreen;
