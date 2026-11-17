// Young10 Marketing — landing page sections (light theme, matches young10marketing.com)
// White surfaces, brand blue #384BFE accents, ink #0F0D1D text.
// All copy, awards, and contact details come from young10marketing.com.

'use client';

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import {
  Award,
  ChevronRight,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Megaphone,
  PenLine,
  Phone,
  ShoppingBag,
  Target,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';

/* ---------------------------------------------------------------------------
   Tilt3D — interactive 3D perspective tilt (mouse-driven) with spring return.
   Wraps any card so it feels physically alive instead of flat.
   -------------------------------------------------------------------------- */

export function Tilt3D({
  children,
  className,
  max = 7,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(rx, { stiffness: 160, damping: 16, mass: 0.6 });
  const rotateY = useSpring(ry, { stiffness: 160, damping: 16, mass: 0.6 });

  function handleMove(event: ReactMouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    ry.set(px * max * 2);
    rx.set(-py * max * 2);
  }

  function handleLeave() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <div className={cn('y10-perspective', className)}>
      <motion.div
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="y10-preserve-3d h-full w-full"
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Rise — resilient scroll-reveal wrapper.

   Uses its own IntersectionObserver plus a scroll-past safety net: if a
   fast jump (anchor link, End key) skips the element across the viewport
   in a single frame, it is revealed anyway. Content can never stay stuck
   at opacity 0, which can happen with `whileInView` + `once: true`.
   -------------------------------------------------------------------------- */

export function Rise({
  children,
  delay = 0,
  distance = 24,
  className,
  as = 'div',
}: {
  children: ReactNode;
  delay?: number;
  distance?: number;
  className?: string;
  as?: 'div' | 'figure';
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const doneRef = useRef(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reveal = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      setShown(true);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal();
            io.disconnect();
          }
        }
      },
      { rootMargin: '0px 0px -60px 0px', threshold: 0.05 },
    );
    io.observe(el);

    // Safety net: anything entirely above the viewport was scrolled past.
    const onScroll = () => {
      if (doneRef.current) return;
      if (el.getBoundingClientRect().bottom < 0) reveal();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const MotionTag = as === 'figure' ? motion.figure : motion.div;

  return (
    <MotionTag
      ref={ref}
      className={className}
      initial={false}
      animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: distance }}
      transition={{ duration: 0.65, delay: shown ? delay : 0, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}

/* ---------------------------------------------------------------------------
   Primitives
   -------------------------------------------------------------------------- */

/** Abstract pinwheel brand symbol (ink, for light surfaces). */
export function Y10Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={cn('h-4 w-4', className)}>
      <path d="M11 11H3a8 8 0 0 1 8-8v8Z" />
      <path d="M13 11V3a8 8 0 0 1 8 8h-8Z" opacity="0.55" />
      <path d="M11 13v8a8 8 0 0 1-8-8h8Z" opacity="0.55" />
      <path d="M13 13h8a8 8 0 0 1-8 8v-8Z" />
    </svg>
  );
}

/** Brand-blue pill button — the primary action across the landing. */
export function Y10Button({
  label,
  href,
  onClick,
  full = false,
  className,
}: {
  label: string;
  href?: string;
  onClick?: () => void;
  full?: boolean;
  className?: string;
}) {
  const inner = (
    <>
      <span>{label}</span>
      <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-[1px]" aria-hidden="true" />
    </>
  );
  const classes = cn(
    'group inline-flex items-center justify-center gap-2 rounded-full bg-[#384BFE] text-white font-medium text-sm px-5 py-3 shadow-[0_10px_24px_-10px_rgba(56,75,254,0.65)] transition-all hover:bg-[#2b3ad1] hover:shadow-[0_14px_30px_-10px_rgba(56,75,254,0.7)] active:scale-[0.98]',
    full && 'w-full',
    className,
  );
  if (href) {
    return (
      <a href={href} className={classes}>
        {inner}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={classes}>
      {inner}
    </button>
  );
}

/** Small uppercase section label with brand-blue dot + optional tag pill. */
export function SectionEyebrow({ label, tag }: { label: string; tag?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-1.5 w-1.5 rounded-full bg-[#384BFE]" aria-hidden="true" />
      <span className="text-sm font-semibold uppercase tracking-[0.14em] text-[#384BFE]">{label}</span>
      {tag ? (
        <span className="rounded-full border border-[#0F0D1D]/10 bg-white px-2.5 py-0.5 text-xs font-medium text-[#5f6274]">
          {tag}
        </span>
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Section — Strategic growth (site copy: "We Empower Business Growth Through
   Strategic SEO")
   -------------------------------------------------------------------------- */

const SNAPSHOT = [
  { label: 'Keywords on page one', value: '38', dot: '#384BFE', note: 'Organic search rankings' },
  { label: 'Paid ROAS', value: '4.2x', dot: '#0ea5b7', note: 'Ad spend optimized weekly' },
  { label: 'Leads captured', value: '126', dot: '#16a34a', note: 'Web forms · API · Landing pages' },
  { label: 'Client retention', value: '96%', dot: '#f59e0b', note: 'Quarterly strategy reviews' },
];

export function GrowthSection() {
  return (
    <section id="growth" className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <div className="grid items-start gap-10 md:grid-cols-2 md:gap-14">
        <Rise>
          <SectionEyebrow label="SEO" tag="Data-driven" />
          <h2 className="mt-5 text-3xl font-semibold leading-[1.12] tracking-tight text-[#0F0D1D] md:text-4xl lg:text-[2.75rem]">
            We empower business growth through strategic SEO.
          </h2>
          <p className="mt-6 max-w-md text-base leading-[1.7] text-[#5f6274]">
            Businesses thrive when their content and design effectively complement each other. Young10
            Marketing helps businesses in Sheridan, Wyoming develop well-structured pages that keep people
            engaged, integrating e-commerce marketing services to enhance overall performance — and we
            prepare your message to be strong, clear and simple.
          </p>
          <div className="mt-8 flex flex-wrap gap-2.5">
            {['Technical SEO audits', 'E-commerce marketing', 'Content that converts', 'Local search'].map(
              (chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-[#0F0D1D]/10 bg-white px-3.5 py-1.5 text-xs font-medium text-[#0F0D1D]/70 shadow-[0_1px_2px_rgba(16,18,35,0.05)]"
                >
                  {chip}
                </span>
              ),
            )}
          </div>
        </Rise>

        <Rise delay={0.12}>
          <Tilt3D max={4}>
            <div className="rounded-2xl border border-[#0F0D1D]/[0.07] bg-white p-6 card-shadow">
              <div className="flex items-center justify-between px-1 pb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5f6274]">
                  This month · Growth snapshot
                </p>
                <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#16a34a] opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#16a34a]" />
                </span>
              </div>
              <div className="space-y-3">
                {SNAPSHOT.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-4 rounded-xl bg-[#F5F6FB] px-4 py-3.5 transition-colors hover:bg-[#EEF0FA]"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: row.dot }} aria-hidden="true" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-[#0F0D1D]">{row.label}</span>
                        <span className="block truncate text-xs text-[#7A7A7A]">{row.note}</span>
                      </span>
                    </span>
                    <span className="shrink-0 text-lg font-semibold tracking-tight text-[#0F0D1D]">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Tilt3D>
        </Rise>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Section — Achievements & Awards (real badges from young10marketing.com)
   -------------------------------------------------------------------------- */

const AWARDS = [
  { platform: 'The Manifest', award: 'Top 20 Web Development Company' },
  { platform: 'Trustpilot', award: '100+ verified reviews' },
  { platform: 'Clutch', award: 'Top B2B Companies Global 2022' },
  { platform: 'Clutch', award: 'Clients say we deliver' },
  { platform: 'GoodFirms', award: 'Top E-Commerce Development Company' },
] as const;

export function AwardsSection() {
  return (
    <section id="awards" className="mx-auto max-w-6xl px-6 py-16 md:py-20">
      <Rise className="flex flex-col items-center text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7A7A7A]">
          Achievements &amp; Awards
        </p>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight text-[#0F0D1D] md:text-3xl">
          Recognized by the industry.
        </h3>
      </Rise>
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {AWARDS.map((badge, i) => (
          <Rise
            key={`${badge.platform}-${badge.award}`}
            delay={i * 0.06}
            distance={16}
            className="group flex flex-col items-center rounded-2xl border border-[#0F0D1D]/[0.07] bg-white px-4 py-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-[#384BFE]/35 hover:shadow-[0_18px_40px_-20px_rgba(31,34,78,0.25)]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#384BFE]/10 text-[#384BFE] transition-transform duration-300 group-hover:scale-110">
              <Award className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="mt-3.5 text-sm font-semibold tracking-tight text-[#0F0D1D]">{badge.platform}</p>
            <p className="mt-1.5 text-xs leading-snug text-[#7A7A7A]">{badge.award}</p>
          </Rise>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Section — Our services (the agency's core offering)
   -------------------------------------------------------------------------- */

const SERVICES: { icon: LucideIcon; name: string; desc: string }[] = [
  {
    icon: Target,
    name: 'Search Engine Optimization',
    desc: 'Technical audits, on-page optimization, and authority building that put you on page one — and keep you there.',
  },
  {
    icon: PenLine,
    name: 'Content Marketing',
    desc: 'Strategic content that builds authority, earns trust, and drives qualified traffic to every page.',
  },
  {
    icon: Megaphone,
    name: 'Social Media Marketing',
    desc: 'Scroll-stopping creative and community management that turns followers into customers.',
  },
  {
    icon: ShoppingBag,
    name: 'E-commerce Marketing',
    desc: 'Product feeds, shopping campaigns, and conversion optimization for online stores that need to sell.',
  },
  {
    icon: Mail,
    name: 'Email & Retention',
    desc: 'Lifecycle campaigns and automation that bring customers back — without landing in spam.',
  },
  {
    icon: Phone,
    name: 'Strategy & Consulting',
    desc: 'A clear, actionable growth plan with measurable milestones. Problem solving with precision and expertise.',
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="relative mx-auto max-w-6xl px-6 py-20 md:py-28">
      {/* Dotted texture band behind the header (decor) */}
      <div
        aria-hidden="true"
        className="y10-dots pointer-events-none absolute inset-x-6 top-10 -z-10 h-40 opacity-40 [mask-image:radial-gradient(60%_100%_at_50%_0%,black,transparent)]"
      />
      <Rise className="flex flex-col items-center text-center">
        <SectionEyebrow label="Our Services" />
        <h2 className="mt-5 text-3xl font-semibold tracking-tight text-[#0F0D1D] md:text-5xl">
          Everything your growth needs.
          <br />
          <span className="text-[#7A7A7A]">Nothing it doesn&apos;t.</span>
        </h2>
      </Rise>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((service, i) => (
          <Rise key={service.name} as="figure" delay={(i % 3) * 0.08} distance={20} className="h-full">
            <Tilt3D max={8} className="h-full">
              <div className="card-lift group flex h-full flex-col rounded-2xl border border-[#0F0D1D]/[0.07] bg-white p-6 card-shadow">
                <div className="stat-icon stat-icon-blue flex h-11 w-11 items-center justify-center rounded-xl bg-[#384BFE]/10 text-[#384BFE]">
                  <service.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <figcaption className="mt-5 text-base font-semibold text-[#0F0D1D]">{service.name}</figcaption>
                <p className="mt-2.5 text-sm leading-[1.65] text-[#7A7A7A]">{service.desc}</p>
              </div>
            </Tilt3D>
          </Rise>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Section — Final CTA (brand-blue gradient panel)
   -------------------------------------------------------------------------- */

export function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <Rise
        delay={0.05}
        distance={32}
        className="brand-gradient relative overflow-hidden rounded-[2rem] px-8 py-16 text-center shadow-[0_32px_80px_-32px_rgba(43,58,209,0.55)] md:py-20"
      >
        {/* Decorative floating orbs + slow-rotating 3D rings */}
        <div
          aria-hidden="true"
          className="animate-float-slow pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="animate-float-slow pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-[#0F0D1D]/25 blur-3xl [animation-delay:-3.5s]"
        />
        <div
          aria-hidden="true"
          className="animate-spin-slow pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full border border-white/15"
        />
        <div
          aria-hidden="true"
          className="animate-spin-slow pointer-events-none absolute -left-28 bottom-[-6rem] h-72 w-72 rounded-full border border-dashed border-white/20 [animation-delay:-8s]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{ background: 'radial-gradient(640px circle at 50% -10%, rgba(255,255,255,0.28), transparent 70%)' }}
        />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/90">
            <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
            Let&apos;s work together
          </span>
          <h2 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight text-white md:text-6xl">
            Your growth.
            <br />
            Our mission.
          </h2>
          <p className="mx-auto mt-6 max-w-md text-sm leading-[1.7] text-white/80 md:text-base">
            Strategy, execution, and a platform that keeps every opportunity moving — from first click to
            closed deal.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:alex@young10marketing.com"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0F0D1D] shadow-[0_14px_30px_-12px_rgba(15,13,29,0.5)] transition-all hover:bg-white/95 active:scale-[0.98]"
            >
              Contact Us
              <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-[1px]" aria-hidden="true" />
            </a>
            <a
              href="tel:+12708444916"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/15"
            >
              Call +1 270-844-4916
            </a>
          </div>
        </div>
      </Rise>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Footer — deep ink footer with real company contact details
   -------------------------------------------------------------------------- */

const FOOTER_SERVICES = [
  'Search Engine Optimization',
  'Content Marketing',
  'Social Media Marketing',
  'E-commerce Marketing',
  'Email & Retention',
  'Strategy & Consulting',
] as const;

const FOOTER_COMPANY = [
  { label: 'Growth', href: '#growth' },
  { label: 'Services', href: '#services' },
  { label: 'Awards', href: '#awards' },
  { label: 'young10marketing.com', href: 'https://young10marketing.com/' },
] as const;

function FooterSocialLink({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white/70 transition-all hover:-translate-y-0.5 hover:border-[#384BFE] hover:bg-[#384BFE] hover:text-white"
    >
      {children}
    </a>
  );
}

export function LandingFooter() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-[#0F0D1D] text-white">
      {/* Decor: brand pinwheel watermark + soft blue glow */}
      <Y10Mark className="pointer-events-none absolute -right-16 top-10 h-72 w-72 rotate-12 text-white/[0.04]" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#384BFE]/20 blur-[120px]"
      />

      <div className="relative mx-auto max-w-6xl px-6 pb-10 pt-16 md:pt-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1.2fr] md:gap-8">
          {/* Brand column */}
          <div className="max-w-sm">
            <a href="#" className="inline-flex items-center" aria-label="Young10 Marketing home">
              <img
                src="/brand/logo-white.png"
                alt="Young10 Marketing"
                className="h-11 w-auto"
                width={124}
                height={44}
              />
            </a>
            <p className="mt-5 text-sm leading-[1.7] text-white/55">
              Professional digital marketing agency in Sheridan, Wyoming — fueling growth, driving results,
              and keeping every opportunity moving with the Y10 CRM platform.
            </p>
            <div className="mt-6 flex gap-3">
              <FooterSocialLink href="https://www.facebook.com/young10marketing" label="Young10 Marketing on Facebook">
                <Facebook className="h-4 w-4" aria-hidden="true" />
              </FooterSocialLink>
              <FooterSocialLink href="https://www.instagram.com/young10marketing" label="Young10 Marketing on Instagram">
                <Instagram className="h-4 w-4" aria-hidden="true" />
              </FooterSocialLink>
              <FooterSocialLink href="https://www.linkedin.com/company/young10-marketing" label="Young10 Marketing on LinkedIn">
                <Linkedin className="h-4 w-4" aria-hidden="true" />
              </FooterSocialLink>
            </div>
          </div>

          {/* Company links */}
          <nav aria-label="Company">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">Company</p>
            <ul className="mt-5 space-y-3">
              {FOOTER_COMPANY.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                    className="group inline-flex items-center gap-1.5 text-sm text-white/65 transition-colors hover:text-white"
                  >
                    <span className="h-px w-0 bg-[#384BFE] transition-all duration-300 group-hover:w-3" aria-hidden="true" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Services list */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">Services</p>
            <ul className="mt-5 space-y-3">
              {FOOTER_SERVICES.map((service) => (
                <li key={service} className="text-sm text-white/65">
                  {service}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">Get in touch</p>
            <div className="mt-5 space-y-3.5 text-sm">
              <a
                href="mailto:alex@young10marketing.com"
                className="flex items-start gap-3 text-white/65 transition-colors hover:text-white"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-white/70">
                  <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span className="min-w-0 break-all pt-1.5">alex@young10marketing.com</span>
              </a>
              <a href="tel:+12708444916" className="flex items-start gap-3 text-white/65 transition-colors hover:text-white">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-white/70">
                  <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span className="pt-1.5">+1 270-844-4916</span>
              </a>
              <p className="flex items-start gap-3 text-white/65">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-white/70">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span className="pt-1.5">Sheridan, Wyoming</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-7 text-xs text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} Young10 Marketing. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <Y10Mark className="h-3 w-3 text-white/40" />
            Young10 Marketing — Sheridan, WY
          </p>
        </div>
      </div>
    </footer>
  );
}
