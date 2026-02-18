import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ChevronLeft, ShoppingCart } from 'lucide-react-native';

import { COLORS } from '../theme/colors';
import { getProducts } from '../api/productService';
import { fixImageUrl } from '../utils/imageHelper';

const ProductsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { category, categoryName } = route.params || {};
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // If category is provided, use it to filter
      const params = category ? { category } : {};
      const data = await getProducts(params);
      setProducts(data.products || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderProductItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetails', { id: item.id || item._id })}
    >
      <View style={styles.imageContainer}>
        {item.images && item.images.length > 0 ? (
          <Image 
            source={{ uri: fixImageUrl(item.images[0]) }} 
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage} />
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productPrice}>Rp {item.price?.toLocaleString('id-ID')}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {categoryName || category || 'Semua Produk'}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
           <ShoppingCart size={24} color={COLORS.secondary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : products.length > 0 ? (
        <FlatList
          data={products}
          keyExtractor={(item, index) => item.id?.toString() || item._id?.toString() || index.toString()}
          renderItem={renderProductItem}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Tidak ada produk ditemukan.</Text>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
    textTransform: 'capitalize',
  },
  backButton: {
    padding: 5,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 15,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 15,
    padding: 10,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  imageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: COLORS.gray[50], // fallback color
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.gray[200],
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: 5,
    minHeight: 40,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray[500],
  }
});

export default ProductsScreen;
