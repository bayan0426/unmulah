import { describe, expect, it } from 'vitest';
import { deriveExperienceProgress, readLocalActivities, readLocalProfile, recordLocalActivity } from './localExperience';

describe('local profile and meaningful progress', () => {
  it('recovers safely from corrupt local profile data', () => {
    const storage = { getItem: () => '{broken', setItem: () => {}, removeItem: () => {} } as unknown as Storage;
    expect(readLocalProfile(storage)).toMatchObject({ accessibility: 'mixed', age: 'adult' });
  });
  it('derives points, garden, achievements and a real-activity streak', () => {
    const now = new Date(); const day = (offset: number) => new Date(now.valueOf() - offset * 86400000).toISOString();
    const result = deriveExperienceProgress([{ kind: 'attempt', occurredAt: day(0) }, { kind: 'review', occurredAt: day(1) }, { kind: 'surah-read', occurredAt: day(2) }], [.75]);
    expect(result).toMatchObject({ points: 35, streak: 3, garden: 'sprout', bestAccuracy: .75 });
    expect(result.achievements).toContain('first-attempt'); expect(result.achievements).toContain('three-day-streak');
  });
  it('records at most one meaningful activity of a kind per calendar day', () => {
    let value = '';
    const storage = { getItem: () => value || null, setItem: (_key: string, next: string) => { value = next; } } as unknown as Storage;
    recordLocalActivity('surah-read', storage, '2026-10-05T09:00:00.000Z');
    recordLocalActivity('surah-read', storage, '2026-10-05T19:00:00.000Z');
    expect(readLocalActivities(storage)).toEqual([{ kind: 'surah-read', occurredAt: '2026-10-05T09:00:00.000Z' }]);
  });
});
