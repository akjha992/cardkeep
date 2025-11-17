/**
 * Card List Component
 * Displays list of cards
 */

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
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

export type CardListHandle = {
  scrollToTop: () => void;
};

const CardList = forwardRef<CardListHandle, CardListProps>(function CardList(
  { cards, onRefresh, refreshing = false, onCopyCard, onEditCard },
  ref
) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const listRef = useRef<FlatList<Card>>(null);
  useImperativeHandle(
    ref,
    () => ({
      scrollToTop() {
        if (listRef.current) {
          listRef.current.scrollToOffset({ offset: 0, animated: true });
        }
      },
    }),
    []
  );
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
      ref={listRef}
      data={cards}
      renderItem={({ item, index }) => (
        <CardItem
          card={item}
          onCopy={onCopyCard}
          onEdit={onEditCard}
          accentIndex={index}
        />
      )}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      onRefresh={onRefresh}
      refreshing={refreshing}
      showsVerticalScrollIndicator={false}
    />
  );
});

export default CardList;

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    listContent: {
      paddingVertical: 16,
      paddingBottom: 140,
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
