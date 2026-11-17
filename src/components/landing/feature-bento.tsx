// Middle bento section — three-part asymmetric grid:
// narrow dark card (CTA), wide pale card (Sarah Mitchell contact-profile
// visual with portrait photo + copy), compact UI stack (interface previews).
// Fully animated: staggered reveals, popping chips, growing lines, count-up.

'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Bell, CircleDot, Plus } from 'lucide-react';

import { LogoMark } from '@/components/brand/logo';
import { CountUp } from '@/components/landing/count-up';
import { Reveal } from '@/components/landing/reveal';

const EASE = [0.22, 1, 0.36, 1] as const;

function InitialsAvatar({ initials, className }: { initials: string; className?: string }) {
  return (
    <span
      className={`grid place-items-center rounded-full bg-gradient-to-br from-[#384BFE] to-[#6E82FF] text-[13px] font-semibold text-white ${className ?? ''}`}
    >
      {initials}
    </span>
  );
}

/** Pop-in chip (spring) used across the section. */
function Pop({
  children,
  delay,
  className,
}: {
  children: React.ReactNode;
  delay: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.span
      className={className}
      initial={reduced ? undefined : { opacity: 0, scale: 0.4, y: 8 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ type: 'spring', stiffness: 320, damping: 20, delay }}
    >
      {children}
    </motion.span>
  );
}

/** Skeleton line that draws itself from the left when in view. */
function GrowingLine({ width, delay, tone }: { width: string; delay: number; tone: string }) {
  const reduced = useReducedMotion();
  return (
    <div className="h-1.5 w-full rounded-full bg-black/5" aria-hidden>
      <motion.div
        className={`h-full origin-left rounded-full ${tone}`}
        style={{ width }}
        initial={reduced ? undefined : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.8, delay, ease: EASE }}
      />
    </div>
  );
}

export function FeatureBento({ onOpenCrm }: { onOpenCrm: () => void }) {
  return (
    <section aria-label="CRM highlights" className="px-4 pt-12 sm:px-6 lg:px-8 lg:pt-16">
      <div className="grid gap-4 lg:min-h-[420px] lg:grid-cols-[0.82fr_1.62fr_1.05fr] lg:gap-5">
        {/* LEFT — narrow dark card */}
        <Reveal className="h-full">
          <div className="relative flex h-full flex-col overflow-visible rounded-[30px] bg-[#0C0D1C] p-7 lg:p-8">
            <span className="y10-glass-ornament grid size-11 place-items-center rounded-2xl">
              <LogoMark size={24} />
            </span>

            <h3 className="mt-7 text-[22px] font-medium leading-snug tracking-tight text-white lg:text-2xl">
              Keep every lead in view.
            </h3>
            <p className="mt-3 max-w-[240px] text-[13px] leading-relaxed text-white/55">
              Every contact, deal and follow-up lives in one shared workspace — so nothing
              slips through the cracks.
            </p>

            <div className="mt-auto pt-8">
              <button
                type="button"
                onClick={onOpenCrm}
                className="group inline-flex items-center gap-2 rounded-full bg-[#384BFE] px-5 py-2.5 text-[13px] font-medium text-white shadow-[0_12px_24px_-10px_rgba(56,75,254,0.6)] transition-all duration-200 hover:-translate-y-px hover:bg-[#2B3AD1]"
              >
                Open CRM
                <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
              </button>
            </div>

            {/* transparent glass pebble overlapping the lower edge */}
            <div
              className="y10-glass-pebble pointer-events-none absolute -bottom-7 left-9 h-16 w-28 rounded-[50%]"
              aria-hidden
            />
          </div>
        </Reveal>

        {/* CENTRE — wide pale card with Sarah Mitchell profile visual */}
        <Reveal className="h-full" delay={0.06}>
          <div className="flex h-full flex-col rounded-[30px] border border-black/4 bg-gradient-to-br from-[#ECEEF3] to-[#F2F3F8] p-6 sm:flex-row sm:items-center lg:gap-8 lg:p-8">
            {/* contact-profile visual — Sarah Mitchell portrait */}
            <div className="group relative mx-auto aspect-[3/4] w-full max-w-[240px] shrink-0 overflow-hidden rounded-[26px] bg-[#D7DBEF] sm:mx-0">
              <Image
                src="/team/sarah-mitchell.png"
                alt="Sarah Mitchell, sales representative at Young10 Marketing"
                width={864}
                height={1152}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]"
              />
              {/* legibility gradient */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#10111A]/55 via-[#10111A]/10 to-transparent" aria-hidden />

              <div className="absolute inset-x-0 bottom-0 p-4">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.6, delay: 0.35, ease: EASE }}
                  className="rounded-2xl border border-white/50 bg-white/75 p-3.5 shadow-[0_14px_30px_-14px_rgba(10,11,26,0.5)] backdrop-blur-md"
                >
                  <div className="flex items-center gap-3">
                    <span className="relative shrink-0">
                      <Image
                        src="/team/sarah-mitchell.png"
                        alt=""
                        aria-hidden
                        width={80}
                        height={80}
                        className="size-10 rounded-full object-cover object-top ring-2 ring-white"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-[#16A34A] ring-2 ring-white" aria-hidden />
                    </span>
                    <div>
                      <p className="text-[13px] font-semibold text-[#10111A]">Sarah Mitchell</p>
                      <p className="text-[11px] text-[#777984]">Sales rep · Young10</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5">
                    <Pop delay={0.55}>
                      <span className="inline-block rounded-full bg-[#384BFE]/12 px-2 py-0.5 text-[10px] font-medium text-[#2B3AD1]">
                        Hot lead
                      </span>
                    </Pop>
                    <Pop delay={0.68}>
                      <span className="inline-block rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-medium text-[#10111A]/60">
                        Follow-up Fri
                      </span>
                    </Pop>
                  </div>
                </motion.div>
              </div>
            </div>

            <div className="mt-6 sm:mt-0 sm:flex-1 lg:pl-2">
              <h3 className="text-[21px] font-medium leading-snug tracking-tight text-[#10111A] lg:text-[23px]">
                Your customer relationships, organised.
              </h3>
              <p className="mt-3 max-w-[300px] text-[13px] leading-relaxed text-[#777984]">
                Rich contact profiles keep notes, history and next steps together — the whole
                team always sees the latest state of a relationship.
              </p>
              <a
                href="#how-it-works"
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-[12px] font-medium text-[#10111A] transition-all duration-200 hover:-translate-y-px hover:bg-white"
              >
                <CircleDot className="size-3.5 text-[#384BFE]" aria-hidden />
                See how it works
              </a>
            </div>
          </div>
        </Reveal>

        {/* RIGHT — compact UI stack */}
        <Reveal className="h-full" delay={0.12}>
          <div className="flex h-full flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              {/* dark mini card */}
              <div className="rounded-[24px] bg-[#0C0D1C] p-4 transition-transform duration-200 hover:-translate-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="grid size-7 place-items-center rounded-full bg-white/10">
                    <Bell className="size-3.5 text-[#A9B5FF]" aria-hidden />
                  </span>
                  <motion.span
                    className="size-1.5 rounded-full bg-[#5F72FF]"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.55, 1] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                    aria-hidden
                  />
                </div>
                <p className="mt-3 text-[12px] font-semibold leading-snug text-white">
                  New lead assigned
                </p>
                <p className="mt-1.5 text-[10px] leading-relaxed text-white/45">
                  Mike joined the deal today
                </p>
              </div>

              {/* blue mini card */}
              <div className="rounded-[24px] bg-gradient-to-br from-[#384BFE] to-[#5F72FF] p-4 shadow-[0_14px_28px_-14px_rgba(56,75,254,0.65)] transition-transform duration-200 hover:-translate-y-0.5">
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/70">
                  Pipeline today
                </p>
                <p className="mt-2 text-xl font-semibold text-white">
                  <CountUp to={12} /> deals
                </p>
                <p className="mt-1 text-[10px] text-white/65">Demo data · this quarter</p>
              </div>
            </div>

            {/* contact profile panel */}
            <div className="flex-1 rounded-[24px] border border-black/5 bg-white p-4 transition-transform duration-200 hover:-translate-y-0.5">
              <div className="flex items-center gap-3">
                <InitialsAvatar initials="AC" className="size-11" />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-[#10111A]">Alex Carter</p>
                  <p className="text-[11px] text-[#777984]">Administrator</p>
                </div>
                <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-[#16A34A]/10 px-2.5 py-1 text-[10px] font-medium text-[#16A34A]">
                  <span className="size-1.5 animate-pulse rounded-full bg-[#16A34A]" aria-hidden />
                  Online
                </span>
              </div>
              <div className="mt-4 space-y-2" aria-hidden>
                <GrowingLine width="100%" delay={0.15} tone="bg-black/8" />
                <GrowingLine width="80%" delay={0.28} tone="bg-black/8" />
                <GrowingLine width="60%" delay={0.41} tone="bg-[#384BFE]/35" />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-black/8 px-2.5 py-1 text-[10px] font-medium text-[#10111A]/65 transition-colors hover:bg-black/4">
                  <Plus className="size-3 text-[#384BFE]" aria-hidden />
                  Add note
                </span>
                <span className="rounded-full bg-black/4 px-2.5 py-1 text-[10px] font-medium text-[#10111A]/50">
                  3 tasks due
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
