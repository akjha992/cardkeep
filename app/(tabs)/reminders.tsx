import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, RefreshControl, Modal, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';

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

const BILL_NUDGE_KEY = 'missing_bill_nudge';
const BILL_NUDGE_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export default function RemindersScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { showToast } = useToast();

  const styles = getStyles(isDark);

  const [reminders, setReminders] = useState<CardReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reminderWindowDays, setReminderWindowDays] = useState(5);
  const [missingBillCards, setMissingBillCards] = useState<Card[]>([]);
  const [showMissingBillNudge, setShowMissingBillNudge] = useState(false);
  const [isMissingBillModalOpen, setMissingBillModalOpen] = useState<boolean>(false);

  const loadReminders = useCallback(async () => {
    try {
      setLoading(true);
      await clearOutdatedDismissals();
      const [cards, prefs] = await Promise.all([getCards(), getAppPreferences()]);
      setReminderWindowDays(prefs.reminderWindowDays);
      const missingCards = cards.filter(
        (card) => card.cardType === 'Credit' && typeof card.billGenerationDay !== 'number'
      );
      setMissingBillCards(missingCards);
      if (missingCards.length > 0) {
        const lastDismissedRaw = await AsyncStorage.getItem(BILL_NUDGE_KEY);
        const lastDismissed = lastDismissedRaw ? Number(lastDismissedRaw) : 0;
        const shouldShow = !lastDismissed || Date.now() - lastDismissed > BILL_NUDGE_COOLDOWN_MS;
        setShowMissingBillNudge(shouldShow);
      } else {
        setShowMissingBillNudge(false);
      }

      const active = await getActiveReminders(cards as Card[], prefs.reminderWindowDays, new Date(), prefs.reminderTypes);
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
      await AsyncStorage.removeItem(BILL_NUDGE_KEY);
      setShowMissingBillNudge(true);
      await resetAllDismissals();
      showToast({ message: 'Reminders reset.', type: 'success' });
      await loadReminders();
    } catch (error) {
      console.error('Failed to reset reminders:', error);
      showToast({ message: 'Failed to reset reminders.', type: 'error' });
    }
  };

  const handleDismissBillNudge = useCallback(async () => {
    try {
      await AsyncStorage.setItem(BILL_NUDGE_KEY, String(Date.now()));
    } catch (error) {
      console.error('Failed to persist bill nudge dismissal:', error);
    }
    setShowMissingBillNudge(false);
  }, []);

  const handleOpenMissingBillList = () => {
    setMissingBillModalOpen(true);
  };

  const handleEditMissingCard = (card: Card) => {
    setMissingBillModalOpen(false);
    router.push({ pathname: '/add-card', params: { id: card.id } });
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
      {showMissingBillNudge && missingBillCards.length > 0 && (
        <TouchableOpacity style={styles.nudgeCard} onPress={handleOpenMissingBillList} activeOpacity={0.9}>
          <View style={{ flex: 1 }}>
            <Text style={styles.nudgeTitle}>Add bill generation days</Text>
            <Text style={styles.nudgeSubtitle}>
              {missingBillCards.length} credit card{missingBillCards.length > 1 ? 's' : ''} need a
              bill day to enable reminders.
            </Text>
          </View>
          <TouchableOpacity style={styles.nudgeDismissButton} onPress={handleDismissBillNudge}>
            <Text style={styles.nudgeDismissText}>Dismiss</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
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
      <Modal
        visible={isMissingBillModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMissingBillModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={styles.missingModalContainer}
          >
            <Text style={styles.missingModalTitle}>Cards missing bill day</Text>
            <ScrollView style={{ maxHeight: 320 }}>
              {missingBillCards.map((card) => (
                <TouchableOpacity
                  key={card.id}
                  style={styles.missingCardRow}
                  onPress={() => handleEditMissingCard(card)}
                >
                  <View>
                    <Text style={styles.missingCardTitle}>{card.bankName}</Text>
                    <Text style={styles.missingCardSubtitle}>{card.cardholderName}</Text>
                  </View>
                  <Text style={styles.missingCardAction}>Edit</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.missingModalClose}
              onPress={() => setMissingBillModalOpen(false)}
            >
              <Text style={styles.missingModalCloseText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    nudgeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 12,
      backgroundColor: isDark ? 'rgba(255,200,0,0.15)' : '#FFF6E1',
      borderWidth: 1,
      borderColor: isDark ? Colors.dark.inputBorder : '#F0D58C',
      marginBottom: 12,
      gap: 12,
    },
    nudgeTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    nudgeSubtitle: {
      fontSize: 12,
      color: isDark ? Colors.dark.icon : Colors.light.icon,
      marginTop: 4,
    },
    nudgeDismissButton: {
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: isDark ? Colors.dark.icon : Colors.light.icon,
    },
    nudgeDismissText: {
      fontSize: 12,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
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
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
    },
    missingModalContainer: {
      margin: 20,
      borderRadius: 16,
      padding: 16,
      backgroundColor: isDark ? Colors.dark.cardBackground ?? '#1c1c1e' : '#fff',
    },
    missingModalTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
      marginBottom: 12,
    },
    missingCardRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? Colors.dark.inputBorder : '#eee',
    },
    missingCardTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    missingCardSubtitle: {
      fontSize: 12,
      color: isDark ? Colors.dark.icon : Colors.light.icon,
    },
    missingCardAction: {
      fontSize: 12,
      fontWeight: '600',
      color: isDark ? Colors.dark.tint : Colors.light.tint,
    },
    missingModalClose: {
      marginTop: 12,
      alignSelf: 'flex-end',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 10,
      backgroundColor: Colors.light.tint,
    },
    missingModalCloseText: {
      color: '#fff',
      fontWeight: '600',
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
