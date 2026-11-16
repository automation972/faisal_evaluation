// Young10 Marketing brand mark - pinwheel recreated from the company icon
// (extracted brand colors: blue #384BFE, ink #1E1B1C)

import { cn } from '@/lib/utils';

export function LogoMark({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={cn('shrink-0', className)}
      role="img"
      aria-label="Young10 Marketing logo"
    >
      <g>
        <g transform="rotate(-45 50 50)">
          <rect x="55" y="43.5" width="32" height="13" rx="2.5" fill="#384BFE" />
        </g>
        <g transform="rotate(135 50 50)">
          <rect x="55" y="43.5" width="32" height="13" rx="2.5" fill="#384BFE" />
        </g>
        <g transform="rotate(45 50 50)">
          <rect x="55" y="43.5" width="32" height="13" rx="2.5" fill="#1E1B1C" />
        </g>
        <g transform="rotate(225 50 50)">
          <rect x="55" y="43.5" width="32" height="13" rx="2.5" fill="#1E1B1C" />
        </g>
        <rect x="45.75" y="45.75" width="8.5" height="8.5" rx="1.5" transform="rotate(45 50 50)" fill="#ffffff" />
      </g>
    </svg>
  );
}

/**
 * Full logo: pinwheel mark + wordmark.
 * variant "light" = ink text for light surfaces; "white" = white text for dark surfaces.
 */
export function Logo({
  variant = 'light',
  size = 34,
  className,
}: {
  variant?: 'light' | 'white';
  size?: number;
  className?: string;
}) {
  const primary = variant === 'light' ? '#101223' : '#FFFFFF';
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark size={size} />
      <span
        className="font-bold leading-none tracking-tight"
        style={{ color: primary, fontSize: size * 0.62 }}
      >
        Young<span style={{ color: '#384BFE' }}>10</span>
        <span
          className="font-medium"
          style={{
            color: variant === 'light' ? '#7A7A7A' : '#9EA0BC',
            fontSize: size * 0.5,
            marginLeft: size * 0.18,
          }}
        >
          Marketing
        </span>
      </span>
    </span>
  );
}
