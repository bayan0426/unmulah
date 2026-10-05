import { describe, expect, it } from 'vitest';
import type { KfgqpcSmartRecord } from '../data/quran/kfgqpcSmartProvider';
import { auditKfgqpcSmartCoverage, createVerifiedRecitationTarget } from './quranCoverageAudit';

const record = (aya_text: string): KfgqpcSmartRecord => ({
  id: 1, jozz: 1, sura_no: 1, sura_name_en: 'Test', sura_name_ar: 'اختبار', page: 1,
  line_start: 1, line_end: 1, aya_no: 1, aya_text, aya_text_emlaey: 'لا يستخدم هنا',
});

describe('Quran-wide recitation coverage audit', () => {
  it('only creates a target from Arabic display text with verified labels', () => {
    expect(createVerifiedRecitationTarget('قُلْ هُوَ اللَّهُ أَحَدٌ')).toEqual({
      normalizedText: 'قلهواللهاحد',
      expectedRawLabels: ['gaaf', 'laam', 'ha', 'waw', 'aleff', 'laam', 'laam', 'ha', 'aleff', 'haa', 'dal'],
    });
    expect(createVerifiedRecitationTarget('ب')).toBeNull();
  });

  it('reports KFGQPC private-use display glyphs as an explicit target-generation blocker', () => {
    const result = auditKfgqpcSmartCoverage([record('\uE001\uE002')]);
    expect(result).toMatchObject({
      totalAyahs: 1,
      displayEncodingBlockedAyahs: 1,
      auditableArabicLetters: 0,
      fullySupportedAyahs: 0,
      fullySupportedPercentage: 0,
      fullySupportedSurahNumbers: [],
      canCreateVerifiedRecitationTargets: false,
    });
  });
});
