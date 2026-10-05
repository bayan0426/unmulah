export const RELEASE_FRAME_COUNT = 5;

export type SequenceCandidate = {
  rawLabel: string;
  arabicLabel: string | null;
  confidence: number;
  timestamp: number;
  supportingFrames: number;
};

export type SegmentationState = {
  candidate: SequenceCandidate | null;
  releaseFrameCount: number;
  committedCount: number;
};

export const EMPTY_SEGMENTATION_STATE: SegmentationState = {
  candidate: null,
  releaseFrameCount: 0,
  committedCount: 0,
};

export function setStableCandidate(state: SegmentationState, candidate: SequenceCandidate): SegmentationState {
  return { ...state, candidate, releaseFrameCount: 0 };
}

export function observeHand(state: SegmentationState): SegmentationState {
  return state.releaseFrameCount === 0 ? state : { ...state, releaseFrameCount: 0 };
}

export function observeNoHand(state: SegmentationState): { state: SegmentationState; committed: SequenceCandidate | null } {
  if (!state.candidate) return { state: { ...state, releaseFrameCount: 0 }, committed: null };
  const releaseFrameCount = state.releaseFrameCount + 1;
  if (releaseFrameCount < RELEASE_FRAME_COUNT) {
    return { state: { ...state, releaseFrameCount }, committed: null };
  }

  return {
    state: {
      candidate: null,
      releaseFrameCount: 0,
      committedCount: state.committedCount + 1,
    },
    committed: state.candidate,
  };
}
