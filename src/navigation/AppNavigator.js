import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

// Navigators
import DrawerNavigator from './DrawerNavigator';

// Screens
import ProductDetailScreen from '../screens/ProductDetailScreen';
import ProductsScreen from '../screens/ProductsScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import SuccessScreen from '../screens/SuccessScreen';
import AddressScreen from '../screens/AddressScreen';
import PaymentScreen from '../screens/PaymentScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import WishlistScreen from '../screens/WishlistScreen';
import AddAddressScreen from '../screens/AddAddressScreen';
import EditAddressScreen from '../screens/EditAddressScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';

const Stack = createStackNavigator();

// Loading screen component
const LoadingScreen = () => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
};

const AppNavigator = () => {
  const { isLoggedIn, loading } = useAuth();

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={isLoggedIn ? "Main" : "Login"}
    >
      {isLoggedIn ? (
        // Authenticated routes
        <>
          <Stack.Screen name="Main" component={DrawerNavigator} />
          <Stack.Screen name="ProductDetails" component={ProductDetailScreen} />
          <Stack.Screen name="Products" component={ProductsScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="Success" component={SuccessScreen} />
          <Stack.Screen name="Address" component={AddressScreen} />
          <Stack.Screen name="AddAddress" component={AddAddressScreen} />
          <Stack.Screen name="EditAddress" component={EditAddressScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="Wishlist" component={WishlistScreen} />
          <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
        </>
      ) : (
        // Unauthenticated routes
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
});

export default AppNavigator;
