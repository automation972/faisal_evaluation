// Landing header — cinematic glass navbar.
// Transparent over the video hero, frosted dark glass once the page scrolls.
// Animated entrance, glass pill nav, white CTA. Brand lives here.

'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Menu, X } from 'lucide-react';

import { Logo } from '@/components/brand/logo';

const EASE = [0.22, 1, 0.36, 1] as const;

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Contact', href: '#contact' },
];

export function LandingHeader({ onOpenCrm }: { onOpenCrm: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduced = useReducedMotion() ?? false;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={reduced ? undefined : { y: -72, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || menuOpen
          ? 'border-b border-white/10 bg-[#0A0B18]/80 shadow-[0_18px_50px_-24px_rgba(4,6,16,0.9)] backdrop-blur-xl'
          : 'border-b border-transparent bg-gradient-to-b from-[#0A0B18]/55 to-transparent'
      }`}
    >
      <div className="mx-auto flex h-[70px] w-full max-w-[1320px] items-center justify-between gap-4 px-5 sm:px-8">
        {/* brand */}
        <a href="#top" aria-label="Young10 Marketing — home" className="group flex shrink-0 items-center">
          <span className="relative inline-flex items-center">
            {/* soft glow that swells on hover */}
            <span
              className="pointer-events-none absolute -inset-3 rounded-full bg-[#384BFE]/35 opacity-60 blur-xl transition-all duration-500 group-hover:opacity-100"
              aria-hidden
            />
            <Logo
              variant="white"
              height={40}
              className="relative transition-transform duration-300 group-hover:scale-[1.04]"
            />
          </span>
        </a>

        {/* desktop glass pill nav */}
        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 rounded-full border border-white/12 bg-white/[0.07] p-1.5 backdrop-blur-xl md:flex"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-1.5 text-[13px] font-medium text-white/65 transition-all duration-200 hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenCrm}
            className="group hidden items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13px] font-semibold text-[#0B0C1A] shadow-[0_10px_30px_-10px_rgba(255,255,255,0.45)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_14px_34px_-10px_rgba(255,255,255,0.55)] md:inline-flex"
          >
            Open CRM
            <ArrowRight
              className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden
            />
          </button>

          {/* mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="y10-mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="inline-flex size-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.08] text-white backdrop-blur-xl md:hidden"
          >
            {menuOpen ? <X className="size-4.5" aria-hidden /> : <Menu className="size-4.5" aria-hidden />}
          </button>
        </div>
      </div>

      {/* mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="y10-mobile-menu"
            aria-label="Primary mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="overflow-hidden border-t border-white/8 bg-[#0A0B18]/92 backdrop-blur-2xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 pb-5 pt-3">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm font-medium text-white/75 transition-colors hover:bg-white/8 hover:text-white"
                >
                  {link.label}
                </a>
              ))}
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenCrm();
                }}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#0B0C1A]"
              >
                Open CRM
                <ArrowRight className="size-4" aria-hidden />
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
