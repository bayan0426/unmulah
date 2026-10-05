import type { RecitationComparison, RecitationTargetId } from './recitationComparison';

const STORAGE_KEY = 'unmulah.recitation-attempts.v1';
const MAX_ATTEMPTS = 8;

export type LocalAttempt = {
  id: string;
  completedAt: string;
  targetId: string;
  targetLabel: string;
  correct: number;
  missing: number;
  extra: number;
  substitutions: number;
  accuracy: number;
};

export function readAttemptHistory(): LocalAttempt[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.map(migrateAttempt).filter(isAttempt).slice(0, MAX_ATTEMPTS) : [];
  } catch {
    return [];
  }
}

function migrateAttempt(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value;
  const item = value as Record<string, unknown>;
  if (typeof item.targetId === 'string') return item;
  const ids: Record<string, RecitationTargetId> = { 'الآية ١': 'ayah-1', 'الآية ٢': 'ayah-2', 'الآية ٣': 'ayah-3', 'الآية ٤': 'ayah-4', 'السورة كاملة': 'full-surah' };
  const targetId = typeof item.targetLabel === 'string' ? ids[item.targetLabel] : undefined;
  return targetId ? { ...item, targetId } : item;
}

export function saveAttempt(comparison: RecitationComparison): LocalAttempt[] {
  const attempt: LocalAttempt = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    completedAt: new Date().toISOString(),
    targetId: comparison.targetId,
    targetLabel: comparison.targetLabel,
    correct: comparison.correct,
    missing: comparison.missing,
    extra: comparison.extra,
    substitutions: comparison.substitutions,
    accuracy: comparison.accuracy,
  };
  const next = appendAttempt(readAttemptHistory(), attempt);
  writeAttemptHistory(next);
  return next;
}

export function appendAttempt(history: readonly LocalAttempt[], attempt: LocalAttempt): LocalAttempt[] {
  return [attempt, ...history].slice(0, MAX_ATTEMPTS);
}

export function removeAttempt(history: readonly LocalAttempt[], id: string): LocalAttempt[] {
  const next = history.filter((attempt) => attempt.id !== id);
  writeAttemptHistory(next);
  return next;
}

export function clearAttemptHistory(): LocalAttempt[] {
  writeAttemptHistory([]);
  return [];
}

function writeAttemptHistory(history: readonly LocalAttempt[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // The current comparison still works when local storage is unavailable.
  }
}

function isAttempt(value: unknown): value is LocalAttempt {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === 'string' && typeof item.completedAt === 'string' && typeof item.targetId === 'string' && typeof item.targetLabel === 'string'
    && ['correct', 'missing', 'extra', 'substitutions', 'accuracy'].every((key) => typeof item[key] === 'number');
}
