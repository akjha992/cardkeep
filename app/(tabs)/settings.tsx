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
import * as DocumentPicker from 'expo-document-picker';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useToast } from '@/components/ui/Toast';
import { exportCardData } from '@/services/export.service';
import { importCardData } from '@/services/import.service';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);
  const { showToast } = useToast();

  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [exportPassword, setExportPassword] = useState('');
  const [exportPasswordError, setExportPasswordError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [importPassword, setImportPassword] = useState('');
  const [importPasswordError, setImportPasswordError] = useState<string | null>(null);
  const [selectedImportFile, setSelectedImportFile] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [isImporting, setIsImporting] = useState(false);

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

  const pickImportFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.length) {
      return null;
    }

    return result.assets[0];
  };

  const handleStartImport = async () => {
    try {
      const asset = await pickImportFile();
      if (!asset) {
        return;
      }
      setSelectedImportFile(asset);
      setImportPassword('');
      setImportPasswordError(null);
      setIsImportModalVisible(true);
    } catch (error) {
      console.error('Error selecting import file:', error);
      showToast({ message: 'Failed to open document picker.', type: 'error' });
    }
  };

  const handleChangeImportFile = async () => {
    try {
      const asset = await pickImportFile();
      if (!asset) {
        return;
      }
      setSelectedImportFile(asset);
    } catch (error) {
      console.error('Error selecting import file:', error);
      showToast({ message: 'Failed to open document picker.', type: 'error' });
    }
  };

  const closeImportModal = () => {
    if (isImporting) return;
    setIsImportModalVisible(false);
    setImportPassword('');
    setImportPasswordError(null);
    setSelectedImportFile(null);
  };

  const handleConfirmImport = async () => {
    if (!selectedImportFile) {
      setImportPasswordError('Select a file to import.');
      return;
    }

    const password = importPassword.trim();
    if (!password) {
      setImportPasswordError('Password is required');
      return;
    }

    try {
      setIsImporting(true);
      const summary = await importCardData(selectedImportFile.uri, password);
      const summaryMessage = `${summary.imported} cards imported, ${summary.duplicates} duplicates skipped.`;
      showToast({ message: summaryMessage, type: summary.imported ? 'success' : 'info' });
      closeImportModal();
    } catch (error) {
      console.error('Error importing cards:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to import cards. Please try again.';
      showToast({ message, type: 'error' });
    } finally {
      setIsImporting(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes <= 0) {
      return null;
    }
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your card data</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Data Management</Text>
        <TouchableOpacity style={styles.item} activeOpacity={0.7} onPress={handleStartImport}>
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

      <Modal
        visible={isImportModalVisible}
        animationType="fade"
        transparent
        onRequestClose={closeImportModal}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: isDark ? Colors.dark.cardBackground : '#fff' },
            ]}
          >
            <Text style={styles.modalTitle}>Import Cards</Text>
            <Text style={styles.modalSubtitle}>
              Choose your exported file and enter the password to restore cards.
            </Text>
            <View style={styles.fileInfo}>
              <Text style={styles.fileName}>
                {selectedImportFile?.name ?? 'cardvault-export.json'}
              </Text>
              {selectedImportFile?.size ? (
                <Text style={styles.fileMeta}>{formatFileSize(selectedImportFile.size)}</Text>
              ) : null}
              <TouchableOpacity
                style={styles.linkButton}
                onPress={handleChangeImportFile}
                disabled={isImporting}
              >
                <Text style={styles.linkButtonText}>
                  Choose different file
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              value={importPassword}
              onChangeText={(value) => {
                setImportPassword(value);
                if (importPasswordError) {
                  setImportPasswordError(null);
                }
              }}
              placeholder="Password"
              placeholderTextColor={isDark ? '#6B6B6B' : '#9E9E9E'}
              secureTextEntry
              style={[styles.input, importPasswordError && styles.inputError]}
              editable={!isImporting}
            />
            {importPasswordError && <Text style={styles.errorText}>{importPasswordError}</Text>}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeImportModal}
                disabled={isImporting}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirmImport}
                disabled={isImporting}
              >
                {isImporting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>Import</Text>
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
    fileInfo: {
      marginTop: 20,
      padding: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: isDark ? Colors.dark.inputBorder : Colors.light.inputBorder,
      backgroundColor: isDark ? Colors.dark.inputBackground : Colors.light.inputBackground,
    },
    fileName: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    fileMeta: {
      marginTop: 4,
      fontSize: 13,
      color: isDark ? Colors.dark.icon : Colors.light.icon,
    },
    linkButton: {
      marginTop: 12,
    },
    linkButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? Colors.dark.tint : Colors.light.tint,
    },
  });
