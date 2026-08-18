import React, { useRef, useEffect, useState } from 'react';
import {
  format,
  addDays,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  differenceInCalendarDays,
  isSameDay,
  isSameMonth,
  isBefore,
  parseISO,
} from 'date-fns';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, LoaderIcon, PlusIcon, SparklesIcon, Trash2Icon } from 'lucide-react';
import { usePlanner } from '../../contexts/PlannerContext';
import type { PlanInput, PlanDraftSubject } from '../../types/planner';

const confidenceLabels: Record<number, string> = {
  1: '1 — Lost',
  2: '2 — Shaky',
  3: '3 — Okay',
  4: '4 — Solid',
  5: '5 — Confident',
};

const inputClass =
  'h-10 w-full rounded-card border border-ink-line bg-paper px-3 text-sm text-ink outline-none transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-ink-muted/70 focus:border-moss focus:shadow-[0_0_0_3px_rgba(31,107,84,0.15)] aria-[invalid=true]:border-clay';

// ─── Mini calendar component ───────────────────────────────────────────────

interface MiniCalendarProps {
  /** ISO yyyy-MM-dd selected end-date (null = none picked) */
  selected: string | null;
  /** today's Date, used to block past dates */
  today: Date;
  onChange: (isoDate: string) => void;
}

function MiniCalendar({ selected, today, onChange }: MiniCalendarProps) {
  const [viewMonth, setViewMonth] = useState<Date>(
    selected ? parseISO(selected) : today,
  );

  const selectedDate = selected ? parseISO(selected) : null;

  // Build calendar grid: 6 rows × 7 cols starting from Sun of the first week
  const monthStart = startOfMonth(viewMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) days.push(addDays(gridStart, i));

  const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className="w-full select-none rounded-card border border-ink-line bg-paper p-3">
      {/* Month navigation */}
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setViewMonth((m) => subMonths(m, 1))}
          aria-label="Previous month"
          className="flex h-7 w-7 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-paper-sunk hover:text-ink"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium text-ink">
          {format(viewMonth, 'MMMM yyyy')}
        </span>
        <button
          type="button"
          onClick={() => setViewMonth((m) => addMonths(m, 1))}
          aria-label="Next month"
          className="flex h-7 w-7 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-paper-sunk hover:text-ink"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Day-of-week header */}
      <div className="mb-1 grid grid-cols-7">
        {dayLabels.map((d) => (
          <div key={d} className="py-0.5 text-center text-[10px] font-medium uppercase tracking-wide text-ink-muted">
            {d}
          </div>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {days.map((day) => {
          const isPast = isBefore(day, today) && !isSameDay(day, today);
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          const isToday = isSameDay(day, today);
          const inMonth = isSameMonth(day, viewMonth);

          // Days between today and selected date highlight
          const inRange =
            selectedDate &&
            !isPast &&
            differenceInCalendarDays(day, today) >= 0 &&
            differenceInCalendarDays(selectedDate, day) > 0;

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={isPast}
              onClick={() => onChange(format(day, 'yyyy-MM-dd'))}
              aria-label={format(day, 'EEEE, MMMM do yyyy')}
              aria-pressed={isSelected}
              className={[
                'relative flex h-7 w-full items-center justify-center rounded-md text-xs transition-colors duration-100',
                isPast
                  ? 'cursor-not-allowed text-ink-muted/30'
                  : isSelected
                  ? 'bg-moss font-semibold text-paper-raised shadow-sm'
                  : isToday
                  ? 'border border-moss/50 font-semibold text-moss hover:bg-moss/10'
                  : inRange
                  ? 'bg-moss/10 text-ink'
                  : inMonth
                  ? 'text-ink hover:bg-paper-sunk'
                  : 'text-ink-muted/40 hover:bg-paper-sunk',
              ].join(' ')}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>

      {/* Selected date label */}
      <div className="mt-3 border-t border-ink-line pt-2.5 text-center">
        {selectedDate ? (
          <p className="text-xs text-ink-soft">
            Plan ends{' '}
            <span className="font-medium text-moss">
              {format(selectedDate, 'EEEE, MMM d')}
            </span>{' '}
            · <span className="tabular-nums text-ink">{differenceInCalendarDays(selectedDate, today)}</span> day
            {differenceInCalendarDays(selectedDate, today) !== 1 ? 's' : ''} from today
          </p>
        ) : (
          <p className="text-xs text-ink-muted">
            Pick an end date for your study plan
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────

export function TimetableForm() {
  const { planInput, regenerate, generatedAt, now } = usePlanner();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Derive the initial end-date from saved plan
  const initialEndDate =
    planInput.days > 0
      ? format(addDays(today, planInput.days), 'yyyy-MM-dd')
      : null;

  const [draft, setDraft] = useState<PlanInput>(planInput);
  const [endDate, setEndDate] = useState<string | null>(initialEndDate);
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Keep draft.days in sync whenever the student picks a new end date */
  function handleEndDateChange(isoDate: string) {
    setEndDate(isoDate);
    const picked = parseISO(isoDate);
    const dayCount = Math.max(1, differenceInCalendarDays(picked, today));
    setDraft((cur) => ({ ...cur, days: dayCount }));
  }

  function updateSubject(id: string, patch: Partial<PlanDraftSubject>) {
    setDraft((current) => ({
      ...current,
      subjects: current.subjects.map((subject) =>
        subject.id === id ? { ...subject, ...patch } : subject,
      ),
    }));
  }

  function addSubject() {
    setDraft((current) => ({
      ...current,
      subjects: [
        ...current.subjects,
        {
          id: `s${Date.now()}`,
          name: '',
          examDate: format(now, 'yyyy-MM-dd'),
          confidence: 3,
          topics: '',
        },
      ],
    }));
  }

  function removeSubject(id: string) {
    setDraft((current) => ({
      ...current,
      subjects: current.subjects.filter((subject) => subject.id !== id),
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleaned = draft.subjects.filter((subject) => subject.name.trim());
    if (cleaned.length === 0) {
      setError('Add at least one subject with a name.');
      return;
    }
    if (cleaned.some((subject) => !subject.examDate)) {
      setError('Every subject needs an exam date to be scheduled against.');
      return;
    }
    if (!endDate) {
      setError('Pick an end date for your study plan using the calendar.');
      return;
    }
    setError(null);
    setBuilding(true);
    await new Promise((resolve) => setTimeout(resolve, 1100));
    regenerate({ ...draft, subjects: cleaned });
    setBuilding(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-card border border-ink-line bg-paper-raised"
      aria-labelledby="builder-heading"
    >
      <div className="border-b border-ink-line px-5 py-4">
        <h2
          id="builder-heading"
          className="flex items-center gap-2 text-sm font-medium text-ink"
        >
          <SparklesIcon className="h-4 w-4 text-moss" aria-hidden="true" />
          Build a new timetable
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-ink-muted">
          Sessions are weighted by how near each exam is and how confident you
          feel, then broken into 45-minute blocks with breaks.
        </p>
      </div>

      <div className="flex flex-col gap-5 px-5 py-5">
        {/* ── Subjects ── */}
        <fieldset className="flex flex-col gap-4">
          <legend className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            Subjects
          </legend>

          {draft.subjects.map((subject, index) => (
            <div
              key={subject.id}
              className="flex flex-col gap-2.5 rounded-card border border-ink-line/70 bg-paper p-3"
            >
              <div className="flex items-center gap-2">
                <input
                  value={subject.name}
                  onChange={(event) =>
                    updateSubject(subject.id, { name: event.target.value })
                  }
                  placeholder="Subject name"
                  aria-label={`Subject ${index + 1} name`}
                  className={`${inputClass} bg-paper-raised`}
                />
                {draft.subjects.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSubject(subject.id)}
                    aria-label={`Remove ${subject.name || `subject ${index + 1}`}`}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-card text-ink-muted transition-colors duration-150 ease-out hover:bg-paper-sunk hover:text-clay"
                  >
                    <Trash2Icon className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <label className="flex flex-col gap-1 text-xs text-ink-muted">
                  Exam date
                  <input
                    type="date"
                    value={subject.examDate}
                    onChange={(event) =>
                      updateSubject(subject.id, { examDate: event.target.value })
                    }
                    className={`${inputClass} bg-paper-raised`}
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs text-ink-muted">
                  Confidence
                  <select
                    value={subject.confidence}
                    onChange={(event) =>
                      updateSubject(subject.id, {
                        confidence: Number(event.target.value) as 1 | 2 | 3 | 4 | 5,
                      })
                    }
                    className={`${inputClass} bg-paper-raised`}
                  >
                    {[1, 2, 3, 4, 5].map((value) => (
                      <option key={value} value={value}>
                        {confidenceLabels[value]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="flex flex-col gap-1 text-xs text-ink-muted">
                Topics (comma separated)
                <input
                  value={subject.topics}
                  onChange={(event) =>
                    updateSubject(subject.id, { topics: event.target.value })
                  }
                  placeholder="Eigenvalues, Determinants"
                  className={`${inputClass} bg-paper-raised`}
                />
              </label>
            </div>
          ))}

          <button
            type="button"
            onClick={addSubject}
            className="flex h-10 items-center justify-center gap-2 rounded-card border border-dashed border-ink-line text-sm text-ink-soft transition-colors duration-150 ease-out hover:border-ink-muted hover:bg-paper-sunk"
          >
            <PlusIcon className="h-4 w-4" aria-hidden="true" />
            Add subject
          </button>
        </fieldset>

        {/* ── Availability ── */}
        <fieldset className="flex flex-col gap-4">
          <legend className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            Your availability
          </legend>

          <label className="flex flex-col gap-2 text-sm text-ink-soft">
            <span className="flex items-baseline justify-between">
              Study hours per day
              <span className="text-sm tabular-nums text-ink">
                {draft.hoursPerDay} h
              </span>
            </span>
            <input
              type="range"
              min={1}
              max={10}
              step={0.5}
              value={draft.hoursPerDay}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  hoursPerDay: Number(event.target.value),
                }))
              }
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-paper-sunk accent-moss"
            />
          </label>

          <div className="grid grid-cols-2 gap-2.5">
            <label className="flex flex-col gap-1 text-xs text-ink-muted">
              Start at
              <input
                type="time"
                value={draft.startTime}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    startTime: event.target.value,
                  }))
                }
                className={inputClass}
              />
            </label>

            {/* ── Plan end date pill (opens calendar below) ── */}
            <label className="flex flex-col gap-1 text-xs text-ink-muted">
              Plan end date
              <div
                className={`${inputClass} flex cursor-default items-center gap-2 text-sm ${
                  endDate ? 'text-ink' : 'text-ink-muted/70'
                }`}
              >
                <CalendarIcon className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
                {endDate ? format(parseISO(endDate), 'dd MMM yyyy') : 'Pick from calendar ↓'}
              </div>
            </label>
          </div>

          {/* ── Inline calendar ── */}
          <MiniCalendar
            selected={endDate}
            today={today}
            onChange={handleEndDateChange}
          />

          <label className="flex flex-col gap-1 text-xs text-ink-muted">
            Keep one day clear
            <select
              value={draft.restDay}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  restDay: event.target.value as PlanInput['restDay'],
                }))
              }
              className={inputClass}
            >
              <option value="none">No rest day</option>
              <option value="sat">Saturdays</option>
              <option value="sun">Sundays</option>
            </select>
          </label>
        </fieldset>

        {error && (
          <p role="alert" className="text-xs text-clay">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={building}
          className="flex h-11 items-center justify-center gap-2 rounded-card bg-moss text-sm font-medium text-paper-raised transition-[background-color,transform,opacity] duration-150 ease-out hover:bg-moss-hover active:translate-y-px disabled:opacity-80"
        >
          {building ? (
            <LoaderIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <SparklesIcon className="h-4 w-4" aria-hidden="true" />
          )}
          {building ? 'Balancing your week…' : 'Generate timetable'}
        </button>

        <p aria-live="polite" className="text-xs text-ink-muted">
          {building
            ? 'Weighing exam dates against your confidence…'
            : generatedAt
            ? `Plan rebuilt at ${generatedAt}. Today's schedule updated.`
            : "Current plan was built from your last saved syllabi."}
        </p>
      </div>
    </form>
  );
}