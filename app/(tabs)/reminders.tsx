import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/types/card.types';
import { getCards, updateCard } from '@/services/storage.service';
import { getAppPreferences } from '@/services/preferences.service';
import {
  CardReminder,
  dismissReminder,
  getActiveReminders,
  clearOutdatedDismissals,
  resetAllDismissals,
} from '@/services/reminders.service';

export default function RemindersScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);
  const { showToast } = useToast();

  const [reminders, setReminders] = useState<CardReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reminderWindowDays, setReminderWindowDays] = useState(5);

  const loadReminders = useCallback(async () => {
    try {
      setLoading(true);
      await clearOutdatedDismissals();
      const [cards, prefs] = await Promise.all([getCards(), getAppPreferences()]);
      setReminderWindowDays(prefs.reminderWindowDays);
      const active = await getActiveReminders(cards as Card[], prefs.reminderWindowDays);
      setReminders(active);
    } catch (error) {
      console.error('Failed to load reminders:', error);
      showToast({ message: 'Failed to load reminders.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useFocusEffect(
    useCallback(() => {
      loadReminders();
    }, [loadReminders])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadReminders();
    setRefreshing(false);
  }, [loadReminders]);

  const handleDismiss = async (reminder: CardReminder) => {
    try {
      await dismissReminder(reminder.key);
      showToast({ message: 'Reminder dismissed.', type: 'success' });
      await loadReminders();
    } catch (error) {
      console.error('Failed to dismiss reminder:', error);
      showToast({ message: 'Failed to dismiss reminder.', type: 'error' });
    }
  };

  const handleResetDismissals = async () => {
    try {
      await resetAllDismissals();
      showToast({ message: 'Reminders reset.', type: 'success' });
      await loadReminders();
    } catch (error) {
      console.error('Failed to reset reminders:', error);
      showToast({ message: 'Failed to reset reminders.', type: 'error' });
    }
  };

  const emptyState = (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>All caught up</Text>
      <Text style={styles.emptySubtitle}>No upcoming bills in your reminder window.</Text>
    </View>
  );

  const handleSkipRemindersForCard = async (card: Card) => {
    try {
      await updateCard(card.id, { skipReminders: true });
      showToast({
        message: 'Reminders disabled. Enable again from the edit screen.',
        type: 'info',
      });
      await loadReminders();
    } catch (error) {
      console.error('Failed to skip reminders:', error);
      showToast({ message: 'Failed to update reminders.', type: 'error' });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Reminders</Text>
        <TouchableOpacity style={styles.resetButton} onPress={handleResetDismissals}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>
        Upcoming statements, payments, and renewals over the next {reminderWindowDays} day(s)
      </Text>
      <FlatList
        data={reminders}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <ReminderCard
            reminder={item}
            isDark={isDark}
            onDismiss={() => handleDismiss(item)}
            onSkip={() => handleSkipRemindersForCard(item.card)}
          />
        )}
        ListEmptyComponent={!loading ? emptyState : null}
        contentContainerStyle={reminders.length === 0 ? styles.emptyContent : undefined}
        refreshControl={<RefreshControl refreshing={refreshing && !loading} onRefresh={handleRefresh} />}
      />
    </SafeAreaView>
  );
}

function ReminderCard({
  reminder,
  isDark,
  onDismiss,
  onSkip,
}: {
  reminder: CardReminder;
  isDark: boolean;
  onDismiss: () => void;
  onSkip: () => void;
}) {
  const styles = reminderCardStyles(isDark);
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{reminder.card.bankName}</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.iconButtonAccent}
            onPress={onSkip}
            accessibilityLabel="Skip all reminders for this card"
          >
            <Ionicons
              name="notifications-off-outline"
              size={16}
              color={isDark ? Colors.dark.destructive : Colors.light.destructive}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onDismiss}
            accessibilityLabel="Dismiss reminder"
          >
            <Ionicons name="close" size={16} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.cardSubtitle}>
        {[reminder.card.cardVariant, reminder.card.cardholderName].filter(Boolean).join(' • ')}
      </Text>
      <Text style={styles.reason}>{reminder.label}</Text>
      <Text style={styles.subreason}>{reminder.sublabel}</Text>
      <Text style={styles.timing}>In {reminder.daysUntil} day(s)</Text>
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
      paddingHorizontal: 20,
      paddingTop: 16,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    title: {
      fontSize: 24,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    subtitle: {
      marginTop: 6,
      fontSize: 13,
      color: isDark ? 'rgba(235,235,245,0.6)' : Colors.light.icon,
      marginBottom: 16,
    },
    emptyState: {
      alignItems: 'center',
      marginTop: 80,
    },
    emptyContent: {
      flexGrow: 1,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    emptySubtitle: {
      marginTop: 8,
      fontSize: 14,
      color: isDark ? Colors.dark.icon : Colors.light.icon,
      textAlign: 'center',
      paddingHorizontal: 20,
    },
    resetButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: isDark ? Colors.dark.inputBackground : '#E6E6E6',
    },
    resetButtonText: {
      fontSize: 12,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
  });

const reminderCardStyles = (isDark: boolean) =>
  StyleSheet.create({
    card: {
      backgroundColor: isDark ? Colors.dark.cardBackground : '#fff',
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOpacity: isDark ? 0.2 : 0.1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    cardVariant: {
      fontSize: 14,
      color: isDark ? Colors.dark.icon : Colors.light.icon,
      marginBottom: 2,
    },
    cardSubtitle: {
      fontSize: 13,
      color: isDark ? Colors.dark.icon : Colors.light.icon,
      marginBottom: 8,
    },
    reason: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    subreason: {
      fontSize: 13,
      color: isDark ? Colors.dark.icon : Colors.light.icon,
      marginBottom: 4,
    },
    timing: {
      fontSize: 12,
      color: isDark ? Colors.dark.icon : Colors.light.icon,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: 8,
    },
    iconButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: isDark ? Colors.dark.inputBackground : '#E6E6E6',
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconButtonAccent: {
      width: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: isDark ? Colors.dark.destructive : Colors.light.destructive,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
  const handleResetDismissals = async () => {
    try {
      await resetAllDismissals();
      showToast({ message: 'Reminders reset.', type: 'success' });
      await loadReminders();
    } catch (error) {
      console.error('Failed to reset reminders:', error);
      showToast({ message: 'Failed to reset reminders.', type: 'error' });
    }
  };
