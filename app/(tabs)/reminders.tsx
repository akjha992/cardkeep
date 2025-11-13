import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/types/card.types';
import { getCards } from '@/services/storage.service';
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Reminders</Text>
        <TouchableOpacity style={styles.resetButton} onPress={handleResetDismissals}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>
        Showing statements and payments within the next {reminderWindowDays} day(s)
      </Text>
      <FlatList
        data={reminders}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <ReminderCard reminder={item} isDark={isDark} onDismiss={() => handleDismiss(item)} />
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
}: {
  reminder: CardReminder;
  isDark: boolean;
  onDismiss: () => void;
}) {
  const styles = reminderCardStyles(isDark);
  return (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{reminder.card.bankName}</Text>
        <Text style={styles.cardSubtitle}>{reminder.card.cardholderName}</Text>
        <Text style={styles.reason}>{reminder.label}</Text>
        <Text style={styles.subreason}>{reminder.sublabel}</Text>
        <Text style={styles.timing}>In {reminder.daysUntil} day(s)</Text>
      </View>
      <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
        <Text style={styles.dismissText}>Dismiss</Text>
      </TouchableOpacity>
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
      fontSize: 14,
      color: isDark ? Colors.dark.icon : Colors.light.icon,
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
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOpacity: isDark ? 0.2 : 0.1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    cardSubtitle: {
      fontSize: 14,
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
    dismissButton: {
      marginLeft: 12,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: isDark ? Colors.dark.inputBackground : '#E6E6E6',
    },
    dismissText: {
      fontSize: 12,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
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
