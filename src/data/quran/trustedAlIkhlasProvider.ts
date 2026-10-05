import { quranSource } from '../surahAlIkhlas';
import type { QuranProvider, QuranSurahContent } from './types';

const source = {
  id: 'kfgqpc-hafs-v18-pinned-mirror',
  organization: 'King Fahd Glorious Quran Printing Complex (upstream attribution)',
  title: 'KFGQPC Hafs Uthmanic Data v0.18',
  url: quranSource.sourceUrl,
  license: 'Not verified for redistribution',
  redistribution: 'not-verified' as const,
  notes: `Pinned mirror ${quranSource.mirrorCommit}; only Surah 112 is included locally. See docs/SOURCES.md.`,
};

const alIkhlas: QuranSurahContent = {
  surahNumber: quranSource.surahNumber,
  name: quranSource.surahName,
  riwaya: quranSource.riwaya,
  script: quranSource.script,
  ayahs: quranSource.verses.map((verse) => ({
    surahNumber: quranSource.surahNumber,
    ayahNumber: verse.number,
    text: verse.text,
  })),
  source,
};

export const trustedAlIkhlasProvider: QuranProvider = {
  id: source.id,
  source,
  getSurah: (surahNumber) => surahNumber === alIkhlas.surahNumber ? alIkhlas : null,
  hasSurah: (surahNumber) => surahNumber === alIkhlas.surahNumber,
};
