// Landing header — logo left, quiet centred links, dark pill action right.

'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Menu, X } from 'lucide-react';

import { Logo } from '@/components/brand/logo';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Contact', href: '#contact' },
];

export function LandingHeader({ onOpenCrm }: { onOpenCrm: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative z-40">
      <div className="flex items-center justify-between px-5 py-4 sm:px-8 lg:px-12 lg:py-5">
        <a href="#top" aria-label="Young10 Marketing — home" className="flex shrink-0 items-center">
          <Logo variant="light" height={44} />
        </a>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[13px] font-medium text-[#10111A]/60 transition-colors duration-200 hover:text-[#10111A]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenCrm}
            className="group hidden items-center gap-2 rounded-full bg-[#10111A] px-5 py-2.5 text-[13px] font-medium text-white transition-all duration-200 hover:bg-[#26273A] md:inline-flex"
          >
            Open CRM
            <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
          </button>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="y10-mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="inline-flex size-11 items-center justify-center rounded-full border border-black/8 bg-white/70 text-[#10111A] md:hidden"
          >
            {menuOpen ? <X className="size-4.5" aria-hidden /> : <Menu className="size-4.5" aria-hidden />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="y10-mobile-menu"
            aria-label="Primary mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden border-b border-black/5 px-5 md:hidden"
          >
            <div className="flex flex-col gap-1 pb-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-[#10111A]/70 transition-colors hover:bg-black/4 hover:text-[#10111A]"
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
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#10111A] px-5 py-2.5 text-sm font-medium text-white"
              >
                Open CRM
                <ArrowRight className="size-4" aria-hidden />
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
