// Middle bento section — three-part asymmetric grid:
// narrow dark card (CTA), wide pale card (contact-profile visual + copy),
// compact UI stack (interface preview cards).

'use client';

import { ArrowRight, Bell, CircleDot, Plus } from 'lucide-react';

import { LogoMark } from '@/components/brand/logo';
import { Reveal } from '@/components/landing/reveal';

function InitialsAvatar({ initials, className }: { initials: string; className?: string }) {
  return (
    <span
      className={`grid place-items-center rounded-full bg-gradient-to-br from-[#7563F4] to-[#9A8CFF] text-[13px] font-semibold text-white ${className ?? ''}`}
    >
      {initials}
    </span>
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
                className="group inline-flex items-center gap-2 rounded-full bg-[#7563F4] px-5 py-2.5 text-[13px] font-medium text-white transition-colors duration-200 hover:bg-[#6352E0]"
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

        {/* CENTRE — wide pale card */}
        <Reveal className="h-full" delay={0.06}>
          <div className="flex h-full flex-col rounded-[30px] border border-black/4 bg-gradient-to-br from-[#ECEEF3] to-[#F2F3F8] p-6 sm:flex-row sm:items-center lg:gap-8 lg:p-8">
            {/* contact-profile visual (no licensed portrait — tasteful in-house visual) */}
            <div className="relative mx-auto aspect-[3/4] w-full max-w-[240px] shrink-0 overflow-hidden rounded-[26px] bg-gradient-to-b from-[#DDDEF3] via-[#D6D8F0] to-[#C9CBE9] sm:mx-0">
              <div className="absolute inset-0 y10-glow-mid opacity-70" aria-hidden />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="rounded-2xl border border-white/50 bg-white/70 p-3.5 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <InitialsAvatar initials="SM" className="size-10" />
                    <div>
                      <p className="text-[13px] font-semibold text-[#10111A]">Sarah Mitchell</p>
                      <p className="text-[11px] text-[#777984]">Sales rep · Young10</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5">
                    <span className="rounded-full bg-[#7563F4]/12 px-2 py-0.5 text-[10px] font-medium text-[#6352E0]">
                      Hot lead
                    </span>
                    <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-medium text-[#10111A]/60">
                      Follow-up Fri
                    </span>
                  </div>
                </div>
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
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-[12px] font-medium text-[#10111A] transition-colors hover:bg-white"
              >
                <CircleDot className="size-3.5 text-[#7563F4]" aria-hidden />
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
              <div className="rounded-[24px] bg-[#0C0D1C] p-4">
                <div className="flex items-center justify-between">
                  <span className="grid size-7 place-items-center rounded-full bg-white/10">
                    <Bell className="size-3.5 text-[#B9B0FF]" aria-hidden />
                  </span>
                  <span className="size-1.5 rounded-full bg-[#7563F4]" aria-hidden />
                </div>
                <p className="mt-3 text-[12px] font-semibold leading-snug text-white">
                  New lead assigned
                </p>
                <p className="mt-1.5 text-[10px] leading-relaxed text-white/45">
                  Mike joined the deal today
                </p>
              </div>
              {/* violet mini card */}
              <div className="rounded-[24px] bg-gradient-to-br from-[#7563F4] to-[#9A8CFF] p-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/70">
                  Pipeline today
                </p>
                <p className="mt-2 text-xl font-semibold text-white">12 deals</p>
                <p className="mt-1 text-[10px] text-white/65">Demo data · this quarter</p>
              </div>
            </div>

            {/* contact profile panel */}
            <div className="flex-1 rounded-[24px] border border-black/5 bg-white p-4">
              <div className="flex items-center gap-3">
                <InitialsAvatar initials="AC" className="size-11" />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-[#10111A]">Alex Carter</p>
                  <p className="text-[11px] text-[#777984]">Administrator</p>
                </div>
                <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-[#16A34A]/10 px-2.5 py-1 text-[10px] font-medium text-[#16A34A]">
                  <span className="size-1.5 rounded-full bg-[#16A34A]" aria-hidden />
                  Online
                </span>
              </div>
              <div className="mt-4 space-y-2" aria-hidden>
                <div className="h-1.5 w-full rounded-full bg-black/5" />
                <div className="h-1.5 w-4/5 rounded-full bg-black/5" />
                <div className="h-1.5 w-3/5 rounded-full bg-[#7563F4]/25" />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-black/8 px-2.5 py-1 text-[10px] font-medium text-[#10111A]/65">
                  <Plus className="size-3 text-[#7563F4]" aria-hidden />
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
