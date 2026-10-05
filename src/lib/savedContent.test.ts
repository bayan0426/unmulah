import { describe, expect, it } from 'vitest';
import { clearSavedContent, readSavedContent, removeSavedContent, saveQuranAyah } from './savedContent';

function memoryStorage(): Storage { const values = new Map<string, string>(); return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } } as unknown as Storage; }
const ayah = { surahNumber: 112, surahName: 'الإخلاص', ayahNumber: 1, page: 604, juz: 30 };

describe('saved content', () => {
  it('keeps Quran references locally without copying display text', () => {
    const storage = memoryStorage();
    expect(saveQuranAyah(ayah, storage)).toHaveLength(1);
    expect(saveQuranAyah(ayah, storage)).toHaveLength(1);
    expect(readSavedContent(storage)[0]).toMatchObject({ id: 'quran:112:1', kind: 'quran-ayah', surahName: 'الإخلاص' });
  });
  it('removes and clears local saved references', () => {
    const storage = memoryStorage(); saveQuranAyah(ayah, storage);
    expect(removeSavedContent('quran:112:1', storage)).toEqual([]);
    saveQuranAyah(ayah, storage); expect(clearSavedContent(storage)).toEqual([]);
  });
});
