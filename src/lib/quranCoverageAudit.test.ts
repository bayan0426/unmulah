import { describe, expect, it } from 'vitest';
import type { KfgqpcSmartRecord } from '../data/quran/kfgqpcSmartProvider';
import { auditKfgqpcSmartCoverage, createRecognitionTargetFromKfgqpc, createVerifiedRecitationTarget } from './quranCoverageAudit';

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

  it('keeps display text and its verified Emlaey machine target distinct', () => {
    const source = record('\uE001\uE002');
    source.aya_text_emlaey = 'قل هو الله أحد';
    const target = createRecognitionTargetFromKfgqpc(source);
    expect(target).toMatchObject({ displayText: '\uE001\uE002', recognitionTargetText: 'قلهواللهاحد', source: 'kfgqpc-emlaey' });
    expect(target?.displayText).not.toBe(target?.recognitionTargetText);
  });

  it('audits the Emlaey target separately from the PUA display text', () => {
    const supported = record('\uE001');
    supported.aya_text_emlaey = 'ا';
    const unsupported = record('\uE002');
    unsupported.id = 2;
    unsupported.aya_no = 2;
    unsupported.aya_text_emlaey = 'ب';
    const audit = auditKfgqpcSmartCoverage([supported, unsupported]);
    expect(audit.emlaey).toMatchObject({ mappedCharacters: ['ا'], unmappedCharacters: ['ب'], fullySupportedAyahs: 1, fullySupportedPercentage: .5, fullySupportedSurahNumbers: [1] });
  });
});
