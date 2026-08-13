import { TrendingDownIcon, TrendingUpIcon } from 'lucide-react';
import { usePlanner } from '../../contexts/PlannerContext';
import { topicAccuracy } from '../../utils/analytics';

export function TopicMastery() {
  const { attempts } = usePlanner();
  const scores = topicAccuracy(attempts);
  const strengths = scores.slice(0, 3);
  const weaknesses = [...scores].reverse().slice(0, 3);

  return (
    <section
      aria-labelledby="mastery-heading"
      className="rounded-card border border-ink-line bg-paper-raised p-5">
      
      <h2 id="mastery-heading" className="text-sm font-medium text-ink">
        Topic mastery
      </h2>
      <p className="mt-0.5 text-xs text-ink-muted">
        Accuracy across every quiz you've taken, per topic.
      </p>

      <ul className="mt-5 flex flex-col gap-3">
        {scores.map((entry) => {
          const percent = Math.round(entry.accuracy * 100);
          const tone =
          percent >= 75 ? 'bg-moss' : percent >= 50 ? 'bg-sand' : 'bg-clay';
          return (
            <li key={entry.topic} className="flex items-center gap-3">
              <span className="w-36 shrink-0 truncate text-sm text-ink-soft">
                {entry.topic}
              </span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-paper-sunk">
                <span
                  className={`block h-full rounded-full ${tone}`}
                  style={{ width: `${percent}%` }} />
                
              </span>
              <span className="w-10 shrink-0 text-right text-sm tabular-nums text-ink">
                {percent}%
              </span>
            </li>);

        })}
      </ul>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-moss">
            <TrendingUpIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Strengths
          </p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {strengths.map((entry) =>
            <li key={entry.topic} className="text-sm text-ink-soft">
                {entry.topic}{' '}
                <span className="text-ink-muted">
                  · {Math.round(entry.accuracy * 100)}%
                </span>
              </li>
            )}
          </ul>
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-clay">
            <TrendingDownIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Needs work
          </p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {weaknesses.map((entry) =>
            <li key={entry.topic} className="text-sm text-ink-soft">
                {entry.topic}{' '}
                <span className="text-ink-muted">
                  · {Math.round(entry.accuracy * 100)}%
                </span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>);

}