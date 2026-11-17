// Lower two-column section:
// LEFT — light panel with animated workflow steps ("How it works").
// RIGHT — dark analytics panel with sculptural 3D chart tiles (animated bars)
// + floating lavender summary card with a counting-up figure.

'use client';

import { motion, useReducedMotion } from 'framer-motion';

import ChartTiles from '@/components/landing/scene/chart-tiles';
import { CountUp } from '@/components/landing/count-up';
import { Reveal } from '@/components/landing/reveal';

const EASE = [0.22, 1, 0.36, 1] as const;

const STEPS = [
  {
    n: '01',
    title: 'Capture',
    copy: 'Add leads from website forms or quick entry.',
    accent: false,
  },
  {
    n: '02',
    title: 'Nurture',
    copy: 'Move deals through pipeline stages with tasks.',
    accent: true,
  },
  {
    n: '03',
    title: 'Convert',
    copy: 'Track progress and close with live reports.',
    accent: false,
  },
];

export function NextStepsSection() {
  const reduced = useReducedMotion() ?? false;

  return (
    <section className="px-4 pb-4 pt-12 sm:px-6 lg:px-8 lg:pb-6 lg:pt-16">
      <div className="grid gap-4 lg:grid-cols-[1.05fr_1fr] lg:gap-5">
        {/* LEFT — light panel */}
        <Reveal className="h-full">
          <div
            id="how-it-works"
            className="flex h-full scroll-mt-24 flex-col rounded-[30px] border border-black/4 bg-gradient-to-b from-[#ECEEF3] to-[#E7E9F0] p-7 lg:p-8"
          >
            <span className="inline-flex w-fit rounded-full bg-[#10111A] px-3.5 py-1.5 text-[11px] font-medium text-white">
              How it works
            </span>

            <h3 className="mt-5 max-w-[340px] text-[23px] font-medium leading-snug tracking-tight text-[#10111A] lg:text-[25px]">
              A clearer view of your next move.
            </h3>
            <p className="mt-3 max-w-[380px] text-[13px] leading-relaxed text-[#777984]">
              Young10 CRM turns scattered spreadsheets into one simple rhythm — capture,
              nurture, convert. Your team always knows what happens next.
            </p>

            <div className="mt-auto grid grid-cols-3 gap-3 pt-8">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.n}
                  initial={reduced ? undefined : { opacity: 0, y: 24, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.65, delay: 0.15 + i * 0.14, ease: EASE }}
                  className={`flex h-full min-h-[150px] flex-col rounded-[20px] p-4 transition-shadow duration-300 hover:shadow-[0_16px_30px_-16px_rgba(10,11,26,0.35)] ${
                    step.accent
                      ? 'bg-[#DBDFF8] shadow-[inset_0_0_0_1px_rgba(56,75,254,0.2)]'
                      : 'border border-black/5 bg-white/80'
                  }`}
                >
                  <motion.span
                    initial={reduced ? undefined : { scale: 0, rotate: -30 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.3 + i * 0.14 }}
                    className={`grid size-7 place-items-center rounded-full text-[11px] font-semibold ${
                      step.accent ? 'bg-[#384BFE] text-white' : 'bg-[#10111A]/6 text-[#10111A]/70'
                    }`}
                  >
                    {step.n}
                  </motion.span>
                  <p className="mt-4 text-[13.5px] font-semibold text-[#10111A]">{step.title}</p>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-[#777984]">{step.copy}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* RIGHT — dark analytics panel with animated 3D chart tiles */}
        <Reveal className="h-full" delay={0.08}>
          <div className="relative flex h-full flex-col overflow-hidden rounded-[30px] bg-[#0C0D1C] p-7 lg:p-8">
            {/* 3D tile composition */}
            <div className="relative h-[240px] lg:h-[260px]">
              <ChartTiles className="absolute inset-0" />

              {/* floating pale-blue summary card (HTML overlay — crisp & accessible) */}
              <motion.div
                initial={reduced ? undefined : { opacity: 0, x: 26, y: '-33%' }}
                animate={{ opacity: 1, x: 0, y: '-33%' }}
                transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
                className="absolute right-3 top-1/2 z-10 w-[150px] rounded-[18px] border border-white/60 bg-[#DBDFF8]/95 p-4 shadow-[0_20px_40px_-16px_rgba(0,0,0,0.55)] backdrop-blur-sm lg:right-6"
              >
                <div className="flex items-center gap-1.5">
                  <motion.span
                    className="size-1.5 rounded-full bg-[#384BFE]"
                    animate={reduced ? undefined : { scale: [1, 1.45, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    aria-hidden
                  />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#10111A]/55">
                    In negotiation
                  </p>
                </div>
                <p className="mt-1.5 text-[26px] font-semibold leading-none tracking-tight text-[#10111A]">
                  <CountUp to={12} duration={1.6} delay={0.7} />
                </p>
                <p className="mt-2 text-[10px] font-medium leading-relaxed text-[#10111A]/55">
                  active deals · Demo data
                </p>
              </motion.div>
            </div>

            <div className="mt-2">
              <h3 className="text-[22px] font-medium leading-snug tracking-tight text-white lg:text-[24px]">
                See your pipeline at a glance.
              </h3>
              <p className="mt-3 max-w-[360px] text-[13px] leading-relaxed text-white/55">
                Deal value, stage progress and win rates update live — so forecasts rest on
                what is actually in the pipeline, not guesswork.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
