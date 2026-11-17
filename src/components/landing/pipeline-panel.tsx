// Dark horizontal panel under the hero — the glass platform overlaps its top edge.
// Left portion holds a compact "Pipeline overview" CRM preview (demo data).

'use client';

import { Plus } from 'lucide-react';

import { LogoMark } from '@/components/brand/logo';
import { cn } from '@/lib/utils';

const STAGES = [
  { name: 'Discovery', count: 3, width: '42%' },
  { name: 'Proposal', count: 4, width: '58%' },
  { name: 'Negotiation', count: 2, width: '30%' },
];

export function PipelinePanel({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[32px] bg-[#0C0D1C] lg:rounded-[44px]',
        className,
      )}
    >
      {/* fine orbit curves */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 1000 340"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <ellipse cx="770" cy="170" rx="320" ry="158" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        <ellipse cx="840" cy="190" rx="250" ry="112" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <ellipse
          className="y10-orbit-dash"
          cx="790" cy="180" rx="352" ry="176"
          stroke="rgba(140,124,255,0.38)"
          strokeWidth="1.2"
        />
        <circle cx="508" cy="58" r="3" fill="rgba(255,255,255,0.28)" />
        <circle cx="646" cy="284" r="2.4" fill="rgba(140,124,255,0.5)" />
      </svg>

      {/* compact CRM preview — left portion */}
      <div className="relative z-10 max-w-[600px] px-6 py-7 sm:px-8 lg:px-10 lg:py-9">
        <div className="flex items-center gap-3">
          <LogoMark size={26} />
          <span className="text-sm font-semibold tracking-tight text-white">Young10 CRM</span>
          <span className="rounded-full border border-white/15 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-white/45">
            Demo data
          </span>
        </div>

        <div className="mt-6 max-w-[420px] rounded-[22px] bg-gradient-to-br from-[#6C5CF0] via-[#7563F4] to-[#8A7CFF] p-5 shadow-[0_22px_44px_-18px_rgba(108,92,240,0.7)]">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold text-white">Pipeline overview</p>
            <span className="grid size-6 place-items-center rounded-full bg-white/15" aria-hidden>
              <Plus className="size-3.5 text-white/85" />
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {STAGES.map((stage) => (
              <div key={stage.name} className="flex items-center gap-3">
                <span className="w-[86px] shrink-0 text-[11px] font-medium text-white/80">{stage.name}</span>
                <span className="relative h-[7px] flex-1 overflow-hidden rounded-full bg-white/18">
                  <span className="absolute inset-y-0 left-0 rounded-full bg-white/85" style={{ width: stage.width }} />
                </span>
                <span className="w-4 text-right text-[11px] font-semibold text-white">{stage.count}</span>
              </div>
            ))}
          </div>

          <p className="mt-4 text-[11px] font-medium text-white/65">9 open deals · Sample workspace data</p>
        </div>

        {/* tiny decorative controls */}
        <div className="mt-5 flex items-center gap-1.5" aria-hidden>
          <span className="size-1.5 rounded-full bg-white/20" />
          <span className="size-1.5 rounded-full bg-white/35" />
          <span className="size-1.5 rounded-full bg-white/20" />
          <span className="ml-3 rounded-full border border-white/12 px-2.5 py-1 text-[10px] font-medium text-white/40">
            This quarter
          </span>
        </div>
      </div>

      {/* soft ground shadow where the glass platform meets the panel */}
      <div
        className="y10-ground-shadow pointer-events-none absolute -top-9 right-[4%] hidden h-16 w-[460px] lg:block"
        aria-hidden
      />
    </div>
  );
}
