// Platform section — centred editorial header + four cards, each embedding a
// realistic miniature of the actual product surface (contact row, kanban
// column, task list, live chart). Every fragment animates piece-by-piece as
// it enters the viewport: staggered springs, count-up values, growing bars.

'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Check, ChevronRight, Phone } from 'lucide-react';

import { CountUp } from '@/components/landing/count-up';
import { Reveal } from '@/components/landing/reveal';

const EASE = [0.22, 1, 0.36, 1] as const;

const spring = (delay: number) => ({
  type: 'spring' as const,
  stiffness: 260,
  damping: 20,
  delay,
});

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.55, delay, ease: EASE },
});

/* ------------------------------------------------------------------ */
/* miniature product fragments — believable CRM data                    */
/* ------------------------------------------------------------------ */

function ContactMini() {
  return (
    <div className="rounded-2xl border border-[#E8EAF3] bg-[#F7F8FC] p-3.5 text-left">
      <div className="flex items-center gap-2.5">
        <motion.span
          {...rise(0.1)}
          className="relative grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#5F72FF] to-[#384BFE] text-[10.5px] font-semibold text-white"
        >
          JL
          <span
            className="absolute inset-0 animate-ping rounded-full bg-[#384BFE]/25"
            style={{ animationDuration: '2.6s' }}
            aria-hidden
          />
        </motion.span>
        <motion.div {...rise(0.18)} className="min-w-0 flex-1">
          <p className="truncate text-[12.5px] font-semibold text-[#10111A]">Jordan Lee</p>
          <p className="truncate text-[10.5px] text-[#777984]">Meridian Coffee Co.</p>
        </motion.div>
        <motion.span
          initial={{ opacity: 0, scale: 0.6 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={spring(0.3)}
          className="inline-flex items-center gap-1 rounded-full bg-[#16A34A]/10 px-2 py-0.5 text-[9.5px] font-semibold text-[#15803D]"
        >
          <span className="size-1.5 rounded-full bg-[#16A34A]" aria-hidden />
          Won
        </motion.span>
      </div>
      <motion.div {...rise(0.38)} className="mt-3 flex items-center gap-1.5">
        <motion.span
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={spring(0.42)}
          className="rounded-md bg-white px-1.5 py-1 text-[9.5px] font-medium text-[#2B3AD1] ring-1 ring-[#E8EAF3]"
        >
          Retainer
        </motion.span>
        <motion.span
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={spring(0.5)}
          className="rounded-md bg-white px-1.5 py-1 text-[9.5px] font-medium text-[#10111A]/55 ring-1 ring-[#E8EAF3]"
        >
          SEO audit
        </motion.span>
        <span className="ml-auto text-[11px] font-semibold tabular-nums text-[#10111A]">
          $
          <CountUp
            to={6200}
            duration={1.4}
            delay={0.5}
            format={(v) => Math.round(v).toLocaleString('en-US')}
          />
        </span>
      </motion.div>
    </div>
  );
}

function PipelineMini() {
  const deals = [
    { name: 'Ava Brooks', value: 3400, side: -14 },
    { name: 'Duo Fitness', value: 1850, side: 14 },
  ];
  return (
    <div className="rounded-2xl border border-[#E8EAF3] bg-[#F7F8FC] p-3.5 text-left">
      <motion.div {...rise(0.1)} className="flex items-center justify-between">
        <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[#10111A]/45">
          Qualified
        </p>
        <motion.span
          initial={{ opacity: 0, scale: 0.6 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={spring(0.2)}
          className="rounded-full bg-[#384BFE] px-2 py-0.5 text-[9.5px] font-semibold text-white"
        >
          4 deals
        </motion.span>
      </motion.div>
      <div className="mt-2.5 space-y-1.5">
        {deals.map((deal, i) => (
          <motion.div
            key={deal.name}
            initial={{ opacity: 0, x: deal.side }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={spring(0.3 + i * 0.14)}
            whileHover={{ scale: 1.03 }}
            className="flex cursor-default items-center justify-between rounded-xl border border-[#E8EAF3] bg-white px-2.5 py-2 shadow-[0_1px_3px_rgba(23,26,72,0.06)]"
          >
            <span className="truncate text-[11px] font-medium text-[#10111A]">{deal.name}</span>
            <span className="text-[10.5px] font-semibold tabular-nums text-[#2B3AD1]">
              $
              <CountUp
                to={deal.value}
                duration={1.3}
                delay={0.45 + i * 0.15}
                format={(v) => Math.round(v).toLocaleString('en-US')}
              />
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function TasksMini() {
  return (
    <div className="rounded-2xl border border-[#E8EAF3] bg-[#F7F8FC] p-3.5 text-left">
      <motion.div {...rise(0.1)} className="flex items-center justify-between">
        <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[#10111A]/45">
          Today
        </p>
        <span className="text-[9.5px] font-medium text-[#777984]">2 of 3 done</span>
      </motion.div>
      <div className="mt-2.5 space-y-1.5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={spring(0.25)}
          className="flex items-center gap-2 rounded-xl bg-white px-2.5 py-2 ring-1 ring-[#E8EAF3]"
        >
          <motion.span
            initial={{ scale: 0, rotate: -90 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={spring(0.38)}
            className="grid size-4 shrink-0 place-items-center rounded-full bg-[#384BFE] text-white"
          >
            <Check className="size-2.5" aria-hidden />
          </motion.span>
          <span className="flex-1 truncate text-[11px] text-[#10111A]/45 line-through">
            Send proposal draft
          </span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={spring(0.38)}
          className="flex items-center gap-2 rounded-xl bg-white px-2.5 py-2 ring-1 ring-[#E8EAF3]"
        >
          <span className="size-4 shrink-0 rounded-full border-[1.5px] border-[#C6CAE0]" aria-hidden />
          <span className="flex-1 truncate text-[11px] font-medium text-[#10111A]">
            Call Noah at Brightside
          </span>
          <motion.span
            initial={{ opacity: 0, scale: 0.7 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={spring(0.55)}
            className="inline-flex items-center gap-1 rounded-md bg-[#D97706]/10 px-1.5 py-0.5 text-[9.5px] font-semibold text-[#D97706]"
          >
            <Phone className="size-2.5" aria-hidden />
            2:30 PM
          </motion.span>
        </motion.div>
      </div>
    </div>
  );
}

function ReportsMini() {
  const bars = [34, 52, 44, 66, 58, 82, 74];
  return (
    <div className="rounded-2xl border border-[#E8EAF3] bg-[#F7F8FC] p-3.5 text-left">
      <motion.div {...rise(0.1)} className="flex items-baseline justify-between">
        <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[#10111A]/45">
          Won revenue
        </p>
        <motion.span
          initial={{ opacity: 0, scale: 0.6 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={spring(0.55)}
          className="rounded-md bg-[#16A34A]/10 px-1.5 py-0.5 text-[9.5px] font-semibold text-[#15803D]"
        >
          +18.4%
        </motion.span>
      </motion.div>
      <motion.div {...rise(0.18)} className="mt-1 flex items-baseline gap-1.5">
        <p className="text-[19px] font-semibold tracking-tight text-[#10111A]">
          $
          <CountUp
            to={24800}
            duration={1.6}
            delay={0.35}
            format={(v) => Math.round(v).toLocaleString('en-US')}
          />
        </p>
        <p className="text-[9.5px] text-[#777984]">this month</p>
      </motion.div>
      <div className="mt-2.5 flex h-10 items-end gap-1" aria-hidden>
        {bars.map((h, i) => (
          <motion.span
            key={i}
            initial={{ height: '6%', opacity: 0.4 }}
            whileInView={{ height: `${h}%`, opacity: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ type: 'spring', stiffness: 170, damping: 18, delay: 0.35 + i * 0.07 }}
            style={{ transformOrigin: 'bottom' }}
            className={`flex-1 rounded-sm ${
              i === bars.length - 1
                ? 'bg-gradient-to-t from-[#384BFE] to-[#8FA0FF]'
                : 'bg-[#384BFE]/15'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

const CARDS = [
  { label: 'Contacts', value: 'Smart lead profiles', pill: 'Organised', Mini: ContactMini },
  { label: 'Pipeline', value: 'Visual deal stages', pill: 'Drag & drop', Mini: PipelineMini },
  { label: 'Follow-ups', value: 'Tasks & reminders', pill: 'On time', Mini: TasksMini },
  { label: 'Reports', value: 'Live performance', pill: 'Real-time', Mini: ReportsMini },
];

/* ------------------------------------------------------------------ */

export function SummaryCards() {
  const reduced = useReducedMotion() ?? false;

  return (
    <section
      id="features"
      aria-label="CRM capabilities"
      className="relative scroll-mt-28 px-4 pt-16 sm:px-6 lg:px-8 lg:pt-24"
    >
      {/* section header */}
      <Reveal className="mx-auto max-w-[640px] text-center">
        <motion.span
          initial={reduced ? undefined : { opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={spring(0)}
          className="inline-flex items-center gap-2 rounded-full border border-[#384BFE]/20 bg-[#384BFE]/8 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#2B3AD1]"
        >
          <span className="size-1.5 rounded-full bg-[#384BFE]" aria-hidden />
          The platform
        </motion.span>
        <h2 className="mt-4 text-[clamp(1.8rem,3.4vw,2.55rem)] font-medium leading-[1.14] tracking-[-0.028em] text-[#10111A]">
          One workspace for the{' '}
          <em className="font-[family-name:var(--font-y10-serif)] font-normal italic text-[#384BFE]">
            entire
          </em>{' '}
          sales journey.
        </h2>
        <p className="mx-auto mt-3.5 max-w-[460px] text-[14.5px] leading-relaxed text-[#777984]">
          Everything your team touches in a deal — organised into four sharp,
          connected tools.
        </p>
      </Reveal>

      {/* product cards */}
      <div className="mx-auto mt-11 grid max-w-[1200px] grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
        {CARDS.map((card, i) => (
          <Reveal key={card.label} delay={0.08 + i * 0.09} y={36}>
            <div className="group relative h-full overflow-hidden rounded-[24px] border border-black/[0.06] bg-white p-5 shadow-[0_2px_14px_-6px_rgba(23,26,72,0.14)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_30px_60px_-24px_rgba(56,75,254,0.45)]">
              {/* hover accent edge */}
              <span
                className="pointer-events-none absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-[#384BFE] to-[#8FA0FF] transition-transform duration-500 group-hover:scale-x-100"
                aria-hidden
              />

              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#10111A]/45">
                  {card.label}
                </p>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#384BFE]/8 px-2.5 py-1 text-[10px] font-semibold text-[#2B3AD1] transition-colors duration-300 group-hover:bg-[#384BFE] group-hover:text-white">
                  {card.pill}
                </span>
              </div>
              <p className="mt-1.5 text-[17.5px] font-semibold tracking-tight text-[#10111A]">
                {card.value}
              </p>

              {/* realistic, self-animating product fragment */}
              <motion.div
                className={`mt-4 ${reduced ? '' : 'y10-float'}`}
                style={{ animationDelay: `${i * 0.8}s` }}
                whileHover={reduced ? undefined : { scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 240, damping: 18 }}
              >
                <card.Mini />
              </motion.div>

              <p className="mt-3.5 inline-flex items-center gap-1 text-[11px] font-medium text-[#777984] transition-colors group-hover:text-[#2B3AD1]">
                Inside the workspace
                <ChevronRight
                  className="size-3 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
