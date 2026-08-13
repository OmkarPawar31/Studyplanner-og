export type SubjectId = string;

export type Subject = {
  id: SubjectId;
  name: string;
  code: string;
  examDate: string; // ISO date
  confidence: 1 | 2 | 3 | 4 | 5;
  topics: string[];
};

export type BlockKind = 'study' | 'review' | 'quiz' | 'break';

export type StudyBlock = {
  id: string;
  date: string; // ISO date, yyyy-MM-dd
  start: string; // HH:mm
  minutes: number;
  subjectId: SubjectId | null;
  title: string;
  topic?: string;
  kind: BlockKind;
  done: boolean;
  reason?: string;
};

export type QuizQuestion = {
  id: string;
  subjectId: SubjectId;
  topic: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  difficulty: 'core' | 'applied' | 'stretch';
};

export type QuizAttempt = {
  id: string;
  subjectId: SubjectId;
  date: string; // ISO date
  correct: number;
  total: number;
  perTopic: Record<string, {correct: number;total: number;}>;
  seconds: number;
};

export type NotificationKind = 'missed' | 'exam' | 'quiz' | 'streak';

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  time: string; // HH:mm
  read: boolean;
};

export type PlanDraftSubject = {
  id: string;
  name: string;
  examDate: string;
  confidence: 1 | 2 | 3 | 4 | 5;
  topics: string;
};

export type PlanInput = {
  subjects: PlanDraftSubject[];
  hoursPerDay: number;
  startTime: string;
  days: number;
  restDay: 'none' | 'sat' | 'sun';
};