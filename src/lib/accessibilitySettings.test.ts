import { describe, expect, it } from 'vitest';
import { DEFAULT_ACCESSIBILITY_SETTINGS, readAccessibilitySettings, saveAccessibilitySettings } from './accessibilitySettings';

describe('local accessibility settings', () => {
  it('falls back safely when storage is malformed', () => {
    expect(readAccessibilitySettings({ getItem: () => '{bad' } as unknown as Storage)).toEqual(DEFAULT_ACCESSIBILITY_SETTINGS);
  });
  it('persists only explicit presentation preferences', () => {
    let value = '';
    const storage = { getItem: () => value || null, setItem: (_key: string, next: string) => { value = next; } } as unknown as Storage;
    saveAccessibilitySettings({ textSize: 'large', highContrast: true, reducedMotion: true }, storage);
    expect(readAccessibilitySettings(storage)).toEqual({ textSize: 'large', highContrast: true, reducedMotion: true });
  });
});
