// Lower section — clean and premium:
// "How it works" three steps + one dark analytics panel with a quiet animated
// bar chart (Discovery 3 · Proposal 4 · Negotiation 2) and a count-up KPI.

'use client';

import { motion, useReducedMotion } from 'framer-motion';

import { CountUp } from '@/components/landing/count-up';
import { Reveal } from '@/components/landing/reveal';

const EASE = [0.22, 1, 0.36, 1] as const;

const STEPS = [
  { n: '01', title: 'Capture', copy: 'Add leads from website forms or quick entry.' },
  { n: '02', title: 'Nurture', copy: 'Move deals through pipeline stages with tasks.' },
  { n: '03', title: 'Convert', copy: 'Track progress and close with live reports.' },
];

const STAGES = [
  { name: 'Discovery', count: 3, height: 52 },
  { name: 'Proposal', count: 4, height: 88 },
  { name: 'Negotiation', count: 2, height: 38 },
];

export function NextStepsSection() {
  const reduced = useReducedMotion() ?? false;

  return (
    <section className="px-4 pb-6 pt-10 sm:px-6 lg:px-8 lg:pb-8 lg:pt-14">
      {/* How it works */}
      <div id="how-it-works" className="scroll-mt-24">
        <Reveal>
          <span className="inline-flex rounded-full bg-[#10111A] px-3.5 py-1.5 text-[11px] font-medium text-white">
            How it works
          </span>
          <h2 className="mt-4 max-w-[420px] text-[24px] font-medium leading-snug tracking-tight text-[#10111A] lg:text-[27px]">
            A clearer view of your next move.
          </h2>
          <p className="mt-2.5 max-w-[440px] text-[13.5px] leading-relaxed text-[#777984]">
            Young10 CRM turns scattered spreadsheets into one simple rhythm — capture,
            nurture, convert.
          </p>
        </Reveal>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={0.1 + i * 0.1} y={22}>
              <div className="group h-full rounded-[22px] border border-black/5 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_-20px_rgba(31,34,78,0.35)]">
                <span className="grid size-8 place-items-center rounded-full bg-[#384BFE]/8 text-[12px] font-semibold text-[#2B3AD1] transition-colors duration-300 group-hover:bg-[#384BFE] group-hover:text-white">
                  {step.n}
                </span>
                <p className="mt-4 text-[14px] font-semibold text-[#10111A]">{step.title}</p>
                <p className="mt-1.5 text-[12px] leading-relaxed text-[#777984]">{step.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Analytics panel */}
      <Reveal className="mt-5">
        <div className="relative overflow-hidden rounded-[28px] bg-[#0C0D1C] p-7 lg:p-9">
          <div className="y10-chart-grid pointer-events-none absolute inset-0" aria-hidden />
          <div
            className="pointer-events-none absolute -left-16 -top-24 size-72 rounded-full bg-[#384BFE]/18 blur-3xl"
            aria-hidden
          />

          <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-10">
            {/* copy */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-white/55">
                <span className="size-1.5 rounded-full bg-[#5F72FF]" aria-hidden />
                Live reports
              </span>
              <h2 className="mt-4 text-[23px] font-medium leading-snug tracking-tight text-white lg:text-[26px]">
                See your pipeline at a glance.
              </h2>
              <p className="mt-3 max-w-[360px] text-[13px] leading-relaxed text-white/55">
                Deal value, stage progress and win rates update live — so forecasts rest on
                what is actually in the pipeline, not guesswork.
              </p>
              <div className="mt-6 inline-flex items-baseline gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5">
                <span className="text-[30px] font-semibold leading-none tracking-tight text-white">
                  <CountUp to={12} duration={1.6} delay={0.5} />
                </span>
                <span className="text-[11px] font-medium leading-tight text-white/50">
                  in negotiation
                  <br />
                  active deals · Demo data
                </span>
              </div>
            </div>

            {/* animated stage bars */}
            <div className="relative flex h-[240px] justify-center gap-8 sm:gap-12 lg:h-[260px]">
              {STAGES.map((stage, i) => (
                <div key={stage.name} className="flex w-20 flex-col items-center sm:w-24">
                  <motion.span
                    initial={reduced ? undefined : { opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.9 + i * 0.15, ease: EASE }}
                    className="mb-2 text-[16px] font-semibold text-white"
                  >
                    {stage.count}
                  </motion.span>
                  <div className="flex w-full flex-1 items-end overflow-hidden rounded-t-xl bg-white/5">
                    <motion.div
                      className="w-full rounded-t-xl bg-gradient-to-t from-[#2B3AD1] via-[#384BFE] to-[#6E82FF] shadow-[0_-6px_24px_-6px_rgba(56,75,254,0.55)]"
                      initial={reduced ? undefined : { height: '4%' }}
                      whileInView={{ height: `${stage.height}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.1, delay: 0.25 + i * 0.18, ease: EASE }}
                    />
                  </div>
                  <p className="mt-2.5 w-full text-center text-[10.5px] font-medium text-white/45">
                    {stage.name}
                  </p>
                </div>
              ))}

              {/* baseline */}
              <motion.span
                className="absolute bottom-[26px] left-0 h-px w-full bg-white/12"
                initial={reduced ? undefined : { scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.15, ease: EASE }}
                aria-hidden
              />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
