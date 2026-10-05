import { describe, expect, it } from 'vitest';
import { DEFAULT_QURAN_READER_SETTINGS, readQuranReaderSettings, saveQuranReaderSettings } from './quranReaderSettings';

function storageWith(value: string | null): Storage {
  return { getItem: () => value, setItem: () => undefined } as unknown as Storage;
}

describe('Quran reader settings', () => {
  it('recovers safely from malformed stored settings', () => {
    expect(readQuranReaderSettings(storageWith('{oops'))).toEqual(DEFAULT_QURAN_READER_SETTINGS);
    expect(readQuranReaderSettings(storageWith('{"fontScale":"huge"}'))).toEqual(DEFAULT_QURAN_READER_SETTINGS);
  });

  it('stores only valid presentation preferences', () => {
    let saved = '';
    const storage = { getItem: () => saved || null, setItem: (_key: string, value: string) => { saved = value; } } as unknown as Storage;
    saveQuranReaderSettings({ fontScale: 'x-large', lineSpacing: 'spacious', focusMode: true }, storage);
    expect(readQuranReaderSettings(storage)).toEqual({ fontScale: 'x-large', lineSpacing: 'spacious', focusMode: true });
  });
});
