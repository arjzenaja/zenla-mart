import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  Dimensions,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS } from '../theme/colors';
import { ChevronLeft, ShoppingCart, Heart, Share2, Star } from 'lucide-react-native';
import { getProductById } from '../api/productService';
import { useCart } from '../context/CartContext';
import { fixImageUrl } from '../utils/imageHelper';

const { width } = Dimensions.get('window');

import { useNotification } from '../context/NotificationContext';

const ProductDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const { addToCart, cartItems } = useCart();
  const { showNotification } = useNotification();
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Debug log
  useEffect(() => {
    console.log("Selected:", selectedVariant);
  }, [selectedVariant]);

  // Auto-select single variant
  useEffect(() => {
    if (product?.variants?.length === 1) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  const getStock = () => {
    if (product?.variants?.length > 0) {
      return selectedVariant?.stock ?? 0;
    }
    return product?.stock ?? 0;
  };

  const isOutOfStock = getStock() <= 0;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data.product);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedVariant && product?.variants?.length > 0) {
      Alert.alert("Silakan pilih varian terlebih dahulu");
      return;
    }

    if (isOutOfStock) {
      Alert.alert("Stok Habis", "Maaf, stok produk ini sedang habis.");
      return;
    }

    if (product) {
      const itemToAdd = {
        ...product,
        selectedVariant: selectedVariant || null,
        price: selectedVariant ? selectedVariant.price : product.price
      };
      addToCart(itemToAdd);
      showNotification('Produk berhasil ditambahkan ke keranjang!', 'success');
    }
  };

  const handleBuyNow = () => {
    if (!selectedVariant && product?.variants?.length > 0) {
        Alert.alert("Silakan pilih varian terlebih dahulu");
        return;
    }

    if (isOutOfStock) {
        Alert.alert("Stok Habis", "Maaf, stok produk ini sedang habis.");
        return;
    }

    if (product) {
      const itemToAdd = {
        ...product,
        selectedVariant: selectedVariant || null,
        price: selectedVariant ? selectedVariant.price : product.price
      };
      addToCart(itemToAdd);
      navigation.navigate('Cart');
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.loaderContainer}>
        <Text>Produk tidak ditemukan.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <ChevronLeft size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn}>
            <Share2 size={20} color={COLORS.secondary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerBtn, { marginLeft: 15 }]}>
            <Heart size={20} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          {product.images && product.images.length > 0 ? (
            <Image 
              source={{ uri: fixImageUrl(product.images[activeImage]) }} 
              style={styles.mainImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.imagePlaceholder} />
          )}
          
          {product.images && product.images.length > 1 && (
            <View style={styles.thumbnailContainer}>
              {product.images.map((img, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  onPress={() => setActiveImage(idx)}
                  style={[
                    styles.thumbnail,
                    activeImage === idx && { borderColor: COLORS.primary, borderWidth: 2 }
                  ]}
                >
                  <Image source={{ uri: fixImageUrl(img) }} style={styles.thumbnailImg} resizeMode="cover" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.infoContent}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              Rp {(selectedVariant ? selectedVariant.price : product.price)?.toLocaleString('id-ID')}
            </Text>
            <View style={styles.ratingBox}>
              <Star size={16} color="#FFD700" fill="#FFD700" />
              <Text style={styles.ratingText}>{product.rating || '4.5'}</Text>
            </View>
          </View>
          
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={[styles.stockStatus, isOutOfStock && { color: COLORS.error || 'red' }]}>
            Stok: {isOutOfStock ? 'Habis' : `${getStock()} tersedia`}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Deskripsi</Text>
          <Text style={styles.description}>
            {product.description || 'Tidak ada deskripsi untuk produk ini.'}
          </Text>

          {/* Variants could go here if implemented in backend */}
          {product.variants && product.variants.length > 0 && (
             <View style={{ marginTop: 20 }}>
                <Text style={styles.sectionTitle}>Pilih Varian</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                   {product.variants.map((variant) => (
                     <TouchableOpacity 
                       key={variant.id} 
                       style={[
                         styles.variantButton,
                         selectedVariant?.id === variant.id && styles.variantSelected,
                       ]}
                       onPress={() => setSelectedVariant(variant)}
                     >
                        <Text style={
                          selectedVariant?.id === variant.id
                            ? styles.variantTextSelected
                            : styles.variantText
                        }>
                          {variant.name}
                        </Text>
                     </TouchableOpacity>
                   ))}
                </ScrollView>
             </View>
          )}

          <View style={styles.divider} />

          {/* Reviews Section */}
          <Text style={styles.sectionTitle}>Ulasan ({product.reviews ? product.reviews.length : 0})</Text>
          
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((review, index) => (
              <View key={review.id || index} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>{review.name || review.userName || 'User'}</Text>
                  <View style={styles.reviewRating}>
                    <Star size={12} color="#FFD700" fill="#FFD700" />
                    <Text style={styles.reviewRatingText}>{review.rating}</Text>
                  </View>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
                <Text style={styles.reviewDate}>
                  {review.createdAt ? new Date(review.createdAt).toLocaleDateString('id-ID') : ''}
                </Text>
              </View>
            ))
          ) : (
             <Text style={styles.noReviewsText}>Belum ada ulasan untuk produk ini.</Text>
          )}
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.cartIconWrapper} onPress={() => navigation.navigate('Cart')}>
          <ShoppingCart size={24} color={COLORS.secondary} />
          {cartItems.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartItems.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.buyNowBtn, isOutOfStock && styles.disabledBtn]} 
          onPress={handleBuyNow}
          disabled={isOutOfStock}
        >
          <Text style={styles.buyNowText}>{isOutOfStock ? 'Stok Habis' : 'Beli Sekarang'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.addCartBtn, isOutOfStock && styles.disabledBtn]} 
          onPress={handleAddToCart}
          disabled={isOutOfStock}
        >
          <Text style={styles.addCartText}>+ Keranjang</Text>
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  headerActions: {
    flexDirection: 'row',
  },
  imageContainer: {
    width: width,
    height: width,
    backgroundColor: COLORS.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  mainImage: {
    width: '90%',
    height: '90%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.gray[200],
  },
  thumbnailContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    marginRight: 10,
    overflow: 'hidden',
    elevation: 1,
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
  },
  infoContent: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  ratingText: {
    marginLeft: 5,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginTop: 15,
  },
  stockStatus: {
    fontSize: 14,
    color: COLORS.gray[500],
    marginTop: 5,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray[100],
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.gray[500],
    marginTop: 10,
  },
  variantButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    marginRight: 10,
    marginBottom: 10,
  },
  variantSelected: {
    backgroundColor: "#2563eb",
    borderWidth: 2,
    borderColor: "#1d4ed8",
  },
  variantText: {
    fontSize: 14,
    color: COLORS.secondary,
  },
  variantTextSelected: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  reviewItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  reviewerName: {
    fontWeight: 'bold',
    fontSize: 14,
    color: COLORS.secondary,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewRatingText: {
    marginLeft: 4,
    fontSize: 12,
    color: COLORS.gray[600],
  },
  reviewComment: {
    fontSize: 14,
    color: COLORS.gray[600],
    lineHeight: 20,
  },
  reviewDate: {
    fontSize: 12,
    color: COLORS.gray[400],
    marginTop: 5,
  },
  noReviewsText: {
    fontSize: 14,
    color: COLORS.gray[500],
    fontStyle: 'italic',
    marginTop: 10,
  },
  disabledBtn: {
    backgroundColor: COLORS.gray[300],
    opacity: 0.7,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  cartIconWrapper: {
    marginRight: 20,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.error || '#EF4444',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  addCartBtn: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  addCartText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  buyNowBtn: {
     flex: 1,
     backgroundColor: COLORS.primary,
     paddingVertical: 15,
     borderRadius: 12,
     alignItems: 'center',
     marginRight: 10,
  },
  buyNowText: {
     color: COLORS.white,
     fontWeight: 'bold',
     fontSize: 16,
  }
});

export default ProductDetailScreen;
