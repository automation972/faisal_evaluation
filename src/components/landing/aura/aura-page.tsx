'use client';

// Aura-inspired landing for Young10 Marketing.
// Arrangement follows the "Aura" reference design, rebuilt as a LIGHT theme:
// the fullscreen curly-line background video stays visible across the ENTIRE
// page (fixed canvas, colors untouched as delivered), while every section is
// a floating light glass deck on top of it. All data is fresh Young10
// Marketing agency data (services, growth results, clients, packages).

import { useState } from 'react';
import type { CSSProperties } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  ChevronRight,
  Clapperboard,
  Globe,
  LayoutDashboard,
  Mail,
  Megaphone,
  Menu,
  MonitorSmartphone,
  MoreHorizontal,
  Palette,
  Paperclip,
  Pause,
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { cn } from '@/lib/utils';
import Pricing from './pricing';
import './aura.css';

// Self-hosted copy of the delivered curly-line background video.
// Played as-is: no filters, no color adjustments.
const BG_VIDEO_URL = '/media/aura-bg.mp4';

// Shiny gradient headline treatment — reference stops adapted for the light
// theme over the dark video canvas: white base with the spec's cyan shimmer
const gradientStyle: CSSProperties = {
  backgroundImage:
    'linear-gradient(to right, #ffffff 0%, #d9f2ff 12.5%, #A4F4FD 32.5%, #00d2ff 50%, #d9f2ff 67.5%, #ffffff 87.5%, #ffffff 100%)',
  backgroundSize: '200% auto',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  WebkitTextFillColor: 'transparent',
  filter: 'url(#c3-noise)',
};

const NAV_LINKS = [
  { label: 'Services', href: '#services' },
  { label: 'Results', href: '#results' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
];

const MENU_ITEMS = ['File', 'Edit', 'View', 'Go', 'Window', 'Help'];

// ── Growth Console mockup data — fresh Young10 Marketing dataset ────────────

const SIDE_NAV: { icon: LucideIcon; label: string; count?: number; active?: boolean }[] = [
  { icon: LayoutDashboard, label: 'Overview', active: true },
  { icon: Megaphone, label: 'Campaigns', count: 12 },
  { icon: Palette, label: 'Creatives', count: 28 },
  { icon: Users, label: 'Audiences' },
  { icon: BarChart3, label: 'Reports' },
  { icon: Settings, label: 'Settings' },
];

const CHANNELS = [
  { label: 'Paid search', color: '#00d2ff' },
  { label: 'Paid social', color: '#A4F4FD' },
  { label: 'Email', color: '#f59e0b' },
  { label: 'Organic', color: '#10b981' },
];

const CAMPAIGNS = [
  {
    name: 'Google Ads — Search',
    subject: 'Solar install · Phoenix',
    preview: 'CPL $14.20 — pacing 8% under target this week...',
    time: '9:41 AM',
    unread: true,
    active: true,
  },
  {
    name: 'Meta — Advantage+',
    subject: 'Summer sale push',
    preview: 'ROAS 5.1x — creative set B fatiguing, swap queued...',
    time: '8:12 AM',
    unread: true,
  },
  {
    name: 'TikTok — Spark Ads',
    subject: 'Loop Fitness launch',
    preview: 'CTR 3.8% on the new UGC hook variations...',
    time: 'Yesterday',
  },
  {
    name: 'Email — Lifecycle',
    subject: 'Cart recovery flow',
    preview: '$8,240 attributed revenue in the last 7 days...',
    time: 'Yesterday',
  },
  {
    name: 'SEO — Content',
    subject: 'Best CRMs for agencies',
    preview: 'Climbed to position 2.1 — featured snippet close...',
    time: 'Mon',
  },
  {
    name: 'Landing Page — CRO',
    subject: 'UrbanNest valuation page',
    preview: 'Variant B up +18% conversion after round three...',
    time: 'Mon',
  },
];

const READER_ACTIONS: { icon: LucideIcon; label: string }[] = [
  { icon: Pause, label: 'Pause campaign' },
  { icon: RefreshCw, label: 'Refresh data' },
  { icon: BarChart3, label: 'Open analytics' },
  { icon: MoreHorizontal, label: 'More actions' },
];

const GROWTH_CHIPS = [
  'SEO & content',
  'Google & Meta ads',
  'TikTok & creative',
  'Email & lifecycle',
  'Web & CRO',
  'Attribution',
];

const WEEK_GROUPS = [
  {
    label: 'Launching',
    count: 2,
    dot: '#0B1224',
    items: ['UrbanNest — Google Search go-live', 'Crave Kitchen — TikTok creator batch'],
  },
  {
    label: 'Scaling',
    count: 4,
    dot: '#00d2ff',
    items: ['Loop Fitness — Advantage+ +30% budget', 'Solstice — email flow to 3 sends/week'],
  },
  {
    label: 'Optimizing',
    count: 7,
    dot: '#64748b',
    items: ['Peakline — CPL down 22%', 'Maven Dental — LP A/B round 3'],
  },
  {
    label: 'Reporting',
    count: 1,
    dot: '#94a3b8',
    items: ['Friday — Q3 channel mix review'],
  },
];

const SERVICES: { icon: LucideIcon; title: string; desc: string; tag: string }[] = [
  {
    icon: TrendingUp,
    title: 'SEO & Content Engine',
    desc: 'Keyword-mapped briefs, an editorial calendar that actually ships, and authority links — rankings built to hold.',
    tag: 'Organic growth',
  },
  {
    icon: Target,
    title: 'Paid Media',
    desc: 'Google, Meta, and TikTok managed as one portfolio — budget automatically flows to the best marginal ROAS.',
    tag: 'Full-funnel ads',
  },
  {
    icon: Clapperboard,
    title: 'Social & Creative Studio',
    desc: 'A weekly creative sprint: hooks, UGC, statics, and cutdowns — tested on real audiences, not opinions.',
    tag: 'Weekly sprints',
  },
  {
    icon: MonitorSmartphone,
    title: 'Web Design & CRO',
    desc: 'Fast pages, sharp messaging, and A/B-tested layouts that convert the traffic you already own.',
    tag: 'Design + build',
  },
  {
    icon: Mail,
    title: 'Email & Lifecycle',
    desc: 'Flows, campaigns, and win-backs that print revenue while your ads sleep. Segmented, tested, measured.',
    tag: 'Retention',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Attribution',
    desc: 'Server-side tracking, clean dashboards, and numbers your CFO can trust — every dollar traced to revenue.',
    tag: 'Truth layer',
  },
];

const CLIENTS = [
  'Solstice',
  'Peakline',
  'Maven Dental',
  'UrbanNest',
  'Crave Kitchen',
  'Loop Fitness',
  'Brightpath',
  'NovaAuto',
];

const TESTIMONIALS = [
  {
    quote:
      'Y10 took us from flat to +214% pipeline in two quarters. The weekly reporting alone is worth the retainer.',
    name: 'Dana Whitfield',
    role: 'VP Marketing',
    company: 'UrbanNest Realty',
  },
  {
    quote:
      'Our CPA dropped 38% in the first sixty days. They treat our budget like it is their own money.',
    name: 'Miguel Santos',
    role: 'Founder',
    company: 'Loop Fitness',
  },
  {
    quote:
      'Fastest creative turnaround we have ever seen — and every test actually gets read into the roadmap.',
    name: 'Priya Nair',
    role: 'Head of Growth',
    company: 'Solstice Coffee',
  },
];

const FAQS = [
  {
    q: 'How fast do we see results?',
    a: 'Paid channels show signal in the first 2–3 weeks once tracking is live. SEO and content compound over 3–6 months. Either way, you get a 90-day roadmap with weekly checkpoints on day one.',
  },
  {
    q: 'Do we need to lock into a long contract?',
    a: 'No. Growth and Dominate packages run month to month after an initial 90-day sprint. We keep clients with results, not paperwork — 97% of clients stay past their first year.',
  },
  {
    q: 'Who actually does the work?',
    a: 'A dedicated pod: growth strategist, media buyer, creative lead, and analyst. No junior hand-offs, no account-manager telephone game — you talk directly to the people running your channels.',
  },
  {
    q: 'What do you need from us to start?',
    a: 'Access to your ad accounts, analytics, and brand assets. Your Y10 CRM workspace is provisioned the same day, so leads, campaigns, and reporting live in one place from week one.',
  },
];

const HERO_STATS = [
  { value: '4.2x', label: 'avg. ROAS' },
  { value: '$18M+', label: 'ad spend managed' },
  { value: '250+', label: 'campaigns launched' },
  { value: '97%', label: 'client retention' },
];

function AppleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 384 512" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

function DarkPillButton({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#0B1224] px-5 py-3 text-sm font-medium text-white transition-all hover:bg-[#16203a] active:scale-[0.98]"
    >
      {label}
      <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-[1px]" />
    </button>
  );
}

function SectionEyebrow({ label, tag }: { label: string; tag?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="h-1.5 w-1.5 rounded-full bg-[#0B1224]" />
      <span className="text-xs font-semibold uppercase tracking-widest text-black/60">{label}</span>
      {tag ? (
        <span className="rounded-full border border-black/10 px-2 py-0.5 text-xs text-black/50">{tag}</span>
      ) : null}
    </div>
  );
}

export default function AuraPage({ onOpenCrm }: { onOpenCrm?: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="aura-root relative flex min-h-screen flex-col overflow-x-hidden bg-[#070a12] text-[#0B1224]">
      {/* Root noise filter for the shiny headline */}
      <svg className="pointer-events-none absolute h-0 w-0" aria-hidden="true" focusable="false">
        <defs>
          <filter id="c3-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0"
            />
            <feComposite in2="SourceGraphic" operator="in" result="noise" />
            <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
          </filter>
        </defs>
      </svg>

      {/* Fullscreen looping background video — visible across the WHOLE page.
          Colors kept exactly as delivered (the animated curly line). */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          src={BG_VIDEO_URL}
          className="pointer-events-none h-full w-full object-cover"
        />
        {/* Barely-there veil so light decks read cleanly on top */}
        <div aria-hidden="true" className="absolute inset-0 bg-white/[0.04]" />
      </div>

      {/* Container guide lines (desktop only) */}
      <div className="pointer-events-none fixed inset-y-0 left-1/2 z-[5] hidden w-px -translate-x-[calc(50%+36rem)] bg-white/10 md:block" />
      <div className="pointer-events-none fixed inset-y-0 left-1/2 z-[5] hidden w-px translate-x-[calc(-50%+36rem)] bg-white/10 md:block" />

      {/* ── Floating glass navbar (logo 2x) ─────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-40 px-3 pt-3 md:px-6"
      >
        <div
          className="liquid-glass mx-auto flex h-[104px] max-w-6xl items-center justify-between rounded-full px-4 md:px-8"
          style={{ background: 'rgba(255, 255, 255, 0.78)' }}
        >
          <a href="#" aria-label="Young10 Marketing home" className="flex items-center">
            <Logo variant="light" height={84} />
          </a>

          <div className="hidden items-center gap-7 lg:flex">
            {NAV_LINKS.map((link, i) => (
              <motion.a
                key={link.label}
                href={link.href}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05, duration: 0.5 }}
                className="text-sm font-medium text-black/65 transition-colors hover:text-[#0B1224]"
              >
                {link.label}
              </motion.a>
            ))}
          </div>

          <div className="hidden lg:block">
            <DarkPillButton label="Book a call" onClick={onOpenCrm} />
          </div>

          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/60 text-[#0B1224] lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <AnimatePresence>
          {menuOpen ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-x-4 top-[116px] z-50 rounded-2xl border border-black/10 bg-white p-2 text-[#0B1224] shadow-2xl lg:hidden"
            >
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-black/5"
                >
                  {link.label}
                </a>
              ))}
              <button
                type="button"
                onClick={onOpenCrm}
                className="mt-1 w-full rounded-full bg-[#0B1224] px-4 py-2.5 text-sm font-semibold text-white"
              >
                Book a strategy call
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.nav>

      {/* ── Hero — directly over the video canvas ───────────────── */}
      <section className="relative z-10 flex flex-col items-center px-6 pb-16 pt-10 text-center md:pb-20 md:pt-16">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur-md"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Young10 Marketing — full-funnel growth agency
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 text-4xl font-semibold leading-[0.9] tracking-tight text-white md:text-7xl"
        >
          Marketing that
          <br />
          <span className="animate-shiny inline-block" style={gradientStyle}>
            compounds.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 max-w-md text-base leading-[1.5] text-white/60"
        >
          Y10 plans, launches, and scales your acquisition across SEO, paid media, social, and
          email — every experiment tracked, every dollar accounted for, every week building on the
          last.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-9 flex flex-col items-center gap-3"
        >
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onOpenCrm}
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-[#0B1224] transition-all hover:bg-white/90 active:scale-[0.98]"
            >
              Book a strategy call
              <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-[1px]" />
            </button>
            <a
              href="#services"
              className="inline-flex items-center justify-center gap-1 rounded-full border border-white/25 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Explore services
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>
          <p className="text-xs text-white/40">Free strategy call · 90-day roadmap included</p>
        </motion.div>

        {/* Hero stats — glass chips over the video */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14 grid w-full max-w-4xl grid-cols-2 gap-3 md:grid-cols-4"
        >
          {HERO_STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4 backdrop-blur-md"
            >
              <p className="text-2xl font-semibold tracking-tight text-white md:text-3xl">{stat.value}</p>
              <p className="mt-1 text-xs text-white/55">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Light deck stack — every section floats over the video ── */}
      <main className="relative z-10 flex flex-1 flex-col gap-3 px-3 pb-3 md:gap-4 md:px-6 md:pb-6">
        {/* macOS menu bar strip + Growth Console mockup */}
        <div className="liquid-deck overflow-hidden rounded-[2.5rem] text-[#0B1224]">
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="h-10 border-b border-black/10 bg-white/60"
          >
            <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6 text-xs">
              <div className="flex items-center gap-4 text-[#0B1224]">
                <AppleLogo className="h-3.5 w-3.5" />
                <span className="font-bold">Y10</span>
                {MENU_ITEMS.map((item, i) => (
                  <span
                    key={item}
                    className={cn('text-black/60', i > 2 && 'hidden sm:inline', i > 3 && 'hidden md:inline')}
                  >
                    {item}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-black/60">
                <Search className="h-3.5 w-3.5" />
                <span>Wed May 6 1:09 PM</span>
              </div>
            </div>
          </motion.div>

          <section className="mx-auto max-w-6xl px-6 py-16 md:py-24" aria-label="Y10 Growth Console preview">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-2xl border border-black/10 bg-white/85 shadow-[0_30px_90px_-30px_rgba(11,18,36,0.35)] backdrop-blur-2xl"
            >
              {/* Title bar */}
              <div className="relative flex h-11 items-center border-b border-black/10 bg-white/70 px-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                  <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                  <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                </div>
                <span className="absolute left-1/2 -translate-x-1/2 text-xs text-black/50">
                  Y10 — Growth Console
                </span>
              </div>

              <div className="grid grid-cols-1 md:h-[520px] md:grid-cols-12">
                {/* Sidebar */}
                <aside className="hidden border-r border-black/10 bg-black/[0.03] p-4 md:col-span-3 md:block">
                  <button
                    type="button"
                    onClick={onOpenCrm}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#0B1224] px-3 py-2 text-xs font-semibold text-white"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    New campaign with AI
                  </button>
                  <nav className="mt-4 space-y-1" aria-label="Growth Console sections">
                    {SIDE_NAV.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          className={cn(
                            'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium',
                            item.active ? 'bg-black/[0.08] text-[#0B1224]' : 'text-black/60 hover:bg-black/[0.04]',
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {item.label}
                          {item.count ? <span className="ml-auto text-[10px] text-black/45">{item.count}</span> : null}
                        </div>
                      );
                    })}
                  </nav>
                  <p className="mb-2 mt-5 text-[10px] font-semibold uppercase tracking-widest text-black/40">Channels</p>
                  <div className="space-y-2">
                    {CHANNELS.map((channel) => (
                      <div key={channel.label} className="flex items-center gap-2 text-xs text-black/65">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: channel.color }} />
                        {channel.label}
                      </div>
                    ))}
                  </div>
                </aside>

                {/* Campaign list */}
                <div className="border-b border-black/10 md:col-span-4 md:border-b-0 md:border-r">
                  <div className="flex h-11 items-center gap-2 border-b border-black/10 px-4">
                    <Search className="h-3.5 w-3.5 text-black/40" />
                    <span className="text-xs text-black/40">Search campaigns</span>
                  </div>
                  <div className="aura-slim md:h-[calc(520px-44px)] md:overflow-y-auto">
                    {CAMPAIGNS.map((campaign) => (
                      <div
                        key={campaign.subject}
                        className={cn(
                          'flex items-start gap-2 border-b border-black/5 px-4 py-3',
                          campaign.active ? 'bg-black/[0.06]' : 'hover:bg-black/[0.03]',
                        )}
                      >
                        <span
                          className={cn(
                            'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full',
                            campaign.unread ? 'bg-[#3D81E3]' : 'bg-transparent',
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <span
                              className={cn(
                                'truncate text-xs',
                                campaign.unread ? 'font-semibold text-[#0B1224]' : 'font-medium text-black/75',
                              )}
                            >
                              {campaign.name}
                            </span>
                            <span className="shrink-0 text-[10px] text-black/40">{campaign.time}</span>
                          </div>
                          <p
                            className={cn(
                              'mt-0.5 truncate text-xs',
                              campaign.unread ? 'font-medium text-black/80' : 'text-black/65',
                            )}
                          >
                            {campaign.subject}
                          </p>
                          <p className="mt-0.5 truncate text-[11px] text-black/45">{campaign.preview}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Campaign brief */}
                <div className="md:col-span-5">
                  <div className="flex h-11 items-center gap-1 border-b border-black/10 px-4">
                    {READER_ACTIONS.map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.label}
                          type="button"
                          aria-label={action.label}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-black/60 hover:bg-black/5"
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </button>
                      );
                    })}
                    <span className="ml-auto shrink-0 rounded-full border border-[#3D81E3]/25 bg-[#3D81E3]/10 px-2 py-0.5 text-[10px] font-semibold text-[#3D81E3]">
                      Scaling
                    </span>
                  </div>

                  <div className="aura-slim max-h-[520px] overflow-y-auto px-5 py-4 md:max-h-[calc(520px-44px)]">
                    <h3 className="text-sm font-semibold text-[#0B1224]">Meta — Advantage+ · Summer sale</h3>
                    <div className="mt-3 flex items-center gap-2.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00d2ff] to-[#0B2551] text-[11px] font-bold text-white">
                        S
                      </span>
                      <span className="text-xs font-semibold text-[#0B1224]">Solstice Coffee</span>
                      <span className="text-[11px] text-black/45">campaign · 8:12 AM</span>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {[
                        { k: 'ROAS', v: '5.1x' },
                        { k: 'Spend / wk', v: '$3,480' },
                        { k: 'CPA', v: '$21.40' },
                      ].map((m) => (
                        <div key={m.k} className="rounded-xl border border-black/10 bg-white px-3 py-2.5">
                          <p className="text-[10px] uppercase tracking-wide text-black/45">{m.k}</p>
                          <p className="mt-0.5 text-sm font-semibold text-[#0B1224]">{m.v}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 rounded-xl border border-[#3D81E3]/20 bg-[#3D81E3]/[0.06] p-3.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#3D81E3]">
                        <Sparkles className="h-3.5 w-3.5" />
                        Brief by Y10
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-black/70">
                        Spend is pacing 12% ahead of plan with ROAS holding at 5.1x. Creative set B is
                        fatiguing — swap in the UGC batch tomorrow, cap frequency at 2.4, and shift 15%
                        of budget to retargeting on Thursday.
                      </p>
                    </div>

                    <div className="mt-4 space-y-3 text-xs leading-relaxed text-black/70">
                      <p>Hi Dana,</p>
                      <p>
                        Summer sale is outperforming last year&rsquo;s push by every measure. Day-3 numbers:
                        412 orders attributed, AOV up 9%, and email flow revenue covering the creative
                        production cost twice over.
                      </p>
                      <p>
                        Next week we launch the lookalike seed from your 90-day purchaser list and test
                        the new landing page variant against the current champion.
                      </p>
                      <p className="text-black/50">— Marcus · Growth Strategist, Y10</p>
                    </div>

                    <div className="mb-2 mt-5 inline-flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-xs text-black/70">
                      <Paperclip className="h-3 w-3" />
                      summer-sale-brief-v2.pdf
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>
        </div>

        {/* Full-funnel split */}
        <div className="liquid-deck rounded-[2.5rem] text-[#0B1224]">
          <section className="mx-auto max-w-6xl px-6 py-20 md:py-28" aria-label="Full-funnel marketing">
            <div className="grid items-start gap-10 md:grid-cols-2 md:gap-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <SectionEyebrow label="Full-funnel" tag="One team" />
                <h2 className="mt-5 text-3xl font-semibold leading-[1.02] tracking-tight md:text-5xl">
                  Every channel.
                  <br />
                  One growth engine.
                </h2>
                <p className="mt-6 max-w-md text-base leading-[1.6] text-black/60">
                  Y10 runs your acquisition like a product team runs code: ship weekly, measure
                  everything, double down on what wins and kill what does not — fast.
                </p>
                <div className="mt-7 flex flex-wrap gap-2">
                  {GROWTH_CHIPS.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-black/10 bg-white/60 px-3 py-1.5 text-xs text-black/70"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="liquid-glass rounded-2xl p-5"
              >
                <div className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0B1224]" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-black/60">This week at Y10</span>
                  <span className="text-xs text-black/45">· 14 workstreams live</span>
                </div>
                <div className="mt-4 space-y-3">
                  {WEEK_GROUPS.map((group) => (
                    <div key={group.label} className="liquid-glass rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: group.dot }} />
                        <span className="text-xs font-semibold text-[#0B1224]">{group.label}</span>
                        <span className="text-xs text-black/45">({group.count})</span>
                      </div>
                      <div className="mt-1.5 space-y-0.5">
                        {group.items.map((item) => (
                          <p key={item} className="text-xs text-black/60">
                            {item}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>
        </div>

        {/* Services */}
        <div className="liquid-deck rounded-[2.5rem] text-[#0B1224]" id="services">
          <section className="mx-auto max-w-6xl px-6 py-20 md:py-28" aria-label="Services">
            <div className="max-w-xl">
              <SectionEyebrow label="Services" tag="Pick one or all six" />
              <h2 className="mt-5 text-3xl font-semibold leading-[1.02] tracking-tight md:text-5xl">
                Built to compound,
                <br />
                run as one system.
              </h2>
              <p className="mt-6 text-base leading-[1.6] text-black/60">
                Every service feeds the others: creative fuels ads, ads feed email, email sharpens
                SEO signals. One pod, one roadmap, one weekly report.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICES.map((service, i) => {
                const Icon = service.icon;
                return (
                  <motion.article
                    key={service.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    className="liquid-glass group flex flex-col rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B1224] text-white">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="rounded-full border border-black/10 px-2.5 py-1 text-[11px] font-medium text-black/50">
                        {service.tag}
                      </span>
                    </div>
                    <h3 className="mt-5 text-lg font-semibold tracking-tight">{service.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-[1.6] text-black/60">{service.desc}</p>
                    <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-[#0B1224] transition-transform duration-300 group-hover:translate-x-0.5">
                      Learn more
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </motion.article>
                );
              })}
            </div>
          </section>
        </div>

        {/* Client cloud + results */}
        <div className="liquid-deck rounded-[2.5rem] text-[#0B1224]" id="results">
          <section className="mx-auto max-w-6xl px-6 pb-6 pt-16 md:pt-20" aria-label="Clients">
            <p className="text-center text-xs uppercase tracking-widest text-black/40">
              Trusted by brands that expect growth, not promises
            </p>
            <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-8">
              {CLIENTS.map((client, i) => (
                <motion.span
                  key={client}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  className="text-center text-sm font-semibold tracking-tight text-black/45 transition-colors hover:text-[#0B1224]"
                >
                  {client}
                </motion.span>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-6xl border-t border-black/10 px-6 py-20 md:py-24" aria-label="Testimonials">
            <div className="grid gap-6 md:grid-cols-3">
              {TESTIMONIALS.map((t) => (
                <figure key={t.name} className="liquid-glass rounded-2xl p-6">
                  <blockquote className="text-sm leading-[1.6] text-black/75">&ldquo;{t.quote}&rdquo;</blockquote>
                  <figcaption className="mt-6 border-t border-black/10 pt-5">
                    <p className="text-sm font-semibold text-[#0B1224]">{t.name}</p>
                    <p className="mt-0.5 text-xs text-black/50">{t.role}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#0B1224]">{t.company}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        </div>

        {/* Pricing — Y10 growth packages */}
        <div className="liquid-deck rounded-[2.5rem] text-[#0B1224]">
          <Pricing onChoosePlan={onOpenCrm} />
        </div>

        {/* FAQ */}
        <div className="liquid-deck rounded-[2.5rem] text-[#0B1224]" id="faq">
          <section className="mx-auto max-w-3xl px-6 py-20 md:py-24" aria-label="Frequently asked questions">
            <div className="text-center">
              <SectionEyebrow label="FAQ" />
              <h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-5xl">
                Questions, answered straight.
              </h2>
            </div>
            <div className="mt-12 space-y-3">
              {FAQS.map((faq, i) => {
                const open = openFaq === i;
                return (
                  <div key={faq.q} className="liquid-glass rounded-2xl">
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenFaq(open ? null : i)}
                      className="flex w-full items-center justify-between gap-4 rounded-2xl px-6 py-5 text-left"
                    >
                      <span className="text-sm font-semibold md:text-base">{faq.q}</span>
                      <ChevronRight
                        className={cn(
                          'h-4 w-4 shrink-0 text-black/50 transition-transform duration-300',
                          open && 'rotate-90',
                        )}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {open ? (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <p className="px-6 pb-6 text-sm leading-[1.6] text-black/65">{faq.a}</p>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Final CTA */}
        <div className="liquid-deck rounded-[2.5rem] text-[#0B1224]">
          <section className="mx-auto max-w-6xl px-6 py-20 md:py-28" aria-label="Get started">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-3xl px-8 py-16 text-center md:py-24"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-60"
                style={{
                  background: 'radial-gradient(600px circle at 50% 0%, rgba(61,129,227,0.16), transparent 70%)',
                }}
              />
              <div className="relative">
                <h2 className="text-4xl font-semibold leading-[1.02] tracking-tight md:text-6xl">
                  Stop guessing.
                  <br />
                  Start compounding.
                </h2>
                <p className="mx-auto mt-6 max-w-md text-sm leading-[1.6] text-black/60">
                  Book a free strategy call — we audit your funnel live and hand you a 90-day
                  roadmap, whether you sign with us or not.
                </p>
                <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                  <DarkPillButton label="Book a strategy call" onClick={onOpenCrm} />
                  <a
                    href="#services"
                    className="inline-flex items-center justify-center gap-1 rounded-full border border-black/15 px-5 py-3 text-sm font-medium text-[#0B1224] transition-colors hover:bg-black/5"
                  >
                    See what we run
                    <ChevronRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          </section>
        </div>

        {/* Footer — light glass deck, logo 2x */}
        <footer
          id="contact"
          className="liquid-deck mt-auto rounded-[2.5rem] text-[#0B1224]"
          aria-label="Footer"
        >
          <div className="mx-auto max-w-6xl px-6 pb-10 pt-16 md:pt-20">
            <div className="grid gap-12 md:grid-cols-12">
              <div className="md:col-span-5">
                <Logo variant="light" height={64} />
                <p className="mt-5 max-w-xs text-sm leading-[1.6] text-black/55">
                  Full-funnel digital marketing, engineered for compounding growth. Services,
                  creative, and CRM — one team, one roadmap.
                </p>
                <a
                  href="mailto:hello@young10marketing.com"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#0B1224] underline-offset-4 hover:underline"
                >
                  <Globe className="h-4 w-4" />
                  hello@young10marketing.com
                </a>
              </div>

              <nav className="md:col-span-7" aria-label="Footer links">
                <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-black/40">Services</p>
                    <ul className="mt-4 space-y-2.5 text-sm text-black/65">
                      {['SEO & Content', 'Paid Media', 'Social & Creative', 'Web & CRO', 'Email & Lifecycle'].map(
                        (item) => (
                          <li key={item}>
                            <a href="#services" className="transition-colors hover:text-[#0B1224]">
                              {item}
                            </a>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-black/40">Company</p>
                    <ul className="mt-4 space-y-2.5 text-sm text-black/65">
                      <li>
                        <a href="#results" className="transition-colors hover:text-[#0B1224]">
                          Results
                        </a>
                      </li>
                      <li>
                        <a href="#faq" className="transition-colors hover:text-[#0B1224]">
                          FAQ
                        </a>
                      </li>
                      <li>
                        <a href="#pricing" className="transition-colors hover:text-[#0B1224]">
                          Pricing
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-black/40">Product</p>
                    <ul className="mt-4 space-y-2.5 text-sm text-black/65">
                      <li>
                        <button
                          type="button"
                          onClick={onOpenCrm}
                          className="font-semibold text-[#0B1224] transition-colors hover:opacity-70"
                        >
                          Open Y10 CRM
                        </button>
                      </li>
                      <li>
                        <a href="#pricing" className="transition-colors hover:text-[#0B1224]">
                          Growth packages
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </nav>
            </div>

            <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-black/10 pt-6 text-xs text-black/45 sm:flex-row">
              <p>© {new Date().getFullYear()} Young10 Marketing. All rights reserved.</p>
              <p className="flex items-center gap-4">
                <a href="#" className="transition-colors hover:text-[#0B1224]">
                  Privacy
                </a>
                <a href="#" className="transition-colors hover:text-[#0B1224]">
                  Terms
                </a>
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
