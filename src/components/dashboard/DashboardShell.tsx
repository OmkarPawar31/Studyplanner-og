import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  CalendarRangeIcon,
  FlameIcon,
  ListChecksIcon,
  LogOutIcon,
  UserCircleIcon,
} from 'lucide-react';
import { usePlanner } from '../../contexts/PlannerContext';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationCenter } from './NotificationCenter';

// Updated tabs include a Profile tab with a user icon
const tabs = [
  { to: '/dashboard', label: 'Timetable', icon: CalendarRangeIcon, end: true },
  { to: '/dashboard/quiz', label: 'Quiz', icon: ListChecksIcon, end: false },
  { to: '/dashboard/profile', label: 'Profile', icon: UserCircleIcon, end: false },
];

const titles: Record<string, { title: string; subtitle: string; }> = {
  '/dashboard': {
    title: 'Timetable',
    subtitle: 'Today’s schedule and the plan Marigold built from your exams.'
  },
  '/dashboard/quiz': {
    title: 'Quiz',
    subtitle: 'Fresh questions drawn against the topics you keep missing.'
  },
  '/dashboard/profile': {
    title: 'Profile',
    subtitle: 'Your account details and study stats.'
  },
};

export function DashboardShell() {
  const { student, now, notifications } = usePlanner();
  const navigate = useNavigate();
  const { logOut } = useAuth();
  const { pathname } = useLocation();
  const heading = titles[pathname] ?? titles['/dashboard'];
  const missed = notifications.find((entry) => entry.kind === 'missed');

  return (
    <div className="flex min-h-full w-full bg-paper">
      <nav
        aria-label="Dashboard sections"
        className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-ink-line bg-paper-raised px-4 py-6 md:flex"
      >
        <div className="flex items-center gap-2.5 px-2">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink font-display text-[17px] leading-none text-paper"
          >
            M
          </span>
          <span className="text-[15px] font-medium tracking-tight text-ink">
            StudyPlanner
          </span>
        </div>

        <ul className="mt-8 flex flex-col gap-1">
          {tabs.map((tab) => (
            <li key={tab.to}>
              <NavLink
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-card px-3 py-2.5 text-sm transition-colors duration-150 ease-out ${isActive ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-paper-sunk hover:text-ink'
                  }`
                }
              >
                <tab.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {tab.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="mt-auto rounded-card border border-ink-line px-3 py-3">
          <p className="flex items-center gap-2 text-sm font-medium text-ink">
            <FlameIcon className="h-4 w-4 text-clay" aria-hidden="true" />
            {student?.streakDays ?? 0}-day streak
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">
            Finish today's plan to keep it alive.
          </p>
        </div>

        <button
          type="button"
          onClick={async () => {
            try {
              await logOut();
              navigate('/');
            } catch (err) {
              console.error('Logout failed', err);
            }
          }}
          className="mt-3 flex items-center gap-2 rounded-card px-3 py-2 text-sm text-ink-muted transition-colors duration-150 ease-out hover:bg-paper-sunk hover:text-ink"
        >
          <LogOutIcon className="h-4 w-4" aria-hidden="true" />
          Sign out
        </button>
      </nav>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-ink-line bg-paper/90 px-5 py-4 backdrop-blur lg:px-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-ink-muted">
                {format(now, 'EEEE, d MMMM')} · {format(now, 'HH:mm')} · {student?.name ?? 'Student'}
              </p>
              <h1 className="mt-1 font-display text-[30px] leading-tight text-ink">
                {heading.title}
              </h1>
              <p className="mt-0.5 max-w-xl text-sm text-ink-muted">
                {heading.subtitle}
              </p>
            </div>
            <NotificationCenter />
          </div>

          {missed && (
            <div
              role="status"
              className="border-b border-clay/25 bg-clay/[0.07] px-5 py-3 text-sm text-ink lg:px-10"
            >
              <span className="font-medium text-clay">{missed.title}.</span>{' '}
              <span className="text-ink-soft">{missed.body}</span>
            </div>
          )}
        </header>

        <main className="flex-1 px-5 py-6 lg:px-10 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}