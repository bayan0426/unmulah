import { trustedAlIkhlasProvider } from './trustedAlIkhlasProvider';
import type { QuranProvider, QuranSurahContent } from './types';

// Future official imports can be registered here without changing readers.
const providers: readonly QuranProvider[] = [trustedAlIkhlasProvider];

export function getLocalQuranSurah(surahNumber: number): QuranSurahContent | null {
  return providers.map((provider) => provider.getSurah(surahNumber)).find(Boolean) ?? null;
}

export function hasLocalQuranSurah(surahNumber: number): boolean {
  return providers.some((provider) => provider.hasSurah(surahNumber));
}

export type { QuranAyah, QuranProvider, QuranSourceProvenance, QuranSurahContent } from './types';
