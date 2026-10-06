import { describe, expect, it } from 'vitest';
import { createProgressJourney, localDayKey } from './progressJourney';

const base = { readingSeconds: 0, listeningSeconds: 0, reviewAttempts: 0 };
const attempt = (day: string) => ({ id: day, completedAt: `${day}T09:00:00`, targetId: 'ayah-1', targetLabel: 'آية', correct: 1, missing: 0, extra: 0, substitutions: 0, accuracy: 1 });

describe('Quran journey progress selectors', () => {
  it('keeps a brand-new user at zero without inventing progress', () => {
    const journey = createProgressJourney([], [], base, new Date(2026, 9, 6));
    expect(journey.stagePercent).toBe(0);
    expect(journey.metrics).toMatchObject({ readingMinutes: 0, listeningMinutes: 0, signAttempts: 0, activityDays: 0, currentStreak: 0 });
    expect(journey.nextMilestone?.id).toBe('first-reading');
  });
  it('derives the stage percentage from completed real milestones', () => {
    const journey = createProgressJourney([{ kind: 'surah-read', occurredAt: '2026-10-06T09:00:00' }], [attempt('2026-10-06')], { ...base, readingSeconds: 61, reviewAttempts: 1 }, new Date(2026, 9, 6));
    expect(journey.stageCompleted).toBe(3);
    expect(journey.stagePercent).toBe(60);
  });
  it('counts a streak from distinct local calendar days and retains its longest run', () => {
    const activities = ['2026-10-04', '2026-10-05', '2026-10-06'].flatMap((day) => [{ kind: 'surah-read' as const, occurredAt: `${day}T23:30:00` }, { kind: 'review' as const, occurredAt: `${day}T08:00:00` }]);
    const journey = createProgressJourney(activities, [], base, new Date(2026, 9, 6));
    expect(journey.metrics.currentStreak).toBe(3);
    expect(journey.metrics.longestStreak).toBe(3);
  });
  it('recalculates a broken current streak but retains the longest one', () => {
    const journey = createProgressJourney(['2026-10-01', '2026-10-02', '2026-10-04'].map((day) => ({ kind: 'review' as const, occurredAt: `${day}T09:00:00` })), [], base, new Date(2026, 9, 4));
    expect(journey.metrics.currentStreak).toBe(1);
    expect(journey.metrics.longestStreak).toBe(2);
  });
  it('does not infer memorization from reading', () => {
    const journey = createProgressJourney([{ kind: 'surah-read', occurredAt: '2026-10-06T09:00:00' }], [], { ...base, readingSeconds: 3600 }, new Date(2026, 9, 6));
    expect(journey.metrics.readingMinutes).toBe(60);
    expect(journey.nodes.every((node) => node.metric !== 'memorization')).toBe(true);
  });
  it('uses stable local day keys', () => expect(localDayKey(new Date(2026, 9, 6, 23, 59))).toBe('2026-10-06'));
});
