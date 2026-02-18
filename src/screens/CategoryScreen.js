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
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, ShoppingCart, Menu } from 'lucide-react-native';

import { COLORS } from '../theme/colors';
import { getCategories } from '../api/productService';
import { fixImageUrl } from '../utils/imageHelper';

const CategoryScreen = () => {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      
      // ✅ Fix: API returns { categories: [...] }, but we were looking for categoryList
      console.log("Categories API (Screen):", data);
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.categoryCard}
      onPress={() => navigation.navigate('Products', { 
        category: item.slug,
        categoryName: item.name 
      })}
    >
      <View style={styles.imageContainer}>
        {item.image ? (
          <Image 
            source={{ uri: fixImageUrl(item.image) }} 
            style={styles.categoryImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.placeholderImage} />
        )}
      </View>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName} numberOfLines={2}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
          <Menu size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kategori</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
           <ShoppingCart size={24} color={COLORS.secondary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : categories.length > 0 ? (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id?.toString() || item._id?.toString()}
          renderItem={renderCategoryItem}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Tidak ada kategori ditemukan.</Text>
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
  },
  menuButton: {
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
  categoryCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    alignItems: 'center',
  },
  imageContainer: {
    width: 80,
    height: 80,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.gray[100],
    borderRadius: 40,
  },
  categoryInfo: {
    width: '100%',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray[500],
  }
});

export default CategoryScreen;
