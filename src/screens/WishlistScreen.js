import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../theme/colors';
import { ChevronLeft, Heart, Trash2, ShoppingCart } from 'lucide-react-native';
import { getWishlist, removeFromWishlist } from '../api/wishlistService';
import { addToCart } from '../api/cartService'; // Assuming you have this, or use existing logic

// Helper to format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

const WishlistScreen = ({ navigation }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await getWishlist();
      const items = response.wishlist?.items || response.items || [];
      setWishlist(items);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      // Fail silently or show toast
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchWishlist();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWishlist();
    setRefreshing(false);
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId);
      fetchWishlist(); // Refresh list
    } catch (error) {
       Alert.alert('Error', 'Gagal menghapus dari wishlist');
    }
  };

  const renderItem = ({ item }) => {
    const product = item.product || item; // Handle structure
    return (
      <View style={styles.card}>
        <Image 
          source={{ uri: product.images?.[0] || 'https://via.placeholder.com/150' }} 
          style={styles.image} 
          resizeMode="cover"
        />
        <View style={styles.cardContent}>
          <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
          <Text style={styles.price}>{formatCurrency(product.price)}</Text>
          
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={() => navigation.navigate('ProductDetails', { id: product.id || product._id })}
            >
              <ShoppingCart size={18} color={COLORS.primary} />
              <Text style={[styles.actionText, { color: COLORS.primary }]}>Beli</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionBtn, styles.deleteBtn]}
              onPress={() => handleRemove(product.id || product._id)}
            >
              <Trash2 size={18} color={COLORS.error || '#EF4444'} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wishlist</Text>
      </View>

      <FlatList
        data={wishlist}
        keyExtractor={(item) => (item.product?.id || item.product?._id || item.id || item._id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Heart size={50} color={COLORS.gray[300]} />
              <Text style={styles.emptyText}>Wishlist Anda kosong</Text>
              <Text style={styles.emptySubText}>Simpan produk favorit Anda di sini</Text>
            </View>
          )
        }
      />
      {loading && !refreshing && (
         <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary} />
         </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  list: {
    padding: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    overflow: 'hidden',
    height: 120,
  },
  image: {
    width: 100,
    height: '100%',
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: 'rgba(217, 111, 50, 0.1)',
    borderRadius: 8,
    gap: 5,
  },
  deleteBtn: {
    flex: 0,
    width: 40,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  actionText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubText: {
      fontSize: 14,
      color: COLORS.gray[500],
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default WishlistScreen;
