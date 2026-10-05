import { describe, expect, it } from 'vitest';
import { quranCatalog } from './quranCatalog';
import { filterQuranCatalog, normalizeSurahSearch } from './quranCatalogUtils';

describe('Quran catalogue search', () => {
  it('normalizes common Arabic alef forms only for metadata search', () => {
    expect(normalizeSurahSearch('الإخلاص')).toBe('الاخلاص');
    expect(normalizeSurahSearch('الاخلاص')).toBe('الاخلاص');
  });

  it('searches a name or an exact surah number', () => {
    expect(filterQuranCatalog(quranCatalog, 'الاخلاص', 'all', (surah) => surah.number === 112).map((surah) => surah.number)).toEqual([112]);
    expect(filterQuranCatalog(quranCatalog, '112', 'all', (surah) => surah.number === 112).map((surah) => surah.name)).toEqual(['الإخلاص']);
  });

  it('filters capability availability without modifying catalogue metadata', () => {
    expect(filterQuranCatalog(quranCatalog, '', 'available', (surah) => surah.number === 112).map((surah) => surah.number)).toEqual([112]);
    expect(filterQuranCatalog(quranCatalog, '', 'coming-soon', (surah) => surah.number === 112)).toHaveLength(113);
  });
});
