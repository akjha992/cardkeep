import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = 'app_preferences';

export interface AppPreferences {
  reminderWindowDays: number;
}

const DEFAULT_PREFERENCES: AppPreferences = {
  reminderWindowDays: 5,
};

async function readRawPreferences(): Promise<Partial<AppPreferences>> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to load preferences', error);
    return {};
  }
}

export async function getAppPreferences(): Promise<AppPreferences> {
  const stored = await readRawPreferences();
  return {
    ...DEFAULT_PREFERENCES,
    ...stored,
  };
}

export async function updateAppPreferences(partial: Partial<AppPreferences>): Promise<void> {
  try {
    const current = await readRawPreferences();
    const next = { ...DEFAULT_PREFERENCES, ...current, ...partial };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  } catch (error) {
    console.error('Failed to update preferences', error);
    throw new Error('Unable to save preferences. Please try again.');
  }
}
