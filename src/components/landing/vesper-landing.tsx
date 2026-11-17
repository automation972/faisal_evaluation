// Young10 Marketing — single-viewport landing (Vesper.ai spec port)
// Pure black canvas, hero video at 100% opacity, liquid-metal nav pills,
// masked headline reveal, choreographed entrance, stats footer.
// Brand accent: Young10 blue #384BFE. Content: real Young10 Marketing copy.

'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Inter, Instrument_Serif } from 'next/font/google';

import './vesper-landing.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-y10-ui',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  weight: '400',
  style: 'italic',
  subsets: ['latin'],
  variable: '--font-y10-serif',
  display: 'swap',
});

const HERO_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260818_072341_50851634-bbc3-4c33-9acc-7647d4db44aa.mp4';

// H.264 companion from the same Young10 CloudFront account — automatic fallback
// for browsers that cannot decode the primary HEVC file (e.g. some Chromium builds).
const HERO_VIDEO_FALLBACK =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_064122_c4750c0e-7476-4b44-94a2-a85a65c63bf2.mp4';

const CONTACT_EMAIL = 'alex@young10marketing.com';

const NAV_LINKS = [
  { label: 'Services', href: '#services', mod: 'appear--scale', d: '0.16s' },
  { label: 'Results', href: '#results', mod: 'appear--soft', d: '0.28s' },
  { label: 'About', href: '#about', mod: 'appear--scale', d: '0.4s' },
  { label: 'Contact', href: `mailto:${CONTACT_EMAIL}`, mod: 'appear--soft', d: '0.52s' },
] as const;

/** Entrance delay helper (consumed by CSS via --d). */
const d = (value: string) => ({ '--d': value }) as unknown as CSSProperties;

/* --------------------------------- icons ---------------------------------- */

function SparkleIcon() {
  return (
    <svg className="badge-star" width="18" height="20" viewBox="0 0 24 24" fill="#ffffff" aria-hidden="true">
      <path d="M12 2.6C12.55 2.6 12.88 3.15 13.08 4.7c.62 4.7 1.52 5.6 6.22 6.22 1.55.2 2.1.53 2.1 1.08s-.55.88-2.1 1.08c-4.7.62-5.6 1.52-6.22 6.22-.2 1.55-.53 2.1-1.08 2.1s-.88-.55-1.08-2.1c-.62-4.7-1.52-5.6-6.22-6.22C3.15 12.88 2.6 12.55 2.6 12s.55-.88 2.1-1.08c4.7-.62 5.6-1.52 6.22-6.22C11.12 3.15 11.45 2.6 12 2.6Z" />
    </svg>
  );
}

function WorkflowIcon() {
  return (
    <svg className="stat-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="y10v-g1" x1="3" y1="2" x2="14" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" stopOpacity="0.38" />
          <stop offset="1" stopColor="#3a3a3a" stopOpacity="0.62" />
        </linearGradient>
        <linearGradient id="y10v-g2" x1="3" y1="2" x2="14" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3a3a3a" stopOpacity="0.38" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.62" />
        </linearGradient>
      </defs>
      <rect x="3.4" y="2.6" width="7.2" height="18.8" rx="3.6" fill="url(#y10v-g1)" />
      <rect x="13.4" y="2.6" width="7.2" height="18.8" rx="3.6" fill="url(#y10v-g2)" />
      <rect x="9.2" y="10.9" width="5.6" height="2.2" rx="1.1" fill="#4a4a4a" />
    </svg>
  );
}

function DownloadTileIcon() {
  return (
    <svg className="stat-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2.4" y="2.4" width="19.2" height="19.2" rx="6.2" fill="#ffffff" />
      <path d="M12 7.1v7.4" stroke="#111111" strokeWidth="1.85" strokeLinecap="round" />
      <path d="M8.15 12.35L12 16.2l3.85-3.85" stroke="#111111" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AvatarsIcon() {
  return (
    <svg className="stat-icon-wide" viewBox="0 0 40 22" fill="none" aria-hidden="true">
      {/* dark bot */}
      <circle cx="10.2" cy="11" r="9.2" fill="#2b2b2b" />
      <ellipse cx="10.2" cy="12.1" rx="4.15" ry="3.7" fill="#f4f4f4" />
      <path d="M6.3 10.1 L8.2 11.15 L6.3 12.2 Z" fill="#1a1a1a" />
      <path d="M14.1 10.1 L12.2 11.15 L14.1 12.2 Z" fill="#1a1a1a" />
      <circle cx="8.9" cy="11.4" r="0.7" fill="#1a1a1a" />
      <circle cx="11.5" cy="11.4" r="0.7" fill="#1a1a1a" />
      {/* white smiley */}
      <circle cx="20.2" cy="11" r="9.2" fill="#ffffff" />
      <circle cx="17.7" cy="9.3" r="1.7" fill="#111111" />
      <circle cx="22.7" cy="9.3" r="1.7" fill="#111111" />
      <ellipse cx="20.2" cy="11.9" rx="1.5" ry="1.05" fill="#dcdcdc" />
      <path d="M17.3 13.7 Q20.2 16.5 23.1 13.7" stroke="#111111" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      {/* Young10 blue */}
      <circle cx="30.2" cy="11" r="9.2" fill="#384BFE" />
      <text
        x="30.2"
        y="15.1"
        textAnchor="middle"
        fontSize="12.5"
        fontWeight="700"
        fill="#ffffff"
        fontFamily="Inter, system-ui, sans-serif"
      >
        y
      </text>
    </svg>
  );
}

/* ------------------------------ the landing -------------------------------- */

export function LandingPage({ onSignIn }: { onSignIn: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Animation lifecycle: is-in on each animationend + fallback after two rAFs.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    document.documentElement.classList.add('y10v-on');
    document.body.classList.add('y10v-on');

    const onAnimEnd = (event: AnimationEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target || !target.classList) return;
      if (target.classList.contains('appear') || target.classList.contains('hero-photo')) {
        target.classList.add('is-in');
      }
    };
    document.addEventListener('animationend', onAnimEnd);

    let rafOuter = 0;
    let rafInner = 0;
    rafOuter = requestAnimationFrame(() => {
      rafInner = requestAnimationFrame(() => {
        let active = true;
        try {
          const anims = typeof document.getAnimations === 'function' ? document.getAnimations() : [];
          active = anims.some((a) => a.playState === 'running' || a.playState === 'finished');
        } catch {
          active = true;
        }
        if (!active) {
          root.querySelectorAll('.appear, .hero-photo').forEach((el) => el.classList.add('is-in'));
        }
      });
    });

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);

    const desktopMq = window.matchMedia('(min-width: 901px)');
    const onResize = () => {
      if (desktopMq.matches) setMenuOpen(false);
    };
    window.addEventListener('resize', onResize);

    return () => {
      document.removeEventListener('animationend', onAnimEnd);
      cancelAnimationFrame(rafOuter);
      cancelAnimationFrame(rafInner);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      document.documentElement.classList.remove('y10v-on');
      document.body.classList.remove('y10v-on');
      document.body.classList.remove('menu-open');
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div
      ref={rootRef}
      className={`y10v-root ${inter.variable} ${instrumentSerif.variable}${menuOpen ? ' menu-open' : ''}`}
      style={{ background: '#000000', color: '#ffffff' }}
    >
      <div className="grain" aria-hidden="true" />

      {/* Hero video background — 100% opacity, no color overlay.
          Primary: user's HEVC master. Fallback: H.264 encode for Chromium builds
          without HEVC support. The browser picks the first decodable source. */}
      <div className="hero-photo" aria-hidden="true">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          ref={(el) => {
            if (el) el.muted = true;
          }}
        >
          <source src={HERO_VIDEO} type='video/mp4; codecs="hvc1"' />
          <source src={HERO_VIDEO_FALLBACK} type="video/mp4" />
        </video>
      </div>

      <div className="page">
        <div className="menu-backdrop" aria-hidden="true" onClick={closeMenu} />

        <header className="header">
          <a className="logo appear appear--scale" style={d('0.08s')} href="#top" aria-label="Young10 Marketing">
            <img src="/brand/logo-white.png" alt="Young10 Marketing" width={80} height={36} />
          </a>

          <nav id="site-nav" className="site-nav" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                className={`nav-link appear ${link.mod}`}
                style={d(link.d)}
                href={link.href}
                onClick={closeMenu}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="header-right">
            <button
              type="button"
              className="btn btn-solid header-cta appear appear--scale"
              style={d('0.34s')}
              onClick={onSignIn}
            >
              Get Started
            </button>
            <button
              type="button"
              className="burger appear appear--scale"
              style={d('0.34s')}
              aria-controls="site-nav"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </header>

        <main className="hero" id="top">
          <div className="hero-copy">
            <div className="badge appear appear--pop" style={d('0.22s')}>
              <SparkleIcon />
              Digital Marketing Agency
            </div>

            <h1>
              <span className="headline-line">
                <span className="headline-inner appear appear--mask" style={d('0.42s')}>
                  We empower business growth
                </span>
              </span>
              <span className="headline-line">
                <span className="headline-inner appear appear--mask" style={d('0.62s')}>
                  through <em>strategic SEO</em>.
                </span>
              </span>
            </h1>

            <p className="lede appear appear--soft" style={d('0.82s')}>
              Technical SEO, paid media, and content systems that turn traffic into measurable revenue.
            </p>

            <div className="hero-actions">
              <button type="button" className="btn btn-solid appear appear--btn" style={d('0.96s')} onClick={onSignIn}>
                Get Started Free
              </button>
              <a
                className="btn btn-ghost appear appear--side"
                style={d('1.1s')}
                href={`mailto:${CONTACT_EMAIL}?subject=Free%20Growth%20Audit`}
              >
                Book a Free Audit
              </a>
            </div>
          </div>
        </main>

        <footer className="stats">
          <div className="stat appear appear--stat" style={d('1.12s')}>
            <WorkflowIcon />
            4.2x average client ROAS
          </div>
          <div className="stat appear appear--stat" style={d('1.28s')}>
            <DownloadTileIcon />
            126+ qualified leads every month
          </div>
          <div className="stat appear appear--stat" style={d('1.44s')}>
            <AvatarsIcon />
            96% client retention rate
          </div>
        </footer>
      </div>
    </div>
  );
}
