// HeroLogo — the official Young10 Marketing wordmark, very large in the hero.
// Clean and premium: soft blue glow, gentle float, subtle hover response
// (slight lift + smooth colour shift). No glitter clutter.

'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';

export function HeroLogo() {
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 26, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-[300px] sm:w-[400px] lg:w-[500px] xl:w-[560px]"
    >
      <motion.div
        animate={reducedMotion ? undefined : { y: [0, -11, 0] }}
        transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
        className="group relative"
      >
        {/* soft glow */}
        <div
          className="y10-logo-glow absolute -inset-x-10 -inset-y-12 rounded-[64px] opacity-75 transition-opacity duration-700 group-hover:opacity-100"
          aria-hidden
        />

        <Image
          src="/brand/logo.png"
          alt="Young10 Marketing"
          width={600}
          height={267}
          priority
          className="relative z-10 block h-auto w-full select-none transition-all duration-700 ease-out group-hover:scale-[1.02] group-hover:[filter:hue-rotate(50deg)_saturate(1.12)]"
        />
      </motion.div>
    </motion.div>
  );
}
