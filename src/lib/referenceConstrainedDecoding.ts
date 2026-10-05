import { ARABIC_SIGN_MODEL_LABELS, VERIFIED_ARABIC_SIGN_LABELS, type ArabicSignModelLabel } from '../data/arabicSignLabels';

export const CONSTRAINED_CANDIDATE_MIN_CONFIDENCE = 0.2;
export const STABILITY_WINDOW_SIZE = 12;
export const STABILITY_MIN_DOMINANT_FRAMES = 9;

export type ConstrainedPrediction = {
  rawLabel: ArabicSignModelLabel;
  arabicLabel: string | null;
  confidence: number;
  secondBestAllowedConfidence: number;
  margin: number;
};

export type ConstrainedCandidateDiagnostics = ConstrainedPrediction & {
  isValid: boolean;
};

export function inspectReferenceConstrainedCandidate(
  probabilities: ArrayLike<number>,
  allowedRawLabels: readonly ArabicSignModelLabel[],
  minimumConfidence = CONSTRAINED_CANDIDATE_MIN_CONFIDENCE,
): ConstrainedCandidateDiagnostics | null {
  if (probabilities.length !== ARABIC_SIGN_MODEL_LABELS.length) {
    throw new Error(`Expected ${ARABIC_SIGN_MODEL_LABELS.length} model probabilities.`);
  }

  let bestLabel: ArabicSignModelLabel | null = null;
  let bestProbability = -Infinity;
  let secondBestProbability = -Infinity;
  for (const rawLabel of allowedRawLabels) {
    const index = ARABIC_SIGN_MODEL_LABELS.indexOf(rawLabel);
    if (index < 0) continue;
    const probability = probabilities[index];
    if (probability > bestProbability) {
      secondBestProbability = bestProbability;
      bestProbability = probability;
      bestLabel = rawLabel;
    } else if (probability > secondBestProbability) {
      secondBestProbability = probability;
    }
  }

  if (!bestLabel) return null;
  const second = Number.isFinite(secondBestProbability) ? secondBestProbability : 0;
  return {
    rawLabel: bestLabel,
    arabicLabel: VERIFIED_ARABIC_SIGN_LABELS[bestLabel] ?? null,
    confidence: bestProbability,
    secondBestAllowedConfidence: second,
    margin: bestProbability - second,
    isValid: bestProbability >= minimumConfidence,
  };
}

export function selectReferenceConstrainedCandidate(
  probabilities: ArrayLike<number>,
  allowedRawLabels: readonly ArabicSignModelLabel[],
  minimumConfidence = CONSTRAINED_CANDIDATE_MIN_CONFIDENCE,
): ConstrainedPrediction | null {
  const diagnostics = inspectReferenceConstrainedCandidate(probabilities, allowedRawLabels, minimumConfidence);
  if (!diagnostics?.isValid) return null;
  const { isValid: _isValid, ...candidate } = diagnostics;
  return candidate;
}

export function stabilizedConstrainedCandidate(window: ConstrainedPrediction[]): (ConstrainedPrediction & { count: number; averageConfidence: number }) | null {
  if (window.length < STABILITY_WINDOW_SIZE) return null;
  const groups = new Map<ArabicSignModelLabel, ConstrainedPrediction[]>();
  for (const prediction of window) {
    const group = groups.get(prediction.rawLabel) ?? [];
    group.push(prediction);
    groups.set(prediction.rawLabel, group);
  }

  let dominant: ConstrainedPrediction[] = [];
  for (const group of groups.values()) {
    if (group.length > dominant.length) dominant = group;
  }
  if (dominant.length < STABILITY_MIN_DOMINANT_FRAMES) return null;

  const latest = dominant[dominant.length - 1];
  return {
    ...latest,
    count: dominant.length,
    averageConfidence: dominant.reduce((sum, item) => sum + item.confidence, 0) / dominant.length,
  };
}
