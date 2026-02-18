import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';
import { ChevronLeft, User, Phone, Mail, Save } from 'lucide-react-native';
import { getProfile, updateProfile } from '../api/userService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EditProfileScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const user = await getProfile();
      // Handle response structure (sometimes { user: {...}, ... } or just {...})
      const userData = user.user || user;
      
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Gagal memuat data profil');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Validasi', 'Nama tidak boleh kosong');
      return;
    }

    try {
      setSaving(true);
      const updatedUser = await updateProfile({
        name: formData.name,
        phone: formData.phone
      });
      
      // Update local storage if needed
      const userData = updatedUser.user || updatedUser;
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      Alert.alert('Sukses', 'Profil berhasil diperbarui', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Gagal memperbarui profil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
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
        <Text style={styles.headerTitle}>Edit Profil</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          disabled={saving}
          style={styles.saveButton}
        >
          {saving ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Text style={styles.saveText}>Simpan</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nama Lengkap</Text>
            <View style={styles.inputContainer}>
              <User size={20} color={COLORS.gray[400]} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => handleChange('name', text)}
                placeholder="Masukkan nama lengkap"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.inputContainer, styles.disabledInput]}>
              <Mail size={20} color={COLORS.gray[400]} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: COLORS.gray[500] }]}
                value={formData.email}
                editable={false}
              />
            </View>
            <Text style={styles.helperText}>Email tidak dapat diubah</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nomor Telepon</Text>
            <View style={styles.inputContainer}>
              <Phone size={20} color={COLORS.gray[400]} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => handleChange('phone', text)}
                placeholder="Masukkan nomor telepon"
                keyboardType="phone-pad"
              />
            </View>
          </View>
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
  saveButton: {
    padding: 5,
  },
  saveText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  content: {
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    backgroundColor: COLORS.white,
  },
  disabledInput: {
    backgroundColor: COLORS.gray[50],
    borderColor: COLORS.gray[100],
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.secondary,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.gray[400],
    marginTop: 5,
    marginLeft: 5,
  },
});

export default EditProfileScreen;
