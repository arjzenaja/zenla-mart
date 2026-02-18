import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

const { width } = Dimensions.get('window');

const Notification = ({ visible, message, type = 'info', onClose }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;

  // Configuration based on type
  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle',
          color: '#10b981', // green-500
          bgColor: '#ecfdf5', // green-50
          borderColor: '#a7f3d0', // green-200
          title: 'Sukses'
        };
      case 'error':
        return {
          icon: 'alert-circle',
          color: '#ef4444', // red-500
          bgColor: '#fef2f2', // red-50
          borderColor: '#fecaca', // red-200
          title: 'Error'
        };
      case 'info':
      default:
        return {
          icon: 'information-circle',
          color: '#3b82f6', // blue-500
          bgColor: '#eff6ff', // blue-50
          borderColor: '#bfdbfe', // blue-200
          title: 'Informasi'
        };
    }
  };

  const config = getConfig();

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss
      const timer = setTimeout(() => {
        handleClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose && onClose();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={[styles.contentContainer, { backgroundColor: config.bgColor, borderColor: config.borderColor }]}>
        <View style={[styles.iconContainer, { backgroundColor: config.color + '20' }]}>
          <Ionicons name={config.icon} size={24} color={config.color} />
        </View>

        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: config.color }]}>{config.title}</Text>
          <Text style={styles.message}>{message}</Text>
        </View>

        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={20} color={COLORS.gray[400]} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50, // Adjust based on SafeAreaView or Header height
    left: 20,
    right: 20,
    zIndex: 9999,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    width: '100%',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    color: '#4b5563', // gray-600
    lineHeight: 18,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  }
});

export default Notification;
