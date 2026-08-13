import { questionBank } from '../data/questions';
import type { QuizAttempt, QuizQuestion } from '../types/planner';
import { topicAccuracy } from './analytics';

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function shuffleOptions(question: QuizQuestion): QuizQuestion {
  const paired = question.options.map((option, index) => ({
    option,
    correct: index === question.answerIndex
  }));
  const mixed = shuffle(paired);
  return {
    ...question,
    options: mixed.map((entry) => entry.option),
    answerIndex: mixed.findIndex((entry) => entry.correct)
  };
}

/**
 * Weighted random draw: topics the student keeps missing are sampled more often,
 * so a "regenerate" never produces the same flat quiz twice.
 */
export function generateQuiz(
subjectId: string,
count: number,
attempts: QuizAttempt[])
: QuizQuestion[] {
  const pool = questionBank.filter((question) => question.subjectId === subjectId);
  if (pool.length === 0) return [];
  const accuracy = topicAccuracy(attempts, subjectId);

  const weighted = pool.map((question) => {
    const topicScore = accuracy.find((entry) => entry.topic === question.topic);
    // Unseen topics sit mid-weight; heavily missed topics get up to ~3× the pull.
    const miss = topicScore ? 1 - topicScore.accuracy : 0.4;
    const difficultyBias =
    question.difficulty === 'core' ? 1 : question.difficulty === 'applied' ? 0.9 : 0.7;
    return {
      question,
      weight: (0.4 + miss * 2.2) * difficultyBias * (0.75 + Math.random() * 0.5)
    };
  });

  return weighted.
  sort((a, b) => b.weight - a.weight).
  slice(0, Math.min(count, pool.length)).
  map((entry) => shuffleOptions(entry.question)).
  sort(() => Math.random() - 0.5);
}