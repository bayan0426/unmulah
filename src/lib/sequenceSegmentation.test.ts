import { describe, expect, it } from 'vitest';
import {
  EMPTY_SEGMENTATION_STATE,
  RELEASE_FRAME_COUNT,
  observeHand,
  observeNoHand,
  setStableCandidate,
  type SequenceCandidate,
} from './sequenceSegmentation';

const candidate = (rawLabel: string): SequenceCandidate => ({
  rawLabel,
  arabicLabel: rawLabel,
  confidence: 0.9,
  timestamp: 1,
  supportingFrames: 9,
});

describe('candidate → release → commit segmentation', () => {
  it('does not commit a candidate before release', () => {
    let state = setStableCandidate(EMPTY_SEGMENTATION_STATE, candidate('meem'));
    for (let frame = 0; frame < RELEASE_FRAME_COUNT - 1; frame += 1) {
      const result = observeNoHand(state);
      state = result.state;
      expect(result.committed).toBeNull();
    }
    expect(state.candidate?.rawLabel).toBe('meem');
  });

  it('commits exactly once after five no-hand frames', () => {
    let state = setStableCandidate(EMPTY_SEGMENTATION_STATE, candidate('meem'));
    let committed: SequenceCandidate | null = null;
    for (let frame = 0; frame < RELEASE_FRAME_COUNT; frame += 1) {
      const result = observeNoHand(state);
      state = result.state;
      committed = result.committed;
    }
    expect(committed?.rawLabel).toBe('meem');
    expect(state.committedCount).toBe(1);
    expect(observeNoHand(state).committed).toBeNull();
  });

  it('does not append while the same handshape remains present', () => {
    const state = observeHand(setStableCandidate(EMPTY_SEGMENTATION_STATE, candidate('laam')));
    expect(state.candidate?.rawLabel).toBe('laam');
    expect(state.committedCount).toBe(0);
  });

  it('commits the same letter twice when releases separate its candidates', () => {
    let state = setStableCandidate(EMPTY_SEGMENTATION_STATE, candidate('laam'));
    for (let frame = 0; frame < RELEASE_FRAME_COUNT; frame += 1) state = observeNoHand(state).state;
    state = setStableCandidate(state, candidate('laam'));
    for (let frame = 0; frame < RELEASE_FRAME_COUNT; frame += 1) state = observeNoHand(state).state;
    expect(state.committedCount).toBe(2);
  });

  it('replaces a changing candidate without committing transition letters', () => {
    const first = setStableCandidate(EMPTY_SEGMENTATION_STATE, candidate('seen'));
    const replaced = setStableCandidate(first, candidate('meem'));
    expect(replaced.candidate?.rawLabel).toBe('meem');
    expect(replaced.committedCount).toBe(0);
  });
});
