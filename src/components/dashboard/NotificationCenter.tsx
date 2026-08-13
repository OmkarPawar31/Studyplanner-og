import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BellIcon,
  CalendarClockIcon,
  CircleAlertIcon,
  FlameIcon,
  ListChecksIcon,
  XIcon } from
'lucide-react';
import { usePlanner } from '../../contexts/PlannerContext';
import type { NotificationKind } from '../../types/planner';

const iconFor: Record<NotificationKind, typeof BellIcon> = {
  missed: CircleAlertIcon,
  exam: CalendarClockIcon,
  quiz: ListChecksIcon,
  streak: FlameIcon
};

const toneFor: Record<NotificationKind, string> = {
  missed: 'text-clay bg-clay/10',
  exam: 'text-sand bg-sand/15',
  quiz: 'text-moss bg-moss-soft',
  streak: 'text-ink-soft bg-paper-sunk'
};

export function NotificationCenter() {
  const { notifications, unreadCount, markAllRead, dismissNotification } =
  usePlanner();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          if (!open) markAllRead();
        }}
        aria-expanded={open}
        aria-label={`Notifications, ${unreadCount} unread`}
        className="relative flex h-9 w-9 items-center justify-center rounded-card border border-ink-line bg-paper-raised text-ink-soft transition-colors duration-150 ease-out hover:bg-paper-sunk hover:text-ink">
        
        <BellIcon className="h-4 w-4" aria-hidden="true" />
        {unreadCount > 0 &&
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay px-1 text-[10px] font-medium text-paper-raised">
            {unreadCount}
          </span>
        }
      </button>

      <AnimatePresence>
        {open &&
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
          className="absolute right-0 z-30 mt-2 w-[22rem] origin-top-right rounded-card border border-ink-line bg-paper-raised shadow-card">
          
            <div className="flex items-center justify-between border-b border-ink-line px-4 py-3">
              <h2 className="text-sm font-medium text-ink">Notifications</h2>
              <span className="text-xs text-ink-muted">
                {notifications.length} active
              </span>
            </div>
            {notifications.length === 0 ?
          <p className="px-4 py-6 text-sm text-ink-muted">
                Nothing pending — today's plan is fully checked off.
              </p> :

          <ul className="max-h-80 divide-y divide-ink-line overflow-y-auto">
                {notifications.map((entry) => {
              const Icon = iconFor[entry.kind];
              return (
                <li key={entry.id} className="flex gap-3 px-4 py-3.5">
                      <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${toneFor[entry.kind]}`}>
                    
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-snug text-ink">
                          {entry.title}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                          {entry.body}
                        </p>
                        <p className="mt-1.5 text-[11px] text-ink-muted/80">
                          {entry.time}
                        </p>
                      </div>
                      <button
                    type="button"
                    onClick={() => dismissNotification(entry.id)}
                    aria-label={`Dismiss ${entry.title}`}
                    className="h-6 w-6 shrink-0 rounded-md text-ink-muted transition-colors duration-150 ease-out hover:bg-paper-sunk hover:text-ink">
                    
                        <XIcon className="mx-auto h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </li>);

            })}
              </ul>
          }
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}