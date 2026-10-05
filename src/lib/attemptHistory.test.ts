import { describe, expect, it } from 'vitest';
import { appendAttempt, removeAttempt, type LocalAttempt } from './attemptHistory';

const first: LocalAttempt = { id: 'a', completedAt: '2026-10-05T00:00:00.000Z', targetId: 'ayah-1', targetLabel: 'الآية ١', correct: 2, missing: 1, extra: 0, substitutions: 0, accuracy: .67 };

describe('attempt history collection', () => {
  it('adds the newest attempt first without camera data', () => {
    const second = { ...first, id: 'b', targetId: 'ayah-2' as const };
    expect(appendAttempt([first], second).map((attempt) => attempt.id)).toEqual(['b', 'a']);
    expect(Object.keys(second)).not.toContain('video');
  });

  it('removes only the requested local attempt', () => {
    const second = { ...first, id: 'b' };
    expect(removeAttempt([first, second], 'a').map((attempt) => attempt.id)).toEqual(['b']);
  });
});
