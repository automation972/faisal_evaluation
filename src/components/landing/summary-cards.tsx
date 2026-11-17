// Four capability cards — clean, minimal, premium. Soft staggered reveal,
// quiet blue icons, hover lift. No invented metrics.

'use client';

import { BellRing, KanbanSquare, TrendingUp, Users } from 'lucide-react';

import { Reveal } from '@/components/landing/reveal';

const CARDS = [
  { label: 'Contacts', value: 'Smart lead profiles', pill: 'Organised', Icon: Users },
  { label: 'Pipeline', value: 'Visual deal stages', pill: 'Drag & drop', Icon: KanbanSquare },
  { label: 'Follow-ups', value: 'Tasks & reminders', pill: 'On time', Icon: BellRing },
  { label: 'Reports', value: 'Live performance', pill: 'Real-time', Icon: TrendingUp },
];

export function SummaryCards() {
  return (
    <section id="features" aria-label="CRM capabilities" className="relative scroll-mt-24 px-4 pt-8 sm:px-6 lg:px-8 lg:pt-12">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((card, i) => (
          <Reveal key={card.label} delay={i * 0.07} y={22}>
            <div className="group h-full rounded-[24px] border border-black/5 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(31,34,78,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-[#384BFE]/20 hover:shadow-[0_20px_40px_-20px_rgba(56,75,254,0.35)] lg:p-6">
              <div className="flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-2xl bg-[#384BFE]/8 text-[#384BFE] transition-colors duration-300 group-hover:bg-[#384BFE] group-hover:text-white">
                  <card.Icon className="size-5" aria-hidden />
                </span>
                <span className="rounded-full bg-[#384BFE]/8 px-2.5 py-1 text-[10px] font-medium text-[#2B3AD1] transition-colors duration-300 group-hover:bg-[#384BFE] group-hover:text-white">
                  {card.pill}
                </span>
              </div>
              <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#10111A]/50">
                {card.label}
              </p>
              <p className="mt-1.5 text-[16px] font-semibold tracking-tight text-[#10111A] lg:text-[17px]">
                {card.value}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
