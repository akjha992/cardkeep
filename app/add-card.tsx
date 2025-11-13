/**
 * Add Card Modal Screen
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AddCardForm from '@/components/cards/AddCardForm';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card } from '@/types/card.types';
import { getCards } from '@/services/storage.service';

export default function AddCardScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const params = useLocalSearchParams<{ id?: string }>();

  const [initialCard, setInitialCard] = useState<Card | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(params.id));

  useEffect(() => {
    if (!params.id) {
      setInitialCard(undefined);
      setIsLoading(false);
      return;
    }

    const loadCard = async () => {
      try {
        const cards = await getCards();
        const found = cards.find(card => card.id === params.id);
        if (!found) {
          Alert.alert('Card not found', 'The selected card could not be found.');
          router.back();
          return;
        }
        setInitialCard(found);
      } catch (error) {
        console.error('Failed to load card for editing:', error);
        Alert.alert('Error', 'Failed to load card for editing.');
        router.back();
      } finally {
        setIsLoading(false);
      }
    };

    loadCard();
  }, [params.id, router]);

  const handleSave = () => {
    // Navigate back - the parent screen will handle refresh
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  const styles = getStyles(isDark);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={isDark ? Colors.dark.tint : Colors.light.tint} />
        </View>
      ) : (
        <AddCardForm
          onSave={handleSave}
          onCancel={handleCancel}
          initialCard={initialCard}
          mode={params.id ? 'edit' : 'add'}
        />
      )}
    </SafeAreaView>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      padding: 16,
      paddingTop: 10,
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: isDark ? Colors.dark.inputBackground : '#f0f0f0',
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeButtonText: {
      fontSize: 18,
      color: isDark ? Colors.dark.text : Colors.light.text,
      fontWeight: 'bold',
    },
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
