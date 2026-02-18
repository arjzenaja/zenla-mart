import React, { useState } from 'react';
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
  Platform,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';
import { ChevronLeft, MapPin, User, Phone, Home, Building2, Map, FileText, CheckCircle2 } from 'lucide-react-native';
import { createAddress } from '../api/addressService';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const AddAddressScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    province: '',
    city: '',
    district: '',
    postalCode: '',
    note: '',
    isDefault: true,
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      Alert.alert('Validasi', 'Nama lengkap tidak boleh kosong');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Validasi', 'Nomor telepon tidak boleh kosong');
      return false;
    }
    if (!/^\d+$/.test(formData.phone)) {
      Alert.alert('Validasi', 'Nomor telepon hanya boleh berisi angka');
      return false;
    }
    if (!formData.address.trim()) {
      Alert.alert('Validasi', 'Alamat lengkap tidak boleh kosong');
      return false;
    }
    if (!formData.province.trim()) {
      Alert.alert('Validasi', 'Provinsi tidak boleh kosong');
      return false;
    }
    if (!formData.city.trim()) {
      Alert.alert('Validasi', 'Kota tidak boleh kosong');
      return false;
    }
    if (!formData.district.trim()) {
      Alert.alert('Validasi', 'Kecamatan tidak boleh kosong');
      return false;
    }
    if (!formData.postalCode.trim()) {
      Alert.alert('Validasi', 'Kode pos tidak boleh kosong');
      return false;
    }
    if (!/^\d+$/.test(formData.postalCode)) {
      Alert.alert('Validasi', 'Kode pos hanya boleh berisi angka');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const payload = {
        ...formData,
        userId: user?.id || user?._id,
      };

      await createAddress(payload);
      showNotification('Alamat berhasil ditambahkan', 'success');
      navigation.goBack();
    } catch (error) {
      console.error('Error creating address:', error);
      Alert.alert('Error', error.response?.data?.message || 'Gagal menambahkan alamat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tambah Alamat</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nama Penerima <Text style={styles.required}>*</Text></Text>
            <View style={styles.inputContainer}>
              <User size={20} color={COLORS.gray[400]} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.fullName}
                onChangeText={(text) => handleChange('fullName', text)}
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
            <Text style={styles.label}>Kecamatan <Text style={styles.required}>*</Text></Text>
            <View style={styles.inputContainer}>
              <MapPin size={20} color={COLORS.gray[400]} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.district}
                onChangeText={(text) => handleChange('district', text)}
                placeholder="Contoh: Kebayoran Baru"
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
                placeholder="Masukkan alamat lengkap (Jalan, No Rumah, RT/RW)"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
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

          <View style={styles.formGroup}>
            <Text style={styles.label}>Catatan (Opsional)</Text>
            <View style={styles.inputContainer}>
              <FileText size={20} color={COLORS.gray[400]} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.note}
                onChangeText={(text) => handleChange('note', text)}
                placeholder="Contoh: Rumah warna biru"
                placeholderTextColor={COLORS.gray[400]}
              />
            </View>
          </View>

          <View style={styles.defaultContainer}>
            <View style={{ flex: 1 }}>
              <Text style={styles.defaultTitle}>Jadikan Alamat Utama</Text>
              <Text style={styles.defaultSubtitle}>Alamat ini akan otomatis terpilih saat checkout</Text>
            </View>
            <Switch
              trackColor={{ false: COLORS.gray[200], true: COLORS.primary + '50' }}
              thumbColor={formData.isDefault ? COLORS.primary : COLORS.gray[300]}
              onValueChange={(value) => handleChange('isDefault', value)}
              value={formData.isDefault}
            />
          </View>

          <TouchableOpacity 
            style={[styles.saveButton, loading && styles.disabledButton]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.saveButtonText}>Simpan Alamat</Text>
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
  defaultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  defaultTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 2,
  },
  defaultSubtitle: {
    fontSize: 12,
    color: COLORS.gray[500],
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
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

export default AddAddressScreen;
