import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BarChart2Icon, SparklesIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScoreTrendChart } from '../../components/analysis/ScoreTrendChart';
import { TopicMastery } from '../../components/analysis/TopicMastery';
import { usePlanner } from '../../contexts/PlannerContext';
import {
  examReadiness,
  overallAccuracy,
  studyMinutesByDay,
  topicAccuracy,
} from '../../utils/analytics';

// ─── Idle prompt card shown before analysis is triggered ──────────────────

function AnalysisIdleScreen({ onRun }: { onRun: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      {/* Decorative icon ring */}
      <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-paper-raised border border-ink-line shadow-sm">
        <BarChart2Icon className="h-10 w-10 text-moss" aria-hidden="true" />
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full border-2 border-moss/30 animate-ping" />
      </div>

      <div className="max-w-sm">
        <h2 className="font-display text-2xl text-ink">Analysis is ready to run</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          Analysis runs on-demand so it doesn't slow down your session.
          Click the button below once you've finished a quiz to generate
          your personalised insights.
        </p>
      </div>

      <button
        type="button"
        onClick={onRun}
        className="flex h-12 items-center gap-2.5 rounded-card bg-moss px-7 text-sm font-semibold text-paper-raised shadow-md transition-[background-color,transform,box-shadow] duration-150 ease-out hover:bg-moss-hover hover:shadow-lg active:translate-y-px"
      >
        <SparklesIcon className="h-4 w-4" aria-hidden="true" />
        Run Analysis
      </button>

      <p className="text-xs text-ink-muted">
        Complete a quiz first to get the most accurate insights.
      </p>
    </div>
  );
}

// ─── Full analysis content ─────────────────────────────────────────────────

function AnalysisContent() {
  const { subjects, attempts, blocks, now } = usePlanner();
  const readiness = examReadiness(subjects, attempts, blocks, now);
  const lead = readiness[0];
  const accuracy = overallAccuracy(attempts);
  const scores = topicAccuracy(attempts);
  const weakest = scores[scores.length - 1];
  const strongest = scores[0];
  const habits = studyMinutesByDay(blocks);
  const plannedHours = habits.reduce((acc, day) => acc + day.planned, 0);
  const doneHours = habits.reduce((acc, day) => acc + day.done, 0);
  const maxHours = Math.max(1, ...habits.map((day) => day.planned));

  return (
    <motion.div
      className="flex flex-col gap-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        {/* Readiness */}
        <section
          aria-labelledby="readiness-heading"
          className="rounded-card border border-ink-line bg-ink p-6 text-paper"
        >
          <h2 id="readiness-heading" className="text-sm font-medium text-paper/70">
            Next exam readiness
          </h2>
          {lead && (
            <>
              <p className="mt-4 font-display text-[56px] leading-none">
                {lead.score}
                <span className="text-[24px] text-paper/50">/100</span>
              </p>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-paper/80">
                {lead.subject.name} in {lead.daysLeft} day
                {lead.daysLeft === 1 ? '' : 's'} — {Math.round(lead.mastery * 100)}%
                quiz accuracy and {Math.round(lead.coverage * 100)}% of planned
                sessions finished.
              </p>
              <ul className="mt-6 flex flex-col divide-y divide-paper/10 border-t border-paper/10">
                {readiness.map((entry) => (
                  <li key={entry.subject.id} className="flex items-center gap-4 py-3">
                    <span className="min-w-0 flex-1 truncate text-sm text-paper">
                      {entry.subject.name}
                    </span>
                    <span className="w-24 shrink-0 text-xs text-paper/50">
                      {entry.daysLeft}d left
                    </span>
                    <span className="h-1.5 w-24 shrink-0 overflow-hidden rounded-full bg-paper/15">
                      <span
                        className={`block h-full rounded-full ${
                          entry.verdict === 'on track'
                            ? 'bg-moss'
                            : entry.verdict === 'tight'
                            ? 'bg-sand'
                            : 'bg-clay'
                        }`}
                        style={{ width: `${entry.score}%` }}
                      />
                    </span>
                    <span className="w-16 shrink-0 text-right text-xs capitalize text-paper/70">
                      {entry.verdict}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        {/* AI coach summary */}
        <section
          aria-labelledby="coach-heading"
          className="flex flex-col rounded-card border border-ink-line bg-paper-raised p-5"
        >
          <h2
            id="coach-heading"
            className="flex items-center gap-2 text-sm font-medium text-ink"
          >
            <SparklesIcon className="h-4 w-4 text-moss" aria-hidden="true" />
            What Study Planner sees
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
            You answer {Math.round(accuracy * 100)}% of quiz questions correctly
            overall. {strongest?.topic} is your anchor at{' '}
            {Math.round((strongest?.accuracy ?? 0) * 100)}%, while{' '}
            {weakest?.topic} keeps stalling at{' '}
            {Math.round((weakest?.accuracy ?? 0) * 100)}% — it has been the lowest
            topic for three attempts running.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
            You finish morning sessions far more often than evening ones, so the
            plan now front-loads {weakest?.topic} before noon and closes each day
            with a short retrieval quiz.
          </p>

          <dl className="mt-auto grid grid-cols-3 gap-3 border-t border-ink-line pt-4">
            <div>
              <dt className="text-xs text-ink-muted">Accuracy</dt>
              <dd className="mt-0.5 text-xl tabular-nums text-ink">
                {Math.round(accuracy * 100)}%
              </dd>
            </div>
            <div>
              <dt className="text-xs text-ink-muted">Attempts</dt>
              <dd className="mt-0.5 text-xl tabular-nums text-ink">
                {attempts.length}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-ink-muted">Hours done</dt>
              <dd className="mt-0.5 text-xl tabular-nums text-ink">
                {doneHours.toFixed(1)}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ScoreTrendChart />
        <TopicMastery />
      </div>

      {/* Study habits bar chart */}
      <section
        aria-labelledby="habits-heading"
        className="rounded-card border border-ink-line bg-paper-raised p-5"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="habits-heading" className="text-sm font-medium text-ink">
            Planned vs completed hours
          </h2>
          <p className="text-xs text-ink-muted">
            {doneHours.toFixed(1)} of {plannedHours.toFixed(1)} h ·{' '}
            {plannedHours === 0
              ? '0'
              : Math.round((doneHours / plannedHours) * 100)}
            % follow-through
          </p>
        </div>
        <ol className="mt-5 flex items-end gap-3">
          {habits.map((day) => (
            <li key={day.date} className="flex flex-1 flex-col items-center gap-2">
              <div className="relative h-24 w-full max-w-12 overflow-hidden rounded-md bg-paper-sunk">
                <div
                  className="absolute bottom-0 w-full bg-ink-line"
                  style={{ height: `${Math.min(100, (day.planned / maxHours) * 100)}%` }}
                />
                <div
                  className="absolute bottom-0 w-full bg-moss"
                  style={{ height: `${Math.min(100, (day.done / maxHours) * 100)}%` }}
                />
              </div>
              <span className="text-[11px] text-ink-muted">{day.date}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 flex gap-4 text-xs text-ink-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-moss" aria-hidden="true" />
            Completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-ink-line" aria-hidden="true" />
            Planned
          </span>
        </p>
      </section>

      <p className="sr-only">
        {readiness.map((entry) => `${entry.subject.name} is ${entry.verdict}`).join('. ')}
      </p>
    </motion.div>
  );
}

// ─── Page shell ───────────────────────────────────────────────────────────

export function Analysis() {
  const [searchParams, setSearchParams] = useSearchParams();
  // `analysisReady` gates whether the heavy content renders
  const [analysisReady, setAnalysisReady] = useState(false);

  // If student landed here via the "View Analysis" button after a quiz,
  // auto-trigger the analysis and clean up the ?run=1 param so a refresh
  // doesn't re-trigger silently.
  useEffect(() => {
    if (searchParams.get('run') === '1') {
      setAnalysisReady(true);
      setSearchParams({}, { replace: true });
    }
  }, []);   // run once on mount only

  return (
    <AnimatePresence mode="wait">
      {analysisReady ? (
        <AnalysisContent key="content" />
      ) : (
        <motion.div
          key="idle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <AnalysisIdleScreen onRun={() => setAnalysisReady(true)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}