/**
 * Typed Firestore & Realtime Database helpers for StudyPlanner.
 *
 * Database layout:
 * 1) User data under users/{uid}:
 *    - profile      → { name, email, photoURL, providerId, school, streakDays, lastLoginAt, createdAt }
 *    - planInput    → PlanInput (subjects, hoursPerDay, startTime, days, restDay)
 *    - subjects     → { items: Subject[] }
 *    - blocks       → { items: StudyBlock[] }
 *    - attempts/    → sub-collection of QuizAttempt documents
 *
 * 2) ML Model Dataset under ml_timetable_dataset/{uid}:
 *    - Structured record formatted for ML training/inference containing subjects, availability,
 *      generated schedule blocks, and student performance metrics.
 */

import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  getDocs,
  collection,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { ref, set } from 'firebase/database';
import { db, rtdb } from '../firebaseconfig';
import type { PlanInput, QuizAttempt, StudyBlock, Subject } from '../types/planner';

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Strips out undefined properties from objects/arrays so Firestore setDoc does not throw
 * "Unsupported field value: undefined".
 */
function sanitize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

/**
 * Optional helper to mirror writes to Firebase Realtime Database.
 */
async function syncRTDB(path: string, value: unknown): Promise<void> {
  try {
    await set(ref(rtdb, path), sanitize(value));
  } catch (err) {
    // RTDB sync is best-effort
  }
}

// ─── Paths ─────────────────────────────────────────────────────────────────

const userRef        = (uid: string) => doc(db, 'users', uid);
const profileRef     = (uid: string) => doc(db, 'users', uid, 'data', 'profile');
const planInputRef   = (uid: string) => doc(db, 'users', uid, 'data', 'planInput');
const subjectsRef    = (uid: string) => doc(db, 'users', uid, 'data', 'subjects');
const blocksRef      = (uid: string) => doc(db, 'users', uid, 'data', 'blocks');
const attemptsCol    = (uid: string) => collection(db, 'users', uid, 'attempts');

// Dedicated collection for ML model timetable fetching
const mlDatasetRef   = (uid: string) => doc(db, 'ml_timetable_dataset', uid);

// ─── User Profile ──────────────────────────────────────────────────────────

export type UserProfile = {
  uid?:        string;
  name:        string;
  email:       string;
  photoURL?:   string;
  providerId?: string;
  school:      string;
  streakDays:  number;
  lastLoginAt?: string;
  createdAt?:  unknown;
};

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(profileRef(uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function setUserProfile(uid: string, profile: Partial<UserProfile>): Promise<void> {
  const clean = sanitize(profile);
  await setDoc(profileRef(uid), clean, { merge: true });
  void syncRTDB(`users/${uid}/profile`, clean);
}

export async function updateUserProfile(uid: string, patch: Partial<UserProfile>): Promise<void> {
  const clean = sanitize(patch);
  await updateDoc(profileRef(uid), clean as Record<string, unknown>);
  void syncRTDB(`users/${uid}/profile`, clean);
}

// ─── Plan Input ────────────────────────────────────────────────────────────

export async function getPlanInput(uid: string): Promise<PlanInput | null> {
  const snap = await getDoc(planInputRef(uid));
  return snap.exists() ? (snap.data() as PlanInput) : null;
}

export async function setPlanInput(uid: string, input: PlanInput): Promise<void> {
  const clean = sanitize(input);
  await setDoc(planInputRef(uid), clean);
  void syncRTDB(`users/${uid}/planInput`, clean);
}

// ─── Subjects ──────────────────────────────────────────────────────────────

export async function getSubjects(uid: string): Promise<Subject[] | null> {
  const snap = await getDoc(subjectsRef(uid));
  if (!snap.exists()) return null;
  const data = snap.data() as { items: Subject[] };
  return data.items ?? null;
}

export async function setSubjects(uid: string, subjects: Subject[]): Promise<void> {
  const clean = sanitize({ items: subjects });
  await setDoc(subjectsRef(uid), clean);
  void syncRTDB(`users/${uid}/subjects`, clean);
}

// ─── Blocks ────────────────────────────────────────────────────────────────

export async function getBlocks(uid: string): Promise<StudyBlock[] | null> {
  const snap = await getDoc(blocksRef(uid));
  if (!snap.exists()) return null;
  const data = snap.data() as { items: StudyBlock[] };
  return data.items ?? null;
}

export async function setBlocks(uid: string, blocks: StudyBlock[]): Promise<void> {
  const clean = sanitize({ items: blocks });
  await setDoc(blocksRef(uid), clean);
  void syncRTDB(`users/${uid}/blocks`, clean);
}

// ─── Attempts ──────────────────────────────────────────────────────────────

export async function getAttempts(uid: string): Promise<QuizAttempt[]> {
  const snap = await getDocs(attemptsCol(uid));
  return snap.docs.map((d) => d.data() as QuizAttempt);
}

export async function addAttempt(uid: string, attempt: QuizAttempt): Promise<void> {
  const clean = sanitize(attempt);
  await addDoc(attemptsCol(uid), clean);
  void syncRTDB(`users/${uid}/attempts/${attempt.id}`, clean);
}

// ─── ML Timetable Dataset ───────────────────────────────────────────────────

export type MLTimetableRecord = {
  userId: string;
  userEmail: string;
  userName: string;
  updatedAt: string;
  inputs: {
    subjects: Array<{
      id: string;
      name: string;
      examDate: string;
      confidence: number;
      topics: string[];
    }>;
    activeSubjects: Array<{
      id: string;
      name: string;
      examDate: string;
      confidence: number;
      topics: string[];
    }>;
    availability: {
      hoursPerDay: number;
      startTime: string;
      days: number;
      restDay: string;
    };
  };
  generatedSchedule: Array<{
    id: string;
    title: string;
    kind: string;
    subjectId: string | null;
    date: string;
    start: string;
    minutes: number;
    done: boolean;
    reason?: string;
  }>;
  performanceSummary: {
    totalQuizAttempts: number;
    averageQuizAccuracy: number;
  };
};

/**
 * Saves a structured dataset record in the `ml_timetable_dataset` collection in Firestore & Realtime Database.
 * ML models can query this collection to fetch student inputs, generated timetables, and performance.
 */
export async function syncMLTimetableDataset(
  uid: string,
  userEmail: string,
  userName: string,
  planInput: PlanInput,
  subjects: Subject[],
  blocks: StudyBlock[],
  attempts: QuizAttempt[],
): Promise<void> {
  const avgAccuracy = attempts.length === 0
    ? 0
    : Math.round(attempts.reduce((sum, a) => sum + (a.correct / a.total) * 100, 0) / attempts.length);

  const rawRecord: MLTimetableRecord = {
    userId: uid,
    userEmail: userEmail || '',
    userName: userName || 'Student',
    updatedAt: new Date().toISOString(),
    inputs: {
      subjects: planInput.subjects.map((s) => ({
        id: s.id,
        name: s.name,
        examDate: s.examDate,
        confidence: s.confidence,
        topics: s.topics ? s.topics.split(',').map((t) => t.trim()).filter(Boolean) : [],
      })),
      activeSubjects: subjects.map((s) => ({
        id: s.id,
        name: s.name,
        examDate: s.examDate,
        confidence: s.confidence,
        topics: s.topics,
      })),
      availability: {
        hoursPerDay: planInput.hoursPerDay,
        startTime: planInput.startTime,
        days: planInput.days,
        restDay: planInput.restDay,
      },
    },
    generatedSchedule: blocks.map((b) => ({
      id: b.id,
      title: b.title,
      kind: b.kind,
      subjectId: b.subjectId ?? null,
      date: b.date,
      start: b.start,
      minutes: b.minutes,
      done: b.done,
      reason: b.reason ?? '',
    })),
    performanceSummary: {
      totalQuizAttempts: attempts.length,
      averageQuizAccuracy: avgAccuracy,
    },
  };

  const record = sanitize(rawRecord);

  try {
    await setDoc(mlDatasetRef(uid), record);
    void syncRTDB(`ml_timetable_dataset/${uid}`, record);
    console.log(`[Firestore] Successfully synced ML dataset record to ml_timetable_dataset/${uid}`);
  } catch (err) {
    console.error('[Firestore Error] Failed to write to ml_timetable_dataset collection:', err);
  }
}

// ─── User Initialisation (called on every sign-in, idempotent) ─────────────

/**
 * Creates or updates the user profile & database documents whenever a user logs in via
 * Google, Email, or Password authentication.
 */
export async function initUserIfNew(
  uid: string,
  profile: Omit<UserProfile, 'createdAt'>,
): Promise<void> {
  try {
    const rootSnap = await getDoc(userRef(uid));
    const nowStr = new Date().toISOString();

    if (!rootSnap.exists()) {
      // First time login
      const profileData = sanitize({
        uid,
        name: profile.name || 'Student',
        email: profile.email,
        photoURL: profile.photoURL || '',
        providerId: profile.providerId || 'email',
        school: profile.school || '',
        streakDays: profile.streakDays || 0,
        lastLoginAt: nowStr,
        createdAt: serverTimestamp(),
      });

      await Promise.all([
        setDoc(userRef(uid), { createdAt: serverTimestamp(), lastLoginAt: nowStr }),
        setDoc(profileRef(uid), profileData),
      ]);
      void syncRTDB(`users/${uid}/profile`, profileData);
      console.log(`[Firestore] Initialized new user profile under users/${uid}`);
    } else {
      // Returning user login: update lastLoginAt and basic fields if needed
      const updateData = sanitize({
        uid,
        email: profile.email,
        lastLoginAt: nowStr,
        ...(profile.name ? { name: profile.name } : {}),
        ...(profile.photoURL ? { photoURL: profile.photoURL } : {}),
      });

      await Promise.all([
        updateDoc(userRef(uid), { lastLoginAt: nowStr }),
        setDoc(profileRef(uid), updateData, { merge: true }),
      ]);
      void syncRTDB(`users/${uid}/profile`, updateData);
      console.log(`[Firestore] Updated returning user profile under users/${uid}`);
    }
  } catch (err) {
    console.error('[Firestore Error] Failed to write user profile to Firestore:', err);
  }
}
