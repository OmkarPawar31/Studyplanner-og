import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns';
import type { PlanInput, StudyBlock, Subject } from '../types/planner';

const SESSION_MINUTES = 45;
const SHORT_BREAK = 10;
const LONG_BREAK = 30;

export function toMinutes(time: string): number {
  const [hours, mins] = time.split(':').map(Number);
  return hours * 60 + mins;
}

export function toTime(minutes: number): string {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function formatTime(time: string): string {
  const [hours, mins] = time.split(':').map(Number);
  const suffix = hours >= 12 ? 'pm' : 'am';
  const display = hours % 12 === 0 ? 12 : hours % 12;
  return `${display}:${String(mins).padStart(2, '0')}${suffix}`;
}

export function blockEnd(block: StudyBlock): string {
  return toTime(toMinutes(block.start) + block.minutes);
}

/**
 * Weight a subject by exam urgency and self-reported confidence.
 * Sooner exams and lower confidence earn more of the day.
 */
function weightFor(examDate: string, confidence: number, from: Date): number {
  const daysLeft = Math.max(1, differenceInCalendarDays(parseISO(examDate), from));
  const urgency = 1 / Math.sqrt(daysLeft);
  const gap = (6 - confidence) / 5;
  return urgency * (0.45 + gap);
}

/** Largest-remainder allocation so session counts always sum to the target. */
function allocate(weights: number[], total: number): number[] {
  const sum = weights.reduce((acc, value) => acc + value, 0);
  if (sum <= 0) return weights.map(() => 0);
  const raw = weights.map((weight) => weight / sum * total);
  const base = raw.map(Math.floor);
  let remaining = total - base.reduce((acc, value) => acc + value, 0);
  const order = raw.
  map((value, index) => ({ index, frac: value - Math.floor(value) })).
  sort((a, b) => b.frac - a.frac);
  let cursor = 0;
  while (remaining > 0 && order.length > 0) {
    base[order[cursor % order.length].index] += 1;
    remaining -= 1;
    cursor += 1;
  }
  return base;
}

export function buildSubjects(input: PlanInput): Subject[] {
  const palette = ['moss', 'clay', 'sand', 'ink-soft'];
  return input.subjects.map((draft, index) => ({
    id: draft.id,
    name: draft.name.trim(),
    code: palette[index % palette.length],
    examDate: draft.examDate,
    confidence: draft.confidence,
    topics: draft.topics.
    split(',').
    map((topic) => topic.trim()).
    filter(Boolean)
  }));
}

export function generatePlan(
input: PlanInput,
subjects: Subject[],
startDate: Date)
: StudyBlock[] {
  const blocks: StudyBlock[] = [];
  const sessionsPerDay = Math.max(
    1,
    Math.round(input.hoursPerDay * 60 / SESSION_MINUTES)
  );
  const topicCursor = new Map<string, number>();

  for (let dayOffset = 0; dayOffset < input.days; dayOffset += 1) {
    const day = addDays(startDate, dayOffset);
    const dayKey = format(day, 'yyyy-MM-dd');
    const weekday = day.getDay();
    if (
    input.restDay === 'sat' && weekday === 6 ||
    input.restDay === 'sun' && weekday === 0)
    {
      blocks.push({
        id: `${dayKey}-rest`,
        date: dayKey,
        start: input.startTime,
        minutes: 0,
        subjectId: null,
        title: 'Rest day — no sessions scheduled',
        kind: 'break',
        done: false,
        reason: 'You asked to keep this day clear.'
      });
      continue;
    }

    const active = subjects.filter(
      (subject) => differenceInCalendarDays(parseISO(subject.examDate), day) >= 0
    );
    if (active.length === 0) continue;

    const counts = allocate(
      active.map((subject) => weightFor(subject.examDate, subject.confidence, day)),
      sessionsPerDay
    );

    const queue: Subject[] = [];
    counts.forEach((count, index) => {
      for (let i = 0; i < count; i += 1) queue.push(active[index]);
    });
    // Interleave so the same subject rarely runs back to back.
    queue.sort((a, b) => a.id.localeCompare(b.id));
    const interleaved: Subject[] = [];
    while (queue.length > 0) {
      const seen = new Set<string>();
      for (let i = 0; i < queue.length;) {
        if (seen.has(queue[i].id)) {
          i += 1;
          continue;
        }
        seen.add(queue[i].id);
        interleaved.push(queue[i]);
        queue.splice(i, 1);
      }
    }

    let cursor = toMinutes(input.startTime);
    interleaved.forEach((subject, index) => {
      const daysLeft = differenceInCalendarDays(parseISO(subject.examDate), day);
      const cursorKey = subject.id;
      const topicIndex = topicCursor.get(cursorKey) ?? 0;
      const topic =
      subject.topics.length > 0 ?
      subject.topics[topicIndex % subject.topics.length] :
      undefined;
      topicCursor.set(cursorKey, topicIndex + 1);

      const isFinalStretch = daysLeft <= 2;
      blocks.push({
        id: `${dayKey}-${index}-${subject.id}`,
        date: dayKey,
        start: toTime(cursor),
        minutes: SESSION_MINUTES,
        subjectId: subject.id,
        title: topic ?
        `${isFinalStretch ? 'Review' : 'Study'}: ${topic}` :
        `${isFinalStretch ? 'Review' : 'Study'} ${subject.name}`,
        topic,
        kind: isFinalStretch ? 'review' : 'study',
        done: false,
        reason:
        index === 0 ?
        `${subject.name} exam in ${daysLeft} day${daysLeft === 1 ? '' : 's'} — earliest slot goes to your weakest subject.` :
        undefined
      });
      cursor += SESSION_MINUTES;

      const isLast = index === interleaved.length - 1;
      if (!isLast) {
        const long = (index + 1) % 3 === 0;
        blocks.push({
          id: `${dayKey}-${index}-break`,
          date: dayKey,
          start: toTime(cursor),
          minutes: long ? LONG_BREAK : SHORT_BREAK,
          subjectId: null,
          title: long ? 'Longer break — step outside' : 'Short break',
          kind: 'break',
          done: false
        });
        cursor += long ? LONG_BREAK : SHORT_BREAK;
      }
    });

    // Close each day with a retrieval check on the subject with the nearest exam.
    const nearest = [...active].sort(
      (a, b) =>
      differenceInCalendarDays(parseISO(a.examDate), day) -
      differenceInCalendarDays(parseISO(b.examDate), day)
    )[0];
    blocks.push({
      id: `${dayKey}-quiz`,
      date: dayKey,
      start: toTime(cursor + SHORT_BREAK),
      minutes: 15,
      subjectId: nearest.id,
      title: `Quick quiz: ${nearest.name}`,
      kind: 'quiz',
      done: false,
      reason: 'Retrieval practice locks in what you covered today.'
    });
  }

  return blocks;
}