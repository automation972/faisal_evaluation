// Young10 Marketing — premium 3D landing page
// Light theme matching young10marketing.com: white/#F5F6FB surfaces,
// brand blue #384BFE, ink #0F0D1D text. WebGL silk-wave hero (three.js),
// mouse-tracked 3D tilt cards, choreographed scroll reveals.
// "Sign In" in the navbar opens the in-app auth screen via onSignIn.

'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';
import dynamic from 'next/dynamic';
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  BarChart3,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  Menu as MenuIcon,
  MapPin,
  PenTool,
  Phone,
  Search,
  Share2,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from 'lucide-react';

// WebGL hero lives in its own chunk (three.js) — shown as soon as it's ready
const HeroCanvas3D = dynamic(() => import('@/components/landing/hero-canvas-3d'));

const CONTACT_EMAIL = 'alex@young10marketing.com';
const CONTACT_PHONE = '+1 (270) 844-4916';
const MAILTO_AUDIT = `mailto:${CONTACT_EMAIL}?subject=Free%20Growth%20Audit%20—%20Young10%20Marketing`;

/** Shiny gradient sweep for the hero headline (light brand palette). */
const SHINY_GRADIENT: CSSProperties = {
  backgroundImage:
    'linear-gradient(to right, #0F0D1D 0%, #131C5A 12.5%, #384BFE 32.5%, #6E85FF 50%, #131C5A 67.5%, #0F0D1D 87.5%, #0F0D1D 100%)',
  backgroundSize: '200% auto',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  WebkitTextFillColor: 'transparent',
};

/* ---------------------------------------------------------------------------
   Rise — scroll reveal with IntersectionObserver + a scroll-past safety net
   (never leaves content invisible, unlike whileInView + once:true)
   -------------------------------------------------------------------------- */

function Rise({
  children,
  delay = 0,
  distance = 28,
  className,
}: {
  children: ReactNode;
  delay?: number;
  distance?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Deferred initial check (keeps the effect free of synchronous setState)
    let raf = 0;

    if (typeof IntersectionObserver === 'undefined') {
      raf = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(raf);
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -60px 0px', threshold: 0.05 },
    );
    io.observe(el);

    // Safety net: if the element was scrolled past before intersecting,
    // reveal it anyway so nothing can stay stuck at opacity 0.
    const onScroll = () => {
      if (el.getBoundingClientRect().bottom < 0) {
        setShown(true);
        io.disconnect();
        window.removeEventListener('scroll', onScroll);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    raf = requestAnimationFrame(onScroll);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={false}
      animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: distance }}
      transition={{ duration: 0.9, delay: shown ? delay : 0, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ---------------------------------------------------------------------------
   Tilt3D — mouse-tracked perspective tilt with a soft brand-blue glare
   -------------------------------------------------------------------------- */

function Tilt3D({
  children,
  max = 5,
  className,
}: {
  children: ReactNode;
  max?: number;
  className?: string;
}) {
  const rotateX = useSpring(0, { stiffness: 140, damping: 16 });
  const rotateY = useSpring(0, { stiffness: 140, damping: 16 });
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const glare = useMotionTemplate`radial-gradient(260px circle at ${glareX}% ${glareY}%, rgba(56, 75, 254, 0.1), transparent 68%)`;

  function handleMove(event: ReactMouseEvent<HTMLDivElement>) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * max * 2);
    rotateX.set(-py * max * 2);
    glareX.set((px + 0.5) * 100);
    glareY.set((py + 0.5) * 100);
  }

  function handleLeave() {
    rotateX.set(0);
    rotateY.set(0);
    glareX.set(50);
    glareY.set(50);
  }

  return (
    <div
      className={className}
      style={{ perspective: 1100 }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative h-full w-full"
      >
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 rounded-[inherit]"
          style={{ background: glare }}
        />
        {children}
      </motion.div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Navbar — frosted sticky bar, real logo, Sign In -> auth screen
   -------------------------------------------------------------------------- */

const NAV_LINKS = [
  { label: 'Services', href: '#services' },
  { label: 'Results', href: '#results' },
  { label: 'Approach', href: '#approach' },
] as const;

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
        <a href="#top" className="flex items-center" aria-label="Young10 Marketing home">
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
            className="rounded-full border border-[#0F0D1D]/12 bg-white px-5 py-2.5 text-sm font-medium text-[#0F0D1D] shadow-[0_1px_2px_rgba(16,18,35,0.06)] transition-all hover:-translate-y-0.5 hover:border-[#384BFE]/40 hover:text-[#384BFE]"
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={onSignIn}
            className="brand-shadow rounded-full bg-[#384BFE] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#2b3ad1]"
          >
            Get Started
          </button>
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

      {open ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
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
    </motion.header>
  );
}

/* ---------------------------------------------------------------------------
   Hero — WebGL silk wave, parallax glass chips, shiny headline
   -------------------------------------------------------------------------- */

function Hero({ onSignIn }: { onSignIn: () => void }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 20 });
  const sy = useSpring(my, { stiffness: 50, damping: 20 });
  const chip1x = useTransform(sx, (v) => v * 26);
  const chip1y = useTransform(sy, (v) => v * 20);
  const chip2x = useTransform(sx, (v) => v * -34);
  const chip2y = useTransform(sy, (v) => v * -26);

  function handleMove(event: ReactMouseEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    mx.set((event.clientX - rect.left) / rect.width - 0.5);
    my.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  return (
    <section
      id="top"
      onMouseMove={handleMove}
      className="relative flex min-h-[92svh] flex-col items-center justify-center overflow-hidden px-6 pb-20 pt-14 text-center md:pb-28"
    >
      {/* CSS depth fallback — always rendered, carries the hero if WebGL fails */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(46rem 30rem at 18% 78%, rgba(56,75,254,0.14), transparent 62%), radial-gradient(40rem 26rem at 86% 66%, rgba(56,75,254,0.10), transparent 60%)',
        }}
      />

      {/* WebGL silk-wave ribbon (three.js, own chunk) */}
      <div className="absolute inset-0" aria-hidden="true">
        <HeroCanvas3D />
      </div>

      {/* Soft light pool behind the copy — keeps text crisp over the wave */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(58rem 34rem at 50% 44%, rgba(245,246,251,0.72), transparent 64%)',
        }}
      />

      {/* Legibility veils: melt canvas into the page tint top & bottom */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{ background: 'linear-gradient(180deg, #F5F6FB 8%, transparent 100%)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-44"
        style={{ background: 'linear-gradient(0deg, #F5F6FB 12%, transparent 100%)' }}
      />

      {/* Floating 3D glass chips (desktop only) */}
      <motion.div aria-hidden="true" style={{ x: chip1x, y: chip1y }} className="y10-chip left-[3%] top-[24%] -rotate-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#384BFE]/10 text-[#384BFE]">
          <TrendingUp className="h-5 w-5" />
        </span>
        <span>
          <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-[#7A7A7A]">
            Page-one rankings
          </span>
          <span className="block text-sm font-semibold text-[#0F0D1D]">38 this month ↑</span>
        </span>
      </motion.div>
      <motion.div
        aria-hidden="true"
        style={{ x: chip2x, y: chip2y }}
        className="y10-chip right-[2.5%] top-[38%] rotate-[5deg] [animation-delay:-2.5s] animate-float-slow"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#384BFE]/10 text-[#384BFE]">
          <Sparkles className="h-5 w-5" />
        </span>
        <span>
          <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-[#7A7A7A]">
            AI lead score
          </span>
          <span className="block text-sm font-semibold text-[#0F0D1D]">87 · HOT lead</span>
        </span>
      </motion.div>

      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
          className="flex items-center gap-2.5 rounded-full border border-[#0F0D1D]/10 bg-white/80 px-4 py-2 shadow-[0_2px_10px_rgba(16,18,35,0.06)] backdrop-blur"
        >
          <Sparkles className="h-3.5 w-3.5 text-[#384BFE]" aria-hidden="true" />
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0F0D1D]/70">
            Digital Marketing Agency
          </p>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30, rotateX: 16 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformPerspective: 1100 }}
          className="y10-preserve-3d mt-7 text-5xl font-semibold leading-[0.95] tracking-tight text-[#0F0D1D] md:text-7xl"
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
          We empower business growth through strategic SEO, performance marketing, and content that
          compounds — with a CRM that keeps every opportunity moving.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7, ease: 'easeOut' }}
          className="relative mt-9 flex flex-col items-center gap-3"
        >
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onSignIn}
              className="brand-shadow rounded-full bg-[#384BFE] px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#2b3ad1]"
            >
              Get Started Free
            </button>
            <a
              href="#services"
              className="inline-flex items-center gap-2 rounded-full border border-[#0F0D1D]/12 bg-white px-6 py-3 text-sm font-medium text-[#0F0D1D] shadow-[0_2px_10px_rgba(16,18,35,0.06)] transition-all hover:-translate-y-0.5 hover:border-[#384BFE]/40 hover:text-[#384BFE]"
            >
              Explore Services
            </a>
          </div>
          <p className="text-xs text-[#7A7A7A]">Free CRM included · No credit card required</p>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Stats band — proof strip under the hero (tilt card, brand numbers)
   -------------------------------------------------------------------------- */

const STATS = [
  { value: '38', suffix: '', label: 'Keywords on page one' },
  { value: '4.2', suffix: 'x', label: 'Average paid ROAS' },
  { value: '126', suffix: '', label: 'Leads captured monthly' },
  { value: '96', suffix: '%', label: 'Client retention rate' },
] as const;

function StatsBand() {
  return (
    <section id="results" className="relative z-10 mx-auto max-w-6xl scroll-mt-24 px-6">
      <Rise distance={24}>
        <Tilt3D max={4}>
          <div
            className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[#0F0D1D]/[0.07] bg-[#0F0D1D]/[0.06] shadow-[0_24px_60px_-30px_rgba(31,34,78,0.25)] md:grid-cols-4"
            aria-label="Agency results at a glance"
          >
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="bg-white px-6 py-7 text-center transition-colors hover:bg-[#F8F9FE]"
              >
                <p className="text-3xl font-semibold tracking-tight text-[#384BFE] md:text-4xl">
                  {stat.value}
                  <span className="text-2xl md:text-3xl">{stat.suffix}</span>
                </p>
                <p className="mt-2 text-xs font-medium text-[#5f6274] md:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </Tilt3D>
      </Rise>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Section header helper
   -------------------------------------------------------------------------- */

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle: string;
}) {
  return (
    <Rise className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#384BFE]">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#0F0D1D] md:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-[1.7] text-[#5f6274]">{subtitle}</p>
    </Rise>
  );
}

/* ---------------------------------------------------------------------------
   Services — six tilt cards over a dotted brand texture band
   -------------------------------------------------------------------------- */

const SERVICES = [
  {
    icon: Search,
    title: 'Search Engine Optimization',
    desc: 'Technical fixes, content clusters and authority links that win page one.',
  },
  {
    icon: Target,
    title: 'Paid Media & PPC',
    desc: 'Full-funnel Google & Meta campaigns tuned for ROAS, not vanity clicks.',
  },
  {
    icon: PenTool,
    title: 'Content Marketing',
    desc: 'Editorial systems that earn trust and compound organic traffic.',
  },
  {
    icon: Share2,
    title: 'Social Media Marketing',
    desc: 'Platform-native calendars that grow engaged, buying audiences.',
  },
  {
    icon: Mail,
    title: 'Email & Automation',
    desc: 'Lifecycle flows that turn one-time buyers into repeat revenue.',
  },
  {
    icon: BarChart3,
    title: 'Analytics & CRO',
    desc: 'Dashboards, heatmaps and A/B tests that squeeze more from every visit.',
  },
] as const;

function Services() {
  return (
    <section id="services" className="relative scroll-mt-24 py-20 md:py-28">
      <div className="y10-dots pointer-events-none absolute inset-x-0 top-0 h-56 opacity-60 [mask-image:linear-gradient(180deg,black,transparent)]" />
      <div className="relative mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow="What we do"
          title={
            <>
              Services built to <span className="text-gradient-brand">compound growth</span>.
            </>
          }
          subtitle="Every engagement is engineered around one metric: revenue. Pick one service or run the full engine — everything reports into your CRM."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, i) => (
            <Rise key={service.title} delay={i * 0.07} distance={22}>
              <Tilt3D max={6} className="h-full rounded-2xl">
                <div className="card-shadow card-lift flex h-full flex-col rounded-2xl border border-[#0F0D1D]/[0.07] bg-white p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#384BFE]/10 text-[#384BFE]">
                    <service.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-[#0F0D1D]">{service.title}</h3>
                  <p className="mt-2 text-sm leading-[1.65] text-[#5f6274]">{service.desc}</p>
                </div>
              </Tilt3D>
            </Rise>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Approach — three numbered steps with depth
   -------------------------------------------------------------------------- */

const STEPS = [
  {
    num: '01',
    title: 'Discover',
    desc: 'We audit your funnel, market and data to find the gaps worth the most money.',
  },
  {
    num: '02',
    title: 'Build',
    desc: 'Campaigns, content and CRM automations go live in weeks — not quarters.',
  },
  {
    num: '03',
    title: 'Scale',
    desc: 'Weekly experiments double down on what converts and cut what does not.',
  },
] as const;

function Approach() {
  return (
    <section id="approach" className="relative scroll-mt-24 bg-white py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow="How we work"
          title="A tight loop, run weekly."
          subtitle="No black boxes. You see every experiment, every lead and every dollar inside the same workspace your team already uses."
        />

        <div className="relative mt-12 grid gap-5 md:grid-cols-3">
          <div
            aria-hidden="true"
            className="absolute inset-x-16 top-14 hidden h-px bg-gradient-to-r from-transparent via-[#384BFE]/30 to-transparent md:block"
          />
          {STEPS.map((step, i) => (
            <Rise key={step.num} delay={i * 0.1} distance={24}>
              <Tilt3D max={5} className="h-full rounded-2xl">
                <div className="card-shadow card-lift relative h-full rounded-2xl border border-[#0F0D1D]/[0.07] bg-white p-6 text-center md:p-7">
                  <p className="text-gradient-brand text-4xl font-bold tracking-tight">{step.num}</p>
                  <h3 className="mt-3 text-lg font-semibold text-[#0F0D1D]">{step.title}</h3>
                  <p className="mt-2 text-sm leading-[1.65] text-[#5f6274]">{step.desc}</p>
                </div>
              </Tilt3D>
            </Rise>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Final CTA — brand-gradient panel
   -------------------------------------------------------------------------- */

function FinalCta({ onSignIn }: { onSignIn: () => void }) {
  return (
    <section className="relative py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Rise distance={30}>
          <div className="brand-gradient relative overflow-hidden rounded-3xl px-6 py-14 text-center shadow-[0_40px_90px_-40px_rgba(56,75,254,0.6)] md:py-16">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(30rem 18rem at 85% -10%, rgba(255,255,255,0.22), transparent 60%), radial-gradient(26rem 16rem at 8% 110%, rgba(15,13,29,0.28), transparent 55%)',
              }}
            />
            <div className="relative">
              <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Ready to amplify your growth?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-[1.7] text-white/80">
                Join the brands scaling with Young10 — and run every lead, deal and campaign inside
                your new CRM from day one.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onSignIn}
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0F0D1D] shadow-[0_12px_30px_-12px_rgba(15,13,29,0.5)] transition-all hover:-translate-y-0.5 hover:bg-[#F2F4FF]"
                >
                  Get Started Free
                </button>
                <a
                  href={MAILTO_AUDIT}
                  className="rounded-full border border-white/40 px-6 py-3 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:border-white/70 hover:bg-white/10"
                >
                  Book a Free Audit
                </a>
              </div>
              <p className="mt-5 text-xs text-white/70">No credit card required · Sheridan, Wyoming</p>
            </div>
          </div>
        </Rise>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Footer — ink dark, real contact details
   -------------------------------------------------------------------------- */

function LandingFooter({ onSignIn }: { onSignIn: () => void }) {
  const year = new Date().getFullYear();

  return (
    <footer className="ink-gradient mt-auto text-[#ecedf5]">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <img src="/brand/logo-white.png" alt="Young10 Marketing" className="h-10 w-auto" width={89} height={40} />
            <p className="mt-4 max-w-xs text-sm leading-[1.7] text-[#9a9cb5]">
              Professional marketing. Personal connections. A digital marketing agency built on
              measurable growth.
            </p>
            <div className="mt-5 flex gap-3">
              {[
                { icon: Facebook, label: 'Facebook' },
                { icon: Instagram, label: 'Instagram' },
                { icon: Linkedin, label: 'LinkedIn' },
              ].map((social) => (
                <a
                  key={social.label}
                  href="https://young10marketing.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Young10 Marketing on ${social.label}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/80 transition-all hover:-translate-y-0.5 hover:border-[#6E85FF] hover:text-white"
                >
                  <social.icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Footer — company">
            <h3 className="text-sm font-semibold text-white">Company</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[#9a9cb5]">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="transition-colors hover:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Footer — get started">
            <h3 className="text-sm font-semibold text-white">Get started</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[#9a9cb5]">
              <li>
                <button type="button" onClick={onSignIn} className="transition-colors hover:text-white">
                  Sign in
                </button>
              </li>
              <li>
                <button type="button" onClick={onSignIn} className="transition-colors hover:text-white">
                  Create account
                </button>
              </li>
              <li>
                <a href={MAILTO_AUDIT} className="transition-colors hover:text-white">
                  Book a free audit
                </a>
              </li>
            </ul>
          </nav>

          <div>
            <h3 className="text-sm font-semibold text-white">Contact</h3>
            <ul className="mt-4 space-y-3 text-sm text-[#9a9cb5]">
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-[#6E85FF]" aria-hidden="true" />
                <a href={`mailto:${CONTACT_EMAIL}`} className="transition-colors hover:text-white">
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-[#6E85FF]" aria-hidden="true" />
                <a href={`tel:${CONTACT_PHONE.replace(/[^+\d]/g, '')}`} className="transition-colors hover:text-white">
                  {CONTACT_PHONE}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-[#6E85FF]" aria-hidden="true" />
                <span>Sheridan, Wyoming, USA</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-[#9a9cb5] md:flex-row">
          <p>
            © {year} <span className="font-semibold text-white">Young10 Marketing</span> · All rights
            reserved
          </p>
          <p>Professional Digital Marketing Agency · Sheridan, WY</p>
        </div>
      </div>
    </footer>
  );
}

/* ---------------------------------------------------------------------------
   Landing root
   -------------------------------------------------------------------------- */

export function LandingPage({ onSignIn }: { onSignIn: () => void }) {
  return (
    <div className="y10-landing flex min-h-screen flex-col overflow-x-hidden">
      <Navbar onSignIn={onSignIn} />
      <main className="flex-1">
        <Hero onSignIn={onSignIn} />
        <StatsBand />
        <Services />
        <Approach />
        <FinalCta onSignIn={onSignIn} />
      </main>
      <LandingFooter onSignIn={onSignIn} />
    </div>
  );
}
