import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  Image,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS } from '../theme/colors';
import { ShoppingCart, Search, Menu, Bell } from 'lucide-react-native';
import { getProducts, getCategories } from '../api/productService';
import { fixImageUrl } from '../utils/imageHelper';
import { DEBUG_API } from '../config/api';

const HomeScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories()
      ]);
      setProducts(productsData.products || []);
      
      // ✅ Fix: API returns { categories: [...] }, but we were looking for categoryList
      if (DEBUG_API) console.log("Categories API (Home):", categoriesData);
      setCategories(categoriesData.categories || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Menu size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.logo}>Zenla <Text style={{color: COLORS.primary}}>Mart</Text></Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn}>
            <Bell size={24} color={COLORS.secondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconBtn}
            onPress={() => navigation.navigate('Cart')}
          >
            <ShoppingCart size={24} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color={COLORS.primary} />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Selamat Datang!</Text>
          <Text style={styles.subText}>Cari barang impianmu hari ini.</Text>
        </View>

        {/* Search Bar */}
        <TouchableOpacity 
          style={styles.searchBar}
          onPress={() => navigation.navigate('Cari')}
        >
          <Search size={20} color={COLORS.gray[500]} />
          <Text style={styles.searchText}>Cari produk...</Text>
        </TouchableOpacity>


        {/* Featured Card */}
        <View style={styles.featuredCard}>
          <View style={styles.featuredTextContent}>
            <Text style={styles.featuredTitle}>Flash Sale Akhir Pekan</Text>
            <Text style={styles.featuredSubtitle}>Diskon hingga 50% untuk produk pilihan.</Text>
            <TouchableOpacity style={styles.featuredBtn}>
              <Text style={styles.featuredBtnText}>Cek Sekarang</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories Section */}
        {categories.length > 0 && (
          <View style={styles.categorySection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Kategori</Text>
            </View>
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id?.toString() || item._id?.toString()}
              numColumns={2}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.categoryCard}
                  onPress={() =>
                    navigation.navigate("Products", {
                      category: item.slug,
                      categoryName: item.name
                    })
                  }
                >
                  {item.image ? (
                    <Image
                      source={{ uri: fixImageUrl(item.image) }}
                      style={{ width: 60, height: 60, marginBottom: 10 }}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={[styles.catPlaceholder, { marginBottom: 10 }]} />
                  )}
                  <Text style={styles.categoryText}>{item.name}</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.categoryList}
            />
          </View>
        )}

        {/* Products Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Produk Terbaru</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.productGrid}>
           {products.map((item, idx) => (
             <TouchableOpacity 
                key={item._id || item.id || `prod-${idx}`} 
                style={styles.productCard}
                onPress={() => navigation.navigate('ProductDetails', { id: item.id })}

              >
                <View style={styles.productImageContainer}>
                  {item.images && item.images.length > 0 ? (
                    <Image 
                      source={{ uri: fixImageUrl(item.images[0]) }} 
                      style={styles.productImg}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.productPlaceholder} />
                  )}
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.productPrice}>Rp {item.price?.toLocaleString('id-ID')}</Text>
                </View>
             </TouchableOpacity>
           ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  },
  logo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconBtn: {
    marginLeft: 15,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  subText: {
    fontSize: 14,
    color: COLORS.gray[500],
    marginTop: 5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    marginHorizontal: 20,
    marginTop: 20,
    padding: 12,
    borderRadius: 12,
  },
  searchText: {
    marginLeft: 10,
    color: COLORS.gray[500],
  },
  featuredCard: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    marginTop: 25,
    borderRadius: 20,
    padding: 20,
    minHeight: 150,
  },
  featuredTextContent: {
    flex: 1,
    justifyContent: 'center',
  },
  featuredTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  featuredSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 5,
  },
  featuredBtn: {
    backgroundColor: COLORS.white,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 15,
  },
  featuredBtnText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  seeAll: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  categorySection: {
    marginTop: 15,
  },
  categoryList: {
    paddingHorizontal: 10,
  },
  categoryCard: {
    flex: 1,
    margin: 10,
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 110,
  },
  catPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 30,
    marginBottom: 10,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.secondary,
    textAlign: 'center',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    marginTop: 15,
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 15,
    marginBottom: 15,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: COLORS.gray[100],
    borderRadius: 10,
    overflow: 'hidden',
  },
  productImg: {
    width: '100%',
    height: '100%',
  },
  productPlaceholder: {
    flex: 1,
    backgroundColor: COLORS.gray[200],
  },
  productInfo: {
    marginTop: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
    minHeight: 35,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 5,
  }
});

export default HomeScreen;
