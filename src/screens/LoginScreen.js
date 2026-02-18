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
import { Mail, Lock, ChevronLeft } from 'lucide-react-native';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const { showNotification } = useNotification();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      showNotification('Silakan isi email dan password.', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        showNotification('Berhasil login!', 'success');
        // Navigation is handled automatically by AuthContext
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Email atau password salah.';
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
        <View style={styles.content}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft size={24} color={COLORS.secondary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Selamat Datang Kembali</Text>
            <Text style={styles.subtitle}>Masuk untuk melanjutkan belanja Anda.</Text>
          </View>

          <View style={styles.form}>
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
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color={COLORS.gray[500]} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Lupa Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.loginBtn}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.loginBtnText}>Masuk</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Belum punya akun? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerText}>Daftar Sekarang</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 25,
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
    marginTop: 40,
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
    marginTop: 40,
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  forgotText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  loginBtn: {
    backgroundColor: COLORS.primary,
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginBtnText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  footerText: {
    color: COLORS.gray[500],
    fontSize: 14,
  },
  registerText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
  }
});

export default LoginScreen;
