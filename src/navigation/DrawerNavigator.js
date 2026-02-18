import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { COLORS } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Screens
import CategoryScreen from '../screens/CategoryScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TabNavigator from './TabNavigator';

const Drawer = createDrawerNavigator();

function DrawerItem({ label, onPress }) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <Text style={styles.itemText}>{label}</Text>
    </TouchableOpacity>
  );
}

const CustomDrawerContent = (props) => {
  const { navigation } = props;
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingTop: 0 }}
      >
        <SafeAreaView edges={['top']}>
          {/* HEADER USER */}
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <View>
              <Text style={styles.name}>{user?.name || 'User'}</Text>
              <Text style={styles.email}>{user?.email || 'user@example.com'}</Text>
            </View>
          </View>
        </SafeAreaView>

        {/* MENU ITEMS */}
        <View style={styles.menu}>
          <DrawerItem label="Beranda" onPress={() => navigation.navigate("Home")} />
          <DrawerItem label="Kategori" onPress={() => navigation.navigate("Kategori")} />
          <DrawerItem label="Keranjang" onPress={() => navigation.navigate("Keranjang")} />
          <DrawerItem label="Akun" onPress={() => navigation.navigate("Akun")} />
        </View>
      </DrawerContentScrollView>

      {/* LOGOUT FIXED BOTTOM */}
      <TouchableOpacity style={styles.logout} onPress={handleLogout}>
        <Text style={styles.logoutText}>Keluar</Text>
      </TouchableOpacity>
    </View>
  );
};

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: 280,
        },
        drawerActiveBackgroundColor: "#F5E6DA",
        drawerActiveTintColor: "#E67E22",
      }}
    >
      <Drawer.Screen name="Home" component={TabNavigator} />
      <Drawer.Screen name="Kategori" component={CategoryScreen} />
      <Drawer.Screen name="Keranjang" component={CartScreen} />
      <Drawer.Screen name="Akun" component={ProfileScreen} />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E67E22",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  email: {
    fontSize: 13,
    color: "#777",
    marginTop: 3,
  },
  menu: {
    paddingTop: 15,
  },
  item: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  itemText: {
    fontSize: 15,
    fontWeight: "500",
  },
  logout: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    padding: 20,
    marginBottom: 20, // Add some margin for safe area at bottom if needed
  },
  logoutText: {
    color: "red",
    fontWeight: "600",
  },
});

export default DrawerNavigator;
