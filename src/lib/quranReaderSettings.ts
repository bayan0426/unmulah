export type QuranReaderSettings = {
  fontScale: 'standard' | 'large' | 'x-large';
  lineSpacing: 'comfortable' | 'spacious';
  focusMode: boolean;
};

const SETTINGS_KEY = 'unmulah.quran-reader-settings.v1';
export const DEFAULT_QURAN_READER_SETTINGS: QuranReaderSettings = { fontScale: 'standard', lineSpacing: 'comfortable', focusMode: false };

export function readQuranReaderSettings(storage: Storage = window.localStorage): QuranReaderSettings {
  try {
    const candidate: unknown = JSON.parse(storage.getItem(SETTINGS_KEY) ?? 'null');
    if (!candidate || typeof candidate !== 'object') return DEFAULT_QURAN_READER_SETTINGS;
    const value = candidate as Record<string, unknown>;
    if (!['standard', 'large', 'x-large'].includes(String(value.fontScale)) || !['comfortable', 'spacious'].includes(String(value.lineSpacing)) || typeof value.focusMode !== 'boolean') return DEFAULT_QURAN_READER_SETTINGS;
    return value as QuranReaderSettings;
  } catch { return DEFAULT_QURAN_READER_SETTINGS; }
}

export function saveQuranReaderSettings(settings: QuranReaderSettings, storage: Storage = window.localStorage): QuranReaderSettings {
  const valid = isValid(settings) ? settings : DEFAULT_QURAN_READER_SETTINGS;
  try { storage.setItem(SETTINGS_KEY, JSON.stringify(valid)); } catch { /* Keep the active settings in memory. */ }
  return valid;
}

function isValid(settings: QuranReaderSettings): boolean {
  return ['standard', 'large', 'x-large'].includes(settings.fontScale) && ['comfortable', 'spacious'].includes(settings.lineSpacing) && typeof settings.focusMode === 'boolean';
}
