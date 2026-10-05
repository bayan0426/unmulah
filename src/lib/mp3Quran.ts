export const MP3_QURAN_TIMING_READ = {
  id: 5,
  name: 'أحمد بن علي العجمي',
  rewaya: 'حفص عن عاصم',
  folderUrl: 'https://cdn.mp3quran.net/audio/ahmad-ajmi/r1/',
  sourceUrl: 'https://www.mp3quran.net/ar/api',
} as const;

export type AyahTiming = {
  ayah: number;
  start_time: number;
  end_time: number;
  polygon: string | null;
  page: string | null;
};

export function getMp3QuranSurahUrl(surahNumber: number): string {
  if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) throw new Error('Invalid Quran surah number.');
  return `${MP3_QURAN_TIMING_READ.folderUrl}${String(surahNumber).padStart(3, '0')}.mp3`;
}

export function getAyahTimingUrl(surahNumber: number): string {
  if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) throw new Error('Invalid Quran surah number.');
  return `https://www.mp3quran.net/api/v3/ayat_timing?surah=${surahNumber}&read=${MP3_QURAN_TIMING_READ.id}`;
}

export async function loadAyahTimings(surahNumber: number, fetcher: typeof fetch = fetch): Promise<AyahTiming[]> {
  const response = await fetcher(getAyahTimingUrl(surahNumber));
  if (!response.ok) throw new Error(`MP3Quran timings failed to load (${response.status}).`);
  const payload: unknown = await response.json();
  if (!Array.isArray(payload)) throw new Error('MP3Quran timings returned an invalid response.');
  return payload.filter(isAyahTiming);
}

export function timingForAyah(timings: readonly AyahTiming[], ayahNumber: number): AyahTiming | null {
  return timings.find((timing) => timing.ayah === ayahNumber) ?? null;
}

export function repeatShouldContinue(completedRepeats: number, repeatCount: number | 'continuous'): boolean {
  return repeatCount === 'continuous' || completedRepeats < repeatCount;
}

function isAyahTiming(value: unknown): value is AyahTiming {
  if (!value || typeof value !== 'object') return false;
  const timing = value as Record<string, unknown>;
  return typeof timing.ayah === 'number' && typeof timing.start_time === 'number' && typeof timing.end_time === 'number' && (timing.polygon === null || typeof timing.polygon === 'string') && (timing.page === null || typeof timing.page === 'string');
}
