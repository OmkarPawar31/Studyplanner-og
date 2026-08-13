import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { format } from 'date-fns';
import { blockEnd, buildSubjects, generatePlan, toMinutes } from '../utils/schedule';
import type {
  AppNotification,
  PlanInput,
  QuizAttempt,
  StudyBlock,
  Subject,
} from '../types/planner';
import { useAuth } from './AuthContext';
import {
  addAttempt,
  getAttempts,
  getBlocks,
  getPlanInput,
  getSubjects,
  getUserProfile,
  initUserIfNew,
  setBlocks,
  setPlanInput,
  setSubjects,
  syncMLTimetableDataset,
  type UserProfile,
} from '../services/firestoreService';

// ─── Types ─────────────────────────────────────────────────────────────────

/** The empty plan input used as a default before the user builds their first timetable. */
const EMPTY_PLAN_INPUT: PlanInput = {
  subjects:    [],
  hoursPerDay: 4,
  startTime:   '08:30',
  days:        7,
  restDay:     'none',
};

type PlannerValue = {
  profile: UserProfile | null;
  student: {
    name: string;
    school: string;
    streakDays: number;
  };
  now: Date;
  todayKey: string;
  planInput: PlanInput;
  subjects: Subject[];
  blocks: StudyBlock[];
  todayBlocks: StudyBlock[];
  attempts: QuizAttempt[];
  notifications: AppNotification[];
  unreadCount: number;
  generatedAt: string | null;
  dataLoading: boolean;
  regenerate: (input: PlanInput) => void;
  toggleBlock: (id: string) => void;
  recordAttempt: (attempt: QuizAttempt) => void;
  markAllRead: () => void;
  dismissNotification: (id: string) => void;
};

const PlannerContext = createContext<PlannerValue | null>(null);

// ─── Provider ──────────────────────────────────────────────────────────────

export function PlannerProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  // Use the real current time (no demo clock)
  const [now] = useState(() => new Date());

  const [profile,       setProfile]         = useState<UserProfile | null>(null);
  const [planInput,     setPlanInputState]   = useState<PlanInput>(EMPTY_PLAN_INPUT);
  const [subjects,      setSubjectsState]    = useState<Subject[]>([]);
  const [blocks,        setBlocksState]      = useState<StudyBlock[]>([]);
  const [attempts,      setAttemptsState]    = useState<QuizAttempt[]>([]);
  const [notifications, setNotifications]   = useState<AppNotification[]>([]);
  const [generatedAt,   setGeneratedAt]      = useState<string | null>(null);
  const [dataLoading,   setDataLoading]      = useState(true);

  const todayKey = format(now, 'yyyy-MM-dd');

  // ── Load user data from Firestore ─────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      // Clear all data when signed out
      setProfile(null);
      setPlanInputState(EMPTY_PLAN_INPUT);
      setSubjectsState([]);
      setBlocksState([]);
      setAttemptsState([]);
      setNotifications([]);
      setDataLoading(false);
      return;
    }

    setDataLoading(true);

    // Initialise the user if new (no demo data)
    initUserIfNew(user.uid, {
      name:       user.displayName ?? '',
      email:      user.email ?? '',
      photoURL:   user.photoURL ?? '',
      providerId: user.providerData[0]?.providerId ?? 'email',
      school:     '',
      streakDays: 0,
    }).then(async () => {
      const [savedProfile, savedPlanInput, savedSubjects, savedBlocks, savedAttempts] =
        await Promise.all([
          getUserProfile(user.uid),
          getPlanInput(user.uid),
          getSubjects(user.uid),
          getBlocks(user.uid),
          getAttempts(user.uid),
        ]);

      if (savedProfile)                  setProfile(savedProfile);
      if (savedPlanInput)                setPlanInputState(savedPlanInput);
      if (savedSubjects)                 setSubjectsState(savedSubjects);
      if (savedBlocks)                   setBlocksState(savedBlocks);
      if (savedAttempts.length > 0)      setAttemptsState(savedAttempts);
    }).finally(() => {
      setDataLoading(false);
    });
  }, [user]);

  // ── Derived ───────────────────────────────────────────────────────────────

  const todayBlocks = useMemo(
    () => blocks.filter((block) => block.date === todayKey),
    [blocks, todayKey],
  );

  // ── Notifications ─────────────────────────────────────────────────────────

  const pushNotification = useCallback((notification: AppNotification) => {
    setNotifications((current) =>
      current.some((entry) => entry.id === notification.id)
        ? current
        : [notification, ...current],
    );
  }, []);

  // Missed‑session watcher
  useEffect(() => {
    const minutesNow = now.getHours() * 60 + now.getMinutes();
    const missed = todayBlocks.filter(
      (block) =>
        block.kind !== 'break' &&
        !block.done &&
        toMinutes(blockEnd(block)) <= minutesNow,
    );
    if (missed.length === 0) {
      setNotifications((current) => current.filter((entry) => entry.kind !== 'missed'));
      return;
    }
    const first = missed[0];
    setNotifications((current) => {
      const rest = current.filter((entry) => entry.kind !== 'missed');
      return [
        {
          id:    'missed-today',
          kind:  'missed' as const,
          title: missed.length === 1 ? '1 session slipped today' : `${missed.length} sessions slipped today`,
          body:  `"${first.title}" was due at ${first.start}. Reschedule it in the timetable builder.`,
          time:  format(now, 'HH:mm'),
          read:  false,
        },
        ...rest,
      ];
    });
  }, [todayBlocks, now]);

  // Exam proximity watcher
  useEffect(() => {
    subjects.forEach((subject) => {
      const daysLeft = Math.ceil(
        (new Date(subject.examDate).getTime() - now.getTime()) / 86_400_000,
      );
      if (daysLeft >= 0 && daysLeft <= 6) {
        pushNotification({
          id:    `exam-${subject.id}-${subject.examDate}`,
          kind:  'exam',
          title: `${subject.name} exam in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`,
          body:  'Keep up the sessions — the plan is front‑loading this subject each morning.',
          time:  '07:00',
          read:  false,
        });
      }
    });
  }, [subjects, now, pushNotification]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const regenerate = useCallback(
    (input: PlanInput) => {
      const nextSubjects = buildSubjects(input);
      const nextBlocks   = generatePlan(input, nextSubjects, now);
      setPlanInputState(input);
      setSubjectsState(nextSubjects);
      setBlocksState(nextBlocks);
      setGeneratedAt(format(new Date(), 'HH:mm'));

      if (user) {
        void setPlanInput(user.uid, input);
        void setSubjects(user.uid, nextSubjects);
        void setBlocks(user.uid, nextBlocks);

        // Sync ML timetable dataset in Firestore
        void syncMLTimetableDataset(
          user.uid,
          user.email ?? '',
          user.displayName ?? profile?.name ?? '',
          input,
          nextSubjects,
          nextBlocks,
          attempts,
        );
      }
    },
    [now, user, profile, attempts],
  );

  const toggleBlock = useCallback(
    (id: string) => {
      setBlocksState((current) => {
        const next = current.map((block) =>
          block.id === id ? { ...block, done: !block.done } : block,
        );
        if (user) {
          void setBlocks(user.uid, next);
          void syncMLTimetableDataset(
            user.uid,
            user.email ?? '',
            user.displayName ?? profile?.name ?? '',
            planInput,
            subjects,
            next,
            attempts,
          );
        }
        return next;
      });
    },
    [user, profile, planInput, subjects, attempts],
  );

  const recordAttempt = useCallback(
    (attempt: QuizAttempt) => {
      setAttemptsState((current) => {
        const nextAttempts = [...current, attempt];
        if (user) {
          void addAttempt(user.uid, attempt);
          void syncMLTimetableDataset(
            user.uid,
            user.email ?? '',
            user.displayName ?? profile?.name ?? '',
            planInput,
            subjects,
            blocks,
            nextAttempts,
          );
        }
        return nextAttempts;
      });

      const percent = Math.round((attempt.correct / attempt.total) * 100);
      pushNotification({
        id:    `quiz-${attempt.id}`,
        kind:  'quiz',
        title: `Quiz scored ${percent}%`,
        body:
          percent >= 75
            ? 'Nice run — the next quiz will lean harder on stretch questions.'
            : 'The topics you missed are now weighted into tomorrow\u2019s sessions.',
        time: format(new Date(), 'HH:mm'),
        read: false,
      });
    },
    [user, profile, planInput, subjects, blocks, pushNotification],
  );

  const markAllRead = useCallback(() => {
    setNotifications((current) => current.map((entry) => ({ ...entry, read: true })));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((current) => current.filter((entry) => entry.id !== id));
  }, []);

  // ── Context value ─────────────────────────────────────────────────────────

  const student = useMemo(
    () => ({
      name: profile?.name || user?.displayName || 'Student',
      school: profile?.school || '',
      streakDays: profile?.streakDays ?? 0,
    }),
    [profile, user],
  );

  const value = useMemo<PlannerValue>(
    () => ({
      profile,
      student,
      now,
      todayKey,
      planInput,
      subjects,
      blocks,
      todayBlocks,
      attempts,
      notifications,
      unreadCount: notifications.filter((entry) => !entry.read).length,
      generatedAt,
      dataLoading,
      regenerate,
      toggleBlock,
      recordAttempt,
      markAllRead,
      dismissNotification,
    }),
    [
      profile,
      student,
      now,
      todayKey,
      planInput,
      subjects,
      blocks,
      todayBlocks,
      attempts,
      notifications,
      generatedAt,
      dataLoading,
      regenerate,
      toggleBlock,
      recordAttempt,
      markAllRead,
      dismissNotification,
    ],
  );

  return (
    <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function usePlanner(): PlannerValue {
  const context = useContext(PlannerContext);
  if (!context) throw new Error('usePlanner must be used inside PlannerProvider');
  return context;
}

// Export default for stable Fast Refresh compatibility
export default PlannerProvider;