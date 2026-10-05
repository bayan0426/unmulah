import { VERIFIED_ARABIC_SIGN_LABELS, type ArabicSignModelLabel } from '../data/arabicSignLabels';
import type { KfgqpcSmartRecord } from '../data/quran/kfgqpcSmartProvider';

export type QuranCoverageAudit = {
  totalAyahs: number;
  displayEncodingBlockedAyahs: number;
  auditableArabicLetters: number;
  mappedArabicLetters: number;
  uniqueNormalizedArabicCharacters: string[];
  mappedArabicCharacters: string[];
  unmappedArabicLetters: string[];
  fullySupportedAyahs: number;
  fullySupportedPercentage: number;
  fullySupportedSurahNumbers: number[];
  canCreateVerifiedRecitationTargets: boolean;
  emlaey: MachineTargetCoverage;
};

export type MachineTargetCoverage = {
  uniqueArabicCharacters: Array<{ character: string; occurrences: number; rawLabel: ArabicSignModelLabel | null }>;
  mappedCharacters: string[];
  unmappedCharacters: string[];
  fullySupportedAyahs: number;
  fullySupportedPercentage: number;
  fullySupportedSurahNumbers: number[];
};

export type VerifiedRecitationTarget = {
  normalizedText: string;
  expectedRawLabels: ArabicSignModelLabel[];
};

export type KfgqpcRecognitionTarget = VerifiedRecitationTarget & {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  displayText: string;
  recognitionTargetText: string;
  source: 'kfgqpc-emlaey';
};

const ARABIC_DIACRITICS_AND_QURANIC_MARKS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const ALEF_NORMALIZATION = /[\u0671\u0623\u0625\u0622]/g;
const ARABIC_LETTERS_ONLY = /[^\u0621-\u064A]/g;
const PRIVATE_USE_GLYPH = /[\uE000-\uF8FF]/;

const characterToRawLabel = new Map<string, ArabicSignModelLabel>(
  Object.entries(VERIFIED_ARABIC_SIGN_LABELS).map(([rawLabel, character]) => [character, rawLabel as ArabicSignModelLabel]),
);

export function normalizeArabicForCoverage(text: string): string {
  return text
    .replace(ARABIC_DIACRITICS_AND_QURANIC_MARKS, '')
    .replace(ALEF_NORMALIZATION, 'ا')
    .replace(/ى/g, 'ي')
    .replace(ARABIC_LETTERS_ONLY, '');
}

export function createVerifiedRecitationTarget(arabicText: string): VerifiedRecitationTarget | null {
  const normalizedText = normalizeArabicForCoverage(arabicText);
  if (!normalizedText) return null;
  const expectedRawLabels = Array.from(normalizedText, (character) => characterToRawLabel.get(character));
  if (expectedRawLabels.some((rawLabel) => !rawLabel)) return null;
  return { normalizedText, expectedRawLabels: expectedRawLabels as ArabicSignModelLabel[] };
}

/**
 * `aya_text` remains the only Quran display text. The KFGQPC-supplied Emlaey
 * field is used here solely as a non-displayed, machine-readable comparison
 * target after every character is checked against the verified classifier map.
 */
export function createRecognitionTargetFromKfgqpc(record: KfgqpcSmartRecord): KfgqpcRecognitionTarget | null {
  const target = createVerifiedRecitationTarget(record.aya_text_emlaey);
  if (!target) return null;
  return {
    ...target,
    id: `kfgqpc:${record.sura_no}:${record.aya_no}`,
    surahNumber: record.sura_no,
    ayahNumber: record.aya_no,
    displayText: record.aya_text,
    recognitionTargetText: target.normalizedText,
    source: 'kfgqpc-emlaey',
  };
}

export function auditKfgqpcSmartCoverage(records: readonly KfgqpcSmartRecord[]): QuranCoverageAudit {
  const observed = new Set<string>();
  const mapped = new Set<string>();
  const unmapped = new Set<string>();
  let displayEncodingBlockedAyahs = 0;
  let auditableArabicLetters = 0;
  let mappedArabicLetters = 0;
  let fullySupportedAyahs = 0;
  const fullySupportedSurahs = new Set<number>();
  const emlaeyCounts = new Map<string, number>();
  let emlaeyFullySupportedAyahs = 0;
  const emlaeyFullySupportedSurahs = new Set<number>();

  for (const record of records) {
    const emlaeyTarget = createVerifiedRecitationTarget(record.aya_text_emlaey);
    for (const character of normalizeArabicForCoverage(record.aya_text_emlaey)) {
      emlaeyCounts.set(character, (emlaeyCounts.get(character) ?? 0) + 1);
    }
    if (emlaeyTarget) {
      emlaeyFullySupportedAyahs += 1;
      emlaeyFullySupportedSurahs.add(record.sura_no);
    }
    if (PRIVATE_USE_GLYPH.test(record.aya_text)) {
      displayEncodingBlockedAyahs += 1;
      continue;
    }
    const normalized = normalizeArabicForCoverage(record.aya_text);
    let ayahIsFullySupported = normalized.length > 0;
    for (const character of normalized) {
      observed.add(character);
      auditableArabicLetters += 1;
      if (characterToRawLabel.has(character)) {
        mappedArabicLetters += 1;
        mapped.add(character);
      } else {
        unmapped.add(character);
        ayahIsFullySupported = false;
      }
    }
    if (ayahIsFullySupported) {
      fullySupportedAyahs += 1;
      fullySupportedSurahs.add(record.sura_no);
    }
  }

  return {
    totalAyahs: records.length,
    displayEncodingBlockedAyahs,
    auditableArabicLetters,
    mappedArabicLetters,
    uniqueNormalizedArabicCharacters: [...observed].sort(),
    mappedArabicCharacters: [...mapped].sort(),
    unmappedArabicLetters: [...unmapped].sort(),
    fullySupportedAyahs,
    fullySupportedPercentage: records.length === 0 ? 0 : fullySupportedAyahs / records.length,
    fullySupportedSurahNumbers: [...fullySupportedSurahs].sort((first, second) => first - second),
    canCreateVerifiedRecitationTargets: displayEncodingBlockedAyahs === 0 && fullySupportedAyahs === records.length && records.length > 0,
    emlaey: {
      uniqueArabicCharacters: [...emlaeyCounts.entries()].sort(([first], [second]) => first.localeCompare(second, 'ar')).map(([character, occurrences]) => ({ character, occurrences, rawLabel: characterToRawLabel.get(character) ?? null })),
      mappedCharacters: [...emlaeyCounts.keys()].filter((character) => characterToRawLabel.has(character)).sort(),
      unmappedCharacters: [...emlaeyCounts.keys()].filter((character) => !characterToRawLabel.has(character)).sort(),
      fullySupportedAyahs: emlaeyFullySupportedAyahs,
      fullySupportedPercentage: records.length === 0 ? 0 : emlaeyFullySupportedAyahs / records.length,
      fullySupportedSurahNumbers: [...emlaeyFullySupportedSurahs].sort((first, second) => first - second),
    },
  };
}
