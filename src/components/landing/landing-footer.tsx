// Minimal landing footer — brand, real contact details, copyright.

'use client';

import { MapPin, Phone } from 'lucide-react';

import { Logo } from '@/components/brand/logo';

export function LandingFooter() {
  return (
    <footer id="contact" className="mt-auto scroll-mt-24 border-t border-black/5">
      <div className="flex flex-col gap-6 px-5 py-7 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12 lg:py-8">
        <div className="flex flex-col gap-2">
          <a href="#top" aria-label="Young10 Marketing — back to top" className="w-fit">
            <Logo variant="light" height={26} />
          </a>
          <p className="text-[12px] text-[#777984]">We empower business growth through strategic SEO.</p>
        </div>

        <div className="flex flex-col gap-2 text-[12px] text-[#777984] lg:items-end">
          <a href="mailto:alex@young10marketing.com" className="w-fit transition-colors hover:text-[#10111A]">
            alex@young10marketing.com
          </a>
          <a href="tel:+12708444916" className="inline-flex w-fit items-center gap-1.5 transition-colors hover:text-[#10111A]">
            <Phone className="size-3" aria-hidden />
            +1 270-844-4916
          </a>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-3" aria-hidden />
            Sheridan, Wyoming
          </span>
        </div>
      </div>

      <div className="border-t border-black/5 px-5 py-4 sm:px-8 lg:px-12">
        <p className="text-[11px] text-[#777984]">
          © {new Date().getFullYear()} Young10 Marketing. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
