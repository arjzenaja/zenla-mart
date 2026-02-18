import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS } from '../theme/colors';
import { CheckCircle } from 'lucide-react-native';

const SuccessScreen = ({ navigation, route }) => {
  const { orderId } = route.params || {};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <CheckCircle size={100} color={COLORS.primary} strokeWidth={1.5} />
        <Text style={styles.title}>Pesanan Berhasil!</Text>
        <Text style={styles.subtitle}>
          Terima kasih telah berbelanja di Zenla Mart. Pesanan Anda sedang kami proses.
        </Text>
        
        {orderId && (
          <View style={styles.orderIdContainer}>
             <Text style={styles.orderIdLabel}>Order ID:</Text>
             <Text style={styles.orderIdValue}>{orderId}</Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.homeBtn}
          onPress={() => navigation.replace('Main')}
        >
          <Text style={styles.homeBtnText}>Kembali ke Beranda</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.orderBtn}
          onPress={() => navigation.navigate('Main', { screen: 'Home', params: { screen: 'Pesanan' } })}
        >
          <Text style={styles.orderBtnText}>Lihat Pesanan Saya</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginTop: 30,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray[500],
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 24,
  },
  orderIdContainer: {
    marginTop: 20,
    alignItems: 'center',
    padding: 10,
    backgroundColor: COLORS.gray[50],
    borderRadius: 8,
    width: '100%'
  },
  orderIdLabel: {
    fontSize: 14,
    color: COLORS.gray[500],
    marginBottom: 2
  },
  orderIdValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.secondary
  },
  homeBtn: {
    backgroundColor: COLORS.primary,
    width: '100%',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 30,
  },
  homeBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderBtn: {
    marginTop: 20,
    paddingVertical: 10,
  },
  orderBtnText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  }
});

export default SuccessScreen;
