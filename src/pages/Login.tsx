import { LoginForm } from '../components/LoginForm';
import { PlannerPreview } from '../components/PlannerPreview';

export function Login() {
  return (
    <div className="grid min-h-full w-full grid-cols-1 bg-paper lg:grid-cols-[minmax(0,1fr)_1.1fr]">
      <main className="flex min-h-full flex-col px-6 py-10 sm:px-12 lg:px-16 xl:px-24">
        <header className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink font-display text-[17px] leading-none text-paper">

            S
          </span>
          <span className="text-[15px] font-medium tracking-tight text-ink">
            Study Planner
          </span>
        </header>

        <div className="mx-auto flex w-full max-w-[26rem] flex-1 flex-col justify-center py-12">
          <h1 className="font-display text-[40px] leading-[1.05] text-ink">
            Welcome back.
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
            Sign in and today's plan is already waiting — reshuffled around
            everything that shifted since yesterday.
          </p>

          <LoginForm />
        </div>

        <footer className="mx-auto flex w-full max-w-[26rem] flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-muted">
          <span>Free while you're a student</span>
          <a
            href="#privacy"
            className="underline-offset-2 transition-colors duration-150 ease-out hover:text-ink hover:underline">

            Privacy
          </a>
          <a
            href="#terms"
            className="underline-offset-2 transition-colors duration-150 ease-out hover:text-ink hover:underline">

            Terms
          </a>
          <a
            href="#help"
            className="underline-offset-2 transition-colors duration-150 ease-out hover:text-ink hover:underline">

            Get help
          </a>
        </footer>
      </main>

      <PlannerPreview />
    </div>);

}