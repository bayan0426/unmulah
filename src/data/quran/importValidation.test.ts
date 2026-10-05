import { describe, expect, it } from 'vitest';
import { validateImportedQuranAyahs } from './importValidation';

const ayah = { surahNumber: 112, ayahNumber: 1, text: 'قُلۡ هُوَ ٱللَّهُ أَحَدٌ', juz: 30, page: 604, lineStart: 1, lineEnd: 2 };

describe('official Quran import validation', () => {
  it('accepts intact structured metadata', () => expect(validateImportedQuranAyahs([ayah])).toEqual([]));
  it('rejects bad ranges, empty content, and duplicate ayahs without repairing them', () => {
    const errors = validateImportedQuranAyahs([{ ...ayah, surahNumber: 115, text: '' }, ayah]);
    expect(errors.join('\n')).toMatch(/1 to 114/);
    expect(errors.join('\n')).toMatch(/non-empty/);
    expect(validateImportedQuranAyahs([ayah, ayah]).join('\n')).toMatch(/duplicate/);
  });
});
