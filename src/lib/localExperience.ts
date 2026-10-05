export type AccessibilityPreference = 'sign-first' | 'text-first' | 'audio-text' | 'mixed';
export type HearingPreference = 'deaf-sign' | 'hard-of-hearing' | 'hearing' | 'prefer-not-to-say';
export type AgeExperience = 'child' | 'teen' | 'adult';
export type LearningGoal = 'memorize' | 'review' | 'learn-quran' | 'explore-islam';

export type LocalProfile = { accessibility: AccessibilityPreference; hearing: HearingPreference; age: AgeExperience; goal: LearningGoal };
export type ActivityKind = 'attempt' | 'review' | 'surah-read' | 'saved-item';
export type LocalActivity = { kind: ActivityKind; occurredAt: string };
export type ExperienceProgress = { points: number; streak: number; garden: 'seed' | 'sprout' | 'leaves' | 'flower'; achievements: string[]; latestAttemptAt: string | null; bestAccuracy: number | null; challenge: ActivityKind };

const PROFILE_KEY = 'unmulah.profile.v1';
const DEFAULT_PROFILE: LocalProfile = { accessibility: 'mixed', hearing: 'prefer-not-to-say', age: 'adult', goal: 'learn-quran' };

export function readLocalProfile(storage: Storage = window.localStorage): LocalProfile {
  try { return validateProfile(JSON.parse(storage.getItem(PROFILE_KEY) ?? 'null')) ?? DEFAULT_PROFILE; } catch { return DEFAULT_PROFILE; }
}

export function saveLocalProfile(profile: LocalProfile, storage: Storage = window.localStorage): LocalProfile {
  const valid = validateProfile(profile) ?? DEFAULT_PROFILE;
  try { storage.setItem(PROFILE_KEY, JSON.stringify(valid)); } catch { /* Preference remains available in current UI state. */ }
  return valid;
}

export function clearLocalProfile(storage: Storage = window.localStorage) { try { storage.removeItem(PROFILE_KEY); } catch { /* no-op */ } }

export function deriveExperienceProgress(activities: readonly LocalActivity[], attemptAccuracies: readonly number[] = []): ExperienceProgress {
  const sortedDays = [...new Set(activities.map((activity) => dayKey(activity.occurredAt)).filter(Boolean))].sort().reverse();
  const today = dayKey(new Date().toISOString());
  let streak = 0; let cursor = today;
  while (sortedDays.includes(cursor)) { streak += 1; cursor = previousDay(cursor); }
  const points = activities.reduce((total, activity) => total + ({ attempt: 20, review: 10, 'surah-read': 5, 'saved-item': 3 }[activity.kind]), 0);
  const achievements = [
    ...(activities.some((item) => item.kind === 'attempt') ? ['first-attempt'] : []),
    ...(activities.filter((item) => item.kind === 'attempt').length >= 5 ? ['five-attempts'] : []),
    ...(activities.some((item) => item.kind === 'surah-read') ? ['first-surah'] : []),
    ...(streak >= 3 ? ['three-day-streak'] : []),
  ];
  return { points, streak, garden: points >= 150 ? 'flower' : points >= 70 ? 'leaves' : points >= 20 ? 'sprout' : 'seed', achievements, latestAttemptAt: activities.find((item) => item.kind === 'attempt')?.occurredAt ?? null, bestAccuracy: attemptAccuracies.length ? Math.max(...attemptAccuracies) : null, challenge: deterministicChallenge(today) };
}

function validateProfile(value: unknown): LocalProfile | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Record<string, unknown>;
  const valid = (key: string, values: readonly string[]) => typeof candidate[key] === 'string' && values.includes(candidate[key] as string);
  if (!valid('accessibility', ['sign-first', 'text-first', 'audio-text', 'mixed']) || !valid('hearing', ['deaf-sign', 'hard-of-hearing', 'hearing', 'prefer-not-to-say']) || !valid('age', ['child', 'teen', 'adult']) || !valid('goal', ['memorize', 'review', 'learn-quran', 'explore-islam'])) return null;
  return candidate as unknown as LocalProfile;
}
function dayKey(value: string): string { const date = new Date(value); return Number.isNaN(date.valueOf()) ? '' : date.toISOString().slice(0, 10); }
function previousDay(day: string): string { const date = new Date(`${day}T00:00:00.000Z`); date.setUTCDate(date.getUTCDate() - 1); return date.toISOString().slice(0, 10); }
function deterministicChallenge(day: string): ActivityKind { const choices: ActivityKind[] = ['attempt', 'review', 'surah-read', 'saved-item']; return choices[[...day].reduce((sum, character) => sum + character.charCodeAt(0), 0) % choices.length]; }
