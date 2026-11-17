// Hero — full-bleed cinematic real-footage video background (business team
// silhouetted against highrise windows), layered graded overlays, centred
// editorial typography, glass CTAs and a scroll cue. The agency-standard
// premium landing pattern used by top marketing sites.

'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Check, Sparkles } from 'lucide-react';

const EASE = [0.22, 1, 0.36, 1] as const;

const TRUST_POINTS = ['Free demo workspace', 'No credit card required', 'Set up in minutes'];

export function HeroSection({ onOpenCrm }: { onOpenCrm: () => void }) {
  const reduced = useReducedMotion() ?? false;

  const lineVariants = {
    hidden: { y: '112%' },
    shown: (delay: number) => ({
      y: '0%',
      transition: { duration: 0.95, delay, ease: EASE },
    }),
  };

  const revealLine = (delay: number, content: React.ReactNode) => (
    <span className="block overflow-hidden pb-[0.09em]">
      <motion.span
        className="block will-change-transform"
        custom={delay}
        variants={lineVariants}
        initial={reduced ? undefined : 'hidden'}
        animate="shown"
      >
        {content}
      </motion.span>
    </span>
  );

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col overflow-hidden bg-[#0A0B18] text-white"
      aria-labelledby="hero-heading"
    >
      {/* ---- video backdrop ---- */}
      <div className="absolute inset-0" aria-hidden>
        <video
          className="size-full object-cover"
          autoPlay={reduced ? undefined : true}
          muted
          loop
          playsInline
          preload={reduced ? 'none' : 'metadata'}
          poster="/media/y10-hero-poster.jpg"
          disablePictureInPicture
        >
          <source src="/media/y10-hero-bg.mp4" type="video/mp4" />
        </video>

        {/* graded overlays — cinema colour treatment */}
        <div className="absolute inset-0 bg-[#0A0B18]/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0B18]/75 via-[#0A0B18]/10 to-[#0A0B18]/88" />
        <div className="y10-hero-vignette absolute inset-0" />
        <div className="y10-hero-blueglow absolute inset-0" />
        <div className="y10-hero-breath absolute inset-0" />
      </div>

      {/* ---- centred content ---- */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1080px] flex-1 flex-col items-center justify-center px-5 pb-44 pt-36 text-center sm:px-8">
        {/* eyebrow badge */}
        <motion.div
          initial={reduced ? undefined : { opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
        >
          <span className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.08] py-1.5 pl-3 pr-4 text-[12px] font-medium tracking-wide text-white/80 backdrop-blur-xl">
            <span className="relative flex size-2" aria-hidden>
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#8FA0FF] opacity-70" />
              <span className="relative inline-flex size-2 rounded-full bg-[#8FA0FF]" />
            </span>
            Young10 Marketing — CRM &amp; sales platform
          </span>
        </motion.div>

        {/* headline */}
        <h1
          id="hero-heading"
          className="mt-7 text-[clamp(2.7rem,6.4vw,4.9rem)] font-medium leading-[1.05] tracking-[-0.032em]"
        >
          {revealLine(
            0.4,
            <>Grow your business</>,
          )}
          {revealLine(
            0.54,
            <>
              with a{' '}
              <span className="relative inline-block">
                <em className="font-[family-name:var(--font-y10-serif)] font-normal italic text-[#9DABFF]">
                  smarter
                </em>
                <motion.span
                  className="absolute -bottom-[0.05em] left-0 h-[3px] w-full origin-left rounded-full bg-gradient-to-r from-[#384BFE] to-[#8FA0FF]"
                  initial={reduced ? undefined : { scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.7, delay: 1.35, ease: EASE }}
                  aria-hidden
                />
              </span>
            </>,
          )}
          {revealLine(0.68, <>CRM.</>)}
        </h1>

        {/* subcopy */}
        <motion.p
          initial={reduced ? undefined : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.95, ease: EASE }}
          className="mt-6 max-w-[540px] text-[15.5px] leading-relaxed text-white/65 sm:text-[16.5px]"
        >
          Contacts, pipeline, follow-ups and live reports — one beautifully
          organised workspace that keeps every deal moving forward.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={reduced ? undefined : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1, ease: EASE }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3.5"
        >
          <button
            type="button"
            onClick={onOpenCrm}
            className="group inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-[14.5px] font-semibold text-[#0B0C1A] shadow-[0_18px_44px_-12px_rgba(255,255,255,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_54px_-12px_rgba(255,255,255,0.5)]"
          >
            Open the CRM
            <span className="grid size-5.5 place-items-center rounded-full bg-[#384BFE] text-white transition-transform duration-200 group-hover:translate-x-0.5">
              <ArrowRight className="size-3" aria-hidden />
            </span>
          </button>
          <a
            href="#features"
            className="inline-flex items-center gap-2 rounded-full border border-white/22 bg-white/[0.08] px-6 py-3.5 text-[14.5px] font-medium text-white backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/[0.14]"
          >
            <Sparkles className="size-4 text-[#9DABFF]" aria-hidden />
            Explore features
          </a>
        </motion.div>

        {/* trust points */}
        <motion.ul
          initial={reduced ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 1.4, ease: EASE }}
          className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] font-medium text-white/50"
        >
          {TRUST_POINTS.map((point) => (
            <li key={point} className="inline-flex items-center gap-1.5">
              <span className="grid size-4 place-items-center rounded-full bg-[#384BFE]/35 text-[#C7D0FF]" aria-hidden>
                <Check className="size-2.5" />
              </span>
              {point}
            </li>
          ))}
        </motion.ul>
      </div>

      {/* ---- scroll cue ---- */}
      <motion.div
        initial={reduced ? undefined : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.8, ease: EASE }}
        className="absolute inset-x-0 bottom-[74px] z-10 flex flex-col items-center gap-2.5"
        aria-hidden
      >
        <span className="flex h-9 w-[22px] items-start justify-center rounded-full border border-white/30 p-1.5">
          <span className="y10-scroll-dot size-1.5 rounded-full bg-white/80" />
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/45">
          Scroll to explore
        </span>
      </motion.div>
    </section>
  );
}
