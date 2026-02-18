import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  RefreshControl,
  SafeAreaView
} from 'react-native';
import { COLORS } from '../theme/colors';
import { ChevronLeft, Plus, MapPin, Edit2, Trash2, CheckCircle } from 'lucide-react-native';
import { getAddresses, deleteAddress, setDefaultAddress } from '../api/addressService';

const AddressScreen = ({ navigation }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await getAddresses();
      const addressList = response.addresses || response || [];
      setAddresses(addressList);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      Alert.alert('Error', 'Gagal memuat alamat');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAddresses();
    setRefreshing(false);
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Hapus Alamat',
      'Apakah Anda yakin ingin menghapus alamat ini?',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Hapus', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAddress(id);
              fetchAddresses(); // Refresh list
            } catch (error) {
              Alert.alert('Error', 'Gagal menghapus alamat');
            }
          }
        }
      ]
    );
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultAddress(id);
      fetchAddresses(); // Refresh list to update UI
    } catch (error) {
      Alert.alert('Error', 'Gagal mengatur alamat utama');
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.addressCard, item.isDefault && styles.defaultCard]}>
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.addressName}>{item.name}</Text>
          {item.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Utama</Text>
            </View>
          )}
        </View>
        {!item.isDefault && (
          <TouchableOpacity onPress={() => handleSetDefault(item.id)}>
            <Text style={styles.setDefaultLink}>Jadikan Utama</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={styles.phone}>{item.phone}</Text>
      <Text style={styles.addressText}>
        {item.address}, {item.city}, {item.province} {item.postalCode}
      </Text>

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => navigation.navigate('EditAddress', { addressId: item.id })} 
        >
          <Edit2 size={16} color={COLORS.gray[600]} />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => handleDelete(item.id)}
        >
          <Trash2 size={16} color={COLORS.error || '#EF4444'} />
          <Text style={[styles.actionText, { color: COLORS.error || '#EF4444' }]}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daftar Alamat</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddAddress')}
        >
          <Plus size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <MapPin size={50} color={COLORS.gray[300]} />
              <Text style={styles.emptyText}>Belum ada alamat tersimpan</Text>
            </View>
          )
        }
      />
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  addButton: {
    padding: 5,
  },
  list: {
    padding: 20,
  },
  addressCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  defaultCard: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(217, 111, 50, 0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginRight: 10,
  },
  defaultBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  setDefaultLink: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  phone: {
    fontSize: 14,
    color: COLORS.gray[600],
    marginBottom: 5,
  },
  addressText: {
    fontSize: 14,
    color: COLORS.gray[600],
    lineHeight: 20,
    marginBottom: 15,
  },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    paddingTop: 10,
    justifyContent: 'flex-end',
    gap: 15,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.gray[600],
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  emptyText: {
    marginTop: 10,
    color: COLORS.gray[500],
    fontSize: 16,
  },
});

export default AddressScreen;
