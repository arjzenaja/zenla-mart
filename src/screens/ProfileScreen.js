import React, { useCallback, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { COLORS } from '../theme/colors';
import { User, MapPin, LogOut, ChevronRight, Heart, ShoppingBag } from 'lucide-react-native';
import { getProfile } from '../api/userService';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      setUser(data.user || data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Optional: don't show alert on every focus if it fails silently
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
    }, [])
  );

  const handleLogout = async () => {
    Alert.alert(
      'Keluar Akun',
      'Apakah Anda yakin ingin keluar?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // Navigation is handled automatically by AuthContext
              // The app will redirect to Login screen
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Gagal keluar akun');
            }
          }
        }
      ]
    );
  };

  const menuItems = [
    { icon: MapPin, label: 'Alamat Pengiriman', route: 'Address' },
    { icon: User, label: 'Pengaturan Akun', route: 'EditProfile' },
    { icon: Heart, label: 'My List', route: 'Wishlist' },
    { icon: ShoppingBag, label: 'My Orders', route: 'Pesanan' },
  ];

  const handleMenuPress = (route) => {
    if (route === 'Pesanan') {
      // Navigate to the Pesanan tab in the Main navigator
      navigation.navigate('Main', { 
        screen: 'Home', 
        params: { screen: 'Pesanan' } 
      });
    } else {
      navigation.navigate(route);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
               <User size={40} color={COLORS.gray[400]} />
            </View>
          </View>
          
          {loading ? (
             <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 10 }} />
          ) : (
            <>
              <Text style={styles.userName}>{user?.name || 'Customer'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'customer@example.com'}</Text>
            </>
          )}
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={styles.menuItem}
              onPress={() => handleMenuPress(item.route)}
            >
              <View style={styles.menuLeft}>
                <View style={styles.menuIconWrapper}>
                  <item.icon size={20} color={COLORS.secondary} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <ChevronRight size={20} color={COLORS.gray[400]} />
            </TouchableOpacity>
          ))}

          <TouchableOpacity 
            style={[styles.menuItem, { marginTop: 20 }]}
            onPress={handleLogout}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconWrapper, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <LogOut size={20} color="#EF4444" />
              </View>
              <Text style={[styles.menuLabel, { color: '#EF4444' }]}>Keluar Akun</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.version}>Zenla Mart App Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: COLORS.white,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gray[100],
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.gray[500],
    marginTop: 4,
  },
  menuContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[50],
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  version: {
    fontSize: 12,
    color: COLORS.gray[400],
  }
});

export default ProfileScreen;
