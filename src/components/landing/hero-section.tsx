// Hero — asymmetric composition: headline copy left, 3D glass scene right,
// dark pipeline panel below whose top edge is overlapped by the glass platform.

'use client';

import { ArrowRight, Search } from 'lucide-react';

import HeroScene from '@/components/landing/scene/hero-scene';
import { PipelinePanel } from '@/components/landing/pipeline-panel';
import { Reveal } from '@/components/landing/reveal';

export function HeroSection({ onOpenCrm }: { onOpenCrm: () => void }) {
  return (
    <section className="relative" aria-labelledby="hero-heading">
      {/* left copy */}
      <div className="relative z-20 px-5 pb-2 pt-10 sm:px-8 lg:px-12 lg:pb-8 lg:pt-14">
        <div className="max-w-[600px]">
          <Reveal>
            <h1
              id="hero-heading"
              className="text-[clamp(2.55rem,4.7vw,4.15rem)] font-medium leading-[1.05] tracking-[-0.035em] text-[#10111A]"
            >
              Grow your business{' '}
              <br className="hidden sm:block" />
              with a smarter{' '}
              <br className="hidden sm:block" />
              CRM.
            </h1>
          </Reveal>

          <Reveal delay={0.08}>
            <p className="mt-6 max-w-[430px] text-[15px] leading-relaxed text-[#777984]">
              Bring your contacts, sales pipeline, and follow-ups into one organised
              workspace with Young10 Marketing.
            </p>
          </Reveal>

          <Reveal delay={0.16}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onOpenCrm}
                className="group inline-flex items-center gap-2 rounded-full bg-[#7563F4] px-6 py-3 text-sm font-medium text-white shadow-[0_12px_26px_-10px_rgba(117,99,244,0.6)] transition-all duration-200 hover:-translate-y-px hover:bg-[#6352E0]"
              >
                Get Started
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
              </button>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/80 px-5 py-3 text-sm font-medium text-[#10111A] transition-all duration-200 hover:-translate-y-px hover:bg-white"
              >
                <Search className="size-4 text-[#777984]" aria-hidden />
                Explore Features
              </a>
            </div>
          </Reveal>
        </div>
      </div>

      {/* 3D scene — in flow on mobile (below copy), overlaying the right half on
          desktop where it extends downward across the dark panel's top edge. */}
      <div className="relative h-[400px] sm:h-[470px] lg:absolute lg:top-0 lg:right-0 lg:h-[780px] lg:w-[57%]">
        <HeroScene className="pointer-events-none absolute inset-x-0 top-0 h-full" />
      </div>

      {/* dark pipeline panel — the transparent canvas draws the platform over its top edge */}
      <div className="relative z-0 px-4 pb-2 sm:px-6 lg:px-8">
        <PipelinePanel className="mt-8 sm:mt-2 lg:mt-2" />
      </div>
    </section>
  );
}
