import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRightIcon,
  BarChart2Icon,
  CheckIcon,
  LoaderIcon,
  RotateCcwIcon,
  SparklesIcon,
  XIcon,
} from 'lucide-react';
import { usePlanner } from '../../contexts/PlannerContext';
import { generateQuiz } from '../../utils/quiz';
import {
  examReadiness,
  overallAccuracy,
  studyMinutesByDay,
  topicAccuracy,
} from '../../utils/analytics';
import { ScoreTrendChart } from '../analysis/ScoreTrendChart';
import { TopicMastery } from '../analysis/TopicMastery';
import type { QuizAttempt, QuizQuestion } from '../../types/planner';

type Phase = 'setup' | 'generating' | 'running' | 'results';

// ─── Inline analysis panel (rendered only when student clicks "Run Analysis") ─

function InlineAnalysis() {
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
      className="mt-6 flex flex-col gap-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.23, 1, 0.32, 1] }}
    >
      {/* Divider */}
      <div className="flex items-center gap-3">
        <hr className="flex-1 border-ink-line" />
        <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-muted">
          <BarChart2Icon className="h-3.5 w-3.5" aria-hidden="true" />
          Analysis
        </span>
        <hr className="flex-1 border-ink-line" />
      </div>

      {/* Exam readiness */}
      <section
        aria-labelledby="inline-readiness-heading"
        className="rounded-card border border-ink-line bg-ink p-5 text-paper"
      >
        <h3 id="inline-readiness-heading" className="text-xs font-medium text-paper/60">
          Next exam readiness
        </h3>
        {lead ? (
          <>
            <p className="mt-3 font-display text-[44px] leading-none">
              {lead.score}
              <span className="text-[20px] text-paper/50">/100</span>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-paper/75">
              {lead.subject.name} in {lead.daysLeft} day{lead.daysLeft === 1 ? '' : 's'} —{' '}
              {Math.round(lead.mastery * 100)}% quiz accuracy and{' '}
              {Math.round(lead.coverage * 100)}% of planned sessions finished.
            </p>
            <ul className="mt-4 flex flex-col divide-y divide-paper/10 border-t border-paper/10">
              {readiness.map((entry) => (
                <li key={entry.subject.id} className="flex items-center gap-3 py-2.5">
                  <span className="min-w-0 flex-1 truncate text-sm text-paper">
                    {entry.subject.name}
                  </span>
                  <span className="shrink-0 text-xs text-paper/50">{entry.daysLeft}d left</span>
                  <span className="h-1.5 w-20 shrink-0 overflow-hidden rounded-full bg-paper/15">
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
                  <span className="w-14 shrink-0 text-right text-xs capitalize text-paper/70">
                    {entry.verdict}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-3 text-sm text-paper/60">No exams configured yet.</p>
        )}
      </section>

      {/* AI coach insight */}
      <section
        aria-labelledby="inline-coach-heading"
        className="rounded-card border border-ink-line bg-paper-raised p-5"
      >
        <h3
          id="inline-coach-heading"
          className="flex items-center gap-2 text-sm font-medium text-ink"
        >
          <SparklesIcon className="h-4 w-4 text-moss" aria-hidden="true" />
          What Study Planner sees
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          You answer {Math.round(accuracy * 100)}% of quiz questions correctly overall.{' '}
          {strongest?.topic} is your anchor at {Math.round((strongest?.accuracy ?? 0) * 100)}%,
          while {weakest?.topic} keeps stalling at{' '}
          {Math.round((weakest?.accuracy ?? 0) * 100)}%.
        </p>
        <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-ink-line pt-4">
          <div>
            <dt className="text-xs text-ink-muted">Accuracy</dt>
            <dd className="mt-0.5 text-xl tabular-nums text-ink">
              {Math.round(accuracy * 100)}%
            </dd>
          </div>
          <div>
            <dt className="text-xs text-ink-muted">Attempts</dt>
            <dd className="mt-0.5 text-xl tabular-nums text-ink">{attempts.length}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-muted">Hours done</dt>
            <dd className="mt-0.5 text-xl tabular-nums text-ink">{doneHours.toFixed(1)}</dd>
          </div>
        </dl>
      </section>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <ScoreTrendChart />
        <TopicMastery />
      </div>

      {/* Study habits */}
      <section
        aria-labelledby="inline-habits-heading"
        className="rounded-card border border-ink-line bg-paper-raised p-5"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 id="inline-habits-heading" className="text-sm font-medium text-ink">
            Planned vs completed hours
          </h3>
          <p className="text-xs text-ink-muted">
            {doneHours.toFixed(1)} of {plannedHours.toFixed(1)} h ·{' '}
            {plannedHours === 0 ? '0' : Math.round((doneHours / plannedHours) * 100)}%
            follow-through
          </p>
        </div>
        <ol className="mt-4 flex items-end gap-2">
          {habits.map((day) => (
            <li key={day.date} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="relative h-20 w-full max-w-10 overflow-hidden rounded-md bg-paper-sunk">
                <div
                  className="absolute bottom-0 w-full bg-ink-line"
                  style={{ height: `${Math.min(100, (day.planned / maxHours) * 100)}%` }}
                />
                <div
                  className="absolute bottom-0 w-full bg-moss"
                  style={{ height: `${Math.min(100, (day.done / maxHours) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-ink-muted">{day.date}</span>
            </li>
          ))}
        </ol>
        <p className="mt-3 flex gap-4 text-xs text-ink-muted">
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
    </motion.div>
  );
}

// ─── Main quiz runner ──────────────────────────────────────────────────────

export function QuizRunner() {
  const { subjects, attempts, recordAttempt } = usePlanner();
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '');
  const [count, setCount] = useState(5);
  const [phase, setPhase] = useState<Phase>('setup');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [startedAt, setStartedAt] = useState<number>(0);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const subject = subjects.find((entry) => entry.id === subjectId);
  const weakest = useMemo(
    () => topicAccuracy(attempts, subjectId).slice(-2).reverse(),
    [attempts, subjectId],
  );

  async function start() {
    setShowAnalysis(false);
    setPhase('generating');
    await new Promise((resolve) => setTimeout(resolve, 900));
    const generated = generateQuiz(subjectId, count, attempts);
    if (generated.length === 0) {
      setPhase('setup');
      return;
    }
    setQuestions(generated);
    setAnswers([]);
    setIndex(0);
    setSelected(null);
    setStartedAt(Date.now());
    setPhase('running');
  }

  function next() {
    if (selected === null) return;
    const nextAnswers = [...answers, selected];
    setAnswers(nextAnswers);
    setSelected(null);
    if (index + 1 >= questions.length) {
      finish(nextAnswers);
      return;
    }
    setIndex(index + 1);
  }

  function finish(finalAnswers: number[]) {
    const perTopic: QuizAttempt['perTopic'] = {};
    let correct = 0;
    questions.forEach((question, questionIndex) => {
      const isCorrect = finalAnswers[questionIndex] === question.answerIndex;
      if (isCorrect) correct += 1;
      const current = perTopic[question.topic] ?? { correct: 0, total: 0 };
      perTopic[question.topic] = {
        correct: current.correct + (isCorrect ? 1 : 0),
        total: current.total + 1,
      };
    });
    recordAttempt({
      id: `a${Date.now()}`,
      subjectId,
      date: new Date().toISOString().slice(0, 10),
      correct,
      total: questions.length,
      perTopic,
      seconds: Math.round((Date.now() - startedAt) / 1000),
    });
    setPhase('results');
  }

  // ── Setup / Generating screen ──────────────────────────────────────────
  if (phase === 'setup' || phase === 'generating') {
    return (
      <section className="rounded-card border border-ink-line bg-paper-raised p-6">
        <h2 className="font-display text-2xl text-ink">Generate a quiz</h2>
        <p className="mt-1 max-w-lg text-sm leading-relaxed text-ink-muted">
          Questions are drawn at random, but weighted toward the topics your past
          attempts show you keep missing — so no two rounds look the same.
        </p>

        <div className="mt-6 grid max-w-2xl gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm text-ink-soft">
            Subject
            <select
              value={subjectId}
              onChange={(event) => setSubjectId(event.target.value)}
              className="h-10 rounded-card border border-ink-line bg-paper px-3 text-sm text-ink outline-none transition-[border-color,box-shadow] duration-150 ease-out focus:border-moss focus:shadow-[0_0_0_3px_rgba(31,107,84,0.15)]"
            >
              {subjects.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-ink-soft">
            Questions
            <select
              value={count}
              onChange={(event) => setCount(Number(event.target.value))}
              className="h-10 rounded-card border border-ink-line bg-paper px-3 text-sm text-ink outline-none transition-[border-color,box-shadow] duration-150 ease-out focus:border-moss focus:shadow-[0_0_0_3px_rgba(31,107,84,0.15)]"
            >
              {[3, 5, 7].map((value) => (
                <option key={value} value={value}>
                  {value} questions
                </option>
              ))}
            </select>
          </label>
        </div>

        {weakest.length > 0 && (
          <p className="mt-5 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
            <SparklesIcon className="h-3.5 w-3.5 text-moss" aria-hidden="true" />
            Weighted toward:
            {weakest.map((entry) => (
              <span
                key={entry.topic}
                className="rounded-full bg-paper-sunk px-2.5 py-1 text-[11px] text-ink-soft"
              >
                {entry.topic} · {Math.round(entry.accuracy * 100)}%
              </span>
            ))}
          </p>
        )}

        <button
          type="button"
          onClick={start}
          disabled={phase === 'generating'}
          className="mt-6 flex h-11 items-center justify-center gap-2 rounded-card bg-moss px-5 text-sm font-medium text-paper-raised transition-[background-color,transform,opacity] duration-150 ease-out hover:bg-moss-hover active:translate-y-px disabled:opacity-80"
        >
          {phase === 'generating' ? (
            <LoaderIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <SparklesIcon className="h-4 w-4" aria-hidden="true" />
          )}
          {phase === 'generating' ? `Writing ${count} questions…` : 'Generate quiz'}
        </button>
      </section>
    );
  }

  // ── Running screen ────────────────────────────────────────────────────
  if (phase === 'running') {
    const question = questions[index];
    const answered = selected !== null;
    return (
      <section className="rounded-card border border-ink-line bg-paper-raised">
        <div className="flex items-center justify-between gap-4 border-b border-ink-line px-5 py-3.5">
          <p className="text-sm text-ink-muted">
            {subject?.name} · Question {index + 1} of {questions.length}
          </p>
          <div className="flex gap-1" aria-hidden="true">
            {questions.map((_, dotIndex) => (
              <span
                key={dotIndex}
                className={`h-1.5 w-6 rounded-full transition-colors duration-200 ease-out ${
                  dotIndex < index
                    ? 'bg-moss'
                    : dotIndex === index
                    ? 'bg-ink'
                    : 'bg-paper-sunk'
                }`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="px-5 py-6"
          >
            <p className="text-xs uppercase tracking-wide text-ink-muted">
              {question.topic} · {question.difficulty}
            </p>
            <h2 className="mt-2 max-w-2xl font-display text-[26px] leading-snug text-ink">
              {question.prompt}
            </h2>

            <ul className="mt-6 flex max-w-2xl flex-col gap-2.5">
              {question.options.map((option, optionIndex) => {
                const isChosen = selected === optionIndex;
                const isRight = optionIndex === question.answerIndex;
                const state = !answered
                  ? 'idle'
                  : isRight
                  ? 'right'
                  : isChosen
                  ? 'wrong'
                  : 'muted';
                return (
                  <li key={option}>
                    <button
                      type="button"
                      disabled={answered}
                      onClick={() => setSelected(optionIndex)}
                      className={`flex w-full items-center gap-3 rounded-card border px-4 py-3 text-left text-sm transition-[background-color,border-color] duration-150 ease-out ${
                        state === 'right'
                          ? 'border-moss bg-moss-soft text-ink'
                          : state === 'wrong'
                          ? 'border-clay bg-clay/10 text-ink'
                          : state === 'muted'
                          ? 'border-ink-line text-ink-muted'
                          : 'border-ink-line text-ink hover:border-ink-muted hover:bg-paper'
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] ${
                          state === 'right'
                            ? 'border-moss bg-moss text-paper-raised'
                            : state === 'wrong'
                            ? 'border-clay bg-clay text-paper-raised'
                            : 'border-ink-line text-ink-muted'
                        }`}
                      >
                        {state === 'right' ? (
                          <CheckIcon className="h-3 w-3" aria-hidden="true" />
                        ) : state === 'wrong' ? (
                          <XIcon className="h-3 w-3" aria-hidden="true" />
                        ) : (
                          String.fromCharCode(65 + optionIndex)
                        )}
                      </span>
                      {option}
                    </button>
                  </li>
                );
              })}
            </ul>

            {answered && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className="mt-5 max-w-2xl border-l-2 border-moss-soft pl-3 text-sm leading-relaxed text-ink-soft"
              >
                {question.explanation}
              </motion.p>
            )}

            <button
              type="button"
              onClick={next}
              disabled={!answered}
              className="mt-6 flex h-11 items-center justify-center gap-2 rounded-card bg-ink px-5 text-sm font-medium text-paper transition-[background-color,transform,opacity] duration-150 ease-out hover:bg-ink-soft active:translate-y-px disabled:opacity-40"
            >
              {index + 1 === questions.length ? 'See results' : 'Next question'}
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </motion.div>
        </AnimatePresence>
      </section>
    );
  }

  // ── Results screen ────────────────────────────────────────────────────
  const correct = questions.filter(
    (question, questionIndex) => answers[questionIndex] === question.answerIndex,
  ).length;
  const percent = Math.round((correct / questions.length) * 100);
  const missedTopics = [
    ...new Set(
      questions
        .filter((question, i) => answers[i] !== question.answerIndex)
        .map((question) => question.topic),
    ),
  ];

  return (
    <section className="rounded-card border border-ink-line bg-paper-raised p-6">
      <p className="text-xs uppercase tracking-wide text-ink-muted">{subject?.name}</p>
      <h2 className="mt-2 font-display text-[40px] leading-none text-ink">{percent}%</h2>
      <p className="mt-2 text-sm text-ink-soft">
        {correct} of {questions.length} correct.{' '}
        {missedTopics.length === 0
          ? 'Clean sweep — the next round will pull harder questions.'
          : `Weakest here: ${missedTopics.join(', ')}. Tomorrow's sessions now lead with ${missedTopics[0]}.`}
      </p>

      <ul className="mt-6 flex flex-col gap-2.5">
        {questions.map((question, questionIndex) => {
          const wasRight = answers[questionIndex] === question.answerIndex;
          return (
            <li
              key={question.id}
              className="flex gap-3 rounded-card border border-ink-line bg-paper px-4 py-3"
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  wasRight ? 'bg-moss text-paper-raised' : 'bg-clay text-paper-raised'
                }`}
                aria-hidden="true"
              >
                {wasRight ? (
                  <CheckIcon className="h-3 w-3" />
                ) : (
                  <XIcon className="h-3 w-3" />
                )}
              </span>
              <div className="min-w-0">
                <p className="text-sm leading-snug text-ink">{question.prompt}</p>
                <p className="mt-1 text-xs text-ink-muted">
                  {question.topic} · Correct answer:{' '}
                  {question.options[question.answerIndex]}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Action buttons */}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => { setPhase('setup'); setShowAnalysis(false); }}
          className="flex h-11 items-center gap-2 rounded-card border border-ink-line bg-paper px-5 text-sm font-medium text-ink transition-[background-color,transform] duration-150 ease-out hover:bg-paper-sunk active:translate-y-px"
        >
          <RotateCcwIcon className="h-4 w-4" aria-hidden="true" />
          New quiz
        </button>

        {!showAnalysis && (
          <button
            type="button"
            onClick={() => setShowAnalysis(true)}
            className="flex h-11 items-center gap-2 rounded-card bg-moss px-5 text-sm font-medium text-paper-raised shadow-sm transition-[background-color,transform,box-shadow] duration-150 ease-out hover:bg-moss-hover hover:shadow-md active:translate-y-px"
          >
            <BarChart2Icon className="h-4 w-4" aria-hidden="true" />
            Run Analysis
          </button>
        )}
      </div>

      {/* Inline analysis — only mounts after student clicks "Run Analysis" */}
      <AnimatePresence>
        {showAnalysis && <InlineAnalysis />}
      </AnimatePresence>
    </section>
  );
}