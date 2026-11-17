// HeroScene — lazy wrapper around the R3F hero canvas.
// - Detects WebGL availability and renders a faithful CSS composition when absent.
// - Reserves layout space (skeleton) while the 3D chunk loads.
// - Pauses rendering while the canvas is off-screen.
// - Decorative: excluded from the accessibility tree.

'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { useReducedMotion } from 'framer-motion';

let cachedWebgl: boolean | null = null;

function webglAvailable(): boolean {
  if (cachedWebgl !== null) return cachedWebgl;
  try {
    const canvas = document.createElement('canvas');
    cachedWebgl = Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl2') || canvas.getContext('webgl')),
    );
  } catch {
    cachedWebgl = false;
  }
  return cachedWebgl;
}

const emptySubscribe = () => () => {};
const webglServerSnapshot = () => null;

function useOnScreen<T extends HTMLElement>(rootMargin = '120px') {
  const ref = useRef<T>(null);
  const [onScreen, setOnScreen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return { ref, onScreen };
}

function SceneSkeleton() {
  return (
    <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
      <div className="y10-fallback-dish h-[30%] w-[62%] rounded-[50%] opacity-70" />
    </div>
  );
}

const HeroSceneCanvas = dynamic(() => import('./hero-scene-canvas'), {
  ssr: false,
  loading: () => <SceneSkeleton />,
});

/* ------------------------------------------------------------------ */
/* Static CSS fallback composition (no WebGL)                          */
/* ------------------------------------------------------------------ */

function FallbackBar({ className, tint }: { className: string; tint: string }) {
  return (
    <div className={`absolute rounded-t-full ${className}`} style={{ background: tint }}>
      <div className="y10-fallback-wall absolute inset-0 rounded-t-full" aria-hidden />
    </div>
  );
}

function FallbackTile({ className, children }: { className: string; children?: ReactNode }) {
  return (
    <div
      className={`absolute rounded-[22%] border border-white/50 bg-white/40 shadow-[0_18px_36px_-14px_rgba(31,34,78,0.4)] backdrop-blur-md ${className}`}
    >
      {children}
    </div>
  );
}

function StaticFallback() {
  return (
    <div className="absolute inset-0" aria-hidden>
      {/* dark tile, left */}
      <FallbackTile className="left-[4%] top-[16%] h-[19%] w-[15%] rotate-[-8deg] !bg-[#191A2E]/85">
        <div className="absolute left-[22%] top-[24%] size-[26%] rounded-[28%] bg-[#F2A0B6]" />
        <div className="absolute bottom-[22%] right-[20%] size-[22%] rounded-[28%] bg-[#A9E8C6]" />
      </FallbackTile>
      {/* clear tile, upper centre-left */}
      <FallbackTile className="left-[26%] top-[4%] h-[24%] w-[21%] rotate-[3deg]">
        <div className="absolute bottom-[20%] left-[20%] size-[30%] rounded-[28%] bg-[#A9E8C6]" />
        <div className="absolute right-[18%] top-[20%] size-[24%] rounded-[28%] bg-[#7563F4]" />
      </FallbackTile>
      {/* clear tile with trend, upper right */}
      <FallbackTile className="right-[30%] top-[0%] h-[17%] w-[14%] rotate-[-5deg]">
        <div className="absolute bottom-[24%] left-[18%] h-[34%] w-[10%] rounded bg-[#7563F4]" />
        <div className="absolute bottom-[24%] left-[36%] h-[48%] w-[10%] rounded bg-[#8A7CFF]" />
        <div className="absolute bottom-[24%] left-[54%] h-[62%] w-[10%] rounded bg-[#7563F4]" />
      </FallbackTile>
      {/* large clear tile, far right */}
      <FallbackTile className="right-[1%] top-[18%] h-[23%] w-[20%] rotate-[7deg]">
        <div className="absolute left-[20%] top-[22%] size-[28%] rounded-[28%] bg-[#F2A0B6]" />
        <div className="absolute bottom-[20%] right-[20%] size-[26%] rounded-[28%] bg-[#F2CF9B]" />
      </FallbackTile>

      {/* cylinders + dish */}
      <div className="absolute bottom-[6%] left-1/2 h-[74%] w-[74%] -translate-x-1/2">
        <FallbackBar tint="linear-gradient(180deg, rgba(117,99,244,0.75), rgba(117,99,244,0.45))" className="bottom-[6%] left-[16%] h-[52%] w-[14%]" />
        <FallbackBar tint="linear-gradient(180deg, rgba(138,124,255,0.7), rgba(138,124,255,0.4))" className="bottom-[2%] left-[34%] h-[34%] w-[11%]" />
        <FallbackBar tint="linear-gradient(180deg, rgba(79,200,216,0.7), rgba(79,200,216,0.4))" className="bottom-[8%] left-[50%] h-[44%] w-[13%]" />
        <FallbackBar tint="linear-gradient(180deg, rgba(255,255,255,0.75), rgba(231,233,255,0.4))" className="bottom-[14%] left-[66%] h-[68%] w-[15%]" />
        {/* glass dish */}
        <div className="absolute bottom-[0%] left-1/2 h-[16%] w-[104%] -translate-x-1/2">
          <div className="y10-fallback-wall absolute inset-x-0 top-[-58%] h-[130%] rounded-[50%]" />
          <div className="y10-fallback-dish absolute inset-0 rounded-[50%]" />
          <div className="absolute bottom-[12%] left-[26%] top-[30%] w-[48%] rounded-[50%] bg-[#0C0D1C]/85" />
        </div>
      </div>

      {/* violet plus accent */}
      <div className="absolute right-[24%] top-[1%] grid size-7 place-items-center rounded-full bg-[#7563F4] text-white shadow-lg">
        <span className="text-sm leading-none">+</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function HeroScene({ className }: { className?: string }) {
  const reducedMotion = useReducedMotion() ?? false;
  const webgl = useSyncExternalStore(emptySubscribe, webglAvailable, webglServerSnapshot);
  const { ref, onScreen } = useOnScreen<HTMLDivElement>();

  return (
    <div ref={ref} className={className} aria-hidden>
      {webgl === null && <SceneSkeleton />}
      {webgl === false && <StaticFallback />}
      {webgl === true && (
        <div className="absolute inset-0 motion-safe:animate-[y10-scene-in_0.9s_ease-out_both]">
          <HeroSceneCanvas reducedMotion={reducedMotion} frameloop={onScreen ? 'always' : 'never'} />
        </div>
      )}
    </div>
  );
}
