/**
 * Main Cards List Screen
 */

import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Card } from '@/types/card.types';
import { incrementUsage } from '@/services/storage.service';
import { getSortedCards, filterCards } from '@/services/cards.service';
import CardList from '@/components/cards/CardList';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useToast } from '@/components/ui/Toast';
import * as Haptics from 'expo-haptics';
import { SearchBar } from '@/components/ui/SearchBar';
import { getAppPreferences } from '@/services/preferences.service';
import { CardReminder, getActiveReminders } from '@/services/reminders.service';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { showToast } = useToast();

  const [cards, setCards] = useState<Card[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [reminderCount, setReminderCount] = useState(0);
  const [reminderPreview, setReminderPreview] = useState<CardReminder | null>(null);

  const updateReminderInfo = useCallback(
    async (cardsData: Card[]) => {
      try {
        const prefs = await getAppPreferences();
        const reminders = await getActiveReminders(cardsData, prefs.reminderWindowDays);
        setReminderCount(reminders.length);
        setReminderPreview(reminders[0] ?? null);
      } catch (error) {
        console.error('Error loading reminders:', error);
      }
    },
    []
  );

  const loadCards = useCallback(async () => {
    try {
      const loadedCards = await getSortedCards();
      setCards(loadedCards);
      await updateReminderInfo(loadedCards);
    } catch (error) {
      console.error('Error loading cards:', error);
      showToast({ message: 'Failed to load cards.', type: 'error' });
    }
  }, [showToast, updateReminderInfo]);

  // Load cards when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadCards();
    }, [loadCards])
  );

  const filteredCards = useMemo(() => {
    return filterCards(cards, searchQuery);
  }, [cards, searchQuery]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCards();
    setRefreshing(false);
  }, [loadCards]);

  const handleAddCard = () => {
    router.push('/add-card');
  };

  const handleEditCard = (card: Card) => {
    router.push({
      pathname: '/add-card',
      params: { id: card.id },
    });
  };

  const handleOpenReminders = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/reminders');
  };

  const handleCopyCard = async (id: string) => {
    try {
      await incrementUsage(id);
      await loadCards(); // Refresh the list to reflect new usage count
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast({ message: 'Card number copied!', type: 'success' });
    } catch (error) {
      console.error('Error copying card:', error);
      showToast({ message: 'Failed to copy card number.', type: 'error' });
    }
  };

  const styles = getStyles(isDark);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.heroHeader}>
        <Text style={styles.heroTitle}>My Cards</Text>
        <Text style={styles.heroSubtitle}>Tap to copy, hold to edit or pin</Text>
      </View>
      <SearchBar onSearch={setSearchQuery} />
      {reminderCount > 0 && reminderPreview && (
        <TouchableOpacity style={styles.reminderBanner} onPress={handleOpenReminders}>
          <Ionicons
            name="notifications"
            size={20}
            color={isDark ? Colors.dark.tint : Colors.light.tint}
            style={styles.reminderIcon}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.reminderBannerTitle}>
              {reminderCount} bill{reminderCount > 1 ? 's' : ''} coming up
            </Text>
            <Text style={styles.reminderBannerSubtitle}>
              {reminderPreview.card.bankName} — {reminderPreview.label.toLowerCase()}
            </Text>
          </View>
          <View style={styles.reminderCTA}>
            <Text style={styles.reminderBannerAction}>View</Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={isDark ? Colors.dark.tint : Colors.light.tint}
            />
          </View>
        </TouchableOpacity>
      )}
      <CardList
        cards={filteredCards}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onCopyCard={handleCopyCard}
        onEditCard={handleEditCard}
      />

      <TouchableOpacity style={styles.fab} onPress={handleAddCard}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
    },
    fab: {
      position: 'absolute',
      right: 20,
      bottom: 80, // Increased bottom margin to avoid tab bar
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: Colors.light.tint,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      zIndex: 1000,
    },
    fabText: {
      color: '#fff',
      fontSize: 24,
      fontWeight: 'bold',
    },
    heroHeader: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 4,
    },
    heroTitle: {
      fontSize: 24,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    heroSubtitle: {
      marginTop: 4,
      fontSize: 13,
      color: isDark ? Colors.dark.icon : Colors.light.icon,
    },
    reminderBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      backgroundColor: isDark ? 'rgba(46,125,255,0.25)' : '#E6F0FF',
      marginHorizontal: 20,
      marginBottom: 12,
      borderRadius: 16,
      gap: 12,
    },
    reminderIcon: {
      marginRight: 4,
    },
    reminderBannerTitle: {
      color: isDark ? Colors.dark.text : Colors.light.text,
      fontSize: 14,
      fontWeight: '600',
    },
    reminderBannerSubtitle: {
      marginTop: 4,
      color: isDark ? Colors.dark.icon : Colors.light.icon,
      fontSize: 12,
    },
    reminderCTA: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    reminderBannerAction: {
      color: isDark ? Colors.dark.tint : Colors.light.tint,
      fontWeight: '600',
    },
  });
