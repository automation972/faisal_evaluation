// Middle section — clean two-card bento:
// LEFT (wide, white): a realistic Young10 CRM contact-detail panel for Sarah
//   Mitchell — stage tracker, deal value, activity timeline, next task.
// RIGHT (dark): concise value statement + Open CRM CTA + live demo stats.

'use client';

import Image from 'next/image';
import {
  ArrowRight,
  Check,
  FileText,
  Phone,
  StickyNote,
} from 'lucide-react';

import { CountUp } from '@/components/landing/count-up';
import { Reveal } from '@/components/landing/reveal';

const STAGES = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won'];
const ACTIVE_STAGE = 2; // Qualified

const TIMELINE = [
  {
    Icon: Phone,
    title: 'Discovery call — 14 min',
    meta: 'Yesterday · notes saved',
    tone: 'bg-[#384BFE]',
    iconTone: 'text-white',
  },
  {
    Icon: StickyNote,
    title: 'Added brief: spring campaign',
    meta: 'Mon · visible to the team',
    tone: 'bg-[#E8EAF3]',
    iconTone: 'text-[#5A5E75]',
  },
  {
    Icon: FileText,
    title: 'Proposal sent — $4,200',
    meta: 'Fri · opens tracked: 2',
    tone: 'bg-[#E8EAF3]',
    iconTone: 'text-[#5A5E75]',
  },
];

export function FeatureBento({ onOpenCrm }: { onOpenCrm: () => void }) {
  return (
    <section aria-label="CRM highlights" className="px-4 pt-16 sm:px-6 lg:px-8 lg:pt-24">
      {/* section header */}
      <Reveal className="mx-auto max-w-[640px] text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#384BFE]/20 bg-[#384BFE]/8 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#2B3AD1]">
          <span className="size-1.5 rounded-full bg-[#384BFE]" aria-hidden />
          Why Young10
        </span>
        <h2 className="mt-4 text-[clamp(1.8rem,3.4vw,2.55rem)] font-medium leading-[1.14] tracking-[-0.028em] text-[#10111A]">
          Built for the way marketing teams{' '}
          <em className="font-[family-name:var(--font-y10-serif)] font-normal italic text-[#384BFE]">
            actually
          </em>{' '}
          sell.
        </h2>
        <p className="mx-auto mt-3.5 max-w-[480px] text-[14.5px] leading-relaxed text-[#777984]">
          Real relationships, real momentum — see how Young10 keeps every deal
          and follow-up on track.
        </p>
      </Reveal>

      <div className="mt-11 grid gap-5 lg:mt-14 lg:grid-cols-[1.35fr_1fr]">
        {/* LEFT — realistic contact-detail panel */}
        <Reveal className="h-full">
          <div className="h-full overflow-hidden rounded-[28px] border border-black/[0.06] bg-white shadow-[0_2px_14px_-6px_rgba(23,26,72,0.14)] transition-shadow duration-300 hover:shadow-[0_28px_56px_-26px_rgba(56,75,254,0.4)]">
            {/* window chrome */}
            <div className="flex items-center justify-between border-b border-[#EEF0F7] bg-[#FAFBFE] px-5 py-3">
              <div className="flex items-center gap-1.5" aria-hidden>
                <span className="size-2.5 rounded-full bg-[#E3E5EF]" />
                <span className="size-2.5 rounded-full bg-[#E3E5EF]" />
                <span className="size-2.5 rounded-full bg-[#E3E5EF]" />
              </div>
              <p className="text-[11px] font-medium text-[#777984]">
                Young10 CRM — contact
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#16A34A]/10 px-2 py-0.5 text-[9.5px] font-semibold text-[#15803D]">
                <span className="size-1.5 rounded-full bg-[#16A34A]" aria-hidden />
                In workspace
              </span>
            </div>

            <div className="p-5 sm:p-6 lg:p-7">
              {/* identity row */}
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <Image
                    src="/team/sarah-mitchell.png"
                    alt="Sarah Mitchell, sales representative at Young10 Marketing"
                    width={128}
                    height={128}
                    className="size-16 rounded-2xl object-cover object-top ring-1 ring-black/10"
                  />
                  <span
                    className="absolute -bottom-1 -right-1 size-4 rounded-full bg-[#16A34A] ring-[3px] ring-white"
                    aria-hidden
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[18px] font-semibold tracking-tight text-[#10111A]">
                      Sarah Mitchell
                    </h3>
                    <span className="rounded-full bg-[#D97706]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#B45309]">
                      Hot lead
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12.5px] text-[#777984]">
                    Sales rep · Young10 Marketing
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[#2B3AD1]">
                    sarah.mitchell@young10marketing.com
                  </p>
                </div>
                <div className="hidden shrink-0 text-right sm:block">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#10111A]/40">
                    Deal value
                  </p>
                  <p className="mt-1 text-[20px] font-semibold tabular-nums tracking-tight text-[#10111A]">
                    $4,200
                  </p>
                </div>
              </div>

              {/* stage tracker */}
              <div className="mt-5">
                <div className="flex items-center gap-1.5">
                  {STAGES.map((stage, i) => (
                    <div key={stage} className="flex flex-1 flex-col items-center gap-1.5">
                      <span
                        className={`h-1.5 w-full rounded-full ${
                          i <= ACTIVE_STAGE
                            ? 'bg-gradient-to-r from-[#384BFE] to-[#5F72FF]'
                            : 'bg-[#E8EAF3]'
                        }`}
                        aria-hidden
                      />
                      <span
                        className={`text-[9.5px] font-medium ${
                          i <= ACTIVE_STAGE ? 'text-[#2B3AD1]' : 'text-[#A0A3B5]'
                        }`}
                      >
                        {stage}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* activity timeline */}
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.15em] text-[#10111A]/40">
                    Recent activity
                  </p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/[0.04] px-2.5 py-1 text-[10px] font-medium text-[#10111A]/55">
                    Follow-up Fri
                  </span>
                </div>
                <div className="mt-3 space-y-2.5">
                  {TIMELINE.map((item) => (
                    <div
                      key={item.title}
                      className="flex items-center gap-3 rounded-xl border border-[#EEF0F7] bg-[#FAFBFE] px-3.5 py-2.5"
                    >
                      <span
                        className={`grid size-7 shrink-0 place-items-center rounded-lg ${item.tone} ${item.iconTone}`}
                      >
                        <item.Icon className="size-3.5" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12.5px] font-medium text-[#10111A]">
                          {item.title}
                        </p>
                        <p className="truncate text-[10.5px] text-[#777984]">{item.meta}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* next step bar */}
              <div className="mt-5 flex items-center justify-between rounded-xl bg-[#0B0C1A] px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-5 place-items-center rounded-full bg-white/10 text-white">
                    <Check className="size-3" aria-hidden />
                  </span>
                  <p className="text-[12px] font-medium text-white/85">
                    Next: send revised quote
                  </p>
                </div>
                <p className="text-[10.5px] font-medium text-white/45">due Thu 11:00</p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* RIGHT — dark value card */}
        <Reveal className="h-full" delay={0.08}>
          <div className="relative flex h-full flex-col overflow-hidden rounded-[28px] bg-[#0B0C1A] p-7 lg:p-8">
            <div
              className="pointer-events-none absolute -right-14 -top-20 size-64 rounded-full bg-[#384BFE]/22 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#8FA0FF]/50 to-transparent"
              aria-hidden
            />

            <h3 className="relative z-10 text-[23px] font-medium leading-snug tracking-tight text-white lg:text-[25px]">
              Keep every lead in view.
            </h3>
            <p className="relative z-10 mt-3 max-w-[320px] text-[13.5px] leading-relaxed text-white/55">
              Every contact, deal and follow-up lives in one shared workspace —
              so nothing slips through the cracks.
            </p>

            <div className="relative z-10 mt-7 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3.5">
                <p className="text-[10px] font-medium uppercase tracking-[0.13em] text-white/45">
                  Pipeline today
                </p>
                <p className="mt-1.5 text-[22px] font-semibold tabular-nums leading-none text-white">
                  <CountUp to={12} />{' '}
                  <span className="text-[12px] font-medium text-white/55">deals</span>
                </p>
                <p className="mt-1.5 text-[10px] font-medium text-[#7EE2A8]">
                  +2 this week
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3.5">
                <p className="text-[10px] font-medium uppercase tracking-[0.13em] text-white/45">
                  Tasks due
                </p>
                <p className="mt-1.5 text-[22px] font-semibold tabular-nums leading-none text-white">
                  <CountUp to={3} duration={1.1} delay={0.35} />{' '}
                  <span className="text-[12px] font-medium text-white/55">today</span>
                </p>
                <p className="mt-1.5 text-[10px] font-medium text-white/40">next at 2:30 PM</p>
              </div>
            </div>

            <div className="relative z-10 mt-auto pt-8">
              <button
                type="button"
                onClick={onOpenCrm}
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-[#4C5EFF] to-[#3243E8] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_12px_28px_-10px_rgba(56,75,254,0.7),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-200 hover:-translate-y-px"
              >
                Open CRM
                <ArrowRight
                  className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </button>
              <p className="mt-3 text-[11px] text-white/35">
                Demo data · sample workspace
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
