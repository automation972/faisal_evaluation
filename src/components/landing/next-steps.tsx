// Lower two-column section:
// LEFT — light panel with workflow steps ("How it works").
// RIGHT — dark analytics panel with sculptural 3D chart tiles + lavender summary card.

'use client';

import ChartTiles from '@/components/landing/scene/chart-tiles';
import { Reveal } from '@/components/landing/reveal';

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
              {STEPS.map((step) => (
                <div
                  key={step.n}
                  className={`flex h-full min-h-[150px] flex-col rounded-[20px] p-4 ${
                    step.accent
                      ? 'bg-[#DCDDF5] shadow-[inset_0_0_0_1px_rgba(117,99,244,0.18)]'
                      : 'border border-black/5 bg-white/80'
                  }`}
                >
                  <span
                    className={`grid size-7 place-items-center rounded-full text-[11px] font-semibold ${
                      step.accent ? 'bg-[#7563F4] text-white' : 'bg-[#10111A]/6 text-[#10111A]/70'
                    }`}
                  >
                    {step.n}
                  </span>
                  <p className="mt-4 text-[13.5px] font-semibold text-[#10111A]">{step.title}</p>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-[#777984]">{step.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* RIGHT — dark analytics panel with 3D chart tiles */}
        <Reveal className="h-full" delay={0.08}>
          <div className="relative flex h-full flex-col overflow-hidden rounded-[30px] bg-[#0C0D1C] p-7 lg:p-8">
            {/* 3D tile composition */}
            <div className="relative h-[240px] lg:h-[260px]">
              <ChartTiles className="absolute inset-0" />

              {/* floating pale-lavender summary card (HTML overlay — crisp & accessible) */}
              <div className="absolute right-3 top-1/2 z-10 w-[150px] -translate-y-1/3 rounded-[18px] border border-white/60 bg-[#DCDDF5]/95 p-4 shadow-[0_20px_40px_-16px_rgba(0,0,0,0.55)] backdrop-blur-sm lg:right-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#10111A]/55">
                  In negotiation
                </p>
                <p className="mt-1.5 text-[26px] font-semibold leading-none tracking-tight text-[#10111A]">
                  12
                </p>
                <p className="mt-2 text-[10px] font-medium leading-relaxed text-[#10111A]/55">
                  active deals · Demo data
                </p>
              </div>
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
