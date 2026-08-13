import { addDays, format, subDays } from 'date-fns';
import type { PlanInput, QuizAttempt } from '../types/planner';

const today = new Date();
const iso = (date: Date) => format(date, 'yyyy-MM-dd');

export const defaultPlanInput: PlanInput = {
  subjects: [
  {
    id: 'math',
    name: 'Linear Algebra',
    examDate: iso(addDays(today, 6)),
    confidence: 2,
    topics: 'Eigenvalues, Vector spaces, Determinants'
  },
  {
    id: 'chem',
    name: 'Organic Chemistry',
    examDate: iso(addDays(today, 11)),
    confidence: 3,
    topics: 'Reaction mechanisms, Stereochemistry, Spectroscopy'
  },
  {
    id: 'hist',
    name: 'Modern History',
    examDate: iso(addDays(today, 18)),
    confidence: 4,
    topics: 'Cold War, Decolonisation, Industrial change'
  }],

  hoursPerDay: 4,
  startTime: '08:30',
  days: 7,
  restDay: 'sun'
};

export const seedAttempts: QuizAttempt[] = [
{
  id: 'a1',
  subjectId: 'math',
  date: iso(subDays(today, 8)),
  correct: 4,
  total: 8,
  perTopic: {
    Eigenvalues: { correct: 1, total: 3 },
    'Vector spaces': { correct: 2, total: 3 },
    Determinants: { correct: 1, total: 2 }
  },
  seconds: 512
},
{
  id: 'a2',
  subjectId: 'chem',
  date: iso(subDays(today, 6)),
  correct: 6,
  total: 8,
  perTopic: {
    'Reaction mechanisms': { correct: 2, total: 3 },
    Stereochemistry: { correct: 3, total: 3 },
    Spectroscopy: { correct: 1, total: 2 }
  },
  seconds: 430
},
{
  id: 'a3',
  subjectId: 'math',
  date: iso(subDays(today, 4)),
  correct: 5,
  total: 8,
  perTopic: {
    Eigenvalues: { correct: 1, total: 3 },
    'Vector spaces': { correct: 3, total: 3 },
    Determinants: { correct: 1, total: 2 }
  },
  seconds: 486
},
{
  id: 'a4',
  subjectId: 'hist',
  date: iso(subDays(today, 3)),
  correct: 7,
  total: 8,
  perTopic: {
    'Cold War': { correct: 3, total: 3 },
    Decolonisation: { correct: 3, total: 3 },
    'Industrial change': { correct: 1, total: 2 }
  },
  seconds: 388
},
{
  id: 'a5',
  subjectId: 'chem',
  date: iso(subDays(today, 2)),
  correct: 6,
  total: 8,
  perTopic: {
    'Reaction mechanisms': { correct: 2, total: 3 },
    Stereochemistry: { correct: 3, total: 3 },
    Spectroscopy: { correct: 1, total: 3 }
  },
  seconds: 401
},
{
  id: 'a6',
  subjectId: 'math',
  date: iso(subDays(today, 1)),
  correct: 6,
  total: 8,
  perTopic: {
    Eigenvalues: { correct: 2, total: 3 },
    'Vector spaces': { correct: 3, total: 3 },
    Determinants: { correct: 1, total: 2 }
  },
  seconds: 455
}];


export const student = {
  name: 'Ava Mensah',
  school: 'Northside University',
  streakDays: 9
};