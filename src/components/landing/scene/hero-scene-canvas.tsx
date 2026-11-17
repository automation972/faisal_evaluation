// HeroSceneCanvas — sculptural glass composition with marketing themes.
// Transparent circular platform with four glass data cylinders, a rising
// growth arrow, a rotating chrome orbit ring with satellite spheres, and
// glossy floating orbs. Fully procedural geometry, studio lighting.

'use client';

import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';

import {
  ChromeEdge,
  ClearGlass,
  StudioEnvironment,
  useEntrance,
  useParallaxGroup,
  usePointerParallax,
} from './scene-shared';

type SceneProps = { reducedMotion: boolean };

/* ------------------------------------------------------------------ */

const DISH_R = 2.2;
const FLOOR_Y = 0.12; // top surface of the glass floor
const BASE_Y = 0.2; // top surface of the dark centre base

/** Broad shallow glass dish: floor disc, thick walls, chrome rims, metal rings, dark base. */
function GlassDish() {
  return (
    <group>
      {/* glass floor */}
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[DISH_R, DISH_R, 0.12, 80]} />
        <ClearGlass thickness={0.5} roughness={0.05} side={THREE.DoubleSide} attenuation="#dcdef6" />
      </mesh>
      {/* outer glass wall */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[DISH_R, DISH_R, 0.4, 80, 1, true]} />
        <ClearGlass thickness={0.42} roughness={0.06} side={THREE.DoubleSide} attenuation="#dcdef6" />
      </mesh>
      {/* top rim — bright chrome edge */}
      <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[DISH_R, 0.05, 18, 110]} />
        <ChromeEdge />
      </mesh>
      {/* bottom rim */}
      <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[DISH_R + 0.008, 0.032, 18, 110]} />
        <ChromeEdge color="#c8cdf0" roughness={0.2} />
      </mesh>
      {/* layered concentric rings on the floor */}
      <mesh position={[0, FLOOR_Y + 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.88, 1.93, 80]} />
        <meshStandardMaterial color="#b6bcdd" metalness={1} roughness={0.32} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, FLOOR_Y + 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.47, 1.5, 80]} />
        <meshStandardMaterial color="#c3c8e8" metalness={1} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* dark reflective central base */}
      <mesh position={[0, FLOOR_Y + 0.05, 0]}>
        <cylinderGeometry args={[1.35, 1.42, 0.1, 72]} />
        <meshPhysicalMaterial
          color="#0c0d1c"
          metalness={0.85}
          roughness={0.3}
          clearcoat={1}
          clearcoatRoughness={0.16}
          envMapIntensity={1.3}
        />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */

type BarSpec = {
  x: number;
  z: number;
  radius: number;
  height: number;
  core: string;
  delay: number;
  onBase?: boolean;
};

const BARS: BarSpec[] = [
  { x: -1.0, z: 0.22, radius: 0.48, height: 1.95, core: '#7563F4', delay: 0.25, onBase: true },
  { x: -0.16, z: 1.0, radius: 0.38, height: 1.25, core: '#8A7CFF', delay: 0.45 },
  { x: 0.92, z: 0.4, radius: 0.45, height: 1.65, core: '#4FC8D8', delay: 0.6 },
  { x: 1.3, z: -0.6, radius: 0.52, height: 2.7, core: '#E7E9FF', delay: 0.35, onBase: true },
];

/** One sculptural glass data bar: clear shell, coloured core, chrome edge rims. */
function GlassBar({ spec, reducedMotion }: { spec: BarSpec; reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const advance = useEntrance(reducedMotion, 1.15, spec.delay);
  const y = spec.onBase ? BASE_Y : FLOOR_Y + 0.01;

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const p = advance(state.clock.elapsedTime, delta);
    g.scale.y = Math.max(0.001, p);
  });

  const { radius, height } = spec;

  return (
    <group ref={group} position={[spec.x, y, spec.z]} scale={[1, reducedMotion ? 1 : 0.001, 1]}>
      {/* clear curved wall */}
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[radius, radius, height, 56, 1, true]} />
        <ClearGlass thickness={0.36} roughness={0.08} side={THREE.DoubleSide} attenuation="#e3e5fb" />
      </mesh>
      {/* top elliptical edge */}
      <mesh position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.018, 12, 56]} />
        <ChromeEdge color="#eef0ff" />
      </mesh>
      {/* restrained coloured core */}
      <mesh position={[0, (height * 0.94) / 2, 0]}>
        <cylinderGeometry args={[radius * 0.62, radius * 0.68, height * 0.94, 44]} />
        <meshPhysicalMaterial
          color={spec.core}
          roughness={0.32}
          clearcoat={0.9}
          clearcoatRoughness={0.25}
          emissive={spec.core}
          emissiveIntensity={0.07}
          envMapIntensity={0.9}
        />
      </mesh>
      {/* base contact ring */}
      <mesh position={[0, 0.015, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius + 0.006, 0.014, 12, 56]} />
        <ChromeEdge color="#cdd2f2" roughness={0.22} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Marketing-themed 3D elements                                        */
/* ------------------------------------------------------------------ */

/** Rising growth arrow — glossy violet tube curving upward with an arrowhead. */
function GrowthArrow({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const advance = useEntrance(reducedMotion, 1.1, 0.55);

  const { geometry, headPosition, headQuaternion } = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-2.5, 0.9, 0.35),
      new THREE.Vector3(-1.5, 2.5, -0.3),
      new THREE.Vector3(-0.5, 3.35, -0.55),
    );
    const tube = new THREE.TubeGeometry(curve, 40, 0.075, 14, false);
    const tangent = curve.getTangentAt(1).normalize();
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
    const tip = curve.getPointAt(1).add(tangent.clone().multiplyScalar(0.1));
    return { geometry: tube, headPosition: tip, headQuaternion: quat };
  }, []);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const p = advance(state.clock.elapsedTime, delta);
    const bob = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.9) * 0.07;
    g.scale.setScalar(Math.max(0.001, p));
    g.position.y = bob;
  });

  return (
    <group ref={group} scale={reducedMotion ? 1 : 0.001}>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial
          color="#7563F4"
          roughness={0.22}
          clearcoat={1}
          clearcoatRoughness={0.15}
          emissive="#7563F4"
          emissiveIntensity={0.08}
          envMapIntensity={1.2}
        />
      </mesh>
      <mesh position={headPosition} quaternion={headQuaternion}>
        <coneGeometry args={[0.19, 0.4, 20]} />
        <meshPhysicalMaterial
          color="#7563F4"
          roughness={0.22}
          clearcoat={1}
          emissive="#7563F4"
          emissiveIntensity={0.08}
          envMapIntensity={1.2}
        />
      </mesh>
      {/* small origin node at the base of the curve */}
      <mesh position={[-2.5, 0.9, 0.35]}>
        <sphereGeometry args={[0.14, 24, 24]} />
        <meshPhysicalMaterial color="#9A8CFF" roughness={0.25} clearcoat={1} envMapIntensity={1.1} />
      </mesh>
    </group>
  );
}

const ORBIT_SATELLITES = [
  { angle: 0.4, size: 0.17, color: '#7563F4' },
  { angle: 2.5, size: 0.13, color: '#A9E8C6' },
  { angle: 4.4, size: 0.15, color: '#F2A0B6' },
];

/** Large chrome orbit ring circling the platform with satellite spheres — visible motion. */
function OrbitRing({ reducedMotion }: { reducedMotion: boolean }) {
  const spinner = useRef<THREE.Group>(null);
  const holder = useRef<THREE.Group>(null);
  const advance = useEntrance(reducedMotion, 1.2, 0.3);

  useFrame((state, delta) => {
    if (spinner.current && !reducedMotion) spinner.current.rotation.z += delta * 0.14;
    const h = holder.current;
    if (!h) return;
    const p = advance(state.clock.elapsedTime, delta);
    h.scale.setScalar(Math.max(0.001, 0.75 + 0.25 * p));
  });

  return (
    <group ref={holder} scale={reducedMotion ? 1 : 0.001}>
      <group rotation={[Math.PI / 2 - 0.2, 0, 0.07]} position={[0, 1.1, 0]}>
        <group ref={spinner}>
          <mesh>
            <torusGeometry args={[3.15, 0.032, 12, 128]} />
            <ChromeEdge color="#d7daf5" roughness={0.18} />
          </mesh>
          {ORBIT_SATELLITES.map((s, i) => (
            <mesh
              key={i}
              position={[Math.cos(s.angle) * 3.15, Math.sin(s.angle) * 3.15, 0]}
            >
              <sphereGeometry args={[s.size, 24, 24]} />
              <meshPhysicalMaterial color={s.color} roughness={0.25} clearcoat={1} envMapIntensity={1.1} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}

/** Glass sphere with a chrome ring — "Saturn" accent. */
function SaturnOrb({ reducedMotion }: { reducedMotion: boolean }) {
  const ring = useRef<THREE.Mesh>(null);
  const holder = useRef<THREE.Group>(null);
  const advance = useEntrance(reducedMotion, 0.9, 0.75);

  useFrame((state) => {
    if (ring.current && !reducedMotion) ring.current.rotation.z = state.clock.elapsedTime * 0.25;
    const h = holder.current;
    if (!h) return;
    const p = advance(state.clock.elapsedTime, 1 / 60);
    h.scale.setScalar(Math.max(0.001, p));
  });

  return (
    <group ref={holder} scale={reducedMotion ? 1 : 0.001}>
      <Float
        enabled={!reducedMotion}
        speed={1.4}
        rotationIntensity={0.15}
        floatIntensity={0.7}
        floatingRange={[0.12, 0.3]}
      >
        <group position={[2.75, 3.35, -0.45]} rotation={[0.05, -0.2, 0.06]}>
          <mesh>
            <sphereGeometry args={[0.52, 48, 48]} />
            <ClearGlass thickness={0.7} roughness={0.05} attenuation="#e0e2f8" />
          </mesh>
          <mesh ref={ring} rotation={[1.25, 0, 0.35]}>
            <torusGeometry args={[0.76, 0.035, 12, 72]} />
            <ChromeEdge />
          </mesh>
        </group>
      </Float>
    </group>
  );
}

/** Glossy accent orbs floating around the composition. */
function AccentOrb({
  position,
  radius,
  color,
  delay,
  reducedMotion,
}: {
  position: [number, number, number];
  radius: number;
  color: string;
  delay: number;
  reducedMotion: boolean;
}) {
  const holder = useRef<THREE.Group>(null);
  const advance = useEntrance(reducedMotion, 0.8, delay);

  useFrame((_, delta) => {
    const h = holder.current;
    if (!h) return;
    const p = advance(1, delta);
    h.scale.setScalar(Math.max(0.001, p));
  });

  return (
    <group ref={holder} scale={reducedMotion ? 1 : 0.001}>
      <Float
        enabled={!reducedMotion}
        speed={1.7}
        rotationIntensity={0.2}
        floatIntensity={0.8}
        floatingRange={[0.1, 0.24]}
      >
        <mesh position={position}>
          <sphereGeometry args={[radius, 40, 40]} />
          <meshPhysicalMaterial
            color={color}
            roughness={0.24}
            clearcoat={1}
            clearcoatRoughness={0.2}
            envMapIntensity={1.15}
          />
        </mesh>
      </Float>
    </group>
  );
}

/** Small spinning chrome ring accent, top-right. */
function RingAccent({ reducedMotion }: { reducedMotion: boolean }) {
  const ring = useRef<THREE.Mesh>(null);
  const holder = useRef<THREE.Group>(null);
  const advance = useEntrance(reducedMotion, 0.8, 0.95);

  useFrame((state, delta) => {
    if (ring.current && !reducedMotion) {
      ring.current.rotation.z += delta * 0.4;
      ring.current.rotation.x = 1.15 + Math.sin(state.clock.elapsedTime * 0.5) * 0.12;
    }
    const h = holder.current;
    if (!h) return;
    const p = advance(1, delta);
    h.scale.setScalar(Math.max(0.001, p));
  });

  return (
    <group ref={holder} scale={reducedMotion ? 1 : 0.001}>
      <Float enabled={!reducedMotion} speed={1.9} rotationIntensity={0.3} floatIntensity={0.7} floatingRange={[0.08, 0.2]}>
        <mesh ref={ring} position={[1.85, 4.05, -0.75]} rotation={[1.15, -0.3, 0]}>
          <torusGeometry args={[0.3, 0.05, 14, 48]} />
          <ChromeEdge />
        </mesh>
      </Float>
    </group>
  );
}

/* ------------------------------------------------------------------ */

function SceneContents({ reducedMotion }: SceneProps) {
  const parallaxGroup = useRef<THREE.Group>(null);
  const pointer = usePointerParallax(!reducedMotion);
  useParallaxGroup(parallaxGroup, pointer, { yaw: 0.06, pitch: 0.018 });

  const responsive = useRef<THREE.Group>(null);
  const viewport = useThree((s) => s.viewport);
  const size = useThree((s) => s.size);

  // Keep the composition framed on narrow canvases (mobile) without changing the camera.
  const sceneScale = useMemo(() => Math.min(1, Math.max(0.7, viewport.width / 7.6)), [viewport.width]);
  // Vertical anchor: dish straddles the dark panel edge on desktop; centred lower on mobile.
  const yOffset = size.height < 600 ? -0.3 : 0.35;

  useFrame(() => {
    if (responsive.current) responsive.current.scale.setScalar(sceneScale);
  });

  return (
    <group ref={parallaxGroup}>
      <StudioEnvironment resolution={256} />
      <group ref={responsive} position={[0, yOffset, 0]}>
        <ambientLight intensity={0.35} />
        <directionalLight position={[-6, 8, 6]} intensity={0.7} color="#ffffff" />
        <pointLight position={[6, 2, 3]} intensity={0.5} color="#dcdef6" />

        <GlassDish />
        {BARS.map((spec) => (
          <GlassBar key={`${spec.x}-${spec.z}`} spec={spec} reducedMotion={reducedMotion} />
        ))}

        <OrbitRing reducedMotion={reducedMotion} />
        <GrowthArrow reducedMotion={reducedMotion} />
        <SaturnOrb reducedMotion={reducedMotion} />
        <AccentOrb position={[-3.1, 1.35, 0.5]} radius={0.38} color="#8A7CFF" delay={0.85} reducedMotion={reducedMotion} />
        <AccentOrb position={[3.4, 1.3, 0.35]} radius={0.26} color="#A9E8C6" delay={1.0} reducedMotion={reducedMotion} />
        <RingAccent reducedMotion={reducedMotion} />

        <ContactShadows
          position={[0, FLOOR_Y + 0.02, 0]}
          scale={10}
          far={3.6}
          blur={2.4}
          opacity={0.34}
          resolution={256}
          color="#1a1b33"
        />
      </group>
    </group>
  );
}

export default function HeroSceneCanvas({
  reducedMotion,
  frameloop = 'always',
}: SceneProps & { frameloop?: 'always' | 'never' | 'demand' }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 5.2, 11.8], fov: 37 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ camera }) => camera.lookAt(0, 1.0, 0)}
      frameloop={frameloop}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <SceneContents reducedMotion={reducedMotion} />
      </Suspense>
    </Canvas>
  );
}
