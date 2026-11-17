// Lazy wrapper for the analytics chart tiles: reserves space, gates rendering
// on visibility, and provides a static CSS fallback when WebGL is unavailable.

'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import { useReducedMotion } from 'framer-motion';

const ChartTilesCanvas = dynamic(() => import('./chart-tiles-canvas'), { ssr: false });

let cachedWebgl: boolean | null = null;

function webglAvailable(): boolean {
  if (cachedWebgl !== null) return cachedWebgl;
  try {
    const c = document.createElement('canvas');
    cachedWebgl = Boolean(
      window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')),
    );
  } catch {
    cachedWebgl = false;
  }
  return cachedWebgl;
}

const emptySubscribe = () => () => {};
const webglServerSnapshot = () => null;

function StaticFallback() {
  return (
    <div className="absolute inset-0" aria-hidden>
      <div className="absolute left-[8%] top-[6%] h-[68%] w-[46%] rotate-[-14deg] rounded-[22%] border border-white/15 bg-[#16172c]/90 shadow-[0_24px_48px_-16px_rgba(0,0,0,0.6)] backdrop-blur-sm">
        <div className="absolute bottom-[18%] left-[14%] flex h-[52%] items-end gap-[8%]">
          {[38, 55, 70, 62, 92].map((h, i) => (
            <div key={i} className="w-[9%] rounded-sm bg-[#384BFE]" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
      <div className="absolute right-[6%] top-[26%] h-[64%] w-[46%] rotate-[9deg] rounded-[22%] border border-white/15 bg-[#1a1b32]/90 shadow-[0_24px_48px_-16px_rgba(0,0,0,0.6)] backdrop-blur-sm">
        <div className="absolute bottom-[18%] left-[14%] flex h-[52%] items-end gap-[8%]">
          {[58, 88, 48, 74, 100].map((h, i) => (
            <div key={i} className="w-[9%] rounded-sm bg-[#8FA0FF]" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ChartTiles({ className }: { className?: string }) {
  const reducedMotion = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(false);
  const webgl = useSyncExternalStore(emptySubscribe, webglAvailable, webglServerSnapshot);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { rootMargin: '140px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} aria-hidden>
      {webgl === false ? (
        <StaticFallback />
      ) : (
        <ChartTilesCanvas reducedMotion={reducedMotion} frameloop={onScreen ? 'always' : 'never'} />
      )}
    </div>
  );
}
