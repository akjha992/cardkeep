/**
 * Main Cards List Screen
 */

import CardList from '@/components/cards/CardList';
import { SearchBar } from '@/components/ui/SearchBar';
import { useToast } from '@/components/ui/Toast';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { filterCards, getSortedCards, sortCards } from '@/services/cards.service';
import { CardSortOrder, getAppPreferences, updateAppPreferences } from '@/services/preferences.service';
import { CardReminder, getActiveReminders } from '@/services/reminders.service';
import { incrementUsage } from '@/services/storage.service';
import { Card } from '@/types/card.types';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const SORT_OPTIONS: { value: CardSortOrder; label: string }[] = [
  { value: 'usage', label: 'Most used' },
  { value: 'bank', label: 'Card name A-Z' },
  { value: 'cardholder', label: 'Cardholder A-Z' },
  { value: 'recent', label: 'Recently added' },
];

function getSortLabel(order: CardSortOrder) {
  const match = SORT_OPTIONS.find((option) => option.value === order);
  return match ? match.label : 'Most used';
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [cards, setCards] = useState<Card[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [reminderCount, setReminderCount] = useState(0);
  const [reminderPreview, setReminderPreview] = useState<CardReminder | null>(null);
  const [sortOrder, setSortOrder] = useState<CardSortOrder>('usage');
  const [isSortModalVisible, setIsSortModalVisible] = useState(false);

  const loadCards = useCallback(async () => {
    try {
      const [loadedCards, prefs] = await Promise.all([getSortedCards(), getAppPreferences()]);
      setCards(loadedCards);
      setSortOrder(prefs.cardSortOrder ?? 'usage');
      const reminders = await getActiveReminders(loadedCards, prefs.reminderWindowDays);
      setReminderCount(reminders.length);
      setReminderPreview(reminders[0] ?? null);
    } catch (error) {
      console.error('Error loading cards:', error);
      showToast({ message: 'Failed to load cards.', type: 'error' });
    }
  }, [showToast]);

  // Load cards when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadCards();
    }, [loadCards])
  );

  const filteredCards = useMemo(() => {
    return filterCards(cards, searchQuery);
  }, [cards, searchQuery]);

  const displayCards = useMemo(() => {
    const pinned = filteredCards.filter((card) => card.isPinned);
    const unpinned = filteredCards.filter((card) => !card.isPinned);
    const sort = (list: Card[]) => sortCards(list, sortOrder);
    return [...sort(pinned), ...sort(unpinned)];
  }, [filteredCards, sortOrder]);

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

  const handleChangeSort = useCallback(
    async (order: CardSortOrder) => {
      setIsSortModalVisible(false);
      setSortOrder(order);
      try {
        await updateAppPreferences({ cardSortOrder: order });
      } catch (error) {
        console.error('Failed to save sort order:', error);
        showToast({ message: 'Unable to save sort preference.', type: 'error' });
      }
    },
    [showToast]
  );

  const styles = getStyles(isDark);

  const bottomSheetInset = Math.max(insets.bottom, 16);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.heroHeader}>
        <View>
          <Text style={styles.heroTitle}>My Cards</Text>
          <Text style={styles.heroSubtitle}>Tap to copy, hold to edit or pin</Text>
        </View>
        <View style={styles.heroActions}>
          <View style={styles.countChip}>
            <Ionicons
              name="card-outline"
              size={14}
              color={isDark ? Colors.dark.text : Colors.light.text}
            />
            <Text style={styles.countChipText}>
              {cards.length} card{cards.length === 1 ? '' : 's'}
            </Text>
          </View>
        <TouchableOpacity style={styles.sortChip} onPress={() => setIsSortModalVisible(true)}>
          <Ionicons
            name="swap-vertical"
            size={16}
            color={isDark ? Colors.dark.text : Colors.light.text}
          />
          <Text style={styles.sortChipText}>{getSortLabel(sortOrder)}</Text>
        </TouchableOpacity>
        </View>
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
        cards={displayCards}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onCopyCard={handleCopyCard}
        onEditCard={handleEditCard}
      />

      <TouchableOpacity style={styles.fab} onPress={handleAddCard}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
      <Modal
        visible={isSortModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSortModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { paddingBottom: bottomSheetInset }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setIsSortModalVisible(false)}
          />
          <View
            style={[
              styles.sortSheet,
              { backgroundColor: isDark ? Colors.dark.cardBackground ?? '#1d1d1d' : '#fff' },
            ]}
          >
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.sortOption,
                  sortOrder === option.value && styles.sortOptionSelected,
                ]}
                onPress={() => handleChangeSort(option.value)}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    sortOrder === option.value && styles.sortOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
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
      bottom: 60, // Slightly closer to navigation for reachability
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    heroActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
      maxWidth: '50%',
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
    sortChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark ? Colors.dark.inputBorder : '#d0d0d0',
      backgroundColor: isDark ? Colors.dark.cardBackground ?? '#1a1a1a' : '#fff',
    },
    sortChipText: {
      fontSize: 12,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
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
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'flex-end',
    },
    sortSheet: {
      margin: 20,
      borderRadius: 16,
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    sortOption: {
      paddingVertical: 12,
    },
    sortOptionSelected: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
      borderRadius: 12,
      paddingHorizontal: 8,
    },
    sortOptionText: {
      fontSize: 14,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    sortOptionTextSelected: {
      fontWeight: '600',
    },
    countChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark ? Colors.dark.inputBorder : '#d0d0d0',
      backgroundColor: isDark ? Colors.dark.cardBackground ?? '#1a1a1a' : '#fff',
    },
    countChipText: {
      fontSize: 12,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
  });
