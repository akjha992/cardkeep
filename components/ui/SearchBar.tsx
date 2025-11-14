import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';

interface SearchBarProps {
  onSearch: (query: string) => void;
  debounceTime?: number;
}

export function SearchBar({ onSearch, debounceTime = 500 }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const backgroundColor = useThemeColor({}, 'inputBackground');
  const color = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const placeholderColor = useThemeColor({}, 'icon');

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(query);
    }, debounceTime);

    return () => {
      clearTimeout(handler);
    };
  }, [query, onSearch, debounceTime]);

  const handleClear = () => {
    setQuery('');
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <Ionicons name="search" size={20} color={iconColor} style={styles.searchIcon} />
      <TextInput
        style={[styles.input, { color }]}
        placeholder="Search by bank or name..."
        placeholderTextColor={placeholderColor}
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {query.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearIcon}>
          <Ionicons name="close-circle" size={20} color={iconColor} />
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  clearIcon: {
    marginLeft: 8,
  },
});
