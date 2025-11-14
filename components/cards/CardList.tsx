/**
 * Card List Component
 * Displays list of cards
 */

import React from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import { Card } from '@/types/card.types';
import CardItem from './CardItem';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface CardListProps {
  cards: Card[];
  onRefresh?: () => void;
  refreshing?: boolean;
  onCopyCard: (id: string) => void;
  onEditCard: (card: Card) => void;
}

export default function CardList({
  cards,
  onRefresh,
  refreshing = false,
  onCopyCard,
  onEditCard,
}: CardListProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const styles = getStyles(isDark);

  if (cards.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No cards added yet</Text>
        <Text style={styles.emptySubtext}>Tap the + button to add your first card</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={cards}
      renderItem={({ item }) => <CardItem card={item} onCopy={onCopyCard} onEdit={onEditCard} />}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      onRefresh={onRefresh}
      refreshing={refreshing}
      showsVerticalScrollIndicator={false}
    />
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    listContent: {
      paddingVertical: 16,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyText: {
      fontSize: 20,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: isDark ? Colors.dark.icon : Colors.light.icon,
      textAlign: 'center',
    },
  });
