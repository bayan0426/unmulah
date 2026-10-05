export type QuranAyah = {
  surahNumber: number;
  ayahNumber: number;
  text: string;
  juz?: number;
  page?: number;
  lineStart?: number;
  lineEnd?: number;
};

export type QuranSurahContent = {
  surahNumber: number;
  name: string;
  riwaya: string;
  script: string;
  ayahs: readonly QuranAyah[];
  source: QuranSourceProvenance;
};

export type QuranSourceProvenance = {
  id: string;
  organization: string;
  title: string;
  url: string;
  license: string;
  redistribution: 'verified' | 'not-verified';
  notes: string;
};

export interface QuranProvider {
  readonly id: string;
  readonly source: QuranSourceProvenance;
  getSurah(surahNumber: number): QuranSurahContent | null;
  hasSurah(surahNumber: number): boolean;
}
