import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';
import { ChevronLeft, MapPin, User, Phone, Home, Building2, Map } from 'lucide-react-native';
import { getAddressById, updateAddress } from '../api/addressService';

const EditAddressScreen = ({ navigation, route }) => {
  const { addressId } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
  });

  useEffect(() => {
    fetchAddress();
  }, []);

  const fetchAddress = async () => {
    try {
      setLoading(true);
      const response = await getAddressById(addressId);
      const addressData = response.address || response;
      setFormData({
        name: addressData.name || '',
        phone: addressData.phone || '',
        address: addressData.address || '',
        city: addressData.city || '',
        province: addressData.province || '',
        postalCode: addressData.postalCode || '',
      });
    } catch (error) {
      console.error('Error fetching address:', error);
      Alert.alert('Error', 'Gagal memuat data alamat');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Validasi', 'Nama penerima tidak boleh kosong');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Validasi', 'Nomor telepon tidak boleh kosong');
      return false;
    }
    if (!formData.address.trim()) {
      Alert.alert('Validasi', 'Alamat lengkap tidak boleh kosong');
      return false;
    }
    if (!formData.city.trim()) {
      Alert.alert('Validasi', 'Kota tidak boleh kosong');
      return false;
    }
    if (!formData.province.trim()) {
      Alert.alert('Validasi', 'Provinsi tidak boleh kosong');
      return false;
    }
    if (!formData.postalCode.trim()) {
      Alert.alert('Validasi', 'Kode pos tidak boleh kosong');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      await updateAddress(addressId, formData);
      Alert.alert('Sukses', 'Alamat berhasil diperbarui', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error updating address:', error);
      Alert.alert('Error', error.response?.data?.message || 'Gagal memperbarui alamat');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Alamat</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nama Penerima <Text style={styles.required}>*</Text></Text>
            <View style={styles.inputContainer}>
              <User size={20} color={COLORS.gray[400]} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => handleChange('name', text)}
                placeholder="Masukkan nama penerima"
                placeholderTextColor={COLORS.gray[400]}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nomor Telepon <Text style={styles.required}>*</Text></Text>
            <View style={styles.inputContainer}>
              <Phone size={20} color={COLORS.gray[400]} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => handleChange('phone', text)}
                placeholder="Masukkan nomor telepon"
                keyboardType="phone-pad"
                placeholderTextColor={COLORS.gray[400]}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Alamat Lengkap <Text style={styles.required}>*</Text></Text>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <Home size={20} color={COLORS.gray[400]} style={[styles.inputIcon, { alignSelf: 'flex-start', marginTop: 12 }]} />
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.address}
                onChangeText={(text) => handleChange('address', text)}
                placeholder="Masukkan alamat lengkap (Jalan, RT/RW, Kelurahan, Kecamatan)"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor={COLORS.gray[400]}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Kota <Text style={styles.required}>*</Text></Text>
            <View style={styles.inputContainer}>
              <Building2 size={20} color={COLORS.gray[400]} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.city}
                onChangeText={(text) => handleChange('city', text)}
                placeholder="Contoh: Jakarta"
                placeholderTextColor={COLORS.gray[400]}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Provinsi <Text style={styles.required}>*</Text></Text>
            <View style={styles.inputContainer}>
              <Map size={20} color={COLORS.gray[400]} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.province}
                onChangeText={(text) => handleChange('province', text)}
                placeholder="Contoh: DKI Jakarta"
                placeholderTextColor={COLORS.gray[400]}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Kode Pos <Text style={styles.required}>*</Text></Text>
            <View style={styles.inputContainer}>
              <MapPin size={20} color={COLORS.gray[400]} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.postalCode}
                onChangeText={(text) => handleChange('postalCode', text)}
                placeholder="Contoh: 12345"
                keyboardType="number-pad"
                placeholderTextColor={COLORS.gray[400]}
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.disabledButton]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
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
  content: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: 8,
  },
  required: {
    color: COLORS.error || '#EF4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderRadius: 12,
    paddingHorizontal: 15,
    minHeight: 50,
    backgroundColor: COLORS.white,
  },
  textAreaContainer: {
    minHeight: 100,
    alignItems: 'flex-start',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.secondary,
    paddingVertical: 12,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: COLORS.gray[400],
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditAddressScreen;
