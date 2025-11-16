import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useToast } from '@/components/ui/Toast';
import { exportCardData } from '@/services/export.service';
import { importCardData } from '@/services/import.service';
import { getAppPreferences, updateAppPreferences } from '@/services/preferences.service';
import { deleteAllCards } from '@/services/storage.service';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);
  const { showToast } = useToast();

  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [exportPassword, setExportPassword] = useState('');
  const [confirmExportPassword, setConfirmExportPassword] = useState('');
  const [exportPasswordError, setExportPasswordError] = useState<string | null>(null);
  const [confirmExportPasswordError, setConfirmExportPasswordError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [includeUsageInExport, setIncludeUsageInExport] = useState(true);

  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [importPassword, setImportPassword] = useState('');
  const [importPasswordError, setImportPasswordError] = useState<string | null>(null);
  const [selectedImportFile, setSelectedImportFile] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [reminderWindowDays, setReminderWindowDays] = useState(5);
  const [isReminderLoading, setIsReminderLoading] = useState(true);
  const [isSavingReminder, setIsSavingReminder] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const prefs = await getAppPreferences();
        setReminderWindowDays(prefs.reminderWindowDays);
      } catch (error) {
        console.error('Failed to load preferences:', error);
        showToast({ message: 'Failed to load reminder settings.', type: 'error' });
      } finally {
        setIsReminderLoading(false);
      }
    };

    loadPreferences();
  }, [showToast]);

  const openExportModal = () => {
    setExportPassword('');
    setConfirmExportPassword('');
    setExportPasswordError(null);
    setConfirmExportPasswordError(null);
    setIncludeUsageInExport(true);
    setIsExportModalVisible(true);
  };

  const closeExportModal = () => {
    if (isExporting) return;
    setIsExportModalVisible(false);
    setExportPassword('');
    setConfirmExportPassword('');
    setExportPasswordError(null);
    setConfirmExportPasswordError(null);
  };

  const handleConfirmExport = async () => {
    const password = exportPassword.trim();
    const confirmPassword = confirmExportPassword.trim();

    if (!password) {
      setExportPasswordError('Password is required');
      return;
    }
    if (password !== confirmPassword) {
      setConfirmExportPasswordError('Passwords do not match');
      return;
    }

    try {
      setIsExporting(true);
      await exportCardData(password, { includeUsage: includeUsageInExport });
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

  const clampReminderDays = (value: number) => {
    return Math.max(1, Math.min(15, value));
  };

  const updateReminderWindow = async (delta: number) => {
    if (isReminderLoading || isSavingReminder) {
      return;
    }
    const previousValue = reminderWindowDays;
    const nextValue = clampReminderDays(previousValue + delta);
    if (nextValue === previousValue) {
      return;
    }
    setReminderWindowDays(nextValue);
    setIsSavingReminder(true);
    try {
      await updateAppPreferences({ reminderWindowDays: nextValue });
      showToast({ message: `Reminder window set to ${nextValue} day(s).`, type: 'success' });
    } catch (error) {
      console.error('Failed to save reminder window:', error);
      showToast({ message: 'Failed to save reminder window.', type: 'error' });
      setReminderWindowDays(previousValue);
    } finally {
      setIsSavingReminder(false);
    }
  };

  const handleDeleteAllCards = () => {
    if (isDeletingAll) return;
    Alert.alert(
      'Delete all cards?',
      'This will remove every card from CardVault. Export your data first if you may need it later.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeletingAll(true);
              await deleteAllCards();
              showToast({ message: 'All cards deleted.', type: 'success' });
              router.replace('/');
            } catch (error) {
              console.error('Failed to delete all cards:', error);
              showToast({ message: 'Failed to delete cards.', type: 'error' });
            } finally {
              setIsDeletingAll(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Manage your card data</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Privacy</Text>
          <View style={styles.privacyCard}>
            <Text style={styles.itemTitle}>Stays on this device</Text>
            <Text style={styles.itemSubtitle}>
              Card data is stored locally with encryption. Nothing is sent to a server unless you
              export it yourself.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Reminders</Text>
          <View style={styles.reminderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>Reminder Window</Text>
              <Text style={styles.itemSubtitle}>
                Show bills within the next {reminderWindowDays} day(s)
              </Text>
            </View>
            <View style={styles.stepperContainer}>
              <TouchableOpacity
                style={[styles.stepperButton, (isReminderLoading || isSavingReminder || reminderWindowDays <= 1) && styles.stepperButtonDisabled]}
                onPress={() => updateReminderWindow(-1)}
                disabled={isReminderLoading || isSavingReminder || reminderWindowDays <= 1}
              >
                <Text style={styles.stepperButtonText}>−</Text>
              </TouchableOpacity>
              <View style={styles.stepperValue}>
                {isReminderLoading ? (
                  <ActivityIndicator size="small" color={isDark ? Colors.dark.tint : Colors.light.tint} />
                ) : (
                  <Text style={styles.stepperValueText}>{reminderWindowDays}</Text>
                )}
              </View>
              <TouchableOpacity
                style={[styles.stepperButton, (isReminderLoading || isSavingReminder || reminderWindowDays >= 15) && styles.stepperButtonDisabled]}
                onPress={() => updateReminderWindow(1)}
                disabled={isReminderLoading || isSavingReminder || reminderWindowDays >= 15}
              >
                <Text style={styles.stepperButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.reminderHint}>
            Reminders tab highlights cards whose statements or payments fall within this window.
          </Text>
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
          <View style={styles.deleteAllRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.deleteTitle}>Delete All Cards</Text>
              <Text style={styles.deleteSubtitle}>
                Permanently wipes your vault. Export a backup before continuing.
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.deleteButton, isDeletingAll && styles.deleteButtonDisabled]}
              onPress={handleDeleteAllCards}
              activeOpacity={0.8}
              disabled={isDeletingAll}
            >
              {isDeletingAll ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.deleteButtonText}>Delete</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

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
            <View style={styles.modalSwitchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalSwitchTitle}>Include usage & sorting</Text>
                <Text style={styles.modalSwitchSubtitle}>
                  Keeps copy counts and last-used info in the backup.
                </Text>
              </View>
              <Switch
                value={includeUsageInExport}
                onValueChange={setIncludeUsageInExport}
                trackColor={{
                  false: isDark ? '#3A3A3A' : '#D1D1D1',
                  true: isDark ? Colors.dark.tint : Colors.light.tint,
                }}
                thumbColor="#fff"
              />
            </View>
            <TextInput
              value={exportPassword}
              onChangeText={(value) => {
                setExportPassword(value);
                if (exportPasswordError) {
                  setExportPasswordError(null);
                }
                if (confirmExportPasswordError) {
                  setConfirmExportPasswordError(null);
                }
              }}
              placeholder="Password"
              placeholderTextColor={isDark ? '#6B6B6B' : '#9E9E9E'}
              secureTextEntry
              style={[styles.input, (exportPasswordError || confirmExportPasswordError) && styles.inputError]}
              editable={!isExporting}
            />
            {exportPasswordError && <Text style={styles.errorText}>{exportPasswordError}</Text>}
            <TextInput
              value={confirmExportPassword}
              onChangeText={(value) => {
                setConfirmExportPassword(value);
                if (confirmExportPasswordError) {
                  setConfirmExportPasswordError(null);
                }
              }}
              placeholder="Confirm password"
              placeholderTextColor={isDark ? '#6B6B6B' : '#9E9E9E'}
              secureTextEntry
              style={[styles.input, confirmExportPasswordError && styles.inputError]}
              editable={!isExporting}
            />
            {confirmExportPasswordError && <Text style={styles.errorText}>{confirmExportPasswordError}</Text>}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeExportModal}
                disabled={isExporting}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: Colors.light.tint }]}
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
                style={[styles.modalButton, { backgroundColor: Colors.light.tint }]}
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
    scrollContent: {
      paddingBottom: 32,
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
    privacyCard: {
      marginHorizontal: 4,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: isDark ? 'rgba(0,150,136,0.15)' : '#E6F7F4',
      borderWidth: 1,
      borderColor: isDark ? Colors.dark.inputBorder : '#B8E2DB',
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
    reminderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 12,
      gap: 12,
    },
    reminderHint: {
      marginTop: 8,
      fontSize: 12,
      color: isDark ? Colors.dark.icon : Colors.light.icon,
      paddingHorizontal: 12,
    },
    stepperContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    stepperButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDark ? Colors.dark.inputBackground : '#E6E6E6',
      justifyContent: 'center',
      alignItems: 'center',
    },
    stepperButtonDisabled: {
      opacity: 0.4,
    },
    stepperButtonText: {
      fontSize: 20,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    stepperValue: {
      minWidth: 48,
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDark ? Colors.dark.inputBorder : Colors.light.inputBorder,
      alignItems: 'center',
    },
    stepperValueText: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
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
    modalSwitchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginTop: 16,
    },
    modalSwitchTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    modalSwitchSubtitle: {
      fontSize: 12,
      color: isDark ? Colors.dark.icon : Colors.light.icon,
      marginTop: 4,
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
    deleteAllRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 12,
      gap: 12,
    },
    deleteTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? Colors.dark.destructive : Colors.light.destructive,
    },
    deleteSubtitle: {
      marginTop: 4,
      fontSize: 13,
      color: isDark ? Colors.dark.icon : Colors.light.icon,
    },
    deleteButton: {
      minWidth: 96,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 10,
      backgroundColor: isDark ? Colors.dark.destructive : Colors.light.destructive,
      alignItems: 'center',
      justifyContent: 'center',
    },
    deleteButtonDisabled: {
      opacity: 0.6,
    },
    deleteButtonText: {
      color: '#fff',
      fontWeight: '600',
    },
  });
