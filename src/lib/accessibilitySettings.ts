export type AccessibilitySettings = { textSize: 'standard' | 'large' | 'x-large'; highContrast: boolean; reducedMotion: boolean };

const KEY = 'unmulah.accessibility-settings.v1';
export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = { textSize: 'standard', highContrast: false, reducedMotion: false };

export function readAccessibilitySettings(storage: Storage = window.localStorage): AccessibilitySettings {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(KEY) ?? 'null');
    if (!parsed || typeof parsed !== 'object') return DEFAULT_ACCESSIBILITY_SETTINGS;
    const value = parsed as Record<string, unknown>;
    if (!['standard', 'large', 'x-large'].includes(String(value.textSize)) || typeof value.highContrast !== 'boolean' || typeof value.reducedMotion !== 'boolean') return DEFAULT_ACCESSIBILITY_SETTINGS;
    return value as AccessibilitySettings;
  } catch { return DEFAULT_ACCESSIBILITY_SETTINGS; }
}

export function saveAccessibilitySettings(settings: AccessibilitySettings, storage: Storage = window.localStorage): AccessibilitySettings {
  const valid = ['standard', 'large', 'x-large'].includes(settings.textSize) && typeof settings.highContrast === 'boolean' && typeof settings.reducedMotion === 'boolean' ? settings : DEFAULT_ACCESSIBILITY_SETTINGS;
  try { storage.setItem(KEY, JSON.stringify(valid)); } catch { /* Current-session settings still apply. */ }
  return valid;
}

export function clearAccessibilitySettings(storage: Storage = window.localStorage) { try { storage.removeItem(KEY); } catch { /* no-op */ } }
