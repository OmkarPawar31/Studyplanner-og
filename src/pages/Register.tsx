import { Link } from 'react-router-dom';
import { RegisterForm } from '../components/RegisterForm';
import { PlannerPreview } from '../components/PlannerPreview';

export function Register() {
  return (
    <div className="grid min-h-full w-full grid-cols-1 bg-paper lg:grid-cols-[minmax(0,1fr)_1.1fr]">
      <main className="flex min-h-full flex-col px-6 py-10 sm:px-12 lg:px-16 xl:px-24">
        <header className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink font-display text-[17px] leading-none text-paper">
              
              M
            </span>
            <span className="text-[15px] font-medium tracking-tight text-ink">
              Marigold
            </span>
          </Link>
          <Link
            to="/"
            className="text-sm text-ink-muted underline-offset-2 transition-colors duration-150 ease-out hover:text-ink hover:underline">
            
            Sign in
          </Link>
        </header>

        <div className="mx-auto flex w-full max-w-[26rem] flex-1 flex-col justify-center py-12">
          <h1 className="font-display text-[40px] leading-[1.05] text-ink">
            Start your term.
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
            Create an account, drop in your syllabi, and Marigold builds the
            first week for you in about two minutes.
          </p>

          <RegisterForm />
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

      <PlannerPreview
        eyebrow="What your first week looks like"
        headline="Paste a syllabus and every due date lands in the plan."
        caption="Marigold learns when you actually get work done, then reshuffles the week whenever something slips. Nothing to configure on day one." />
      
    </div>);

}