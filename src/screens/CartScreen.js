import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS } from '../theme/colors';
import { ChevronLeft, Minus, Plus, ShoppingCart } from 'lucide-react-native';
import { useCart } from '../context/CartContext';
import { fixImageUrl } from '../utils/imageHelper';

const CartScreen = ({ navigation }) => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image 
        source={{ uri: fixImageUrl(item.images?.[0]) || 'https://via.placeholder.com/100' }} 
        style={styles.image} 
      />

      <View style={{ flex: 1 }}>
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.price}>Rp {item.price?.toLocaleString('id-ID')}</Text>

        <View style={styles.qtyContainer}>
          <TouchableOpacity 
            style={styles.qtyButton}
            onPress={() => {
              if (item.quantity > 1) {
                updateQuantity(item.id, item.quantity - 1);
              } else {
                removeFromCart(item.id);
              }
            }}
          >
            <Minus size={18} color={COLORS.secondary} />
          </TouchableOpacity>

          <Text style={styles.qtyText}>{item.quantity}</Text>

          <TouchableOpacity 
            style={styles.qtyButton}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <Plus size={18} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <ChevronLeft size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Keranjang</Text>
        <View style={{ width: 40 }} />
      </View>

      {cartItems.length > 0 ? (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => (item.id || item._id).toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 120, paddingTop: 10 }}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.checkoutContainer}>
            <View>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalPrice}>Rp {cartTotal.toLocaleString('id-ID')}</Text>
            </View>

            <TouchableOpacity 
              style={styles.checkoutButton}
              onPress={() => navigation.navigate('Checkout')}
            >
              <Text style={styles.checkoutText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <ShoppingCart size={60} color="#cbd5e1" />
          <Text style={styles.emptyText}>Keranjang masih kosong</Text>
          <TouchableOpacity 
            style={styles.shopBtn}
            onPress={() => navigation.navigate('Main')}
          >
            <Text style={styles.shopBtnText}>Mulai Belanja</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Modern off-white background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.white,
  },
  headerBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  // Card Styles
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginRight: 14,
    backgroundColor: COLORS.gray ? COLORS.gray[50] : '#f1f5f9',
  },
  name: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 4,
  },
  price: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  // Quantity Styles
  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  qtyButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: {
    marginHorizontal: 12,
    fontWeight: "bold",
    fontSize: 15,
    color: COLORS.secondary,
  },
  // Sticky Footer Styles
  checkoutContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  totalLabel: {
    fontSize: 14,
    color: COLORS.gray ? COLORS.gray[500] : '#64748b',
    marginBottom: 2,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.secondary,
  },
  checkoutButton: {
    backgroundColor: "#2563eb", // Using the blue from request, or could use COLORS.primary
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 18,
  },
  checkoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: -50, // Visual balance
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.gray ? COLORS.gray[500] : '#94a3b8',
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 24,
  },
  shopBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  shopBtnText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  }
});

export default CartScreen;
