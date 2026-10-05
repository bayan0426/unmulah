import { describe, expect, it } from 'vitest';
import { getLocalQuranSurah, hasLocalQuranSurah } from '.';

describe('trusted local Quran provider', () => {
  it('exposes only the documented Al-Ikhlas content', () => {
    const surah = getLocalQuranSurah(112);
    expect(surah?.name).toBe('الإخلاص');
    expect(surah?.ayahs).toHaveLength(4);
    expect(hasLocalQuranSurah(112)).toBe(true);
    expect(getLocalQuranSurah(1)).toBeNull();
    expect(hasLocalQuranSurah(1)).toBe(false);
  });
});
