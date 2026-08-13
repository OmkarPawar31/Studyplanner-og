import { differenceInCalendarDays, parseISO } from 'date-fns';
import type { QuizAttempt, StudyBlock, Subject } from '../types/planner';

export type TopicScore = {
  topic: string;
  accuracy: number;
  answered: number;
};

export function topicAccuracy(
attempts: QuizAttempt[],
subjectId?: string)
: TopicScore[] {
  const totals = new Map<string, {correct: number;total: number;}>();
  attempts.
  filter((attempt) => !subjectId || attempt.subjectId === subjectId).
  forEach((attempt) => {
    Object.entries(attempt.perTopic).forEach(([topic, value]) => {
      const current = totals.get(topic) ?? { correct: 0, total: 0 };
      totals.set(topic, {
        correct: current.correct + value.correct,
        total: current.total + value.total
      });
    });
  });

  return [...totals.entries()].
  map(([topic, value]) => ({
    topic,
    accuracy: value.total === 0 ? 0 : value.correct / value.total,
    answered: value.total
  })).
  sort((a, b) => b.accuracy - a.accuracy);
}

export function scoreTrend(attempts: QuizAttempt[]) {
  return [...attempts].
  sort((a, b) => a.date.localeCompare(b.date)).
  map((attempt) => ({
    date: attempt.date.slice(5),
    score: Math.round(attempt.correct / attempt.total * 100),
    subjectId: attempt.subjectId
  }));
}

export function overallAccuracy(attempts: QuizAttempt[]): number {
  const total = attempts.reduce((acc, attempt) => acc + attempt.total, 0);
  const correct = attempts.reduce((acc, attempt) => acc + attempt.correct, 0);
  return total === 0 ? 0 : correct / total;
}

export function subjectAccuracy(attempts: QuizAttempt[], subjectId: string): number {
  return overallAccuracy(attempts.filter((a) => a.subjectId === subjectId));
}

export type Readiness = {
  subject: Subject;
  daysLeft: number;
  mastery: number;
  coverage: number;
  score: number;
  verdict: 'on track' | 'tight' | 'at risk';
};

/**
 * Blends quiz mastery with how much of the planned time has actually been done,
 * then reads it against the days left before the exam.
 */
export function examReadiness(
subjects: Subject[],
attempts: QuizAttempt[],
blocks: StudyBlock[],
today: Date)
: Readiness[] {
  return subjects.
  map((subject) => {
    const daysLeft = Math.max(
      0,
      differenceInCalendarDays(parseISO(subject.examDate), today)
    );
    const mastery = subjectAccuracy(attempts, subject.id);
    const planned = blocks.filter(
      (block) => block.subjectId === subject.id && block.kind !== 'break'
    );
    const completed = planned.filter((block) => block.done);
    const coverage = planned.length === 0 ? 0 : completed.length / planned.length;
    const score = Math.round((mastery * 0.65 + coverage * 0.35) * 100);
    const pressure = daysLeft <= 3 ? 12 : daysLeft <= 7 ? 6 : 0;
    const adjusted = score - pressure;
    const verdict: Readiness['verdict'] =
    adjusted >= 70 ? 'on track' : adjusted >= 50 ? 'tight' : 'at risk';
    return { subject, daysLeft, mastery, coverage, score, verdict };
  }).
  sort((a, b) => a.daysLeft - b.daysLeft);
}

export function studyMinutesByDay(blocks: StudyBlock[]) {
  const totals = new Map<string, {planned: number;done: number;}>();
  blocks.
  filter((block) => block.kind !== 'break').
  forEach((block) => {
    const current = totals.get(block.date) ?? { planned: 0, done: 0 };
    totals.set(block.date, {
      planned: current.planned + block.minutes,
      done: current.done + (block.done ? block.minutes : 0)
    });
  });
  return [...totals.entries()].
  sort((a, b) => a[0].localeCompare(b[0])).
  map(([date, value]) => ({
    date: date.slice(5),
    planned: Math.round(value.planned / 60 * 10) / 10,
    done: Math.round(value.done / 60 * 10) / 10
  }));
}