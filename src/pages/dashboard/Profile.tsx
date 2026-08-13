import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpenIcon,
  CheckIcon,
  FlameIcon,
  LoaderIcon,
  LogOutIcon,
  MailIcon,
  PencilIcon,
  SchoolIcon,
  UserIcon,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePlanner } from '../../contexts/PlannerContext';
import { setUserProfile, updateUserProfile } from '../../services/firestoreService';

const inputClass =
  'h-10 w-full rounded-lg border border-ink-line bg-paper px-3.5 text-sm text-ink outline-none transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-ink-muted/60 focus:border-moss focus:shadow-[0_0_0_3px_rgba(31,107,84,0.15)]';

type EditField = 'name' | 'school' | null;

export function Profile() {
  const { user, logOut } = useAuth();
  const { profile, attempts, blocks, subjects, dataLoading } = usePlanner();
  const navigate = useNavigate();

  const [editing, setEditing]           = useState<EditField>(null);
  const [nameValue, setNameValue]       = useState(profile?.name ?? user?.displayName ?? '');
  const [schoolValue, setSchoolValue]   = useState(profile?.school ?? '');
  const [saving, setSaving]             = useState(false);
  const [saveError, setSaveError]       = useState<string | null>(null);

  // ── Stats ────────────────────────────────────────────────────────────────
  const totalSessions  = blocks.filter((b) => b.kind !== 'break').length;
  const doneSessions   = blocks.filter((b) => b.kind !== 'break' && b.done).length;
  const totalQuizzes   = attempts.length;
  const avgScore       = totalQuizzes === 0
    ? null
    : Math.round(attempts.reduce((sum, a) => sum + (a.correct / a.total) * 100, 0) / totalQuizzes);
  const streakDays     = profile?.streakDays ?? 0;
  const subjectCount   = subjects.length;

  // ── Helpers ───────────────────────────────────────────────────────────────
  function startEdit(field: EditField) {
    setNameValue(profile?.name ?? user?.displayName ?? '');
    setSchoolValue(profile?.school ?? '');
    setSaveError(null);
    setEditing(field);
  }

  async function saveField(field: 'name' | 'school') {
    if (!user) return;
    setSaving(true);
    setSaveError(null);
    try {
      const patch = field === 'name'
        ? { name: nameValue.trim() }
        : { school: schoolValue.trim() };
      await updateUserProfile(user.uid, patch);
      // Also refresh the local profile via setUserProfile (merge)
      if (field === 'name' && profile) {
        await setUserProfile(user.uid, { ...profile, name: nameValue.trim() });
      } else if (field === 'school' && profile) {
        await setUserProfile(user.uid, { ...profile, school: schoolValue.trim() });
      }
      setEditing(null);
    } catch {
      setSaveError('Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await logOut();
    navigate('/');
  }

  // ── Avatar initials ───────────────────────────────────────────────────────
  const displayName = profile?.name || user?.displayName || 'Student';
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  if (dataLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <LoaderIcon className="h-6 w-6 animate-spin text-ink-muted" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">

      {/* Avatar + name card */}
      <section className="flex flex-col items-center gap-5 rounded-2xl border border-ink-line bg-paper-raised px-6 py-10 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-moss text-3xl font-semibold tracking-tight text-paper-raised shadow-lg">
          {user?.photoURL
            ? <img src={user.photoURL} alt={displayName} className="h-full w-full rounded-full object-cover" />
            : initials
          }
        </div>
        <div>
          <h2 className="font-display text-2xl text-ink">{displayName}</h2>
          <p className="mt-1 text-sm text-ink-muted">{profile?.email ?? user?.email}</p>
          {profile?.school && (
            <p className="mt-1 text-sm text-ink-muted">{profile.school}</p>
          )}
        </div>

        {/* Quick stats row */}
        <dl className="mt-2 grid w-full grid-cols-3 gap-3 rounded-xl border border-ink-line bg-paper px-4 py-4">
          <div className="flex flex-col items-center gap-1">
            <dt className="text-xs text-ink-muted">Streak</dt>
            <dd className="flex items-center gap-1 text-xl font-semibold tabular-nums text-ink">
              <FlameIcon className="h-4 w-4 text-clay" aria-hidden />
              {streakDays}d
            </dd>
          </div>
          <div className="flex flex-col items-center gap-1">
            <dt className="text-xs text-ink-muted">Sessions done</dt>
            <dd className="text-xl font-semibold tabular-nums text-ink">
              {doneSessions}
              <span className="text-sm font-normal text-ink-muted">/{totalSessions}</span>
            </dd>
          </div>
          <div className="flex flex-col items-center gap-1">
            <dt className="text-xs text-ink-muted">Quiz avg.</dt>
            <dd className="text-xl font-semibold tabular-nums text-ink">
              {avgScore !== null ? `${avgScore}%` : '—'}
            </dd>
          </div>
        </dl>
      </section>

      {/* Editable details */}
      <section className="rounded-2xl border border-ink-line bg-paper-raised">
        <div className="border-b border-ink-line px-5 py-4">
          <h3 className="text-sm font-medium text-ink">Account details</h3>
        </div>

        <ul className="divide-y divide-ink-line">

          {/* Name */}
          <li className="flex items-start gap-3 px-5 py-4">
            <UserIcon className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-ink-muted">Display name</p>
              {editing === 'name' ? (
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    type="text"
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    className={inputClass}
                    autoFocus
                    placeholder="Your name"
                  />
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void saveField('name')}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-moss text-paper-raised transition-opacity hover:opacity-90 disabled:opacity-60"
                    aria-label="Save name"
                  >
                    {saving ? <LoaderIcon className="h-4 w-4 animate-spin" /> : <CheckIcon className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-ink-line text-ink-muted transition-colors hover:bg-paper-sunk"
                    aria-label="Cancel"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="mt-0.5 flex items-center justify-between gap-2">
                  <p className="text-sm text-ink">{displayName}</p>
                  <button
                    type="button"
                    onClick={() => startEdit('name')}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-paper-sunk hover:text-ink"
                    aria-label="Edit name"
                  >
                    <PencilIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </li>

          {/* Email (read-only) */}
          <li className="flex items-start gap-3 px-5 py-4">
            <MailIcon className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-ink-muted">Email address</p>
              <p className="mt-0.5 text-sm text-ink">{profile?.email ?? user?.email ?? '—'}</p>
            </div>
          </li>

          {/* School */}
          <li className="flex items-start gap-3 px-5 py-4">
            <SchoolIcon className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-ink-muted">School / Institution</p>
              {editing === 'school' ? (
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    type="text"
                    value={schoolValue}
                    onChange={(e) => setSchoolValue(e.target.value)}
                    className={inputClass}
                    autoFocus
                    placeholder="Northside University"
                  />
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void saveField('school')}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-moss text-paper-raised transition-opacity hover:opacity-90 disabled:opacity-60"
                    aria-label="Save school"
                  >
                    {saving ? <LoaderIcon className="h-4 w-4 animate-spin" /> : <CheckIcon className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-ink-line text-ink-muted transition-colors hover:bg-paper-sunk"
                    aria-label="Cancel"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="mt-0.5 flex items-center justify-between gap-2">
                  <p className="text-sm text-ink">{profile?.school || <span className="text-ink-muted">Not set</span>}</p>
                  <button
                    type="button"
                    onClick={() => startEdit('school')}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-paper-sunk hover:text-ink"
                    aria-label="Edit school"
                  >
                    <PencilIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </li>

          {/* Subjects summary */}
          <li className="flex items-start gap-3 px-5 py-4">
            <BookOpenIcon className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-ink-muted">Active subjects</p>
              <p className="mt-0.5 text-sm text-ink">
                {subjectCount === 0
                  ? <span className="text-ink-muted">No subjects yet — generate a timetable to add some.</span>
                  : subjects.map((s) => s.name).join(', ')
                }
              </p>
            </div>
          </li>
        </ul>

        {saveError && (
          <p className="px-5 pb-3 text-xs text-clay">{saveError}</p>
        )}
      </section>

      {/* Sign-out */}
      <section className="rounded-2xl border border-ink-line bg-paper-raised px-5 py-4">
        <h3 className="text-sm font-medium text-ink">Session</h3>
        <p className="mt-1 text-xs text-ink-muted">
          Signing out saves your data automatically.
        </p>
        <button
          type="button"
          onClick={() => void handleSignOut()}
          className="mt-4 flex items-center gap-2 rounded-lg border border-ink-line px-4 py-2.5 text-sm text-ink-soft transition-colors duration-150 ease-out hover:border-clay/40 hover:bg-clay/5 hover:text-clay"
        >
          <LogOutIcon className="h-4 w-4" aria-hidden />
          Sign out
        </button>
      </section>
    </div>
  );
}
