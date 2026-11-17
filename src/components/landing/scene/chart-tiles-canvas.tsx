// ChartTiles — sculptural dark-glass analytics tiles with embedded brand-blue
// bar-chart geometry for the lower "See your pipeline at a glance" panel.
// Bars grow in with a stagger on entrance, then breathe gently. Second canvas.

'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

import { DarkGlass, StudioEnvironment } from './scene-shared';

type Props = { reducedMotion: boolean; frameloop?: 'always' | 'never' };

const TILE_BARS = [
  [0.34, 0.5, 0.66, 0.58, 0.9],
  [0.55, 0.85, 0.45, 0.7, 1.05],
] as const;

const BAR_BASE_Y = -0.32;

/** One chart bar: rises from the baseline with a stagger, then breathes gently. */
function ChartBar({
  height,
  x,
  delay,
  color,
  reducedMotion,
  index,
}: {
  height: number;
  x: number;
  delay: number;
  color: string;
  reducedMotion: boolean;
  index: number;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshPhysicalMaterial>(null);
  const progress = useRef(reducedMotion ? 1 : 0);
  const started = useRef(reducedMotion);

  useFrame((state, delta) => {
    const m = mesh.current;
    if (!m) return;
    const t = progress.current;
    if (t < 1) {
      if (!started.current && state.clock.elapsedTime >= delay) started.current = true;
      if (started.current) progress.current = Math.min(1, t + delta / 0.85);
    }
    const eased = 1 - Math.pow(1 - progress.current, 3);
    const breathe =
      progress.current >= 1 && !reducedMotion
        ? 1 + Math.sin(state.clock.elapsedTime * 1.3 + index * 0.9) * 0.014
        : eased;
    m.scale.y = Math.max(0.001, breathe);
    m.position.y = BAR_BASE_Y + (height * Math.max(0.001, breathe)) / 2;
    if (mat.current) {
      mat.current.emissiveIntensity =
        progress.current >= 1 && !reducedMotion
          ? 0.12 + Math.sin(state.clock.elapsedTime * 1.3 + index * 0.9) * 0.035
          : 0.12 * eased;
    }
  });

  return (
    <mesh ref={mesh} position={[x, BAR_BASE_Y + height / 2, 0.2]} scale={[1, reducedMotion ? 1 : 0.001, 1]}>
      <boxGeometry args={[0.13, height, 0.13]} />
      <meshPhysicalMaterial
        ref={mat}
        color={color}
        roughness={0.3}
        clearcoat={0.9}
        emissive={color}
        emissiveIntensity={0.12}
      />
    </mesh>
  );
}

function ChartTile({
  position,
  rotation,
  bars,
  reducedMotion,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  bars: readonly number[];
  reducedMotion: boolean;
}) {
  const step = 1.32 / bars.length;
  const startX = -((bars.length - 1) * step) / 2;

  return (
    <Float
      enabled={!reducedMotion}
      speed={1.3}
      rotationIntensity={0.16}
      floatIntensity={0.4}
      floatingRange={[0.05, 0.14]}
    >
      <group position={position} rotation={rotation}>
        <RoundedBox args={[1.85, 1.42, 0.32]} radius={0.16} smoothness={5}>
          <DarkGlass roughness={0.24} thickness={0.8} />
        </RoundedBox>
        {bars.map((h, i) => (
          <ChartBar
            key={i}
            index={i}
            height={h}
            x={startX + i * step}
            delay={0.7 + i * 0.12}
            color={i % 2 === 0 ? '#384BFE' : '#8FA0FF'}
            reducedMotion={reducedMotion}
          />
        ))}
        {/* thin baseline */}
        <mesh position={[0, -0.36, 0.2]}>
          <boxGeometry args={[1.4, 0.03, 0.1]} />
          <meshStandardMaterial color="#8f93b5" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>
    </Float>
  );
}

function SceneContents({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <>
      <StudioEnvironment resolution={128} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[-4, 6, 6]} intensity={0.6} />
      <pointLight position={[4, 1, 4]} intensity={0.4} color="#dcdef6" />
      <group rotation={[0.02, 0, 0]}>
        <ChartTile position={[-0.72, 0.5, 0]} rotation={[0.16, -0.52, 0.07]} bars={TILE_BARS[0]} reducedMotion={reducedMotion} />
        <ChartTile position={[0.72, -0.28, 0.6]} rotation={[-0.08, 0.4, -0.05]} bars={TILE_BARS[1]} reducedMotion={reducedMotion} />
      </group>
    </>
  );
}

export default function ChartTilesCanvas({ reducedMotion, frameloop = 'always' }: Props) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.7, 6.4], fov: 30 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ camera }) => camera.lookAt(0, 0.05, 0)}
      frameloop={frameloop}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <SceneContents reducedMotion={reducedMotion} />
      </Suspense>
    </Canvas>
  );
}
