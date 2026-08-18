import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircleIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  LoaderIcon,
} from 'lucide-react';
import { GoogleMark } from './GoogleMark';
import { useAuth } from '../contexts/AuthContext';

type Status = 'idle' | 'submitting' | 'error' | 'success';

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  terms?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const strengthLabels = ['Too short', 'Weak', 'Good', 'Strong'] as const;

function scorePassword(value: string): number {
  if (value.length < 8) return 0;
  let score = 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/\d/.test(value) || /[^A-Za-z0-9]/.test(value)) score += 1;
  if (value.length >= 12) score = Math.min(3, score + 1);
  return Math.min(3, score);
}

/** Maps Firebase Auth error codes to friendly messages. */
function parseFirebaseError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account already uses this email. Sign in instead?';
    case 'auth/invalid-email':
      return 'That email address looks incomplete.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 8 characters with a mix of letters and numbers.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed. Please try again.';
    case 'auth/popup-blocked':
      return 'Popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email using a different sign-in method.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export function RegisterForm() {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [school, setSchool] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const strength = useMemo(() => scorePassword(password), [password]);

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!name.trim()) next.name = 'Tell us what to call you.';
    if (!email.trim()) next.email = 'Enter your school or personal email.';
    else if (!EMAIL_PATTERN.test(email.trim())) next.email = 'That email address looks incomplete.';
    if (!password) next.password = 'Choose a password.';
    else if (password.length < 8) next.password = 'Use at least 8 characters.';
    if (!acceptedTerms) next.terms = 'Please accept the terms to create an account.';
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    if (!validate()) { setStatus('idle'); return; }

    setStatus('submitting');
    try {
      await signUp(email.trim(), password, name.trim());
      setStatus('success');
      // PlannerContext will detect a new user and seed their Firestore data
      setTimeout(() => navigate('/onboarding-quiz'), 600);
    } catch (err: unknown) {
      setStatus('error');
      const code = (err as { code?: string }).code ?? '';
      const message = err instanceof Error && err.message.includes('Firebase is not configured')
        ? 'Firebase is not configured yet. Add your project environment values to enable sign-up.'
        : parseFirebaseError(code);
      setFormError(message);
    }
  }

  async function handleGoogleSignUp() {
    setFormError(null);
    setStatus('submitting');
    try {
      await signInWithGoogle();
      setStatus('success');
      setTimeout(() => navigate('/onboarding-quiz'), 500);
    } catch (err: unknown) {
      setStatus('error');
      const code = (err as { code?: string }).code ?? '';
      const message = err instanceof Error && err.message.includes('Firebase is not configured')
        ? 'Firebase is not configured yet. Add your project environment values to enable sign-up.'
        : parseFirebaseError(code);
      setFormError(message);
    }
  }

  const busy = status === 'submitting';

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-4">

      {/* Google Sign-Up */}
      <button
        type="button"
        disabled={busy}
        onClick={handleGoogleSignUp}
        className="flex h-11 w-full items-center justify-center gap-2.5 rounded-card border border-ink-line bg-paper-raised text-sm font-medium text-ink transition-[background-color,border-color,transform] duration-150 ease-out hover:border-ink-muted/60 hover:bg-paper-sunk active:translate-y-px disabled:opacity-60"
      >
        <GoogleMark />
        Sign up with school Google account
      </button>

      <div className="flex items-center gap-3 py-1">
        <span className="h-px flex-1 bg-ink-line" />
        <span className="text-xs uppercase tracking-wide text-ink-muted">or</span>
        <span className="h-px flex-1 bg-ink-line" />
      </div>

      {/* Form-level error */}
      {formError && (
        <p role="alert" className="flex items-start gap-2 rounded-card bg-clay/10 px-3 py-2.5 text-sm text-clay">
          <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {formError}
        </p>
      )}

      {/* Full Name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium text-ink-soft">Full name</label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={Boolean(fieldErrors.name)}
          aria-describedby={fieldErrors.name ? 'name-error' : undefined}
          placeholder="Ava Mensah"
          className="h-11 rounded-card border border-ink-line bg-paper-raised px-3.5 text-[15px] text-ink outline-none transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-ink-muted/70 focus:border-moss focus:shadow-[0_0_0_3px_rgba(31,107,84,0.15)] aria-[invalid=true]:border-clay"
        />
        {fieldErrors.name && <p id="name-error" className="text-xs text-clay">{fieldErrors.name}</p>}
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-email" className="text-sm font-medium text-ink-soft">Email</label>
        <input
          id="reg-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? 'reg-email-error' : undefined}
          placeholder="you@school.edu"
          className="h-11 rounded-card border border-ink-line bg-paper-raised px-3.5 text-[15px] text-ink outline-none transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-ink-muted/70 focus:border-moss focus:shadow-[0_0_0_3px_rgba(31,107,84,0.15)] aria-[invalid=true]:border-clay"
        />
        {fieldErrors.email && <p id="reg-email-error" className="text-xs text-clay">{fieldErrors.email}</p>}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-password" className="text-sm font-medium text-ink-soft">Password</label>
        <div className="relative">
          <input
            id="reg-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby="password-strength"
            placeholder="At least 8 characters"
            className="h-11 w-full rounded-card border border-ink-line bg-paper-raised pl-3.5 pr-11 text-[15px] text-ink outline-none transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-ink-muted/70 focus:border-moss focus:shadow-[0_0_0_3px_rgba(31,107,84,0.15)] aria-[invalid=true]:border-clay"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors duration-150 ease-out hover:bg-paper-sunk hover:text-ink"
          >
            {showPassword
              ? <EyeOffIcon className="h-4 w-4" aria-hidden="true" />
              : <EyeIcon className="h-4 w-4" aria-hidden="true" />
            }
          </button>
        </div>
        {/* Strength meter */}
        <div className="flex items-center gap-3">
          <span className="flex flex-1 gap-1" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors duration-200 ease-out ${password && strength > i
                  ? strength === 1 ? 'bg-clay' : strength === 2 ? 'bg-sand' : 'bg-moss'
                  : 'bg-ink-line'
                  }`}
              />
            ))}
          </span>
          <span
            id="password-strength"
            className={`w-20 text-right text-xs ${fieldErrors.password ? 'text-clay' : 'text-ink-muted'}`}
          >
            {fieldErrors.password ?? (password ? strengthLabels[strength] : '')}
          </span>
        </div>
      </div>

      {/* School (optional) */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="school" className="text-sm font-medium text-ink-soft">
          School <span className="font-normal text-ink-muted"></span>
        </label>
        <input
          id="school"
          type="text"
          autoComplete="organization"
          value={school}
          onChange={(e) => setSchool(e.target.value)}
          placeholder="Northside University"
          className="h-11 rounded-card border border-ink-line bg-paper-raised px-3.5 text-[15px] text-ink outline-none transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-ink-muted/70 focus:border-moss focus:shadow-[0_0_0_3px_rgba(31,107,84,0.15)]"
        />
        <p className="text-xs text-ink-muted">Lets us match your term dates and academic calendar.</p>
      </div>

      {/* Terms */}
      <div className="flex flex-col gap-1.5">
        <label className="flex cursor-pointer items-start gap-2.5 text-sm leading-relaxed text-ink-soft">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            aria-invalid={Boolean(fieldErrors.terms)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-ink-line accent-moss"
          />
          <span>
            I agree to the{' '}
            <a href="#terms" className="text-moss underline-offset-2 hover:underline">Terms</a>{' '}
            and{' '}
            <a href="#privacy" className="text-moss underline-offset-2 hover:underline">Privacy Policy</a>.
          </span>
        </label>
        {fieldErrors.terms && <p className="text-xs text-clay">{fieldErrors.terms}</p>}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={busy || status === 'success'}
        className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-card bg-moss text-sm font-medium text-paper-raised transition-[background-color,transform,opacity] duration-150 ease-out hover:bg-moss-hover active:translate-y-px disabled:opacity-80"
      >
        {busy && <LoaderIcon className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {status === 'success' && <CheckIcon className="h-4 w-4" aria-hidden="true" />}
        {busy ? 'Creating your account…' : status === 'success' ? 'Account created — adding your classes' : 'Create account'}
      </button>

      <p aria-live="polite" className="sr-only">
        {busy ? 'Creating your account' : status === 'success' ? 'Account created, continuing to add your classes' : ''}
      </p>

      <p className="text-sm text-ink-muted">
        Already have an account?{' '}
        <Link
          to="/"
          className="font-medium text-moss underline-offset-2 transition-colors duration-150 ease-out hover:text-moss-hover hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}