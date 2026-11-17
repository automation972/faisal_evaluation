// Hero — animated masked headline left, giant glittering Young10 Marketing
// wordmark right. The former 3D artwork and dark pipeline panel are gone.

'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Search } from 'lucide-react';

import { HeroLogo } from '@/components/landing/hero-logo';

const LINE_EASE = [0.22, 1, 0.36, 1] as const;

export function HeroSection({ onOpenCrm }: { onOpenCrm: () => void }) {
  const reducedMotion = useReducedMotion() ?? false;

  const lineVariants = {
    hidden: { y: '112%' },
    shown: (delay: number) => ({
      y: '0%',
      transition: { duration: 0.9, delay, ease: LINE_EASE },
    }),
  };

  const revealLine = (delay: number, content: React.ReactNode) => (
    <span className="block overflow-hidden pb-[0.08em]">
      <motion.span
        className="block will-change-transform"
        custom={delay}
        variants={lineVariants}
        initial={reducedMotion ? undefined : 'hidden'}
        animate="shown"
      >
        {content}
      </motion.span>
    </span>
  );

  return (
    <section className="relative" aria-labelledby="hero-heading">
      <div className="mx-auto grid w-full max-w-[1380px] items-center gap-12 px-5 pb-14 pt-8 sm:px-8 lg:min-h-[600px] lg:grid-cols-[1.04fr_0.96fr] lg:gap-6 lg:px-12 lg:pb-20 lg:pt-10">
        {/* left copy */}
        <div className="max-w-[640px]">
          <h1
            id="hero-heading"
            className="text-[clamp(2.6rem,4.8vw,4.3rem)] font-medium leading-[1.06] tracking-[-0.035em] text-[#10111A]"
          >
            {revealLine(
              0.05,
              <>
                Grow your business
                <br className="hidden sm:block" />
              </>,
            )}
            {revealLine(
              0.18,
              <>
                with a{' '}
                <span className="relative inline-block">
                  <em className="font-[family-name:var(--font-y10-serif)] font-normal italic text-[#384BFE]">
                    smarter
                  </em>
                  <motion.span
                    className="absolute -bottom-[0.06em] left-0 h-[3px] w-full origin-left rounded-full bg-[#384BFE]/45"
                    initial={reducedMotion ? undefined : { scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.7, delay: 1.05, ease: LINE_EASE }}
                    aria-hidden
                  />
                </span>
                <br className="hidden sm:block" />
              </>,
            )}
            {revealLine(0.31, <>CRM.</>)}
          </h1>

          <motion.div
            initial={reducedMotion ? undefined : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55, ease: LINE_EASE }}
          >
            <p className="mt-6 max-w-[440px] text-[15px] leading-relaxed text-[#777984]">
              Bring your contacts, sales pipeline, and follow-ups into one organised
              workspace with Young10 Marketing.
            </p>
          </motion.div>

          <motion.div
            initial={reducedMotion ? undefined : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.68, ease: LINE_EASE }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <button
              type="button"
              onClick={onOpenCrm}
              className="group inline-flex items-center gap-2 rounded-full bg-[#384BFE] px-6 py-3 text-sm font-medium text-white shadow-[0_12px_26px_-10px_rgba(56,75,254,0.65)] transition-all duration-200 hover:-translate-y-px hover:bg-[#2B3AD1]"
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
          </motion.div>
        </div>

        {/* right — the Young10 Marketing wordmark, very large, glittering */}
        <div className="flex items-center justify-center lg:justify-end lg:pr-2">
          <HeroLogo />
        </div>
      </div>
    </section>
  );
}
