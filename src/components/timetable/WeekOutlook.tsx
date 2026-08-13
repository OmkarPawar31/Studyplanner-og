import { format, parseISO } from 'date-fns';
import { usePlanner } from '../../contexts/PlannerContext';

const barColors = ['bg-moss', 'bg-clay', 'bg-sand', 'bg-ink-soft'];

export function WeekOutlook() {
  const { blocks, subjects, todayKey } = usePlanner();

  const days = [...new Set(blocks.map((block) => block.date))].sort();
  const perDay = days.map((date) => {
    const dayBlocks = blocks.filter(
      (block) => block.date === date && block.kind !== 'break'
    );
    const total = dayBlocks.reduce((acc, block) => acc + block.minutes, 0);
    const bySubject = subjects.map((subject) => ({
      subject,
      minutes: dayBlocks.
      filter((block) => block.subjectId === subject.id).
      reduce((acc, block) => acc + block.minutes, 0)
    }));
    return { date, total, bySubject };
  });

  const max = Math.max(60, ...perDay.map((day) => day.total));

  return (
    <section
      aria-labelledby="week-heading"
      className="rounded-card border border-ink-line bg-paper-raised p-5">
      
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="week-heading" className="text-sm font-medium text-ink">
          The rest of the plan
        </h2>
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {subjects.map((subject, index) =>
          <li
            key={subject.id}
            className="flex items-center gap-1.5 text-xs text-ink-muted">
            
              <span
              className={`h-2 w-2 rounded-sm ${barColors[index % barColors.length]}`}
              aria-hidden="true" />
            
              {subject.name}
            </li>
          )}
        </ul>
      </div>

      <ol className="mt-5 flex items-end gap-3 sm:gap-4">
        {perDay.map((day) =>
        <li key={day.date} className="flex flex-1 flex-col items-center gap-2">
            <span className="text-[11px] tabular-nums text-ink-muted">
              {day.total === 0 ? '—' : `${(day.total / 60).toFixed(1)}h`}
            </span>
            <div
            className="flex h-28 w-full max-w-14 flex-col-reverse overflow-hidden rounded-md bg-paper-sunk"
            title={`${(day.total / 60).toFixed(1)} hours planned`}>
            
              {day.bySubject.map((entry, index) =>
            <div
              key={entry.subject.id}
              className={barColors[index % barColors.length]}
              style={{ height: `${entry.minutes / max * 100}%` }} />

            )}
            </div>
            <span
            className={`text-xs ${
            day.date === todayKey ? 'font-medium text-ink' : 'text-ink-muted'}`
            }>
            
              {format(parseISO(day.date), 'EEE')}
            </span>
          </li>
        )}
      </ol>
    </section>);

}