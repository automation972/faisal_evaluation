// Young10 Marketing - official logo assets
// logo.png / logo-white.png are the original wordmarks from young10marketing.com
// mark.png is the pinwheel brand symbol (2 blue + 2 ink arms)

'use client';

import Image from 'next/image';

import { cn } from '@/lib/utils';

/**
 * Pinwheel brand symbol.
 */
export function LogoMark({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <Image
      src="/brand/mark.png"
      alt="Young10 Marketing pinwheel mark"
      width={size}
      height={size}
      priority
      className={cn('shrink-0 select-none', className)}
      style={{ width: size, height: size }}
    />
  );
}

/**
 * Full official wordmark: "Young10 MARKETING" with pinwheel.
 * variant "light" = ink "Young" for light surfaces; "white" = white "Young" for dark surfaces.
 */
export function Logo({
  variant = 'light',
  height = 34,
  className,
}: {
  variant?: 'light' | 'white';
  height?: number;
  className?: string;
}) {
  const width = Math.round(height * (395 / 176));
  return (
    <Image
      src={variant === 'light' ? '/brand/logo.png' : '/brand/logo-white.png'}
      alt="Young10 Marketing"
      width={width}
      height={height}
      priority
      className={cn('shrink-0 select-none', className)}
      style={{ width: width, height: 'auto' }}
    />
  );
}
