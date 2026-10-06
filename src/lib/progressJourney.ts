import type { LocalAttempt } from './attemptHistory';
import type { LocalActivity } from './localExperience';
import type { QuranProgress } from './quranProgress';
import { JOURNEY_STAGES, type JourneyMetric, type JourneyMilestone, type JourneyStage } from '../data/progressJourney';

export type ProgressMetrics = {
  readingMinutes: number;
  listeningMinutes: number;
  signAttempts: number;
  reviews: number;
  activityDays: number;
  currentStreak: number;
  longestStreak: number;
  monthActiveDays: number;
  bestAccuracy: number | null;
};

export type MilestoneState = JourneyMilestone & { value: number; completed: boolean; status: 'completed' | 'current' | 'upcoming' | 'locked' };
export type ProgressJourney = {
  metrics: ProgressMetrics;
  stage: JourneyStage;
  stageCompleted: number;
  stagePercent: number;
  nodes: MilestoneState[];
  nextMilestone: MilestoneState | null;
  stages: Array<JourneyStage & { unlocked: boolean }>;
};

export function localDayKey(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.valueOf())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function previousLocalDay(day: string): string {
  const [year, month, date] = day.split('-').map(Number);
  const value = new Date(year, (month ?? 1) - 1, date);
  value.setDate(value.getDate() - 1);
  return localDayKey(value);
}

function streaks(days: readonly string[], today: string) {
  const unique = [...new Set(days.filter(Boolean))].sort();
  let longest = 0; let run = 0; let previous = '';
  for (const day of unique) {
    if (previous && day === (() => { const value = new Date(Number(previous.slice(0, 4)), Number(previous.slice(5, 7)) - 1, Number(previous.slice(8, 10))); value.setDate(value.getDate() + 1); return localDayKey(value); })()) run += 1;
    else run = 1;
    longest = Math.max(longest, run); previous = day;
  }
  const active = new Set(unique);
  let current = 0; let cursor = today;
  while (active.has(cursor)) { current += 1; cursor = previousLocalDay(cursor); }
  return { current, longest };
}

export function createProgressJourney(
  activities: readonly LocalActivity[],
  attempts: readonly LocalAttempt[],
  quranProgress: QuranProgress,
  now = new Date(),
): ProgressJourney {
  const activityDays = [...activities.map((activity) => localDayKey(activity.occurredAt)), ...attempts.map((attempt) => localDayKey(attempt.completedAt))].filter(Boolean);
  const { current: currentStreak, longest: longestStreak } = streaks(activityDays, localDayKey(now));
  const monthPrefix = localDayKey(now).slice(0, 7);
  const metrics: ProgressMetrics = {
    readingMinutes: Math.floor(quranProgress.readingSeconds / 60),
    listeningMinutes: Math.floor(quranProgress.listeningSeconds / 60),
    signAttempts: attempts.length,
    reviews: quranProgress.reviewAttempts + activities.filter((activity) => activity.kind === 'review').length,
    activityDays: new Set(activityDays).size,
    currentStreak,
    longestStreak,
    monthActiveDays: new Set(activityDays.filter((day) => day.startsWith(monthPrefix))).size,
    bestAccuracy: attempts.length ? Math.max(...attempts.map((attempt) => attempt.accuracy)) : null,
  };
  const valueFor = (metric: JourneyMetric) => ({
    reading: metrics.readingMinutes,
    listening: metrics.listeningMinutes,
    sign: metrics.signAttempts,
    review: metrics.reviews,
    consistency: metrics.activityDays,
    memorization: 0,
  }[metric]);
  const allMilestones = JOURNEY_STAGES.flatMap((stage) => stage.milestones);
  const completedOverall = allMilestones.filter((milestone) => valueFor(milestone.metric) >= milestone.threshold).length;
  const stage = JOURNEY_STAGES.find((item) => completedOverall < item.unlockAfterCompleted + item.milestones.length) ?? JOURNEY_STAGES.at(-1)!;
  const nodes = stage.milestones.map((milestone, index) => {
    const value = valueFor(milestone.metric);
    const completed = value >= milestone.threshold;
    const priorDone = stage.milestones.slice(0, index).every((item) => valueFor(item.metric) >= item.threshold);
    return { ...milestone, value, completed, status: completed ? 'completed' : priorDone ? 'current' : 'upcoming' } as MilestoneState;
  });
  const stageCompleted = nodes.filter((node) => node.completed).length;
  return {
    metrics, stage, stageCompleted,
    stagePercent: stage.milestones.length ? Math.round((stageCompleted / stage.milestones.length) * 100) : 0,
    nodes,
    nextMilestone: nodes.find((node) => !node.completed) ?? null,
    stages: JOURNEY_STAGES.map((item) => ({ ...item, unlocked: completedOverall >= item.unlockAfterCompleted })),
  };
}
