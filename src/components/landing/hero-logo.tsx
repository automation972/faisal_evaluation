// HeroLogo — the Young10 Marketing wordmark, presented very large in the hero.
// - Gentle floating motion
// - Glitter: staggered twinkling sparkles + a light sweep that follows the
//   letterforms (masked brightness copy)
// - Hover: the logo smoothly shifts its colour (blue -> violet family) and
//   gains a stronger glow
// - Respects prefers-reduced-motion

'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';

const SPARKLES = [
  { left: '2%', top: '12%', size: 20, delay: 0.1, duration: 2.9, tone: '#384BFE' },
  { left: '30%', top: '-2%', size: 13, delay: 0.9, duration: 3.3, tone: '#8FA0FF' },
  { left: '71%', top: '4%', size: 17, delay: 1.5, duration: 2.7, tone: '#384BFE' },
  { left: '97%', top: '30%', size: 22, delay: 0.5, duration: 3.5, tone: '#7C8FFF' },
  { left: '88%', top: '82%', size: 14, delay: 2.1, duration: 3.1, tone: '#384BFE' },
  { left: '52%', top: '96%', size: 15, delay: 1.2, duration: 2.8, tone: '#8FA0FF' },
  { left: '9%', top: '88%', size: 12, delay: 2.6, duration: 3.4, tone: '#7C8FFF' },
] as const;

function Sparkle({
  left,
  top,
  size,
  delay,
  duration,
  tone,
  reducedMotion,
}: (typeof SPARKLES)[number] & { reducedMotion: boolean }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      aria-hidden
      className="pointer-events-none absolute z-20"
      style={{ left, top, width: size, height: size }}
      animate={
        reducedMotion
          ? { opacity: 0.5, scale: 1, rotate: 0 }
          : { opacity: [0, 1, 0.25, 1, 0], scale: [0.35, 1, 0.7, 1.15, 0.35], rotate: [0, 90, 180] }
      }
      transition={
        reducedMotion
          ? { duration: 0 }
          : { duration, delay, repeat: Infinity, ease: 'easeInOut' }
      }
    >
      <path
        d="M12 0c.9 5.9 2.4 8.6 4.9 10.3C19 11.7 21.5 12 24 12c-2.5 0-5 .3-7.1 1.7-2.5 1.7-4 4.4-4.9 10.3-.9-5.9-2.4-8.6-4.9-10.3C5 12.3 2.5 12 0 12c2.5 0 5-.3 7.1-1.7C9.6 8.6 11.1 5.9 12 0Z"
        fill={tone}
      />
    </motion.svg>
  );
}

export function HeroLogo() {
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.9, y: 28 }}
      animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-[300px] sm:w-[420px] lg:w-[540px] xl:w-[600px]"
    >
      <motion.div
        animate={reducedMotion ? undefined : { y: [0, -13, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="group relative"
      >
        {/* soft blue glow backdrop — intensifies on hover */}
        <div
          className="absolute -inset-x-8 -inset-y-10 rounded-[48px] opacity-70 blur-2xl transition-opacity duration-700 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(55% 55% at 50% 45%, rgba(56,75,254,0.20), rgba(56,75,254,0.07) 55%, transparent 75%)',
          }}
          aria-hidden
        />

        {/* logo + shimmer sweep */}
        <div className="relative">
          <Image
            src="/brand/logo.png"
            alt="Young10 Marketing"
            width={600}
            height={267}
            priority
            className="relative z-10 block h-auto w-full cursor-pointer select-none transition-all duration-700 ease-out group-hover:scale-[1.02] group-hover:[filter:hue-rotate(62deg)_saturate(1.18)_drop-shadow(0_16px_38px_rgba(56,75,254,0.4))]"
          />
          {/* masked brightness copy — a light band sweeps across the letterforms only */}
          {!reducedMotion && (
            <Image
              src="/brand/logo.png"
              alt=""
              aria-hidden
              width={600}
              height={267}
              priority
              className="y10-logo-shimmer absolute inset-0 z-20 block h-auto w-full"
            />
          )}
        </div>

        {/* glitter sparkles */}
        {SPARKLES.map((s) => (
          <Sparkle key={`${s.left}-${s.top}`} {...s} reducedMotion={reducedMotion} />
        ))}
      </motion.div>
    </motion.div>
  );
}
