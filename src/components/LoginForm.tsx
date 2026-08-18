import React, { useState } from 'react';
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
  email?: string;
  password?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Maps Firebase Auth error codes to friendly messages. */
function parseFirebaseError(code: string): string {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return "That email or password isn't right. Try again or reset it below.";
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please wait a moment before trying again.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/invalid-email':
      return 'That email address looks incomplete.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed. Please try again.';
    case 'auth/popup-blocked':
      return 'Popup was blocked by your browser. Please allow popups for this site.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export function LoginForm() {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [status, setStatus] = useState<Status>('idle');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!email.trim()) next.email = 'Enter your school or personal email.';
    else if (!EMAIL_PATTERN.test(email.trim()))
      next.email = 'That email address looks incomplete.';
    if (!password) next.password = 'Enter your password.';
    else if (password.length < 8) next.password = 'Passwords are at least 8 characters.';
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    if (!validate()) { setStatus('idle'); return; }

    setStatus('submitting');
    try {
      await signIn(email.trim(), password);
      setStatus('success');
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err: unknown) {
      setStatus('error');
      const code = (err as { code?: string }).code ?? '';
      const message = err instanceof Error && err.message.includes('Firebase is not configured')
        ? 'Firebase is not configured yet. Add your project environment values to enable sign-in.'
        : parseFirebaseError(code);
      setFormError(message);
    }
  }

  async function handleGoogleSignIn() {
    setFormError(null);
    setStatus('submitting');
    try {
      await signInWithGoogle();
      setStatus('success');
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err: unknown) {
      setStatus('error');
      const code = (err as { code?: string }).code ?? '';
      const message = err instanceof Error && err.message.includes('Firebase is not configured')
        ? 'Firebase is not configured yet. Add your project environment values to enable sign-in.'
        : parseFirebaseError(code);
      setFormError(message);
    }
  }

  const busy = status === 'submitting';

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-4">

      {/* Google Sign-In */}
      <button
        type="button"
        disabled={busy}
        onClick={handleGoogleSignIn}
        className="flex h-11 w-full items-center justify-center gap-2.5 rounded-card border border-ink-line bg-paper-raised text-sm font-medium text-ink transition-[background-color,border-color,transform] duration-150 ease-out hover:border-ink-muted/60 hover:bg-paper-sunk active:translate-y-px disabled:opacity-60"
      >
        <GoogleMark />
        Continue with school Google account
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

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-ink-soft">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? 'email-error' : undefined}
          placeholder="you@school.edu"
          className="h-11 rounded-card border border-ink-line bg-paper-raised px-3.5 text-[15px] text-ink outline-none transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-ink-muted/70 focus:border-moss focus:shadow-[0_0_0_3px_rgba(31,107,84,0.15)] aria-[invalid=true]:border-clay"
        />
        {fieldErrors.email && (
          <p id="email-error" className="text-xs text-clay">{fieldErrors.email}</p>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor="password" className="text-sm font-medium text-ink-soft">Password</label>
          <a href="#reset" className="text-xs text-moss underline-offset-2 transition-colors duration-150 ease-out hover:text-moss-hover hover:underline">
            Forgot password?
          </a>
        </div>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? 'password-error' : undefined}
            placeholder="••••••••"
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
        {fieldErrors.password && (
          <p id="password-error" className="text-xs text-clay">{fieldErrors.password}</p>
        )}
      </div>

      {/* Remember me */}
      <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm text-ink-soft">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="h-4 w-4 rounded border-ink-line text-moss accent-moss"
        />
        Keep me signed in on this device
      </label>

      {/* Submit */}
      <button
        type="submit"
        disabled={busy || status === 'success'}
        className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-card bg-moss text-sm font-medium text-paper-raised transition-[background-color,transform,opacity] duration-150 ease-out hover:bg-moss-hover active:translate-y-px disabled:opacity-80"
      >
        {busy && <LoaderIcon className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {status === 'success' && <CheckIcon className="h-4 w-4" aria-hidden="true" />}
        {busy ? 'Signing in…' : status === 'success' ? 'Opening your week' : 'Sign in'}
      </button>

      <p aria-live="polite" className="sr-only">
        {busy ? 'Signing in' : status === 'success' ? 'Signed in, opening your planner' : ''}
      </p>

      <p className="text-sm text-ink-muted">
        New here?{' '}
        <Link
          to="/register"
          className="font-medium text-moss underline-offset-2 transition-colors duration-150 ease-out hover:text-moss-hover hover:underline"
        >
          Create a free student account
        </Link>
      </p>
    </form>
  );
}