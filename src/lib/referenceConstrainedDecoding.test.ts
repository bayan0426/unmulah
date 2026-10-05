import { describe, expect, it } from 'vitest';
import { ARABIC_SIGN_MODEL_LABELS } from '../data/arabicSignLabels';
import { allowedRawLabelsForTarget } from './recitationComparison';
import {
  CONSTRAINED_CANDIDATE_MIN_CONFIDENCE,
  selectReferenceConstrainedCandidate,
  stabilizedConstrainedCandidate,
} from './referenceConstrainedDecoding';
import { EMPTY_SEGMENTATION_STATE, RELEASE_FRAME_COUNT, observeNoHand, setStableCandidate } from './sequenceSegmentation';

function probabilities(values: Record<string, number>): Float32Array {
  const output = new Float32Array(ARABIC_SIGN_MODEL_LABELS.length);
  for (const [label, probability] of Object.entries(values)) {
    const index = ARABIC_SIGN_MODEL_LABELS.indexOf(label as (typeof ARABIC_SIGN_MODEL_LABELS)[number]);
    if (index >= 0) output[index] = probability;
  }
  return output;
}

describe('reference-constrained decoding', () => {
  const ayahOne = allowedRawLabelsForTarget('ayah-1');

  it('derives the Ayah 1 target vocabulary from its normalized reference', () => {
    expect(ayahOne).toEqual(['gaaf', 'laam', 'ha', 'waw', 'aleff', 'haa', 'dal']);
  });

  it.each(['seen', '9', 'space'])('rejects impossible Ayah 1 class %s from candidate selection', (impossibleLabel) => {
    const result = selectReferenceConstrainedCandidate(probabilities({ [impossibleLabel]: 0.9, laam: 0.1 }), ayahOne);
    expect(result).toBeNull();
  });

  it('rejects a weak allowed probability instead of forcing a target letter', () => {
    const result = selectReferenceConstrainedCandidate(probabilities({ seen: 0.72, laam: CONSTRAINED_CANDIDATE_MIN_CONFIDENCE - 0.01 }), ayahOne);
    expect(result).toBeNull();
  });

  it('keeps original probabilities rather than renormalizing the target subset', () => {
    const result = selectReferenceConstrainedCandidate(probabilities({ seen: 0.72, laam: 0.11, ha: 0.06 }), ayahOne, 0.1);
    expect(result?.rawLabel).toBe('laam');
    expect(result?.confidence).toBeCloseTo(0.11, 6);
    expect(result?.secondBestAllowedConfidence).toBeCloseTo(0.06, 6);
    expect(result?.margin).toBeCloseTo(0.05, 6);
  });

  it('stabilizes a strong allowed candidate after nine of twelve valid frames', () => {
    const laam = selectReferenceConstrainedCandidate(probabilities({ laam: 0.8, ha: 0.1 }), ayahOne)!;
    const ha = selectReferenceConstrainedCandidate(probabilities({ ha: 0.8, laam: 0.1 }), ayahOne)!;
    const stable = stabilizedConstrainedCandidate([...Array(9).fill(laam), ...Array(3).fill(ha)]);
    expect(stable?.rawLabel).toBe('laam');
    expect(stable?.count).toBe(9);
  });

  it('still requires a five-frame release after a constrained candidate', () => {
    const constrained = selectReferenceConstrainedCandidate(probabilities({ laam: 0.8 }), ayahOne)!;
    let state = setStableCandidate(EMPTY_SEGMENTATION_STATE, { ...constrained, timestamp: 1, supportingFrames: 9 });
    for (let index = 0; index < RELEASE_FRAME_COUNT - 1; index += 1) state = observeNoHand(state).state;
    expect(state.candidate?.rawLabel).toBe('laam');
    expect(observeNoHand(state).committed?.rawLabel).toBe('laam');
  });

  it('derives the full Surah target vocabulary from its own reference', () => {
    expect(allowedRawLabelsForTarget('full-surah')).toEqual([
      'gaaf', 'laam', 'ha', 'waw', 'aleff', 'haa', 'dal', 'saad', 'meem', 'yaa', 'kaaf', 'nun', 'fa',
    ]);
  });
});
