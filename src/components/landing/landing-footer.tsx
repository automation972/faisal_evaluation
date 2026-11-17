// Landing footer — dark, premium bookend to the cinematic hero.
// Brand + tagline, quick nav, full contact details, giant watermark.

'use client';

import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';

import { Logo } from '@/components/brand/logo';
import { Reveal } from '@/components/landing/reveal';

const NAV = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Back to top', href: '#top' },
];

export function LandingFooter() {
  return (
    <footer
      id="contact"
      className="y10-landing relative mt-auto scroll-mt-24 overflow-hidden bg-[#0A0B18] text-white"
    >
      {/* atmosphere */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            'radial-gradient(38rem 20rem at 12% 0%, rgba(56,75,254,0.16), transparent 62%), radial-gradient(30rem 18rem at 92% 100%, rgba(56,75,254,0.10), transparent 60%)',
        }}
      />
      <span
        className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-[#8FA0FF]/50 to-transparent"
        aria-hidden
      />
      {/* giant watermark */}
      <span
        className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 select-none whitespace-nowrap text-[19vw] font-bold leading-none tracking-[-0.05em] text-white/[0.035]"
        aria-hidden
      >
        YOUNG10
      </span>

      <Reveal className="relative z-10 mx-auto w-full max-w-[1320px] px-5 pb-14 pt-16 sm:px-8 lg:px-12 lg:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr_1fr]">
          {/* brand */}
          <div>
            <a href="#top" aria-label="Young10 Marketing — back to top" className="group w-fit">
              <Logo
                variant="white"
                height={72}
                className="transition-transform duration-300 group-hover:scale-[1.02] md:hidden"
              />
              <Logo
                variant="white"
                height={104}
                className="hidden transition-transform duration-300 group-hover:scale-[1.02] md:inline-block"
              />
            </a>
            <p className="mt-5 max-w-[300px] text-[13.5px] leading-relaxed text-white/50">
              We empower business growth through strategic SEO, marketing and a
              CRM that keeps every relationship moving.
            </p>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="group mt-6 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-white/60 transition-colors hover:text-white"
            >
              Back to top
              <ArrowUpRight className="size-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
            </button>
          </div>

          {/* explore */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
              Explore
            </p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {NAV.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-[13.5px] font-medium text-white/60 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* contact */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
              Contact
            </p>
            <ul className="mt-4 flex flex-col gap-3 text-[13.5px] text-white/60">
              <li>
                <a
                  href="mailto:alex@young10marketing.com"
                  className="inline-flex items-center gap-2.5 transition-colors hover:text-white"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-[#9DABFF]">
                    <Mail className="size-3.5" aria-hidden />
                  </span>
                  alex@young10marketing.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+12708444916"
                  className="inline-flex items-center gap-2.5 transition-colors hover:text-white"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-[#9DABFF]">
                    <Phone className="size-3.5" aria-hidden />
                  </span>
                  +1 270-844-4916
                </a>
              </li>
              <li className="inline-flex items-center gap-2.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-[#9DABFF]">
                  <MapPin className="size-3.5" aria-hidden />
                </span>
                Sheridan, Wyoming
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/8 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-white/40">
            © {new Date().getFullYear()} Young10 Marketing. All rights reserved.
          </p>
          <p className="text-[12px] text-white/40">CRM &amp; Sales Management · Demo workspace</p>
        </div>
      </Reveal>
    </footer>
  );
}
