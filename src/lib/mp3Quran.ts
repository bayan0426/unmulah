export type Mp3QuranReciter = { id: number; name: string; rewaya: string; folderUrl: string; availableSurahs: number; supportsSurahAudio: boolean; supportsAyahTiming: boolean; source: string };
export const MP3_QURAN_TIMING_READ: Mp3QuranReciter = {
  id: 5,
  name: 'أحمد بن علي العجمي',
  rewaya: 'حفص عن عاصم',
  folderUrl: 'https://cdn.mp3quran.net/audio/ahmad-ajmi/r1/', availableSurahs: 114, supportsSurahAudio: true, supportsAyahTiming: true,
  source: 'https://www.mp3quran.net/ar/api',
} as const;
const RECITERS_URL = 'https://www.mp3quran.net/api/v3/ayat_timing/reads';
const RECITER_STORAGE_KEY = 'unmulah.audio.reciter.v1';
const VERIFIED_AUDIO_ONLY_RECITERS: Mp3QuranReciter[] = [
  { id: 301, name: 'فيصل الهاجري', rewaya: 'حفص عن عاصم', folderUrl: 'https://cdn.mp3quran.net/audio/faisal-hajri/r1/', availableSurahs: 114, supportsSurahAudio: true, supportsAyahTiming: false, source: 'https://www.mp3quran.net/api/v3/reciters?language=ar' },
  { id: 21148, name: 'عبدالبديع غيلان', rewaya: 'حفص عن عاصم', folderUrl: 'https://cdn.mp3quran.net/audio/abdulbadi-ghailan/r1/', availableSurahs: 114, supportsSurahAudio: true, supportsAyahTiming: false, source: 'https://www.mp3quran.net/api/v3/reciters?language=ar' },
];
export async function loadTimingReciters(fetcher: typeof fetch = fetch): Promise<Mp3QuranReciter[]> { const response = await fetcher(RECITERS_URL); if (!response.ok) throw new Error('MP3Quran reciters failed to load.'); const payload: unknown = await response.json(); if (!Array.isArray(payload)) throw new Error('Invalid MP3Quran reciter response.'); const timed = payload.filter((r): r is Record<string, unknown> => !!r && typeof r === 'object').filter((r) => r.rewaya === 'حفص عن عاصم' && r.soar_count === 114 && typeof r.id === 'number' && typeof r.name === 'string' && typeof r.folder_url === 'string' && r.folder_url.startsWith('https://')).map((r) => ({ id: r.id as number, name: r.name as string, rewaya: r.rewaya as string, folderUrl: r.folder_url as string, availableSurahs: r.soar_count as number, supportsSurahAudio: true, supportsAyahTiming: true, source: RECITERS_URL })); return [...timed, ...VERIFIED_AUDIO_ONLY_RECITERS.filter((candidate) => !timed.some((item) => item.id === candidate.id))]; }
export function readSavedReciter(reciters: readonly Mp3QuranReciter[], storage: Storage = window.localStorage): Mp3QuranReciter { try { const id = Number(storage.getItem(RECITER_STORAGE_KEY)); return reciters.find((r) => r.id === id) ?? reciters.find((r) => r.id === MP3_QURAN_TIMING_READ.id) ?? reciters[0] ?? MP3_QURAN_TIMING_READ; } catch { return reciters.find((r) => r.id === MP3_QURAN_TIMING_READ.id) ?? MP3_QURAN_TIMING_READ; } }
export function saveSelectedReciter(reciter: Mp3QuranReciter, storage: Storage = window.localStorage) { try { storage.setItem(RECITER_STORAGE_KEY, String(reciter.id)); } catch { /* session only */ } }

export type AyahTiming = {
  ayah: number;
  start_time: number;
  end_time: number;
  polygon: string | null;
  page: string | null;
};

export function getMp3QuranSurahUrl(surahNumber: number, reciter: Mp3QuranReciter = MP3_QURAN_TIMING_READ): string {
  if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) throw new Error('Invalid Quran surah number.');
  return `${reciter.folderUrl}${String(surahNumber).padStart(3, '0')}.mp3`;
}

export function getAyahTimingUrl(surahNumber: number, reciter: Mp3QuranReciter = MP3_QURAN_TIMING_READ): string {
  if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) throw new Error('Invalid Quran surah number.');
  return `https://www.mp3quran.net/api/v3/ayat_timing?surah=${surahNumber}&read=${reciter.id}`;
}

export async function loadAyahTimings(surahNumber: number, reciter: Mp3QuranReciter = MP3_QURAN_TIMING_READ, fetcher: typeof fetch = fetch): Promise<AyahTiming[]> {
  const response = await fetcher(getAyahTimingUrl(surahNumber, reciter));
  if (!response.ok) throw new Error(`MP3Quran timings failed to load (${response.status}).`);
  const payload: unknown = await response.json();
  if (!Array.isArray(payload)) throw new Error('MP3Quran timings returned an invalid response.');
  return payload.filter(isAyahTiming);
}

export function timingForAyah(timings: readonly AyahTiming[], ayahNumber: number): AyahTiming | null {
  return timings.find((timing) => timing.ayah === ayahNumber) ?? null;
}

export function timingRange(timings: readonly AyahTiming[], startAyah: number, endAyah: number): { start: AyahTiming; end: AyahTiming } | null {
  if (startAyah > endAyah) return null;
  const start = timingForAyah(timings, startAyah);
  const end = timingForAyah(timings, endAyah);
  return start && end ? { start, end } : null;
}

export function repeatShouldContinue(completedRepeats: number, repeatCount: number | 'continuous'): boolean {
  return repeatCount === 'continuous' || completedRepeats < repeatCount;
}

function isAyahTiming(value: unknown): value is AyahTiming {
  if (!value || typeof value !== 'object') return false;
  const timing = value as Record<string, unknown>;
  return typeof timing.ayah === 'number' && typeof timing.start_time === 'number' && typeof timing.end_time === 'number' && (timing.polygon === null || typeof timing.polygon === 'string') && (timing.page === null || typeof timing.page === 'string');
}
