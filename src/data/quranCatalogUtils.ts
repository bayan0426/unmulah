import type { QuranSurah } from './quranCatalog';

export type QuranCatalogFilter = 'all' | 'available' | 'coming-soon';

export function normalizeSurahSearch(value: string): string {
  return value
    .trim()
    .replace(/[ً-ٰٟ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ـ/g, '')
    .replace(/\s+/g, ' ');
}

export function filterQuranCatalog(
  catalog: readonly QuranSurah[],
  query: string,
  filter: QuranCatalogFilter,
  isAvailable: (surah: QuranSurah) => boolean,
): QuranSurah[] {
  const normalizedQuery = normalizeSurahSearch(query);
  return catalog.filter((surah) => {
    const matchesQuery = !normalizedQuery || normalizeSurahSearch(surah.name).includes(normalizedQuery) || String(surah.number) === normalizedQuery;
    const available = isAvailable(surah);
    const matchesFilter = filter === 'all' || (filter === 'available' ? available : !available);
    return matchesQuery && matchesFilter;
  });
}
