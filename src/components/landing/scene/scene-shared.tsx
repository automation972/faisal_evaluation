// Shared building blocks for the landing 3D scenes.
// Procedural studio environment (no remote HDR assets), pointer parallax,
// reusable glass materials and entrance helpers.

'use client';

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';

export const LANDING_BLUE = '#384BFE';

/** Procedural studio environment: big white softboxes + pale blue fill + dark contrast strip. */
export function StudioEnvironment({ resolution = 256 }: { resolution?: number }) {
  return (
    <Environment resolution={resolution} frames={1}>
      <color attach="background" args={['#141520']} />
      {/* Key light — large white softbox upper-left */}
      <Lightformer form="rect" intensity={2.6} color="#ffffff" position={[-6, 7, 5]} scale={[7, 10, 1]} target={[0, 0, 0]} />
      {/* Front fill — broad white panel */}
      <Lightformer form="rect" intensity={1.1} color="#f2f3ff" position={[0, 3.5, 8]} scale={[12, 5, 1]} target={[0, 1, 0]} />
      {/* Pale blue fill from the right */}
      <Lightformer form="rect" intensity={0.85} color="#D8DDF8" position={[7, 3, -2]} scale={[5, 8, 1]} target={[0, 0, 0]} />
      {/* Cool accent strip behind */}
      <Lightformer form="rect" intensity={0.7} color="#c9d2ff" position={[3, 5, -6]} scale={[8, 4, 1]} target={[0, 0, 0]} />
      {/* Dark contrast strip low-front (gives glass its dark reflections) */}
      <Lightformer form="rect" intensity={0.55} color="#191a2a" position={[0, -3, 5]} scale={[10, 3, 1]} target={[0, 0, 0]} />
      {/* Small ring highlight */}
      <Lightformer form="ring" intensity={1.6} color="#ffffff" position={[-4, 6, -5]} scale={2.6} target={[0, 0, 0]} />
    </Environment>
  );
}

/** Normalised window pointer (-1..1) for desktop parallax; disabled on touch. */
export function usePointerParallax(enabled: boolean) {
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [enabled]);

  return pointer;
}

/** Frame-loop parallax: smoothly rotates a group a few degrees toward the pointer. */
export function useParallaxGroup(
  groupRef: React.RefObject<THREE.Group | null>,
  pointer: React.RefObject<{ x: number; y: number }>,
  { yaw = 0.055, pitch = 0.02 }: { yaw?: number; pitch?: number },
) {
  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;
    const k = 1 - Math.pow(0.0018, delta);
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, pointer.current.x * yaw, k);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, pointer.current.y * pitch, k);
  });
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** Entrance progress ref: 0 -> 1 with ease-out cubic; snaps to 1 for reduced motion. */
export function useEntrance(reducedMotion: boolean, duration = 1.15, delay = 0) {
  const state = useRef({ t: reducedMotion ? 1 : 0, started: false });

  const advance = (elapsed: number, delta: number) => {
    const s = state.current;
    if (s.t >= 1) return 1;
    if (!s.started && elapsed >= delay) s.started = true;
    if (s.started) s.t = Math.min(1, s.t + delta / duration);
    return easeOutCubic(s.t);
  };

  return advance;
}

type GlassProps = {
  roughness?: number;
  thickness?: number;
  tint?: string;
  attenuation?: string;
  side?: THREE.Side;
  envIntensity?: number;
};

/** Clear polished glass (mesh physical transmission — shared render pass, fast). */
export function ClearGlass({
  roughness = 0.07,
  thickness = 1.1,
  tint = '#ffffff',
  attenuation = '#e6e8fa',
  side = THREE.FrontSide,
  envIntensity = 1.25,
}: GlassProps) {
  return (
    <meshPhysicalMaterial
      color={tint}
      transmission={0.96}
      thickness={thickness}
      roughness={roughness}
      ior={1.45}
      clearcoat={1}
      clearcoatRoughness={0.08}
      attenuationColor={attenuation}
      attenuationDistance={3.4}
      envMapIntensity={envIntensity}
      specularIntensity={1}
      side={side}
    />
  );
}

/** Dark charcoal glass (tiles, panels). */
export function DarkGlass({ roughness = 0.22, thickness = 0.9 }: Omit<GlassProps, 'tint' | 'attenuation' | 'side'>) {
  return (
    <meshPhysicalMaterial
      color="#14152a"
      transmission={0.5}
      thickness={thickness}
      roughness={roughness}
      ior={1.4}
      clearcoat={1}
      clearcoatRoughness={0.18}
      envMapIntensity={1.15}
      specularIntensity={0.9}
    />
  );
}

/** Polished chrome edge (rims, rings). */
export function ChromeEdge({ color = '#dfe2ff', roughness = 0.14 }: { color?: string; roughness?: number }) {
  return <meshStandardMaterial color={color} metalness={1} roughness={roughness} envMapIntensity={2.1} />;
}
