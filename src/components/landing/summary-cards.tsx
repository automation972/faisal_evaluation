// Four capability summary cards mapped to real CRM features (no invented metrics),
// with a small clear glass ornament overlapping the right edge of the row.

'use client';

import { Reveal } from '@/components/landing/reveal';

const CARDS = [
  { label: 'Contacts', value: 'Smart lead profiles', pill: 'Organised' },
  { label: 'Pipeline', value: 'Visual deal stages', pill: 'Drag & drop' },
  { label: 'Follow-ups', value: 'Tasks & reminders', pill: 'On time' },
  { label: 'Reports', value: 'Live performance', pill: 'Real-time' },
];

export function SummaryCards() {
  return (
    <section id="features" aria-label="CRM capabilities" className="relative scroll-mt-24 px-4 pt-10 sm:px-6 lg:px-8 lg:pt-14">
      <div className="relative grid grid-cols-2 gap-3.5 sm:gap-4 lg:grid-cols-4">
        {CARDS.map((card, i) => (
          <Reveal key={card.label} delay={i * 0.06}>
            <div className="card-lift group h-full rounded-[26px] border border-black/4 bg-gradient-to-b from-[#ECEEF3] to-[#E5E7EF] p-5 lg:p-6">
              <div className="flex h-full items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#10111A]/55">
                    {card.label}
                  </p>
                  <p className="mt-3 text-[17px] font-semibold tracking-tight text-[#10111A] lg:text-lg">
                    {card.value}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-[#384BFE] px-2.5 py-1 text-[10px] font-medium text-white transition-transform duration-200 group-hover:scale-105">
                  {card.pill}
                </span>
              </div>
            </div>
          </Reveal>
        ))}

        {/* clear glass ornament overlapping the row's right edge */}
        <div
          className="y10-glass-ornament pointer-events-none absolute -right-3 -top-7 size-14 rounded-full lg:-right-5 lg:-top-9 lg:size-[4.5rem]"
          aria-hidden
        />
      </div>
    </section>
  );
}
