// Landing header — executive glass navbar.
// Transparent over the video hero; frosted, slimmer and hairline-bordered once
// the page scrolls. Ghost "Sign in" + brand-gradient CTA cluster, animated
// link states, staggered mobile sheet. Brand lives here.

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
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={reduced ? undefined : { y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, delay: 0.05, ease: EASE }}
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500 ${
        scrolled || menuOpen
          ? 'border-b border-white/[0.08] bg-[#070814]/75 shadow-[0_24px_60px_-30px_rgba(2,4,14,0.95)] backdrop-blur-2xl'
          : 'border-b border-transparent bg-gradient-to-b from-[#070814]/60 via-[#070814]/20 to-transparent'
      }`}
    >
      {/* hairline brand gradient at the very top edge */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#384BFE]/70 to-transparent transition-opacity duration-500 ${
          scrolled ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div
        className={`mx-auto flex w-full max-w-[1280px] items-center justify-between gap-6 px-5 transition-all duration-500 sm:px-8 ${
          scrolled ? 'h-[80px] md:h-[84px]' : 'h-[72px] md:h-[104px]'
        }`}
      >
        {/* brand — statement-size wordmark */}
        <a
          href="#top"
          aria-label="Young10 Marketing — home"
          className="group relative flex shrink-0 items-center"
        >
          <span className="relative inline-flex items-center">
            <span
              aria-hidden
              className="pointer-events-none absolute -inset-4 rounded-full bg-[#384BFE]/30 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
            />
            <Logo
              variant="white"
              height={scrolled ? 48 : 52}
              className="relative transition-[transform,height] duration-500 group-hover:scale-[1.02] md:hidden"
            />
            <Logo
              variant="white"
              height={scrolled ? 64 : 84}
              className="relative hidden transition-[transform,height] duration-500 group-hover:scale-[1.02] md:inline-block"
            />
          </span>
        </a>

        {/* desktop nav — quiet links with animated underline */}
        <nav
          aria-label="Primary"
          className="hidden items-center gap-9 lg:flex"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative py-2 text-[13.5px] font-medium tracking-[0.01em] text-white/60 transition-colors duration-200 hover:text-white"
            >
              {link.label}
              <span
                aria-hidden
                className="absolute inset-x-0 -bottom-px h-px origin-center scale-x-0 rounded-full bg-gradient-to-r from-[#384BFE] to-[#8FA0FF] transition-transform duration-300 ease-out group-hover:scale-x-100"
              />
            </a>
          ))}
        </nav>

        {/* actions — ghost sign-in + gradient CTA */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          <button
            type="button"
            onClick={onOpenCrm}
            className="hidden rounded-full px-3.5 py-2 text-[13.5px] font-medium text-white/70 transition-all duration-200 hover:bg-white/[0.08] hover:text-white sm:inline-flex"
          >
            Sign in
          </button>

          <button
            type="button"
            onClick={onOpenCrm}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-b from-[#4C5EFF] to-[#3243E8] px-4.5 py-2.5 text-[13.5px] font-semibold text-white shadow-[0_10px_28px_-8px_rgba(56,75,254,0.65),inset_0_1px_0_rgba(255,255,255,0.22)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_16px_36px_-8px_rgba(56,75,254,0.8),inset_0_1px_0_rgba(255,255,255,0.22)] sm:px-5"
          >
            {/* top sheen */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.18] to-transparent"
            />
            {/* hover glow ring */}
            <span
              aria-hidden
              className="pointer-events-none absolute -inset-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  'radial-gradient(60% 120% at 50% -20%, rgba(143,160,255,0.5), transparent 70%)',
              }}
            />
            <span className="relative whitespace-nowrap">Get started</span>
            <span className="relative grid size-5 place-items-center rounded-full bg-white/15 transition-transform duration-200 group-hover:translate-x-0.5">
              <ArrowRight className="size-3" aria-hidden />
            </span>
          </button>

          {/* mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="y10-mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="ml-1 inline-flex size-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.07] text-white backdrop-blur-xl transition-colors hover:bg-white/[0.14] md:hidden"
          >
            {menuOpen ? <X className="size-4.5" aria-hidden /> : <Menu className="size-4.5" aria-hidden />}
          </button>
        </div>
      </div>

      {/* mobile sheet menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="y10-mobile-menu"
            aria-label="Primary mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden border-t border-white/[0.07] bg-[#070814]/94 backdrop-blur-2xl md:hidden"
          >
            <div className="flex flex-col px-5 pb-6 pt-2">
              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  initial={reduced ? undefined : { opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.05 + i * 0.06, ease: EASE }}
                  className="flex items-center justify-between border-b border-white/[0.06] py-3.5 text-[15px] font-medium text-white/80 transition-colors last:border-0 hover:text-white"
                >
                  {link.label}
                  <ArrowRight className="size-4 text-white/30" aria-hidden />
                </motion.a>
              ))}
              <motion.button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenCrm();
                }}
                initial={reduced ? undefined : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.26, ease: EASE }}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#4C5EFF] to-[#3243E8] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_28px_-8px_rgba(56,75,254,0.65)]"
              >
                Get started
                <ArrowRight className="size-4" aria-hidden />
              </motion.button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
