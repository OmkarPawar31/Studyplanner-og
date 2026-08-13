import { motion } from 'framer-motion';
import { SparklesIcon } from 'lucide-react';
import { planBlocks, planDay, type PlanBlock } from '../data/plannerPreview';

const kindStyles: Record<PlanBlock['kind'], {dot: string;label: string;}> = {
  study: { dot: 'bg-moss', label: 'Focus' },
  deadline: { dot: 'bg-clay', label: 'Due today' },
  class: { dot: 'bg-sand', label: 'Class' },
  break: { dot: 'bg-ink-muted/50', label: 'Break' }
};

type PlannerPreviewProps = {
  eyebrow?: string;
  headline?: string;
  caption?: string;
};

export function PlannerPreview({
  eyebrow = 'Your plan, rebuilt every morning',
  headline = planDay.headline,
  caption = "Add your syllabi once. Marigold reads the due dates, learns when you actually get work done, and reshuffles the week when something slips."
}: PlannerPreviewProps) {
  return (
    <aside
      aria-label="Preview of an AI-generated study plan"
      className="hidden min-h-full flex-col justify-between bg-ink px-10 py-12 lg:flex xl:px-14">
      
      <div>
        <p className="inline-flex items-center gap-2 text-sm text-paper/70">
          <SparklesIcon className="h-4 w-4 text-sand" aria-hidden="true" />
          {eyebrow}
        </p>
        <p className="mt-6 max-w-md font-display text-[34px] leading-[1.15] text-paper xl:text-[40px]">
          {headline}
        </p>
      </div>

      <div className="mt-10 rounded-card border border-paper/10 bg-paper/[0.04] p-5">
        <div className="flex items-baseline justify-between gap-4 border-b border-paper/10 pb-4">
          <h2 className="text-sm font-medium text-paper">{planDay.label}</h2>
          <p className="text-xs text-paper/60">
            {planDay.focusHours} h focus · {planDay.deadlinesLeft} deadlines
          </p>
        </div>

        <ol className="mt-1 divide-y divide-paper/[0.07]">
          {planBlocks.map((block, index) =>
          <motion.li
            key={block.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.28,
              delay: 0.12 + index * 0.05,
              ease: [0.23, 1, 0.32, 1]
            }}
            className="flex gap-4 py-3.5">
            
              <span className="w-12 shrink-0 pt-0.5 text-xs tabular-nums text-paper/50">
                {block.time}
              </span>
              <span
              className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${kindStyles[block.kind].dot}`}
              aria-hidden="true" />
            
              <span className="min-w-0">
                <span className="block text-[15px] leading-snug text-paper">
                  {block.title}
                </span>
                <span className="mt-0.5 block text-xs text-paper/50">
                  {block.course} · {kindStyles[block.kind].label}
                </span>
                {block.note &&
              <span className="mt-2 block border-l border-sand/50 pl-2.5 text-xs italic leading-relaxed text-paper/60">
                    {block.note}
                  </span>
              }
              </span>
            </motion.li>
          )}
        </ol>
      </div>

      <p className="mt-10 max-w-sm text-sm leading-relaxed text-paper/50">
        {caption}
      </p>
    </aside>);

}