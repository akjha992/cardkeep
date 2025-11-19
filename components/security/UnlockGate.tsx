import React, { useCallback, useEffect, useState, ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type UnlockGateProps = {
  children: ReactNode;
};

type GateStatus = 'checking' | 'authorized' | 'error' | 'unsupported';

export function UnlockGate({ children }: UnlockGateProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);

  const [status, setStatus] = useState<GateStatus>('checking');
  const [message, setMessage] = useState<string>('Verifying device security…');

  const authenticate = useCallback(async () => {
    setStatus('checking');
    setMessage('Verifying device security…');
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = hasHardware ? await LocalAuthentication.isEnrolledAsync() : false;
      if (!hasHardware || !isEnrolled) {
        setStatus('unsupported');
        setMessage(
          'Device lock is not configured. For better security, enable Face ID, Touch ID, or a device PIN.'
        );
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock CardKeep',
        fallbackLabel: 'Use device passcode',
        disableDeviceFallback: false,
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        setStatus('authorized');
      } else {
        setStatus('error');
        setMessage(
          result.error === 'user_cancel' ? 'Authentication canceled.' : 'Authentication failed.'
        );
      }
    } catch (error) {
      console.error('Local authentication error:', error);
      setStatus('error');
      setMessage('Unable to authenticate. Please try again.');
    }
  }, []);

  useEffect(() => {
    authenticate();
  }, [authenticate]);

  if (status === 'authorized') {
    return <>{children}</>;
  }

  const showRetry = status === 'error';
  const showContinue = status === 'unsupported';

  return (
    <View style={styles.gateContainer}>
      <View style={styles.card}>
        {status === 'checking' ? (
          <>
            <ActivityIndicator color={Colors.light.tint} />
            <Text style={styles.title}>Unlocking…</Text>
          </>
        ) : (
          <>
            <Text style={styles.title}>Unlock CardKeep</Text>
            <Text style={styles.message}>{message}</Text>
            {showRetry && (
              <TouchableOpacity style={styles.retryButton} onPress={authenticate}>
                <Text style={styles.retryText}>Try again</Text>
              </TouchableOpacity>
            )}
            {showContinue && (
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setStatus('authorized')}>
                <Text style={styles.secondaryButtonText}>Continue anyway</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    gateContainer: {
      flex: 1,
      backgroundColor: isDark ? '#050505' : '#f2f2f2',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    card: {
      width: '100%',
      borderRadius: 20,
      paddingVertical: 32,
      paddingHorizontal: 24,
      backgroundColor: isDark ? Colors.dark.cardBackground ?? '#1a1a1a' : '#fff',
      alignItems: 'center',
      gap: 16,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
      textAlign: 'center',
    },
    message: {
      fontSize: 14,
      color: isDark ? Colors.dark.icon : Colors.light.icon,
      textAlign: 'center',
      lineHeight: 20,
    },
    retryButton: {
      marginTop: 12,
      paddingHorizontal: 24,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: Colors.light.tint,
    },
    retryText: {
      color: '#fff',
      fontWeight: '600',
    },
    secondaryButton: {
      marginTop: 12,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: isDark ? Colors.dark.text : Colors.light.text,
    },
    secondaryButtonText: {
      color: isDark ? Colors.dark.text : Colors.light.text,
      fontWeight: '600',
    },
  });
