import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  Image,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS } from '../theme/colors';
import { Search as SearchIcon, ChevronLeft } from 'lucide-react-native';
import { getProducts } from '../api/productService';
import { fixImageUrl } from '../utils/imageHelper';

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInitialProducts();
  }, []);

  const fetchInitialProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      const allProducts = data.products || [];
      setProducts(allProducts);
      setFilteredProducts(allProducts);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchQuery || searchQuery.trim() === "") {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter((item) =>
      item.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchWrapper}>
          <SearchIcon size={20} color={COLORS.gray[500]} />
          <TextInput
            style={styles.input}
            placeholder="Cari produk..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Batal</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : filteredProducts.length > 0 ? (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item, idx) => item._id || item.id || `search-${idx}`}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.resultItem}
              onPress={() => navigation.navigate('ProductDetails', { id: item.id })}
            >
              <Image source={{ uri: fixImageUrl(item.images[0]) }} style={styles.itemImg} />
              <View style={styles.itemText}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemPrice}>Rp {item.price.toLocaleString('id-ID')}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Produk tidak ditemukan</Text>
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
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    paddingHorizontal: 15,
    borderRadius: 12,
    marginRight: 15,
  },
  input: {
    flex: 1,
    height: 45,
    marginLeft: 10,
    fontSize: 16,
  },
  cancelText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  list: {
    padding: 15,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[50],
  },
  itemImg: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: COLORS.gray[50],
  },
  itemText: {
    flex: 1,
    marginLeft: 15,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  itemPrice: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 5,
  },
  emptyText: {
    color: COLORS.gray[400],
    fontSize: 16,
  },
  recentSearch: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: COLORS.secondary,
  },
  tag: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[50],
  },
  tagText: {
    fontSize: 14,
    color: COLORS.gray[500],
  }
});

export default SearchScreen;
