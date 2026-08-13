import React, { useState } from 'react';
import { format } from 'date-fns';
import { LoaderIcon, PlusIcon, SparklesIcon, Trash2Icon } from 'lucide-react';
import { usePlanner } from '../../contexts/PlannerContext';
import type { PlanInput, PlanDraftSubject } from '../../types/planner';

const confidenceLabels: Record<number, string> = {
  1: '1 — Lost',
  2: '2 — Shaky',
  3: '3 — Okay',
  4: '4 — Solid',
  5: '5 — Confident'
};

const inputClass =
'h-10 w-full rounded-card border border-ink-line bg-paper px-3 text-sm text-ink outline-none transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-ink-muted/70 focus:border-moss focus:shadow-[0_0_0_3px_rgba(31,107,84,0.15)] aria-[invalid=true]:border-clay';

export function TimetableForm() {
  const { planInput, regenerate, generatedAt, now } = usePlanner();
  const [draft, setDraft] = useState<PlanInput>(planInput);
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateSubject(id: string, patch: Partial<PlanDraftSubject>) {
    setDraft((current) => ({
      ...current,
      subjects: current.subjects.map((subject) =>
      subject.id === id ? { ...subject, ...patch } : subject
      )
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
        topics: ''
      }]

    }));
  }

  function removeSubject(id: string) {
    setDraft((current) => ({
      ...current,
      subjects: current.subjects.filter((subject) => subject.id !== id)
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
      aria-labelledby="builder-heading">
      
      <div className="border-b border-ink-line px-5 py-4">
        <h2
          id="builder-heading"
          className="flex items-center gap-2 text-sm font-medium text-ink">
          
          <SparklesIcon className="h-4 w-4 text-moss" aria-hidden="true" />
          Build a new timetable
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-ink-muted">
          Sessions are weighted by how near each exam is and how confident you
          feel, then broken into 45-minute blocks with breaks.
        </p>
      </div>

      <div className="flex flex-col gap-5 px-5 py-5">
        <fieldset className="flex flex-col gap-4">
          <legend className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            Subjects
          </legend>

          {draft.subjects.map((subject, index) =>
          <div
            key={subject.id}
            className="flex flex-col gap-2.5 rounded-card border border-ink-line/70 bg-paper p-3">
            
              <div className="flex items-center gap-2">
                <input
                value={subject.name}
                onChange={(event) =>
                updateSubject(subject.id, { name: event.target.value })
                }
                placeholder="Subject name"
                aria-label={`Subject ${index + 1} name`}
                className={`${inputClass} bg-paper-raised`} />
              
                {draft.subjects.length > 1 &&
              <button
                type="button"
                onClick={() => removeSubject(subject.id)}
                aria-label={`Remove ${subject.name || `subject ${index + 1}`}`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-card text-ink-muted transition-colors duration-150 ease-out hover:bg-paper-sunk hover:text-clay">
                
                    <Trash2Icon className="h-4 w-4" aria-hidden="true" />
                  </button>
              }
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
                  className={`${inputClass} bg-paper-raised`} />
                
                </label>
                <label className="flex flex-col gap-1 text-xs text-ink-muted">
                  Confidence
                  <select
                  value={subject.confidence}
                  onChange={(event) =>
                  updateSubject(subject.id, {
                    confidence: Number(event.target.value) as 1 | 2 | 3 | 4 | 5
                  })
                  }
                  className={`${inputClass} bg-paper-raised`}>
                  
                    {[1, 2, 3, 4, 5].map((value) =>
                  <option key={value} value={value}>
                        {confidenceLabels[value]}
                      </option>
                  )}
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
                className={`${inputClass} bg-paper-raised`} />
              
              </label>
            </div>
          )}

          <button
            type="button"
            onClick={addSubject}
            className="flex h-10 items-center justify-center gap-2 rounded-card border border-dashed border-ink-line text-sm text-ink-soft transition-colors duration-150 ease-out hover:border-ink-muted hover:bg-paper-sunk">
            
            <PlusIcon className="h-4 w-4" aria-hidden="true" />
            Add subject
          </button>
        </fieldset>

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
                hoursPerDay: Number(event.target.value)
              }))
              }
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-paper-sunk accent-moss" />
            
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
                  startTime: event.target.value
                }))
                }
                className={inputClass} />
              
            </label>
            <label className="flex flex-col gap-1 text-xs text-ink-muted">
              Plan length
              <select
                value={draft.days}
                onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  days: Number(event.target.value)
                }))
                }
                className={inputClass}>
                
                {[3, 5, 7, 10, 14].map((value) =>
                <option key={value} value={value}>
                    {value} days
                  </option>
                )}
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-1 text-xs text-ink-muted">
            Keep one day clear
            <select
              value={draft.restDay}
              onChange={(event) =>
              setDraft((current) => ({
                ...current,
                restDay: event.target.value as PlanInput['restDay']
              }))
              }
              className={inputClass}>
              
              <option value="none">No rest day</option>
              <option value="sat">Saturdays</option>
              <option value="sun">Sundays</option>
            </select>
          </label>
        </fieldset>

        {error &&
        <p role="alert" className="text-xs text-clay">
            {error}
          </p>
        }

        <button
          type="submit"
          disabled={building}
          className="flex h-11 items-center justify-center gap-2 rounded-card bg-moss text-sm font-medium text-paper-raised transition-[background-color,transform,opacity] duration-150 ease-out hover:bg-moss-hover active:translate-y-px disabled:opacity-80">
          
          {building ?
          <LoaderIcon className="h-4 w-4 animate-spin" aria-hidden="true" /> :

          <SparklesIcon className="h-4 w-4" aria-hidden="true" />
          }
          {building ? 'Balancing your week…' : 'Generate timetable'}
        </button>

        <p aria-live="polite" className="text-xs text-ink-muted">
          {building ?
          'Weighing exam dates against your confidence…' :
          generatedAt ?
          `Plan rebuilt at ${generatedAt}. Today's schedule updated.` :
          'Current plan was built from your last saved syllabi.'}
        </p>
      </div>
    </form>);

}