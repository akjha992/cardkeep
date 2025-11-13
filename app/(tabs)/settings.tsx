import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useToast } from '@/components/ui/Toast';
import { exportCardData } from '@/services/export.service';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);
  const { showToast } = useToast();

  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [exportPassword, setExportPassword] = useState('');
  const [exportPasswordError, setExportPasswordError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const openExportModal = () => {
    setExportPassword('');
    setExportPasswordError(null);
    setIsExportModalVisible(true);
  };

  const closeExportModal = () => {
    if (isExporting) return;
    setIsExportModalVisible(false);
    setExportPassword('');
    setExportPasswordError(null);
  };

  const handleConfirmExport = async () => {
    const password = exportPassword.trim();

    if (!password) {
      setExportPasswordError('Password is required');
      return;
    }

    try {
      setIsExporting(true);
      await exportCardData(password);
      showToast({ message: 'Cards exported successfully.', type: 'success' });
      closeExportModal();
    } catch (error) {
      console.error('Error exporting cards:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to export cards. Please try again.';
      showToast({ message, type: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your card data</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Data Management</Text>
        <TouchableOpacity style={styles.item} activeOpacity={0.7}>
          <View>
            <Text style={styles.itemTitle}>Import Data</Text>
            <Text style={styles.itemSubtitle}>Restore cards from a saved export</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item} activeOpacity={0.7} onPress={openExportModal}>
          <View>
            <Text style={styles.itemTitle}>Export Data</Text>
            <Text style={styles.itemSubtitle}>Backup cards to an encrypted file</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isExportModalVisible}
        animationType="fade"
        transparent
        onRequestClose={closeExportModal}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: isDark ? Colors.dark.cardBackground : '#fff' },
            ]}
          >
            <Text style={styles.modalTitle}>Export Cards</Text>
            <Text style={styles.modalSubtitle}>
              Enter a password. You will need it to import this backup later.
            </Text>
            <TextInput
              value={exportPassword}
              onChangeText={(value) => {
                setExportPassword(value);
                if (exportPasswordError) {
                  setExportPasswordError(null);
                }
              }}
              placeholder="Password"
              placeholderTextColor={isDark ? '#6B6B6B' : '#9E9E9E'}
              secureTextEntry
              style={[styles.input, exportPasswordError && styles.inputError]}
              editable={!isExporting}
            />
            {exportPasswordError && <Text style={styles.errorText}>{exportPasswordError}</Text>}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeExportModal}
                disabled={isExporting}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirmExport}
                disabled={isExporting}
              >
                {isExporting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>Export</Text>
                )}
              </TouchableOpacity>
            </View>
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
      paddingHorizontal: 20,
    },
    header: {
      paddingVertical: 24,
    },
    section: {
      marginTop: 12,
      borderRadius: 16,
      backgroundColor: isDark ? Colors.dark.cardBackground : '#fff',
      paddingVertical: 8,
      paddingHorizontal: 4,
      shadowColor: '#000',
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    sectionLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? Colors.dark.icon : Colors.light.icon,
      marginBottom: 8,
      marginLeft: 4,
    },
    title: {
      fontSize: 24,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    subtitle: {
      marginTop: 6,
      fontSize: 16,
      color: isDark ? Colors.dark.icon : Colors.light.icon,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? Colors.dark.inputBorder : Colors.light.inputBorder,
    },
    itemTitle: {
      fontSize: 17,
      fontWeight: '500',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    itemSubtitle: {
      marginTop: 4,
      fontSize: 14,
      color: isDark ? Colors.dark.icon : Colors.light.icon,
    },
    chevron: {
      fontSize: 24,
      color: isDark ? Colors.dark.icon : Colors.light.icon,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    modalContent: {
      width: '100%',
      borderRadius: 16,
      padding: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    modalSubtitle: {
      marginTop: 8,
      fontSize: 14,
      color: isDark ? Colors.dark.icon : Colors.light.icon,
    },
    input: {
      marginTop: 20,
      padding: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: isDark ? Colors.dark.inputBorder : Colors.light.inputBorder,
      color: isDark ? Colors.dark.text : Colors.light.text,
      backgroundColor: isDark ? Colors.dark.inputBackground : Colors.light.inputBackground,
    },
    inputError: {
      borderColor: isDark ? Colors.dark.destructive : Colors.light.destructive,
    },
    errorText: {
      marginTop: 8,
      color: isDark ? Colors.dark.destructive : Colors.light.destructive,
      fontSize: 13,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 20,
      gap: 12,
    },
    modalButton: {
      paddingVertical: 12,
      paddingHorizontal: 18,
      borderRadius: 10,
    },
    cancelButton: {
      backgroundColor: isDark ? Colors.dark.inputBackground : '#E6E6E6',
    },
    confirmButton: {
      backgroundColor: isDark ? Colors.dark.tint : Colors.light.tint,
    },
    modalButtonText: {
      fontWeight: '600',
      color: '#fff',
    },
    cancelButtonText: {
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
  });
