// Lower section — premium two-part composition:
// 1. "How it works": editorial three-step rail — oversized ghost numerals on
//    hairline rules, no boxed cards.
// 2. Dark analytics panel: editorial split layout — copy + KPI chips left,
//    animated horizontal stage bars with per-stage values right.

'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, CalendarClock, Layers } from 'lucide-react';

import { CountUp } from '@/components/landing/count-up';
import { Reveal } from '@/components/landing/reveal';

const EASE = [0.22, 1, 0.36, 1] as const;

const STEPS = [
  {
    n: '01',
    title: 'Capture',
    copy: 'Add leads from website forms or quick entry — everything lands in one place.',
  },
  {
    n: '02',
    title: 'Nurture',
    copy: 'Move deals through visual stages with tasks and reminders that keep momentum.',
  },
  {
    n: '03',
    title: 'Convert',
    copy: 'Track every stage with live reports and close with confidence.',
  },
];

const STAGES = [
  { name: 'Discovery', count: 3, value: '$6,900', width: 46 },
  { name: 'Proposal', count: 4, value: '$11,200', width: 78 },
  { name: 'Negotiation', count: 2, value: '$8,400', width: 56 },
];

export function NextStepsSection() {
  const reduced = useReducedMotion() ?? false;

  return (
    <section className="px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-28 lg:pt-24">
      {/* ---- How it works ---- */}
      <div id="how-it-works" className="mx-auto max-w-[1200px] scroll-mt-24">
        <Reveal className="mx-auto max-w-[640px] text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#384BFE]/20 bg-[#384BFE]/8 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#2B3AD1]">
            <span className="size-1.5 rounded-full bg-[#384BFE]" aria-hidden />
            How it works
          </span>
          <h2 className="mt-4 text-[clamp(1.8rem,3.4vw,2.55rem)] font-medium leading-[1.14] tracking-[-0.028em] text-[#10111A]">
            From first hello to{' '}
            <em className="font-[family-name:var(--font-y10-serif)] font-normal italic text-[#384BFE]">
              signed
            </em>{' '}
            deal.
          </h2>
          <p className="mx-auto mt-3.5 max-w-[480px] text-[14.5px] leading-relaxed text-[#777984]">
            Young10 CRM turns scattered spreadsheets into one simple rhythm —
            capture, nurture, convert.
          </p>
        </Reveal>

        {/* editorial step rail */}
        <div className="relative mx-auto mt-12 grid max-w-[1100px] gap-x-10 gap-y-8 sm:grid-cols-3 lg:mt-16">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={0.15 + i * 0.14} y={26}>
              <div className="group relative">
                {/* hairline top rule with animated progress */}
                <span
                  className="absolute inset-x-0 top-0 h-px bg-[#E3E5EF]"
                  aria-hidden
                />
                <motion.span
                  className="absolute inset-x-0 top-0 h-px origin-left bg-gradient-to-r from-[#384BFE] to-[#8FA0FF]"
                  initial={reduced ? undefined : { scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: 0.3 + i * 0.15, ease: EASE }}
                  aria-hidden
                />

                {/* ghost numeral — blur-rise entrance */}
                <motion.p
                  initial={reduced ? undefined : { opacity: 0, y: 22, filter: 'blur(10px)' }}
                  whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.85, delay: 0.25 + i * 0.15, ease: EASE }}
                  className="mt-5 bg-gradient-to-b from-[#384BFE]/16 to-[#384BFE]/[0.04] bg-clip-text text-[52px] font-semibold leading-none tracking-tight text-transparent transition-all duration-300 group-hover:from-[#384BFE]/30 sm:text-[56px]"
                >
                  {step.n}
                </motion.p>
                <p className="mt-3 text-[17px] font-semibold tracking-tight text-[#10111A]">
                  {step.title}
                </p>
                <p className="mt-2 max-w-[300px] text-[13.5px] leading-relaxed text-[#777984]">
                  {step.copy}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ---- Dark analytics panel ---- */}
      <Reveal className="mx-auto mt-16 max-w-[1200px] lg:mt-24">
        <div className="relative overflow-hidden rounded-[36px] bg-[#0B0C1A] p-7 sm:p-9 lg:p-12">
          {/* atmosphere */}
          <div className="y10-chart-grid pointer-events-none absolute inset-0" aria-hidden />
          <div
            className="pointer-events-none absolute -left-20 -top-28 size-80 rounded-full bg-[#384BFE]/20 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-32 -right-16 size-80 rounded-full bg-[#384BFE]/14 blur-3xl"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#8FA0FF]/60 to-transparent"
            aria-hidden
          />

          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
            {/* copy + KPIs */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white/60 backdrop-blur-md">
                <span className="size-1.5 rounded-full bg-[#8FA0FF]" aria-hidden />
                Live reports
              </span>
              <h2 className="mt-5 text-[clamp(1.55rem,2.8vw,2.15rem)] font-medium leading-[1.16] tracking-[-0.026em] text-white">
                See your pipeline{' '}
                <em className="font-[family-name:var(--font-y10-serif)] font-normal italic text-[#9DABFF]">
                  at a glance.
                </em>
              </h2>
              <p className="mt-4 max-w-[400px] text-[13.5px] leading-relaxed text-white/55">
                Deal value, stage progress and win rates update live — so your
                forecast rests on what is actually in the pipeline, never on
                guesswork.
              </p>

              {/* KPI chips */}
              <div className="mt-8 grid grid-cols-2 gap-3.5 sm:max-w-[380px]">
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-md">
                  <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-white/45">
                    <Layers className="size-3 text-[#8FA0FF]" aria-hidden />
                    In negotiation
                  </div>
                  <p className="mt-2 text-[28px] font-semibold leading-none tracking-tight text-white">
                    <CountUp to={12} duration={1.6} delay={0.5} />
                  </p>
                  <p className="mt-1.5 text-[11px] text-white/40">active deals</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-md">
                  <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-white/45">
                    <CalendarClock className="size-3 text-[#8FA0FF]" aria-hidden />
                    Tasks due
                  </div>
                  <p className="mt-2 text-[28px] font-semibold leading-none tracking-tight text-white">
                    <CountUp to={3} duration={1.3} delay={0.7} />
                  </p>
                  <p className="mt-1.5 text-[11px] text-white/40">today</p>
                </div>
              </div>
            </div>

            {/* realistic pipeline readout */}
            <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md sm:p-8">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white/55">
                  Pipeline overview
                </p>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#384BFE]/25 px-2.5 py-1 text-[10px] font-medium text-[#C7D0FF]">
                  <span className="relative flex size-1.5" aria-hidden>
                    <span className="absolute size-full animate-ping rounded-full bg-[#8FA0FF] opacity-70" />
                    <span className="relative size-1.5 rounded-full bg-[#8FA0FF]" />
                  </span>
                  Live
                </span>
              </div>

              <div className="mt-7 flex flex-col gap-6">
                {STAGES.map((stage, i) => (
                  <div key={stage.name}>
                    <div className="mb-2.5 flex items-baseline justify-between">
                      <p className="text-[13.5px] font-medium text-white/80">
                        {stage.name}
                        <span className="ml-2 text-[11px] font-normal tabular-nums text-white/40">
                          {stage.count} deals
                        </span>
                      </p>
                      <p className="text-[12px] font-semibold tabular-nums text-white/85">
                        {stage.value}
                      </p>
                    </div>
                    <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/8">
                      <motion.div
                        className="y10-stage-fill h-full rounded-full bg-gradient-to-r from-[#2B3AD1] via-[#384BFE] to-[#8FA0FF] shadow-[0_0_18px_-2px_rgba(56,75,254,0.7)]"
                        initial={reduced ? undefined : { width: '6%' }}
                        whileInView={{ width: `${stage.width}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.3, delay: 0.3 + i * 0.22, ease: EASE }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* total row */}
              <div className="mt-7 flex items-center justify-between border-t border-white/8 pt-4">
                <p className="text-[11.5px] text-white/45">
                  Total open value
                  <span className="ml-2 text-[10px] text-white/30">9 deals · 3 stages</span>
                </p>
                <p className="text-[15px] font-semibold tabular-nums text-white">
                  $
                  <CountUp
                    to={26500}
                    duration={1.8}
                    delay={0.6}
                    format={(v) => Math.round(v).toLocaleString('en-US')}
                  />
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <p className="text-[11px] text-white/35">Demo data · sample workspace</p>
                <p className="inline-flex items-center gap-1 text-[11px] font-medium text-[#9DABFF]">
                  Updates in real time
                  <ArrowUpRight className="size-3" aria-hidden />
                </p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
