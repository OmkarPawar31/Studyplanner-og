import { Link } from 'react-router-dom';

const features = [
    {
        title: 'Smart weekly planning',
        description: 'Organize lectures, assignments, and revision blocks into one calm, realistic schedule.',
    },
    {
        title: 'Priority-aware focus',
        description: 'See what matters most each day so you can focus on deadlines without feeling overwhelmed.',
    },
    {
        title: 'Built for students',
        description: 'Track your workload across classes, projects, and personal study time in one place.',
    },
];

export function Landing() {
    return (
        <div className="min-h-screen bg-paper text-ink">
            <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 sm:px-8 lg:px-10">
                <Link to="/" className="flex items-center gap-2.5">
                    <span
                        aria-hidden="true"
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink font-display text-lg leading-none text-paper"
                    >
                        S
                    </span>
                    <span className="text-base font-medium tracking-tight text-ink">Study Planner</span>
                </Link>

                <nav className="flex items-center gap-3 text-sm font-medium">
                    <Link to="/login" className="rounded-full px-4 py-2 text-ink-muted transition hover:text-ink">
                        Login
                    </Link>
                    <Link
                        to="/register"
                        className="rounded-full bg-ink px-4 py-2 text-paper transition hover:bg-ink/90"
                    >
                        Sign up
                    </Link>
                </nav>
            </header>

            <main className="mx-auto max-w-6xl px-6 pb-16 pt-8 sm:px-8 lg:px-10">
                <section className="grid items-center gap-12 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:py-14">
                    <div>
                        <span className="inline-flex rounded-full border border-ink-line bg-paper-raised px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-moss">
                            AI Student Planner
                        </span>
                        <h1 className="mt-6 max-w-xl font-display text-5xl leading-none text-ink sm:text-6xl">
                            Turn chaos into a calm study plan.
                        </h1>
                        <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">
                            Study Planner helps students organize coursework, deadlines, and revision time in one
                            focused system. Build a weekly plan, track your progress, and stay ahead without the
                            stress.
                        </p>

                        <div className="mt-8 flex flex-wrap items-center gap-4">
                            <Link
                                to="/login"
                                className="rounded-full bg-moss px-6 py-3 text-sm font-medium text-paper transition hover:bg-moss-hover"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="rounded-full border border-ink-line bg-paper-raised px-6 py-3 text-sm font-medium text-ink transition hover:border-ink-muted hover:bg-paper-sunk"
                            >
                                Create account
                            </Link>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-6 text-sm text-ink-muted">
                            <span>Weekly planning</span>
                            <span>Deadline tracking</span>
                            <span>Study focus</span>
                        </div>
                    </div>

                    <div className="rounded-[32px] border border-ink-line bg-ink p-6 text-paper shadow-[0_30px_60px_rgba(18,25,22,0.18)]">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-paper/60">This week</p>
                            <span className="rounded-full bg-paper/10 px-2.5 py-1 text-xs text-paper/80">Balanced</span>
                        </div>

                        <div className="mt-8 space-y-4">
                            {[
                                ['Mon', 'Mathematics revision', '2h 30m'],
                                ['Tue', 'Lab report draft', '1h 45m'],
                                ['Wed', 'Physics practice set', '2h'],
                                ['Thu', 'Essay planning', '1h 30m'],
                            ].map(([day, task, time]) => (
                                <div key={day} className="flex items-center justify-between rounded-2xl border border-paper/10 bg-paper/[0.04] p-3.5">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.12em] text-paper/50">{day}</p>
                                        <p className="mt-1 text-sm font-medium text-paper">{task}</p>
                                    </div>
                                    <span className="text-xs text-paper/70">{time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mt-8 grid gap-6 border-t border-ink-line pt-10 md:grid-cols-3">
                    {features.map((feature) => (
                        <article key={feature.title} className="rounded-3xl border border-ink-line bg-paper-raised p-6">
                            <div className="mb-4 h-10 w-10 rounded-2xl bg-moss/15" />
                            <h2 className="text-xl font-semibold text-ink">{feature.title}</h2>
                            <p className="mt-3 text-sm leading-relaxed text-ink-muted">{feature.description}</p>
                        </article>
                    ))}
                </section>
            </main>
        </div>
    );
}
