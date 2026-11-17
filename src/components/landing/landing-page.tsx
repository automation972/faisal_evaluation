// Young10 Marketing — landing page (cinematic dark, Aura-style)
// Real brand: logo, copy, contact info from young10marketing.com.
// Product showcase: the Y10 CRM platform (leads → pipeline → close).

'use client';

import { useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import {
  Archive,
  Forward,
  Menu as MenuIcon,
  MoreHorizontal,
  Paperclip,
  Reply,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion';

import {
  AwardsSection,
  FinalCta,
  GrowthSection,
  LandingFooter,
  ServicesSection,
  Y10Button,
  Y10Mark,
} from '@/components/landing/landing-sections';
import { PricingSection } from '@/components/landing/landing-pricing';

/** Shiny gradient sweep applied to the headline word (brand-blue stops). */
const SHINY_GRADIENT: CSSProperties = {
  backgroundImage:
    'linear-gradient(to right, #0c0c10 0%, #131C5A 12.5%, #B9C6FF 32.5%, #6E85FF 50%, #131C5A 67.5%, #0c0c10 87.5%, #0c0c10 100%)',
  backgroundSize: '200% auto',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  WebkitTextFillColor: 'transparent',
  filter: 'url(#c3-noise)',
};

const NAV_LINKS = [
  { label: 'Services', href: '#services' },
  { label: 'Growth', href: '#growth' },
  { label: 'Awards', href: '#awards' },
  { label: 'Pricing', href: '#pricing' },
] as const;

/* ---------------------------------------------------------------------------
   Navbar
   -------------------------------------------------------------------------- */

function Navbar({ onSignIn }: { onSignIn: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative z-20"
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5" aria-label="Main">
        <a href="#" className="flex items-center" aria-label="Young10 Marketing home">
          <img src="/brand/logo-white.png" alt="Young10 Marketing" className="h-8 w-auto" width={98} height={32} />
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link, i) => (
            <motion.a
              key={link.label}
              href={link.href}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.05 }}
              className="text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              {link.label}
            </motion.a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={onSignIn}
            className="rounded-full px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
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
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 md:hidden"
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
            className="overflow-hidden border-b border-white/10 bg-black/60 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 pb-5">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/75 transition-colors hover:bg-white/5 hover:text-white"
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
                  className="flex-1 rounded-full border border-white/15 px-4 py-2.5 text-sm font-medium text-white"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onSignIn();
                  }}
                  className="flex-1 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-black"
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
   Hero — shiny gradient headline + mouse-parallax glow orbs
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
      className="relative z-10 flex flex-col items-center pb-16 pt-14 text-center md:pb-20 md:pt-24"
    >
      {/* Parallax glow orbs */}
      <motion.div
        aria-hidden="true"
        style={{ x: orb1x, y: orb1y }}
        className="pointer-events-none absolute left-[8%] top-[12%] h-64 w-64 rounded-full bg-[#384BFE]/25 blur-[110px]"
      />
      <motion.div
        aria-hidden="true"
        style={{ x: orb2x, y: orb2y }}
        className="pointer-events-none absolute right-[6%] top-[40%] h-72 w-72 rounded-full bg-[#6E85FF]/15 blur-[120px]"
      />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
        className="relative flex items-center gap-3"
      >
        <span className="flex h-5 w-9 items-center rounded-full border border-white/20 bg-white/10 p-0.5" aria-hidden="true">
          <span className="h-3.5 w-3.5 rounded-full bg-[#6E85FF]" />
        </span>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-white/70">
          Digital Marketing Agency
        </p>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="mt-6 text-5xl font-semibold leading-[0.9] tracking-tight md:text-7xl"
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
        className="mt-8 max-w-md text-base leading-[1.5] text-white/60"
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
          <Y10Button label="Get Started Free" onClick={onSignIn} />
          <a
            href="#services"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/5"
          >
            Explore Services
          </a>
        </div>
        <p className="text-xs text-white/40">Free CRM included · No credit card required</p>
      </motion.div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   macOS-style menu bar strip
   -------------------------------------------------------------------------- */

const MENU_ITEMS = ['Dashboard', 'Leads', 'Pipeline', 'Tasks', 'Analytics', 'Reports'];

function MenuBarStrip() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.9, ease: 'easeOut' }}
      className="relative z-10 border-y border-white/10 bg-black/40 backdrop-blur-md"
    >
      <div className="mx-auto flex h-10 max-w-6xl items-center justify-between px-6 text-xs">
        <div className="flex min-w-0 items-center gap-4">
          <Y10Mark className="h-3.5 w-3.5" />
          <span className="font-semibold text-white">Y10 CRM</span>
          {MENU_ITEMS.map((item, i) => (
            <span
              key={item}
              className={
                i > 3
                  ? 'hidden text-white/60 lg:inline'
                  : i > 2
                    ? 'hidden text-white/60 md:inline'
                    : 'hidden text-white/60 sm:inline'
              }
            >
              {item}
            </span>
          ))}
        </div>
        <div className="hidden items-center gap-2 text-white/60 sm:flex">
          <Search className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Wed May 6 1:09 PM</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------------------------------------------------------------------------
   CRM product mockup — macOS window with 3D rise on scroll
   -------------------------------------------------------------------------- */

const LEADS = [
  {
    company: 'Acme Robotics',
    subject: 'Requesting SEO audit for new site',
    preview: 'Launching in Q3 — needs a technical audit before the rebuild.',
    value: '$4,800',
    time: '9:41 AM',
    unread: true,
    active: true,
  },
  {
    company: 'Sophia Chen',
    subject: 'Re: Q3 ad spend review',
    preview: 'Thanks for the deck. A few thoughts on the allocation…',
    value: '$2,150',
    time: '8:12 AM',
    unread: true,
    active: false,
  },
  {
    company: 'Summit Realty',
    subject: 'New location grand opening',
    preview: 'Grand opening campaign for the west side office.',
    value: '$1,900',
    time: 'Yesterday',
    unread: false,
    active: false,
  },
  {
    company: 'Northwind Logistics',
    subject: 'Fleet software demo request',
    preview: 'Can we schedule a walkthrough this week?',
    value: '$3,400',
    time: 'Yesterday',
    unread: false,
    active: false,
  },
  {
    company: 'Bloom & Co',
    subject: 'E-commerce rebuild inquiry',
    preview: 'Conversion rate is dropping on mobile checkout.',
    value: '$6,200',
    time: 'Mon',
    unread: false,
    active: false,
  },
  {
    company: 'Apex Dental',
    subject: 'Local SEO package',
    preview: 'A competitor outranks us on every keyword we care about.',
    value: '$950',
    time: 'Mon',
    unread: false,
    active: false,
  },
] as const;

const STAGES = [
  { name: 'New', color: '#384BFE' },
  { name: 'Qualified', color: '#8FB0FF' },
  { name: 'Proposal', color: '#f59e0b' },
  { name: 'Won', color: '#10b981' },
] as const;

const SIDEBAR_NAV = [
  { label: 'Leads', count: 12, active: true },
  { label: 'Pipeline', count: null, active: false },
  { label: 'Tasks', count: 3, active: false },
  { label: 'Analytics', count: null, active: false },
  { label: 'API Keys', count: null, active: false },
] as const;

function CrmMockup() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [18, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.93, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.55], [0.35, 1]);

  return (
    <section className="mx-auto max-w-6xl px-6 pb-16 pt-16 md:pb-24 md:pt-20">
      <div ref={ref} className="relative" style={{ perspective: 1400 }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ rotateX, scale, opacity, transformStyle: 'preserve-3d' }}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0e1014]/90 backdrop-blur-2xl"
        >
          {/* Title bar */}
          <div className="flex h-11 items-center border-b border-white/[0.06] px-4">
            <div className="flex gap-2" aria-hidden="true">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            </div>
            <p className="flex-1 text-center text-xs text-white/50">Y10 CRM — Pipeline</p>
            <span className="w-[52px]" aria-hidden="true" />
          </div>

          {/* Body */}
          <div className="grid h-[520px] grid-cols-12">
            {/* Sidebar */}
            <div className="col-span-3 hidden flex-col border-r border-white/[0.06] bg-black/30 p-4 md:flex">
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-black"
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Add Lead
              </button>
              <nav className="mt-4 space-y-1" aria-label="CRM navigation">
                {SIDEBAR_NAV.map((item) => (
                  <div
                    key={item.label}
                    className={
                      item.active
                        ? 'flex items-center justify-between rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white'
                        : 'flex items-center justify-between rounded-lg px-3 py-2 text-xs text-white/60 transition-colors hover:bg-white/5'
                    }
                  >
                    <span>{item.label}</span>
                    {item.count !== null ? (
                      <span className="text-[10px] text-white/50">{item.count}</span>
                    ) : null}
                  </div>
                ))}
              </nav>
              <div className="mt-6">
                <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-white/40">Stages</p>
                <div className="mt-3 space-y-2.5 px-1">
                  {STAGES.map((stage) => (
                    <div key={stage.name} className="flex items-center gap-2.5 px-2 text-xs text-white/60">
                      <span className="h-2 w-2 rounded-full" style={{ background: stage.color }} aria-hidden="true" />
                      {stage.name}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-auto rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                <p className="text-[10px] uppercase tracking-widest text-white/40">Pipeline value</p>
                <p className="mt-1 text-sm font-semibold text-white">$75,300</p>
              </div>
            </div>

            {/* Lead list */}
            <div className="col-span-12 flex flex-col border-r border-white/[0.06] md:col-span-4">
              <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
                <Search className="h-3.5 w-3.5 text-white/40" aria-hidden="true" />
                <span className="text-xs text-white/40">Search leads</span>
              </div>
              <div className="scrollbar-slim flex-1 overflow-y-auto">
                {LEADS.map((lead) => (
                  <div
                    key={`${lead.company}-${lead.subject}`}
                    className={
                      lead.active
                        ? 'border-b border-white/[0.04] bg-white/[0.06] px-4 py-3'
                        : 'border-b border-white/[0.04] px-4 py-3 transition-colors hover:bg-white/[0.03]'
                    }
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="flex items-center gap-2 text-xs font-semibold text-white">
                        {lead.unread ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#6E85FF]" aria-hidden="true" />
                        ) : null}
                        {lead.company}
                      </p>
                      <span className="text-[10px] text-white/40">{lead.time}</span>
                    </div>
                    <p className="mt-1 truncate text-xs font-medium text-white/80">{lead.subject}</p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="truncate text-[11px] text-white/45">{lead.preview}</p>
                      <span className="shrink-0 text-[11px] font-semibold text-[#8FB0FF]">{lead.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reader / lead detail */}
            <div className="col-span-5 hidden flex-col lg:flex">
              <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
                <div className="flex items-center gap-1.5">
                  {[Reply, Forward, Archive, Trash2].map((Icon, i) => (
                    <span
                      key={i}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-white/55 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  ))}
                </div>
                <span className="flex h-7 w-7 items-center justify-center rounded-md text-white/55 transition-colors hover:bg-white/5 hover:text-white">
                  <MoreHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </div>

              <div className="scrollbar-slim flex-1 overflow-y-auto px-6 py-5">
                <h3 className="text-lg font-semibold tracking-tight text-white">
                  Requesting SEO audit for new site
                </h3>
                <div className="mt-3.5 flex items-center gap-2.5">
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#384BFE] to-[#131C5A] text-[11px] font-bold text-white"
                    aria-hidden="true"
                  >
                    A
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-white">Acme Robotics</p>
                    <p className="text-[10px] text-white/45">Marcus Bell · SOURCE: WEBSITE · 9:41 AM</p>
                  </div>
                  <span className="rounded-full border border-[#6E85FF]/40 bg-[#6E85FF]/10 px-2 py-0.5 text-[10px] font-semibold text-[#8FB0FF]">
                    HOT · 87
                  </span>
                </div>

                <div className="mt-5 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold text-white">
                    <Sparkles className="h-3.5 w-3.5 text-[#8FB0FF]" aria-hidden="true" />
                    Scored by Y10
                  </p>
                  <p className="mt-2 text-xs leading-[1.6] text-white/60">
                    Lead score 87/100 — HOT. High-value service fit with strong buying intent and approved
                    budget. Recommended: reach out within 1 hour and assign to your top closer.
                  </p>
                </div>

                <div className="mt-5 space-y-3.5 text-xs leading-[1.7] text-white/70">
                  <p>Hi there,</p>
                  <p>
                    We're launching a new division in Q3 and need a full technical and content audit of our
                    current site before the rebuild. We're evaluating partners for both the rebuild and an
                    ongoing retainer.
                  </p>
                  <p>
                    Budget is approved and we'd like to move quickly. Could you share your process and a
                    sample report this week?
                  </p>
                  <p>Looking forward to it,</p>
                  <p className="text-white/50">— Marcus Bell, COO, Acme Robotics</p>
                </div>

                <div className="mt-5 flex items-center gap-2">
                  <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] text-white/70">
                    <Paperclip className="h-3 w-3" aria-hidden="true" />
                    seo-audit-brief.pdf
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Landing root
   -------------------------------------------------------------------------- */

export function LandingPage({ onSignIn }: { onSignIn: () => void }) {
  return (
    <div className="y10-landing relative min-h-screen overflow-x-hidden text-white">
      {/* Fullscreen looping background video */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="pointer-events-none h-full w-full object-cover"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_064122_c4750c0e-7476-4b44-94a2-a85a65c63bf2.mp4"
        />
        <div className="absolute inset-0 bg-[#0c0c0c]/60" aria-hidden="true" />
      </div>

      {/* Vertical guide lines at the container edges (desktop only) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-y-0 left-1/2 z-[5] hidden w-px -translate-x-[calc(50%+36rem)] bg-white/10 md:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-y-0 left-1/2 z-[5] hidden w-px translate-x-[calc(-50%+36rem)] bg-white/10 md:block"
      />

      {/* Subtle grain for the shiny headline */}
      <svg aria-hidden="true" className="absolute h-0 w-0">
        <filter id="c3-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0"
          />
          <feComposite in2="SourceGraphic" operator="in" result="noise" />
          <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
        </filter>
      </svg>

      <Navbar onSignIn={onSignIn} />
      <Hero onSignIn={onSignIn} />
      <MenuBarStrip />
      <CrmMockup />
      <GrowthSection />
      <AwardsSection />
      <ServicesSection />
      <PricingSection onGetStarted={onSignIn} />
      <FinalCta />
      <LandingFooter />
    </div>
  );
}
