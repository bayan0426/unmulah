import type { AcceptedArabicSign } from '../components/HandTrackingCamera';
import type { AlignmentOperation } from './recitationComparison';

export type LiveRecitationFeedback = {
  kind: 'correct' | 'extra' | 'substitution';
  expectedRawLabel: string | null;
  recognizedRawLabel: string;
  expectedIndex: number | null;
};

export function deriveLiveRecitationFeedback(
  expectedRawLabels: readonly string[],
  accepted: readonly Pick<AcceptedArabicSign, 'rawLabel'>[],
): { revealedCount: number; feedback: LiveRecitationFeedback[] } {
  let expectedIndex = 0;
  const feedback: LiveRecitationFeedback[] = [];

  for (const item of accepted) {
    const expectedRawLabel = expectedRawLabels[expectedIndex] ?? null;
    if (expectedRawLabel === item.rawLabel) {
      feedback.push({ kind: 'correct', expectedRawLabel, recognizedRawLabel: item.rawLabel, expectedIndex });
      expectedIndex += 1;
      continue;
    }
    const kind = expectedRawLabels.includes(item.rawLabel) ? 'substitution' : 'extra';
    feedback.push({ kind, expectedRawLabel, recognizedRawLabel: item.rawLabel, expectedIndex: expectedRawLabel ? expectedIndex : null });
  }

  return { revealedCount: expectedIndex, feedback };
}

export function reviewableAlignmentOperations(operations: readonly AlignmentOperation[]): AlignmentOperation[] {
  return operations.filter((operation) => operation.type !== 'correct');
}
