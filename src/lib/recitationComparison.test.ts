import { describe, expect, it } from 'vitest';
import {
  AL_IKHLAS_EXPECTED_RAW_LABELS,
  RECITATION_TARGETS,
  compareAlIkhlasRecitation,
} from './recitationComparison';

const fromRawLabels = (rawLabels: string[]) => rawLabels.map((rawLabel) => ({ rawLabel, arabicLabel: null }));
const expected = AL_IKHLAS_EXPECTED_RAW_LABELS;

describe('Al-Ikhlas deterministic recitation alignment', () => {
  it.each([
    ['ayah-1', 11],
    ['ayah-2', 9],
    ['ayah-3', 12],
    ['ayah-4', 15],
    ['full-surah', 47],
  ])('verifies %s reference length as %i letters', (id, length) => {
    const target = RECITATION_TARGETS.find((entry) => entry.id === id);
    expect(target?.normalized.length).toBe(length);
  });

  it('aligns a perfect sequence', () => {
    const result = compareAlIkhlasRecitation(fromRawLabels(expected));
    expect(result.correct).toBe(47);
    expect(result.missing).toBe(0);
    expect(result.extra).toBe(0);
    expect(result.substitutions).toBe(0);
    expect(result.accuracy).toBe(1);
  });

  it('reports one missing letter', () => {
    const result = compareAlIkhlasRecitation(fromRawLabels(expected.filter((_, index) => index !== 10)));
    expect(result.correct).toBe(46);
    expect(result.missing).toBe(1);
    expect(result.extra).toBe(0);
    expect(result.substitutions).toBe(0);
  });

  it('reports one extra letter', () => {
    const result = compareAlIkhlasRecitation(fromRawLabels([...expected.slice(0, 10), 'nun', ...expected.slice(10)]));
    expect(result.correct).toBe(47);
    expect(result.missing).toBe(0);
    expect(result.extra).toBe(1);
    expect(result.substitutions).toBe(0);
  });

  it('reports one substituted letter', () => {
    const substituted = [...expected];
    substituted[10] = 'nun';
    const result = compareAlIkhlasRecitation(fromRawLabels(substituted));
    expect(result.correct).toBe(46);
    expect(result.missing).toBe(0);
    expect(result.extra).toBe(0);
    expect(result.substitutions).toBe(1);
  });

  it('reports an empty sequence as all letters missing', () => {
    const result = compareAlIkhlasRecitation([]);
    expect(result.correct).toBe(0);
    expect(result.missing).toBe(47);
    expect(result.extra).toBe(0);
    expect(result.substitutions).toBe(0);
    expect(result.accuracy).toBe(0);
  });
});
