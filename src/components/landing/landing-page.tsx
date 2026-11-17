// Young10 Marketing — landing page composition.
// Dark charcoal frame, large pale surface with rounded corners: animated hero
// with the giant glittering Young10 wordmark, capability cards, bento,
// analytics and footer. Brand-blue accent system (#384BFE).

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
    <div className="y10-landing relative flex min-h-screen flex-col overflow-hidden bg-[#F3F4F7]">
      {/* atmospheric gradients */}
      <div className="y10-glow-hero pointer-events-none absolute inset-x-0 top-0 h-[900px]" aria-hidden />
      <div className="y10-glow-mid pointer-events-none absolute inset-x-0 bottom-0 h-[820px]" aria-hidden />

      <LandingHeader onOpenCrm={onOpenCrm} />

      <main className="relative z-10 flex-1 pb-6 pt-4 sm:pt-6">
        <HeroSection onOpenCrm={onOpenCrm} />
        <SummaryCards />
        <FeatureBento onOpenCrm={onOpenCrm} />
        <NextStepsSection />
      </main>

      <div className="relative z-10">
        <LandingFooter />
      </div>
    </div>
  );
}
