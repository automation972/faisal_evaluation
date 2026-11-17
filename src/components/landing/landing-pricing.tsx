// Young10 Marketing — landing pricing section
// Cinematic watermark typography + glass plan cards (c3-* classes in globals.css)

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

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
    tier: 'Free',
    monthly: 'Free',
    yearly: 'Free',
    desc: 'For solo founders capturing their very first leads.',
    features: [
      'Track up to 50 leads',
      '1 team seat',
      'Pipeline & task management',
      'Web intake form',
      'Access via web and mobile app',
    ],
  },
  {
    tier: 'Standard',
    monthly: '$9.99/m',
    yearly: '$99.99/y',
    desc: 'For small teams who need more freedom and flexibility.',
    features: [
      'Unlimited leads',
      'Up to 5 team members',
      'Role-based permissions',
      'API intake + webhook relay',
      'AI lead scoring (HOT · WARM · COLD)',
    ],
  },
  {
    tier: 'Pro',
    monthly: '$19.99/m',
    yearly: '$199.99/y',
    desc: 'For agencies and sales teams running serious pipelines.',
    features: [
      'Everything in Standard',
      'Unlimited team members',
      'Analytics & reporting suite',
      'Custom integrations',
      'Priority support',
    ],
    pro: true,
  },
];

export function PricingSection({ onGetStarted }: { onGetStarted?: () => void }) {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="c3-pricing-section">
      {/* Fractal-noise filter for the watermark (distinct id from the hero grain) */}
      <svg aria-hidden="true" className="absolute h-0 w-0">
        <filter id="c3-noise-pricing">
          <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" stitchTiles="stitch" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.075" />
          </feComponentTransfer>
          <feComposite in2="SourceGraphic" operator="in" result="noise" />
          <feBlend in="SourceGraphic" in2="noise" mode="overlay" />
        </filter>
      </svg>

      {/* Giant backdrop headline */}
      <div className="c3-watermark-container">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="c3-watermark-main"
        >
          <span className="c3-watermark-line-1">Your growth.</span>
          <span className="c3-watermark-line-2">Amplified.</span>
        </motion.div>
      </div>

      {/* Plan cards */}
      <div className="c3-grid">
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.tier}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            className={plan.pro ? 'c3-card c3-card-pro' : 'c3-card'}
          >
            <p className="c3-tier-small">{plan.tier}</p>
            <p className="c3-tier-large">{yearly ? plan.yearly : plan.monthly}</p>
            <p className="c3-desc">{plan.desc}</p>
            <ul className="c3-list">
              {plan.features.map((feature) => (
                <li key={feature}>
                  <span className="c3-check" aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6.2 4.8 9 10 3.4"
                        stroke="#fff"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button type="button" className="c3-btn" onClick={onGetStarted}>
              Choose Plan
            </button>
          </motion.div>
        ))}
      </div>

      {/* Billing toggle */}
      <div className="c3-toggle-wrap">
        <span className="text-sm text-white/60">Yearly</span>
        <button
          type="button"
          role="switch"
          aria-checked={yearly}
          aria-label="Toggle yearly billing"
          onClick={() => setYearly((v) => !v)}
          className={yearly ? 'c3-toggle active' : 'c3-toggle'}
        >
          <span className="c3-toggle-knob" />
        </button>
      </div>
      <p className="mt-2 w-full max-w-[1100px] pr-5 text-right text-xs text-white/35 max-lg:pr-0 max-lg:text-center">
        Prices in USD · Cancel anytime
      </p>
    </section>
  );
}
