import { motion } from 'framer-motion';
import { CheckIcon, CoffeeIcon, SparklesIcon } from 'lucide-react';
import { usePlanner } from '../../contexts/PlannerContext';
import { blockEnd, formatTime, toMinutes } from '../../utils/schedule';
import type { StudyBlock } from '../../types/planner';

const kindLabel: Record<StudyBlock['kind'], string> = {
  study: 'Focus',
  review: 'Review',
  quiz: 'Quiz',
  break: 'Break'
};

const dotFor: Record<StudyBlock['kind'], string> = {
  study: 'bg-moss',
  review: 'bg-clay',
  quiz: 'bg-sand',
  break: 'bg-ink-line'
};

export function DailySchedule() {
  const { todayBlocks, toggleBlock, now, subjects } = usePlanner();
  const minutesNow = now.getHours() * 60 + now.getMinutes();

  const sessions = todayBlocks.filter((block) => block.kind !== 'break');
  const done = sessions.filter((block) => block.done);
  const plannedMinutes = sessions.reduce((acc, block) => acc + block.minutes, 0);
  const doneMinutes = done.reduce((acc, block) => acc + block.minutes, 0);
  const progress = plannedMinutes === 0 ? 0 : doneMinutes / plannedMinutes;

  return (
    <section
      aria-labelledby="today-heading"
      className="rounded-card border border-ink-line bg-paper-raised">
      
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink-line px-5 py-4">
        <div>
          <h2 id="today-heading" className="font-display text-2xl text-ink">
            Today's schedule
          </h2>
          <p className="mt-0.5 text-sm text-ink-muted">
            {done.length} of {sessions.length} sessions done ·{' '}
            {(doneMinutes / 60).toFixed(1)} of {(plannedMinutes / 60).toFixed(1)} h
          </p>
        </div>
        <div className="w-40">
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-paper-sunk"
            role="progressbar"
            aria-valuenow={Math.round(progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Day completion">
            
            <motion.div
              className="h-full rounded-full bg-moss"
              initial={false}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }} />
            
          </div>
          <p className="mt-1.5 text-right text-xs text-ink-muted">
            {Math.round(progress * 100)}% complete
          </p>
        </div>
      </div>

      <ol className="divide-y divide-ink-line">
        {todayBlocks.map((block, index) => {
          const subject = subjects.find((entry) => entry.id === block.subjectId);
          const overdue =
          !block.done &&
          block.kind !== 'break' &&
          toMinutes(blockEnd(block)) < minutesNow;
          const isBreak = block.kind === 'break';

          return (
            <motion.li
              key={block.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.24,
                delay: Math.min(index * 0.03, 0.24),
                ease: [0.23, 1, 0.32, 1]
              }}
              className={`flex gap-4 px-5 py-3.5 ${isBreak ? 'bg-paper/60' : ''}`}>
              
              <div className="w-20 shrink-0 pt-0.5">
                <p className="text-sm tabular-nums text-ink">
                  {formatTime(block.start)}
                </p>
                <p className="text-[11px] tabular-nums text-ink-muted">
                  {block.minutes} min
                </p>
              </div>

              {isBreak ?
              <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center text-ink-muted">
                  <CoffeeIcon className="h-3.5 w-3.5" aria-hidden="true" />
                </span> :

              <button
                type="button"
                onClick={() => toggleBlock(block.id)}
                aria-pressed={block.done}
                aria-label={`Mark "${block.title}" ${block.done ? 'not done' : 'done'}`}
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-[background-color,border-color] duration-150 ease-out ${
                block.done ?
                'border-moss bg-moss text-paper-raised' :
                overdue ?
                'border-clay/60 hover:border-clay' :
                'border-ink-line hover:border-ink-muted'}`
                }>
                
                  {block.done && <CheckIcon className="h-3 w-3" aria-hidden="true" />}
                </button>
              }

              <div className="min-w-0 flex-1">
                <p
                  className={`text-[15px] leading-snug ${
                  block.done ? 'text-ink-muted line-through' : 'text-ink'}`
                  }>
                  
                  {block.title}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${dotFor[block.kind]}`}
                      aria-hidden="true" />
                    
                    {kindLabel[block.kind]}
                  </span>
                  {subject && <span>· {subject.name}</span>}
                  {overdue &&
                  <span className="rounded-full bg-clay/10 px-2 py-0.5 text-[11px] font-medium text-clay">
                      Missed
                    </span>
                  }
                </p>
                {block.reason &&
                <p className="mt-2 flex gap-1.5 border-l-2 border-moss-soft pl-2.5 text-xs italic leading-relaxed text-ink-muted">
                    <SparklesIcon
                    className="mt-0.5 h-3 w-3 shrink-0 text-moss"
                    aria-hidden="true" />
                  
                    {block.reason}
                  </p>
                }
              </div>
            </motion.li>);

        })}
      </ol>
    </section>);

}