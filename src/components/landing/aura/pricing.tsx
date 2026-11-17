'use client';

// Pricing — cinematic typography section (light theme, Y10 Marketing growth packages).

import { useState } from 'react';

import { cn } from '@/lib/utils';

type Plan = {
  tier: string;
  monthly: string;
  yearly: string;
  desc: string;
  features: string[];
  pro?: boolean;
};

const PLANS: Plan[] = [
  {
    tier: 'Launch',
    monthly: '$1,450/m',
    yearly: '$14,500/y',
    desc: 'For businesses getting their first real acquisition engine off the ground.',
    features: [
      '1 core channel managed',
      'Landing page & CRO basics',
      'Monthly growth report',
      'Email support',
      'Y10 CRM starter workspace',
    ],
  },
  {
    tier: 'Growth',
    monthly: '$2,900/m',
    yearly: '$29,000/y',
    desc: 'For teams ready to scale what already works across multiple channels.',
    features: [
      '3 channels managed',
      'SEO & content engine included',
      'Weekly creative iterations',
      'Conversion tracking & dashboards',
      'Dedicated growth strategist',
    ],
    pro: true,
  },
  {
    tier: 'Dominate',
    monthly: '$5,800/m',
    yearly: '$58,000/y',
    desc: 'For brands going all-in on full-funnel market leadership.',
    features: [
      'Full-funnel management',
      'Omnichannel paid media (Google, Meta, TikTok)',
      'CRO & landing page sprints',
      'Weekly strategy calls',
      'Priority support & quarterly planning',
    ],
  },
];

export default function Pricing({ onChoosePlan }: { onChoosePlan?: () => void }) {
  const [yearly, setYearly] = useState(false);

  return (
    <section className="c3-pricing-section" id="pricing">
      {/* Fractal noise for the giant watermark (per spec, id c3-noise) */}
      <svg className="pointer-events-none absolute h-0 w-0" aria-hidden="true" focusable="false">
        <defs>
          <filter id="c3-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" stitchTiles="stitch" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.075" />
            </feComponentTransfer>
            <feComposite in2="SourceGraphic" operator="in" result="noise" />
            <feBlend in="SourceGraphic" in2="noise" mode="overlay" />
          </filter>
        </defs>
      </svg>

      {/* Giant hero headline watermark */}
      <div className="c3-watermark-container">
        <div className="c3-watermark-main">
          <span className="c3-watermark-line-1">Your growth.</span>
          <span className="c3-watermark-line-2">Compounding</span>
        </div>
      </div>

      <div className="c3-grid">
        {PLANS.map((plan) => (
          <div key={plan.tier} className={cn('c3-card', plan.pro && 'c3-card-pro')}>
            <p className="c3-tier-small">{plan.tier}</p>
            <p className="c3-tier-large">{yearly ? plan.yearly : plan.monthly}</p>
            <p className="c3-desc">{plan.desc}</p>
            <ul className="c3-list">
              {plan.features.map((feature) => (
                <li key={feature}>
                  <span className="c3-check" aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#0B1224"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3.5 w-3.5"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
            <button type="button" className="c3-btn" onClick={onChoosePlan}>
              Book a strategy call
            </button>
          </div>
        ))}
      </div>

      <div className="c3-toggle-wrap">
        <span className="text-sm text-black/60">Yearly (2 months free)</span>
        <button
          type="button"
          role="switch"
          aria-checked={yearly}
          aria-label="Toggle yearly pricing"
          className={cn('c3-toggle', yearly && 'active')}
          onClick={() => setYearly((v) => !v)}
        >
          <span className="c3-toggle-knob" />
        </button>
      </div>
    </section>
  );
}
