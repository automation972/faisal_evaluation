// Middle section — clean two-card bento:
// LEFT (wide, white): Sarah Mitchell contact-profile visual with portrait photo.
// RIGHT (dark): concise value statement + Open CRM CTA + demo stats.

'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CircleDot } from 'lucide-react';

import { CountUp } from '@/components/landing/count-up';
import { Reveal } from '@/components/landing/reveal';

const EASE = [0.22, 1, 0.36, 1] as const;

export function FeatureBento({ onOpenCrm }: { onOpenCrm: () => void }) {
  const reduced = useReducedMotion() ?? false;

  return (
    <section aria-label="CRM highlights" className="px-4 pt-10 sm:px-6 lg:px-8 lg:pt-14">
      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr] lg:gap-5">
        {/* LEFT — contact profile showcase */}
        <Reveal className="h-full">
          <div className="flex h-full flex-col gap-6 rounded-[28px] border border-black/5 bg-white p-6 sm:flex-row sm:items-center lg:gap-8 lg:p-8">
            {/* portrait */}
            <div className="group relative mx-auto aspect-[3/4] w-full max-w-[220px] shrink-0 overflow-hidden rounded-[22px] bg-[#DDE1F2] sm:mx-0">
              <Image
                src="/team/sarah-mitchell.png"
                alt="Sarah Mitchell, sales representative at Young10 Marketing"
                width={864}
                height={1152}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
              />
              <div
                className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#10111A]/45 to-transparent"
                aria-hidden
              />
            </div>

            {/* profile details */}
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="relative shrink-0">
                  <Image
                    src="/team/sarah-mitchell.png"
                    alt=""
                    aria-hidden
                    width={80}
                    height={80}
                    className="size-11 rounded-full object-cover object-top ring-2 ring-[#384BFE]/15"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-[#16A34A] ring-2 ring-white" aria-hidden />
                </span>
                <div>
                  <p className="text-[15px] font-semibold text-[#10111A]">Sarah Mitchell</p>
                  <p className="text-[12px] text-[#777984]">Sales rep · Young10</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#384BFE]/8 px-3 py-1 text-[11px] font-medium text-[#2B3AD1]">
                  Hot lead
                </span>
                <span className="rounded-full bg-black/4 px-3 py-1 text-[11px] font-medium text-[#10111A]/60">
                  Follow-up Fri
                </span>
              </div>

              <h3 className="mt-5 text-[21px] font-medium leading-snug tracking-tight text-[#10111A] lg:text-[23px]">
                Your customer relationships, organised.
              </h3>
              <p className="mt-3 max-w-[340px] text-[13px] leading-relaxed text-[#777984]">
                Rich contact profiles keep notes, history and next steps together — the whole
                team always sees the latest state of a relationship.
              </p>

              <a
                href="#how-it-works"
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-[12px] font-medium text-[#10111A] transition-all duration-200 hover:-translate-y-px hover:border-[#384BFE]/30 hover:text-[#2B3AD1]"
              >
                <CircleDot className="size-3.5 text-[#384BFE]" aria-hidden />
                See how it works
              </a>
            </div>
          </div>
        </Reveal>

        {/* RIGHT — dark value card */}
        <Reveal className="h-full" delay={0.08}>
          <div className="relative flex h-full flex-col overflow-hidden rounded-[28px] bg-[#0C0D1C] p-7 lg:p-8">
            <div
              className="pointer-events-none absolute -right-14 -top-20 size-64 rounded-full bg-[#384BFE]/22 blur-3xl"
              aria-hidden
            />

            <h3 className="relative z-10 text-[22px] font-medium leading-snug tracking-tight text-white lg:text-2xl">
              Keep every lead in view.
            </h3>
            <p className="relative z-10 mt-3 max-w-[300px] text-[13px] leading-relaxed text-white/55">
              Every contact, deal and follow-up lives in one shared workspace — so nothing
              slips through the cracks.
            </p>

            <div className="relative z-10 mt-6 flex items-center gap-3">
              <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/45">
                  Pipeline today
                </p>
                <p className="mt-1 text-xl font-semibold text-white">
                  <CountUp to={12} /> <span className="text-[12px] font-medium text-white/55">deals</span>
                </p>
              </div>
              <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/45">
                  Tasks due
                </p>
                <p className="mt-1 text-xl font-semibold text-white">
                  <CountUp to={3} duration={1.1} delay={0.35} />{' '}
                  <span className="text-[12px] font-medium text-white/55">today</span>
                </p>
              </div>
            </div>

            <div className="relative z-10 mt-auto pt-7">
              <button
                type="button"
                onClick={onOpenCrm}
                className="group inline-flex items-center gap-2 rounded-full bg-[#384BFE] px-5 py-2.5 text-[13px] font-medium text-white shadow-[0_12px_24px_-10px_rgba(56,75,254,0.6)] transition-all duration-200 hover:-translate-y-px hover:bg-[#2B3AD1]"
              >
                Open CRM
                <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
              </button>
              <p className="mt-3 text-[11px] text-white/35">Demo data · sample workspace</p>
            </div>

            {/* soft entrance for stats */}
            <motion.span
              className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#384BFE]/50 to-transparent"
              initial={reduced ? undefined : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.4, ease: EASE }}
              aria-hidden
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
