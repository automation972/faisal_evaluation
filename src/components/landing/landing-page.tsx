// Young10 Marketing — landing page (light theme, matches young10marketing.com)
// Real brand: logo, copy, contact info from young10marketing.com.
// Product showcase: the Y10 CRM platform (leads → pipeline → close).

'use client';

import { useState, type CSSProperties, type MouseEvent } from 'react';
import { Menu as MenuIcon, Sparkles, X } from 'lucide-react';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

import {
  AwardsSection,
  FinalCta,
  GrowthSection,
  LandingFooter,
  Rise,
  ServicesSection,
  Y10Button,
} from '@/components/landing/landing-sections';

/** Shiny gradient sweep applied to the headline word (light brand-blue stops). */
const SHINY_GRADIENT: CSSProperties = {
  backgroundImage:
    'linear-gradient(to right, #0F0D1D 0%, #131C5A 12.5%, #384BFE 32.5%, #6E85FF 50%, #131C5A 67.5%, #0F0D1D 87.5%, #0F0D1D 100%)',
  backgroundSize: '200% auto',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  WebkitTextFillColor: 'transparent',
};

const NAV_LINKS = [
  { label: 'Services', href: '#services' },
  { label: 'Growth', href: '#growth' },
  { label: 'Awards', href: '#awards' },
] as const;

/* ---------------------------------------------------------------------------
   Navbar — frosted sticky bar, exact 3-zone grid, professional logo size
   -------------------------------------------------------------------------- */

function Navbar({ onSignIn }: { onSignIn: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="y10-nav-surface sticky top-0 z-40"
    >
      <nav
        className="mx-auto grid max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-4 px-6 py-3 md:py-4"
        aria-label="Main"
      >
        <a href="#" className="flex items-center" aria-label="Young10 Marketing home">
          <img
            src="/brand/logo.png"
            alt="Young10 Marketing"
            className="h-11 w-auto transition-transform duration-300 hover:scale-[1.03] md:h-12"
            width={134}
            height={48}
          />
        </a>

        <div className="hidden justify-center md:flex">
          <div className="flex items-center gap-9">
            {NAV_LINKS.map((link, i) => (
              <motion.a
                key={link.label}
                href={link.href}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.05 }}
                className="group relative py-1 text-sm font-medium text-[#0F0D1D]/70 transition-colors hover:text-[#384BFE]"
              >
                {link.label}
                <span
                  className="absolute inset-x-0 -bottom-0.5 h-0.5 origin-center scale-x-0 rounded-full bg-[#384BFE] transition-transform duration-300 group-hover:scale-x-100"
                  aria-hidden="true"
                />
              </motion.a>
            ))}
          </div>
        </div>

        <div className="hidden items-center justify-end gap-2.5 md:flex">
          <button
            type="button"
            onClick={onSignIn}
            className="rounded-full px-4 py-2.5 text-sm font-medium text-[#0F0D1D]/70 transition-colors hover:bg-[#384BFE]/[0.07] hover:text-[#384BFE]"
          >
            Sign In
          </button>
          <Y10Button label="Get Started" onClick={onSignIn} className="!py-2.5" />
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="flex h-11 w-11 items-center justify-center justify-self-end rounded-full border border-[#0F0D1D]/10 bg-white text-[#0F0D1D] shadow-[0_1px_2px_rgba(16,18,35,0.06)] md:hidden"
        >
          {open ? <X className="h-5 w-5" aria-hidden="true" /> : <MenuIcon className="h-5 w-5" aria-hidden="true" />}
        </button>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="overflow-hidden border-b border-[#0F0D1D]/10 bg-white/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 pb-5">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm font-medium text-[#0F0D1D]/75 transition-colors hover:bg-[#F5F6FB] hover:text-[#384BFE]"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onSignIn();
                  }}
                  className="flex-1 rounded-full border border-[#0F0D1D]/15 px-4 py-3 text-sm font-medium text-[#0F0D1D]"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onSignIn();
                  }}
                  className="flex-1 rounded-full bg-[#384BFE] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(56,75,254,0.65)]"
                >
                  Get Started
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}

/* ---------------------------------------------------------------------------
   Hero — shiny gradient headline + mouse-parallax glow orbs on light canvas
   -------------------------------------------------------------------------- */

function Hero({ onSignIn }: { onSignIn: () => void }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 20 });
  const sy = useSpring(my, { stiffness: 50, damping: 20 });
  const orb1x = useTransform(sx, (v) => v * 40);
  const orb1y = useTransform(sy, (v) => v * 30);
  const orb2x = useTransform(sx, (v) => v * -55);
  const orb2y = useTransform(sy, (v) => v * -35);

  function handleMove(event: MouseEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    mx.set((event.clientX - rect.left) / rect.width - 0.5);
    my.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  return (
    <section
      onMouseMove={handleMove}
      className="relative z-10 flex flex-col items-center pb-16 pt-16 text-center md:pb-24 md:pt-24"
    >
      {/* Parallax glow orbs (kept — light palette) */}
      <motion.div
        aria-hidden="true"
        style={{ x: orb1x, y: orb1y }}
        className="pointer-events-none absolute left-[6%] top-[10%] h-72 w-72 rounded-full bg-[#384BFE]/[0.16] blur-[120px]"
      />
      <motion.div
        aria-hidden="true"
        style={{ x: orb2x, y: orb2y }}
        className="pointer-events-none absolute right-[4%] top-[42%] h-80 w-80 rounded-full bg-[#7C3AED]/[0.12] blur-[130px]"
      />
      <motion.div
        aria-hidden="true"
        className="animate-float-slow pointer-events-none absolute left-[16%] top-[58%] hidden h-40 w-40 rounded-full bg-[#384BFE]/10 blur-[80px] lg:block"
      />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
        className="relative flex items-center gap-2.5 rounded-full border border-[#0F0D1D]/10 bg-white px-4 py-2 shadow-[0_2px_10px_rgba(16,18,35,0.06)]"
      >
        <Sparkles className="h-3.5 w-3.5 text-[#384BFE]" aria-hidden="true" />
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0F0D1D]/70">
          Digital Marketing Agency
        </p>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="mt-7 text-5xl font-semibold leading-[0.95] tracking-tight text-[#0F0D1D] md:text-7xl"
      >
        Your growth.
        <br />
        <span className="animate-shiny" style={SHINY_GRADIENT}>
          Amplified.
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5, ease: 'easeOut' }}
        className="mt-7 max-w-xl text-base leading-[1.7] text-[#5f6274] md:text-lg"
      >
        At Young10 Marketing, we provide expert digital marketing services in Sheridan, Wyoming designed
        to fuel growth and drive results — and a CRM that keeps every opportunity moving.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.7, ease: 'easeOut' }}
        className="relative mt-9 flex flex-col items-center gap-3"
      >
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Y10Button label="Get Started Free" onClick={onSignIn} className="px-6" />
          <a
            href="#services"
            className="inline-flex items-center gap-2 rounded-full border border-[#0F0D1D]/12 bg-white px-6 py-3 text-sm font-medium text-[#0F0D1D] shadow-[0_2px_10px_rgba(16,18,35,0.06)] transition-all hover:-translate-y-0.5 hover:border-[#384BFE]/40 hover:text-[#384BFE]"
          >
            Explore Services
          </a>
        </div>
        <p className="text-xs text-[#7A7A7A]">Free CRM included · No credit card required</p>
      </motion.div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Stats band — proof strip under the hero (white card, brand numbers)
   -------------------------------------------------------------------------- */

const STATS = [
  { value: '38', suffix: '', label: 'Keywords on page one' },
  { value: '4.2', suffix: 'x', label: 'Average paid ROAS' },
  { value: '126', suffix: '', label: 'Leads captured monthly' },
  { value: '96', suffix: '%', label: 'Client retention rate' },
] as const;

function StatsBand() {
  return (
    <Rise distance={24} className="relative z-10 mx-auto max-w-6xl px-6">
      <div
        className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[#0F0D1D]/[0.07] bg-[#0F0D1D]/[0.06] shadow-[0_24px_60px_-30px_rgba(31,34,78,0.25)] md:grid-cols-4"
        aria-label="Agency results at a glance"
      >
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-white px-6 py-7 text-center transition-colors hover:bg-[#F8F9FE]">
            <p className="text-3xl font-semibold tracking-tight text-[#384BFE] md:text-4xl">
              {stat.value}
              <span className="text-2xl md:text-3xl">{stat.suffix}</span>
            </p>
            <p className="mt-2 text-xs font-medium text-[#5f6274] md:text-sm">{stat.label}</p>
          </div>
        ))}
      </div>
    </Rise>
  );
}

/* ---------------------------------------------------------------------------
   Landing root
   -------------------------------------------------------------------------- */

export function LandingPage({ onSignIn }: { onSignIn: () => void }) {
  return (
    <div className="y10-landing relative flex min-h-screen flex-col overflow-x-hidden text-[#0F0D1D]">
      {/* Fullscreen looping background video (kept) — veiled for the light theme */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="pointer-events-none h-full w-full object-cover"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_064122_c4750c0e-7476-4b44-94a2-a85a65c63bf2.mp4"
        />
        {/* Light veil: keeps the motion visible while the page stays bright */}
        <div className="absolute inset-0 bg-[#F5F6FB]/85" aria-hidden="true" />
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(80rem 42rem at 50% -8%, rgba(255,255,255,0.9), transparent 62%), linear-gradient(180deg, rgba(245,246,251,0.2) 0%, rgba(245,246,251,0.72) 46%, #F5F6FB 88%)',
          }}
        />
      </div>

      {/* Vertical guide lines at the container edges (desktop only) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-y-0 left-1/2 z-[5] hidden w-px -translate-x-[calc(50%+36rem)] bg-[#0F0D1D]/[0.06] md:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-y-0 left-1/2 z-[5] hidden w-px translate-x-[calc(-50%+36rem)] bg-[#0F0D1D]/[0.06] md:block"
      />

      <Navbar onSignIn={onSignIn} />
      <Hero onSignIn={onSignIn} />
      <StatsBand />
      <GrowthSection />
      <AwardsSection />
      <ServicesSection />
      <FinalCta />
      <LandingFooter />
    </div>
  );
}
