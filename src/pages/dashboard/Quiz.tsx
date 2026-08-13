import { format, parseISO } from 'date-fns';
import { QuizRunner } from '../../components/quiz/QuizRunner';
import { usePlanner } from '../../contexts/PlannerContext';

export function Quiz() {
  const { attempts, subjects } = usePlanner();
  const recent = [...attempts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]">
      <QuizRunner />

      <aside className="rounded-card border border-ink-line bg-paper-raised p-5 xl:sticky xl:top-32 xl:self-start">
        <h2 className="text-sm font-medium text-ink">Recent attempts</h2>
        <ol className="mt-4 flex flex-col gap-3.5">
          {recent.map((attempt) => {
            const subject = subjects.find((entry) => entry.id === attempt.subjectId);
            const percent = Math.round(attempt.correct / attempt.total * 100);
            return (
              <li key={attempt.id} className="flex items-center gap-3">
                <span className="w-10 shrink-0 text-sm tabular-nums text-ink">
                  {percent}%
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-ink-soft">
                    {subject?.name ?? 'Subject'}
                  </p>
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-paper-sunk">
                    <div
                      className={percent >= 70 ? 'h-full bg-moss' : 'h-full bg-clay'}
                      style={{ width: `${percent}%` }} />
                    
                  </div>
                </div>
                <span className="shrink-0 text-xs text-ink-muted">
                  {format(parseISO(attempt.date), 'd MMM')}
                </span>
              </li>);

          })}
        </ol>
        <p className="mt-5 text-xs leading-relaxed text-ink-muted">
          Every attempt feeds the analysis tab and reshapes which topics the next
          quiz pulls from.
        </p>
      </aside>
    </div>);

}