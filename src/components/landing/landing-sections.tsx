// Young10 Marketing — landing page sections (dark cinematic theme)
// All copy, awards, and contact details come from young10marketing.com.

'use client';

import { motion } from 'framer-motion';
import {
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
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

/* ---------------------------------------------------------------------------
   Primitives
   -------------------------------------------------------------------------- */

/** Abstract pinwheel brand symbol (white, for dark surfaces). */
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

/** White pill button — the primary action across the landing. */
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
    'group inline-flex items-center justify-center gap-2 rounded-full bg-white text-black font-medium text-sm px-5 py-3 transition-all hover:bg-white/90 active:scale-[0.98]',
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

/** Small uppercase section label with dot + optional tag pill. */
export function SectionEyebrow({ label, tag }: { label: string; tag?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
      <span className="text-sm font-medium text-white">{label}</span>
      {tag ? (
        <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-white/50">{tag}</span>
      ) : null}
    </div>
  );
}

const riseIn = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
} as const;

/* ---------------------------------------------------------------------------
   Section — Strategic growth (site copy: "We Empower Business Growth Through
   Strategic SEO")
   -------------------------------------------------------------------------- */

const SNAPSHOT = [
  { label: 'Organic', count: 38, tone: '#ffffff', items: ['Keywords ranking on page one'] },
  { label: 'Paid ROAS', count: 4.2, suffix: 'x', tone: '#e5e5e5', items: ['Ad spend optimized weekly'] },
  { label: 'Leads captured', count: 126, tone: '#a3a3a3', items: ['Web forms · API · Landing pages'] },
  { label: 'Retention', count: 96, suffix: '%', tone: '#525252', items: ['Quarterly strategy reviews'] },
];

export function GrowthSection() {
  return (
    <section id="growth" className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <div className="grid items-start gap-10 md:grid-cols-2 md:gap-16">
        <motion.div {...riseIn} transition={{ duration: 0.7, ease: 'easeOut' }}>
          <SectionEyebrow label="SEO" tag="Data-driven" />
          <h2 className="mt-5 text-3xl font-semibold leading-[1.02] tracking-tight md:text-5xl">
            We empower business growth
            <br />
            through strategic SEO.
          </h2>
          <p className="mt-6 max-w-md text-base leading-[1.6] text-white/60">
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
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/70"
                >
                  {chip}
                </span>
              ),
            )}
          </div>
        </motion.div>

        <motion.div
          {...riseIn}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
          className="liquid-glass rounded-2xl p-5"
        >
          <p className="px-1 pb-4 text-xs uppercase tracking-widest text-white/50">
            This month · Growth snapshot
          </p>
          <div className="space-y-3">
            {SNAPSHOT.map((row) => (
              <div key={row.label} className="liquid-glass rounded-lg p-3">
                <div className="flex items-center justify-between px-1">
                  <span className="flex items-center gap-2 text-sm font-medium" style={{ color: row.tone }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: row.tone }} aria-hidden="true" />
                    {row.label}
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {row.count}
                    {'suffix' in row ? row.suffix : ''}
                  </span>
                </div>
                {row.items.map((item) => (
                  <p key={item} className="mt-1.5 px-1 text-xs text-white/45">
                    {item}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </motion.div>
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
      <motion.p
        {...riseIn}
        transition={{ duration: 0.6 }}
        className="text-center text-xs uppercase tracking-widest text-white/40"
      >
        Achievements &amp; Awards
      </motion.p>
      <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
        {AWARDS.map((badge, i) => (
          <motion.div
            key={`${badge.platform}-${badge.award}`}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.05, ease: 'easeOut' }}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-5 text-center transition-colors hover:border-white/15"
          >
            <p className="text-sm font-semibold tracking-tight text-white/50 transition-colors hover:text-white">
              {badge.platform}
            </p>
            <p className="mt-2 text-xs leading-snug text-white/40">{badge.award}</p>
          </motion.div>
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
    <section id="services" className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <motion.div {...riseIn} transition={{ duration: 0.6 }} className="flex flex-col items-center text-center">
        <SectionEyebrow label="Our Services" />
        <h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-5xl">
          Everything your growth needs.
          <br />
          <span className="text-white/50">Nothing it doesn't.</span>
        </h2>
      </motion.div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((service, i) => (
          <motion.figure
            key={service.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: (i % 3) * 0.08, ease: 'easeOut' }}
            className="liquid-glass rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5">
              <service.icon className="h-5 w-5 text-white/80" aria-hidden="true" />
            </div>
            <figcaption className="mt-5 text-base font-semibold text-white">{service.name}</figcaption>
            <p className="mt-2.5 text-sm leading-[1.6] text-white/55">{service.desc}</p>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Section — Final CTA
   -------------------------------------------------------------------------- */

export function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 md:py-32">
      <motion.div
        {...riseIn}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="liquid-glass relative overflow-hidden rounded-3xl px-8 py-16 text-center md:py-24"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{ background: 'radial-gradient(600px circle at 50% 0%, rgba(255,255,255,0.15), transparent 70%)' }}
        />
        <div className="relative">
          <h2 className="text-4xl font-semibold leading-[1.02] tracking-tight md:text-6xl">
            Your growth.
            <br />
            Our mission.
          </h2>
          <p className="mx-auto mt-6 max-w-md text-sm leading-[1.6] text-white/60">
            Strategy, execution, and a platform that keeps every opportunity moving — from first click to
            closed deal.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Y10Button label="Contact Us" href="mailto:alex@young10marketing.com" />
            <a
              href="tel:+12708444916"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/5"
            >
              Call +1 270-844-4916
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Footer — real company contact details
   -------------------------------------------------------------------------- */

function SocialLink({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
    >
      {children}
    </a>
  );
}

export function LandingFooter() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-black/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <img
            src="/brand/logo-white.png"
            alt="Young10 Marketing"
            className="h-9 w-auto"
            width={110}
            height={36}
          />
          <p className="mt-4 text-sm leading-[1.6] text-white/50">
            Professional digital marketing agency in Sheridan, Wyoming — fueling growth and driving
            results.
          </p>
        </div>

        <div className="space-y-3 text-sm text-white/60">
          <p className="text-xs uppercase tracking-widest text-white/40">Contact</p>
          <a
            href="mailto:alex@young10marketing.com"
            className="flex items-center gap-2.5 transition-colors hover:text-white"
          >
            <Mail className="h-4 w-4 text-white/50" aria-hidden="true" />
            alex@young10marketing.com
          </a>
          <a href="tel:+12708444916" className="flex items-center gap-2.5 transition-colors hover:text-white">
            <Phone className="h-4 w-4 text-white/50" aria-hidden="true" />
            +1 270-844-4916
          </a>
          <p className="flex items-center gap-2.5">
            <MapPin className="h-4 w-4 text-white/50" aria-hidden="true" />
            Sheridan, Wyoming
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-white/40">Follow Us</p>
          <div className="mt-4 flex gap-3">
            <SocialLink href="https://www.facebook.com/young10marketing" label="Young10 Marketing on Facebook">
              <Facebook className="h-4 w-4" aria-hidden="true" />
            </SocialLink>
            <SocialLink href="https://www.instagram.com/young10marketing" label="Young10 Marketing on Instagram">
              <Instagram className="h-4 w-4" aria-hidden="true" />
            </SocialLink>
            <SocialLink href="https://www.linkedin.com/company/young10-marketing" label="Young10 Marketing on LinkedIn">
              <Linkedin className="h-4 w-4" aria-hidden="true" />
            </SocialLink>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} Young10 Marketing. All rights reserved.</p>
          <a
            href="https://young10marketing.com/"
            target="_blank"
            rel="noreferrer noopener"
            className="transition-colors hover:text-white"
          >
            young10marketing.com
          </a>
        </div>
      </div>
    </footer>
  );
}
