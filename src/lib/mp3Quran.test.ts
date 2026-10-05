import { describe, expect, it } from 'vitest';
import { MP3_QURAN_TIMING_READ, getAyahTimingUrl, getMp3QuranSurahUrl, repeatShouldContinue, timingForAyah } from './mp3Quran';

describe('MP3Quran official timing helpers', () => {
  it('generates the verified reciter and padded surah URLs', () => {
    expect(MP3_QURAN_TIMING_READ.id).toBe(5);
    expect(getMp3QuranSurahUrl(112)).toBe('https://cdn.mp3quran.net/audio/ahmad-ajmi/r1/112.mp3');
    expect(getAyahTimingUrl(112)).toContain('surah=112&read=5');
  });

  it('uses real timing boundaries and deterministic repeat rules', () => {
    expect(timingForAyah([{ ayah: 1, start_time: 110, end_time: 200, polygon: null, page: null }], 1)?.end_time).toBe(200);
    expect(repeatShouldContinue(2, 3)).toBe(true);
    expect(repeatShouldContinue(3, 3)).toBe(false);
    expect(repeatShouldContinue(500, 'continuous')).toBe(true);
  });
});
