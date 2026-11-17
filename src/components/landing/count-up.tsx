// CountUp — animates a number from 0 to `to` when it scrolls into view.
// Respects prefers-reduced-motion (renders the final value immediately).

'use client';

import { useEffect, useRef } from 'react';
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1] as const;

export function CountUp({
  to,
  duration = 1.5,
  delay = 0.15,
  format,
  className,
}: {
  to: number;
  duration?: number;
  delay?: number;
  format?: (v: number) => string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const reduced = useReducedMotion() ?? false;
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) =>
    format ? format(v) : `${Math.round(v)}`,
  );

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      motionValue.set(to);
      return;
    }
    const controls = animate(motionValue, to, { duration, delay, ease: EASE });
    return () => controls.stop();
  }, [inView, reduced, motionValue, to, duration, delay]);

  return (
    <motion.span ref={ref} className={className}>
      {rounded}
    </motion.span>
  );
}
