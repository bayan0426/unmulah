import { describe, expect, it } from 'vitest';
import { deriveLiveRecitationFeedback, reviewableAlignmentOperations } from './quranLiveRecitation';

describe('inline Mushaf live recitation feedback', () => {
  it('reveals only consecutive correct reference tokens', () => {
    const state = deriveLiveRecitationFeedback(['qaaf', 'laam', 'haa'], [{ rawLabel: 'qaaf' }, { rawLabel: 'laam' }]);
    expect(state.revealedCount).toBe(2);
    expect(state.feedback.map((item) => item.kind)).toEqual(['correct', 'correct']);
  });

  it('does not reveal a reference token for a wrong or extra classifier output', () => {
    const state = deriveLiveRecitationFeedback(['qaaf', 'laam'], [{ rawLabel: 'meem' }, { rawLabel: 'space' }]);
    expect(state.revealedCount).toBe(0);
    expect(state.feedback.map((item) => item.kind)).toEqual(['extra', 'extra']);
  });

  it('keeps substitution feedback separate from the official reference reveal', () => {
    const state = deriveLiveRecitationFeedback(['qaaf', 'laam'], [{ rawLabel: 'laam' }]);
    expect(state.revealedCount).toBe(0);
    expect(state.feedback[0]).toMatchObject({ kind: 'substitution', expectedRawLabel: 'qaaf', recognizedRawLabel: 'laam' });
  });

  it('exposes only non-correct operations for error review', () => {
    expect(reviewableAlignmentOperations([
      { type: 'correct', expected: 'ق', recognized: 'ق', expectedIndex: 0, recognizedIndex: 0 },
      { type: 'missing', expected: 'ل', recognized: null, expectedIndex: 1, recognizedIndex: null },
    ])).toHaveLength(1);
  });
});
