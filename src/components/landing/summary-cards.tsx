// Platform section — centred editorial header + four genuinely 3D cards.
// Cards respond to the cursor with a springy perspective tilt, glass shine
// sweep, gradient halo and a floating content layer (translateZ pop).

'use client';

import { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion';
import { BellRing, KanbanSquare, TrendingUp, Users } from 'lucide-react';

import { Reveal } from '@/components/landing/reveal';

const CARDS = [
  { label: 'Contacts', value: 'Smart lead profiles', pill: 'Organised', Icon: Users },
  { label: 'Pipeline', value: 'Visual deal stages', pill: 'Drag & drop', Icon: KanbanSquare },
  { label: 'Follow-ups', value: 'Tasks & reminders', pill: 'On time', Icon: BellRing },
  { label: 'Reports', value: 'Live performance', pill: 'Real-time', Icon: TrendingUp },
];

const MAX_TILT = 9; // degrees

function TiltCard({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 220, damping: 18, mass: 0.6 });
  const springY = useSpring(rotateY, { stiffness: 220, damping: 18, mass: 0.6 });

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * MAX_TILT * 2);
    rotateX.set(-py * MAX_TILT * 2);
  };

  const handleLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <div className="y10-tilt-scene h-full">
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ rotateX: springX, rotateY: springY }}
        className="y10-tilt-card h-full"
      >
        {children}
      </motion.div>
    </div>
  );
}

export function SummaryCards() {
  return (
    <section
      id="features"
      aria-label="CRM capabilities"
      className="relative scroll-mt-24 px-4 pt-14 sm:px-6 lg:px-8 lg:pt-20"
    >
      {/* section header */}
      <Reveal className="mx-auto max-w-[620px] text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#384BFE]/20 bg-[#384BFE]/8 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#2B3AD1]">
          <span className="size-1.5 rounded-full bg-[#384BFE]" aria-hidden />
          The platform
        </span>
        <h2 className="mt-4 text-[clamp(1.7rem,3.2vw,2.4rem)] font-medium leading-[1.14] tracking-[-0.028em] text-[#10111A]">
          One workspace for the{' '}
          <em className="font-[family-name:var(--font-y10-serif)] font-normal italic text-[#384BFE]">
            entire
          </em>{' '}
          sales journey.
        </h2>
        <p className="mx-auto mt-3 max-w-[440px] text-[14px] leading-relaxed text-[#777984]">
          Everything your team touches in a deal — organised into four sharp,
          connected tools.
        </p>
      </Reveal>

      {/* 3D cards */}
      <div className="mx-auto mt-10 grid max-w-[1200px] grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">
        {CARDS.map((card, i) => (
          <Reveal key={card.label} delay={0.08 + i * 0.08} y={30}>
            <TiltCard>
              <div className="y10-card-shine group relative h-full rounded-[26px] border border-black/[0.06] bg-white p-6 shadow-[0_2px_14px_-6px_rgba(23,26,72,0.14)] transition-all duration-300 hover:shadow-[0_28px_56px_-24px_rgba(56,75,254,0.45)]">
                {/* gradient halo edge on hover */}
                <span
                  className="pointer-events-none absolute inset-0 rounded-[26px] opacity-0 ring-1 ring-[#384BFE]/35 transition-opacity duration-300 group-hover:opacity-100"
                  aria-hidden
                />

                <div className="y10-tilt-pop">
                  <div className="flex items-start justify-between">
                    <span className="relative grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-[#5F72FF] to-[#384BFE] text-white shadow-[0_10px_22px_-8px_rgba(56,75,254,0.65)] transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
                      <card.Icon className="size-5" aria-hidden />
                    </span>
                    <span className="rounded-full bg-[#384BFE]/8 px-2.5 py-1 text-[10px] font-semibold text-[#2B3AD1] transition-colors duration-300 group-hover:bg-[#384BFE] group-hover:text-white">
                      {card.pill}
                    </span>
                  </div>

                  <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#10111A]/45">
                    {card.label}
                  </p>
                  <p className="mt-1.5 text-[17px] font-semibold tracking-tight text-[#10111A]">
                    {card.value}
                  </p>

                  {/* quiet progress accent */}
                  <span
                    className="mt-4 block h-1 w-10 rounded-full bg-gradient-to-r from-[#384BFE] to-[#8FA0FF] transition-all duration-500 group-hover:w-full"
                    aria-hidden
                  />
                </div>
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
