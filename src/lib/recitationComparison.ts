import { ARABIC_SIGN_MODEL_LABELS, VERIFIED_ARABIC_SIGN_LABELS, type ArabicSignModelLabel } from '../data/arabicSignLabels';
import { quranSource } from '../data/surahAlIkhlas';

export type RecognizedComparisonItem = {
  rawLabel: string;
  arabicLabel: string | null;
};

export type AlignmentOperation = {
  type: 'correct' | 'missing' | 'extra' | 'substitution';
  expected: string | null;
  recognized: string | null;
  expectedIndex: number | null;
  recognizedIndex: number | null;
};

export type UnresolvedRecognition = {
  rawLabel: string;
  recognizedIndex: number;
};

export type RecitationComparison = {
  targetId: RecitationTargetId;
  targetLabel: string;
  expectedNormalized: string;
  expectedRawLabels: ArabicSignModelLabel[];
  recognizedDebugSequence: string;
  operations: AlignmentOperation[];
  unresolved: UnresolvedRecognition[];
  correct: number;
  missing: number;
  extra: number;
  substitutions: number;
  totalRecognizedLetters: number;
  accuracy: number;
};

const ARABIC_DIACRITICS_AND_QURANIC_MARKS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const ALEF_NORMALIZATION = /[\u0671\u0623\u0625\u0622]/g;
const ARABIC_LETTERS_ONLY = /[^\u0621-\u064A]/g;
export type RecitationTargetId = 'ayah-1' | 'ayah-2' | 'ayah-3' | 'ayah-4' | 'full-surah';

type TargetDefinition = {
  id: RecitationTargetId;
  label: string;
  verseIndexes: number[];
  expectedNormalized: string;
  expectedLength: number;
};

function isModelLabel(rawLabel: string): rawLabel is ArabicSignModelLabel {
  return (ARABIC_SIGN_MODEL_LABELS as readonly string[]).includes(rawLabel);
}

function verifiedArabicCharacter(rawLabel: string): string | null {
  return isModelLabel(rawLabel) ? VERIFIED_ARABIC_SIGN_LABELS[rawLabel] ?? null : null;
}

export function normalizeForAlIkhlasComparison(text: string): string {
  return text
    .replace(ARABIC_DIACRITICS_AND_QURANIC_MARKS, '')
    .replace(ALEF_NORMALIZATION, 'ا')
    .replace(/ى/g, 'ي')
    .replace(ARABIC_LETTERS_ONLY, '');
}

const TARGET_DEFINITIONS: TargetDefinition[] = [
  { id: 'ayah-1', label: 'الآية ١', verseIndexes: [0], expectedNormalized: 'قلهواللهاحد', expectedLength: 11 },
  { id: 'ayah-2', label: 'الآية ٢', verseIndexes: [1], expectedNormalized: 'اللهالصمد', expectedLength: 9 },
  { id: 'ayah-3', label: 'الآية ٣', verseIndexes: [2], expectedNormalized: 'لميلدولميولد', expectedLength: 12 },
  { id: 'ayah-4', label: 'الآية ٤', verseIndexes: [3], expectedNormalized: 'ولميكنلهكفوااحد', expectedLength: 15 },
  { id: 'full-surah', label: 'السورة كاملة', verseIndexes: [0, 1, 2, 3], expectedNormalized: 'قلهواللهاحداللهالصمدلميلدولميولدولميكنلهكفوااحد', expectedLength: 47 },
];

export const RECITATION_TARGETS = TARGET_DEFINITIONS.map((target) => {
  const normalized = normalizeForAlIkhlasComparison(target.verseIndexes.map((index) => quranSource.verses[index].text).join(' '));
  if (normalized !== target.expectedNormalized || normalized.length !== target.expectedLength) {
    throw new Error(`Trusted Al-Ikhlas target ${target.id} did not normalize to its expected reference.`);
  }
  return { ...target, normalized };
});

export function getRecitationTarget(id: RecitationTargetId) {
  const target = RECITATION_TARGETS.find((entry) => entry.id === id);
  if (!target) throw new Error(`Unknown Al-Ikhlas recitation target ${id}.`);
  return target;
}

export const AL_IKHLAS_NORMALIZED_REFERENCE = getRecitationTarget('full-surah').normalized;

const ARABIC_CHARACTER_TO_RAW_LABEL = new Map<string, ArabicSignModelLabel>(
  Object.entries(VERIFIED_ARABIC_SIGN_LABELS).map(([rawLabel, character]) => [character, rawLabel as ArabicSignModelLabel]),
);

export const AL_IKHLAS_EXPECTED_RAW_LABELS = Array.from(AL_IKHLAS_NORMALIZED_REFERENCE, (character) => {
  const rawLabel = ARABIC_CHARACTER_TO_RAW_LABEL.get(character);
  if (!rawLabel) throw new Error(`No verified Arabic-sign label exists for required Al-Ikhlas character ${character}.`);
  return rawLabel;
});

export function expectedRawLabelsForTarget(targetId: RecitationTargetId): ArabicSignModelLabel[] {
  return Array.from(getRecitationTarget(targetId).normalized, (character) => {
    const rawLabel = ARABIC_CHARACTER_TO_RAW_LABEL.get(character);
    if (!rawLabel) throw new Error(`No verified Arabic-sign label exists for required Al-Ikhlas character ${character}.`);
    return rawLabel;
  });
}

export function allowedRawLabelsForTarget(targetId: RecitationTargetId): ArabicSignModelLabel[] {
  return [...new Set(expectedRawLabelsForTarget(targetId))];
}

type AlignmentToken = {
  value: string;
  display: string | null;
};

export function compareAlIkhlasRecitation(
  recognized: RecognizedComparisonItem[],
  targetId: RecitationTargetId = 'full-surah',
): RecitationComparison {
  const target = getRecitationTarget(targetId);
  const unresolved: UnresolvedRecognition[] = [];
  const recognizedTokens: AlignmentToken[] = recognized.map((item, index) => {
    const character = verifiedArabicCharacter(item.rawLabel);
    if (character) return { value: character, display: character };
    unresolved.push({ rawLabel: item.rawLabel, recognizedIndex: index });
    return { value: `\u0000${index}:${item.rawLabel}`, display: null };
  });
  const expected = Array.from(target.normalized);
  const rows = expected.length + 1;
  const columns = recognizedTokens.length + 1;
  const scores = Array.from({ length: rows }, () => Array<number>(columns).fill(0));

  for (let row = 1; row < rows; row += 1) scores[row][0] = row;
  for (let column = 1; column < columns; column += 1) scores[0][column] = column;

  for (let row = 1; row < rows; row += 1) {
    for (let column = 1; column < columns; column += 1) {
      const substitution = scores[row - 1][column - 1] + (expected[row - 1] === recognizedTokens[column - 1].value ? 0 : 1);
      const missing = scores[row - 1][column] + 1;
      const extra = scores[row][column - 1] + 1;
      scores[row][column] = Math.min(substitution, missing, extra);
    }
  }

  const operations: AlignmentOperation[] = [];
  let row = expected.length;
  let column = recognizedTokens.length;
  while (row > 0 || column > 0) {
    const expectedCharacter = row > 0 ? expected[row - 1] : null;
    const recognizedToken = column > 0 ? recognizedTokens[column - 1] : null;
    const same = expectedCharacter !== null && recognizedToken !== null && expectedCharacter === recognizedToken.value;
    const substitutionScore = row > 0 && column > 0
      ? scores[row - 1][column - 1] + (same ? 0 : 1)
      : Number.POSITIVE_INFINITY;
    const missingScore = row > 0 ? scores[row - 1][column] + 1 : Number.POSITIVE_INFINITY;
    const current = scores[row][column];

    if (same && substitutionScore === current) {
      operations.push({ type: 'correct', expected: expectedCharacter, recognized: recognizedToken.display, expectedIndex: row - 1, recognizedIndex: column - 1 });
      row -= 1;
      column -= 1;
    } else if (substitutionScore === current) {
      operations.push({ type: 'substitution', expected: expectedCharacter, recognized: recognizedToken?.display ?? null, expectedIndex: row - 1, recognizedIndex: column - 1 });
      row -= 1;
      column -= 1;
    } else if (missingScore === current) {
      operations.push({ type: 'missing', expected: expectedCharacter, recognized: null, expectedIndex: row - 1, recognizedIndex: null });
      row -= 1;
    } else {
      operations.push({ type: 'extra', expected: null, recognized: recognizedToken?.display ?? null, expectedIndex: null, recognizedIndex: column - 1 });
      column -= 1;
    }
  }
  operations.reverse();

  const correct = operations.filter((operation) => operation.type === 'correct').length;
  const missing = operations.filter((operation) => operation.type === 'missing').length;
  const extra = operations.filter((operation) => operation.type === 'extra').length;
  const substitutions = operations.filter((operation) => operation.type === 'substitution').length;
  const alignmentColumns = correct + missing + extra + substitutions;

  return {
    targetId,
    targetLabel: target.label,
    expectedNormalized: target.normalized,
    expectedRawLabels: expectedRawLabelsForTarget(targetId),
    recognizedDebugSequence: recognized.map((item) => verifiedArabicCharacter(item.rawLabel) ?? `[${item.rawLabel}]`).join(''),
    operations,
    unresolved,
    correct,
    missing,
    extra,
    substitutions,
    totalRecognizedLetters: recognized.length,
    accuracy: alignmentColumns === 0 ? 0 : correct / alignmentColumns,
  };
}
