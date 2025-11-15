/**
 * Add Card Modal Screen
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AddCardForm from '@/components/cards/AddCardForm';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card } from '@/types/card.types';
import { getCards, togglePin, deleteCard, updateCard } from '@/services/storage.service';
import { useToast } from '@/components/ui/Toast';

export default function AddCardScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { showToast } = useToast();
  const params = useLocalSearchParams<{ id?: string }>();

  const [activeCard, setActiveCard] = useState<Card | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(params.id));
  const [isPinning, setIsPinning] = useState(false);
  const [isUpdatingReminders, setIsUpdatingReminders] = useState(false);

  useEffect(() => {
    if (!params.id) {
      setActiveCard(undefined);
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
        setActiveCard(found);
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
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  const handleTogglePin = async () => {
    if (!activeCard || isPinning) return;
    setIsPinning(true);
    try {
      await togglePin(activeCard.id);
      const updated = { ...activeCard, isPinned: !activeCard.isPinned };
      setActiveCard(updated);
      showToast({
        message: updated.isPinned ? 'Card pinned.' : 'Card unpinned.',
        type: 'success',
      });
    } catch (error) {
      console.error('Failed to toggle pin:', error);
      showToast({ message: 'Failed to update pin status.', type: 'error' });
    } finally {
      setIsPinning(false);
    }
  };

  const confirmDelete = () => {
    if (!activeCard) return;
    Alert.alert(
      'Delete Card',
      'Are you sure you want to delete this card?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCard(activeCard.id);
              showToast({ message: 'Card deleted.', type: 'success' });
              router.back();
            } catch (error) {
              console.error('Failed to delete card:', error);
              showToast({ message: 'Failed to delete card.', type: 'error' });
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleToggleReminders = async () => {
    if (!activeCard || isUpdatingReminders) return;
    setIsUpdatingReminders(true);
    try {
      await updateCard(activeCard.id, { skipReminders: !activeCard.skipReminders });
      const updated = { ...activeCard, skipReminders: !activeCard.skipReminders };
      setActiveCard(updated);
      showToast({
        message: updated.skipReminders
          ? 'Reminders disabled for this card.'
          : 'Reminders enabled.',
        type: 'success',
      });
    } catch (error) {
      console.error('Failed to toggle reminders:', error);
      showToast({ message: 'Failed to update reminders.', type: 'error' });
    } finally {
      setIsUpdatingReminders(false);
    }
  };

  const styles = getStyles(isDark);
  const isEditMode = Boolean(params.id && activeCard);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        {isEditMode && (
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={handleToggleReminders}
              disabled={isUpdatingReminders}
              accessibilityLabel="Toggle card reminders"
            >
              <Ionicons
                name={activeCard?.skipReminders ? 'notifications-off-outline' : 'notifications-outline'}
                size={20}
                color={isDark ? Colors.dark.text : Colors.light.icon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={handleTogglePin}
              disabled={isPinning}
              accessibilityLabel="Pin or unpin card"
            >
              <Ionicons
                name={activeCard?.isPinned ? 'star' : 'star-outline'}
                size={20}
                color={isDark ? Colors.dark.tint : Colors.light.tint}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerIconButton, styles.deleteButton]}
              onPress={confirmDelete}
              accessibilityLabel="Delete card"
            >
              <Ionicons
                name="trash-outline"
                size={20}
                color={isDark ? Colors.dark.destructive : Colors.light.destructive}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={isDark ? Colors.dark.tint : Colors.light.tint} />
        </View>
      ) : (
        <AddCardForm
          onSave={handleSave}
          onCancel={handleCancel}
          initialCard={activeCard}
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
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
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
    headerActions: {
      flexDirection: 'row',
      gap: 12,
    },
    headerIconButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: isDark ? Colors.dark.inputBackground : '#f0f0f0',
      justifyContent: 'center',
      alignItems: 'center',
    },
    deleteButton: {
      backgroundColor: isDark ? 'rgba(255,69,58,0.2)' : 'rgba(255,69,58,0.12)',
    },
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
