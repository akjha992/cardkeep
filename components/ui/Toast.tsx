import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Animated, Text, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const { height } = Dimensions.get('window');

type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number; // in milliseconds
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const fadeAnim = new Animated.Value(0); // Initial value for opacity: 0
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    if (toast) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(toast.duration || 2000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setToast(null));
    }
  }, [toast]);

  const showToast = (options: ToastOptions) => {
    setToast(options);
  };

  const getToastStyle = (type: ToastType) => {
    switch (type) {
      case 'success':
        return { backgroundColor: isDark ? '#4CAF50' : '#66BB6A' };
      case 'error':
        return { backgroundColor: isDark ? '#F44336' : '#EF5350' };
      case 'info':
        return { backgroundColor: isDark ? '#2196F3' : '#42A5F5' };
      default:
        return { backgroundColor: isDark ? Colors.dark.tint : Colors.light.tint };
    }
  };

  const styles = getStyles(isDark);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Animated.View
          style={[
            styles.toastContainer,
            getToastStyle(toast.type || 'info'),
            { opacity: fadeAnim },
          ]}
        >
          <SafeAreaView>
            <Text style={styles.toastText}>{toast.message}</Text>
          </SafeAreaView>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    toastContainer: {
      position: 'absolute',
      bottom: height * 0.1, // Position above the bottom navigation
      left: 20,
      right: 20,
      borderRadius: 8,
      padding: 16,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    toastText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: 'bold',
      textAlign: 'center',
    },
  });
