import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS } from '../theme/colors';
import { register } from '../api/authService';
import { Mail, Lock, User, Phone, ChevronLeft } from 'lucide-react-native';
import { useNotification } from '../context/NotificationContext';

const RegisterScreen = ({ navigation }) => {
  const { showNotification } = useNotification();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) {
      showNotification('Silakan lengkapi semua data.', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await register({ name, email, phone, password });
      if (result.success) {
        showNotification('Registrasi berhasil! Silakan login.', 'success');
        navigation.navigate('Login');
      } else {
        showNotification(result.message || 'Gagal mendaftar.', 'error');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Terjadi kesalahan saat registrasi.';
      showNotification(errorMsg, 'error');
    } finally {

      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft size={24} color={COLORS.secondary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Daftar Akun Baru</Text>
            <Text style={styles.subtitle}>Mulai belanja dengan mudah dan cepat.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nama Lengkap</Text>
              <View style={styles.inputWrapper}>
                <User size={20} color={COLORS.gray[500]} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan nama"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <Mail size={20} color={COLORS.gray[500]} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nomor Telepon</Text>
              <View style={styles.inputWrapper}>
                <Phone size={20} color={COLORS.gray[500]} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan nomor HP"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color={COLORS.gray[500]} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Buat password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity 
              style={styles.registerBtn}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.registerBtnText}>Daftar</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Sudah punya akun? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginText}>Masuk</Text>
            </TouchableOpacity>
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
  scrollContent: {
    paddingHorizontal: 25,
    paddingBottom: 40,
  },
  backBtn: {
    marginTop: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginTop: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray[500],
    marginTop: 10,
  },
  form: {
    marginTop: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: COLORS.secondary,
  },
  registerBtn: {
    backgroundColor: COLORS.primary,
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  registerBtnText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  footerText: {
    color: COLORS.gray[500],
    fontSize: 14,
  },
  loginText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
  }
});

export default RegisterScreen;
