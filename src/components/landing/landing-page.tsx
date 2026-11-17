// Young10 Marketing — landing page composition.
// Cinematic full-bleed video hero, pale body sheet rising over it with a
// rounded top edge, dark premium footer bookend. Brand blue #384BFE.

'use client';

import './landing.css';

import { LandingHeader } from '@/components/landing/landing-header';
import { HeroSection } from '@/components/landing/hero-section';
import { SummaryCards } from '@/components/landing/summary-cards';
import { FeatureBento } from '@/components/landing/feature-bento';
import { NextStepsSection } from '@/components/landing/next-steps';
import { LandingFooter } from '@/components/landing/landing-footer';

export default function LandingPage({ onOpenCrm }: { onOpenCrm: () => void }) {
  return (
    <div className="y10-landing relative flex min-h-screen flex-col overflow-x-clip bg-[#F3F4F7]">
      {/* fixed glass navbar — transparent over the video, frosted when scrolled */}
      <LandingHeader onOpenCrm={onOpenCrm} />

      {/* full-bleed cinematic hero */}
      <HeroSection onOpenCrm={onOpenCrm} />

      {/* pale sheet rising over the hero with a rounded top edge */}
      <main className="relative z-20 -mt-9 flex-1 rounded-t-[44px] bg-[#F3F4F7] shadow-[0_-30px_70px_-24px_rgba(5,7,20,0.6)]">
        <div className="y10-glow-mid pointer-events-none absolute inset-x-0 bottom-0 h-[820px]" aria-hidden />
        <div className="relative">
          <SummaryCards />
          <FeatureBento onOpenCrm={onOpenCrm} />
          <NextStepsSection />
        </div>
      </main>

      <div className="relative z-10">
        <LandingFooter />
      </div>
    </div>
  );
}
