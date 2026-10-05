import { describe, expect, it } from 'vitest';
import { MP3_QURAN_TIMING_READ, getAyahTimingUrl, getMp3QuranSurahUrl, loadTimingReciters, readSavedReciter, repeatShouldContinue, timingForAyah, timingRange } from './mp3Quran';

describe('MP3Quran official timing helpers', () => {
  it('generates the verified reciter and padded surah URLs', () => {
    expect(MP3_QURAN_TIMING_READ.id).toBe(5);
    expect(getMp3QuranSurahUrl(112)).toBe('https://cdn.mp3quran.net/audio/ahmad-ajmi/r1/112.mp3');
    expect(getAyahTimingUrl(112)).toContain('surah=112&read=5');
  });

  it('uses real timing boundaries and deterministic repeat rules', () => {
    const timings = [{ ayah: 1, start_time: 110, end_time: 200, polygon: null, page: null }, { ayah: 2, start_time: 201, end_time: 300, polygon: null, page: null }];
    expect(timingForAyah(timings, 1)?.end_time).toBe(200);
    expect(timingRange(timings, 1, 2)).toMatchObject({ start: { start_time: 110 }, end: { end_time: 300 } });
    expect(timingRange(timings, 2, 1)).toBeNull();
    expect(repeatShouldContinue(2, 3)).toBe(true);
    expect(repeatShouldContinue(3, 3)).toBe(false);
    expect(repeatShouldContinue(500, 'continuous')).toBe(true);
  });

  it('keeps verified full-Hafs audio-only reciters and recovers from stale storage', async () => {
    const fetcher = async () => new Response(JSON.stringify([{ id: 5, name: 'أحمد بن علي العجمي', rewaya: 'حفص عن عاصم', folder_url: 'https://cdn.mp3quran.net/audio/ahmad-ajmi/r1/', soar_count: 114 }]));
    const reciters = await loadTimingReciters(fetcher as typeof fetch);
    expect(reciters.find((reciter) => reciter.name === 'فيصل الهاجري')).toMatchObject({ availableSurahs: 114, supportsAyahTiming: false });
    const storage = { getItem: () => '999999' } as unknown as Storage;
    expect(readSavedReciter(reciters, storage).id).toBe(5);
  });
});
