// Young10 Marketing — WebGL hero backdrop
// A premium, brand-blue "silk ribbon" wave rendered with a custom GLSL shader.
// - three.js is dynamically imported so it never touches the main bundle
// - pauses when the tab is hidden or the hero scrolls out of view
// - mouse parallax on the camera, DPR capped at 2, full GPU cleanup on unmount
// - honors prefers-reduced-motion (renders a single static frame)
// - if WebGL is unavailable, the canvas simply stays empty and the CSS
//   gradient fallback behind it carries the design

'use client';

import { useEffect, useRef } from 'react';

const VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  varying float vElev;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 p = position;
    float t = uTime;

    // Layered sine field — smooth, slow, silk-like undulation
    float e = 0.0;
    e += sin(p.x * 0.42 + t * 0.85) * cos(p.y * 0.50 + t * 0.55) * 1.15;
    e += sin((p.x * 0.26 + p.y * 0.42) - t * 0.62) * 0.62;
    e += sin(p.y * 1.05 + p.x * 0.18 + t * 1.10) * 0.30;

    vElev = e / 2.07;
    p.z = e;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;
  uniform float uOpacity;
  varying float vElev;
  varying vec2 vUv;

  void main() {
    float h = clamp(vElev * 0.5 + 0.5, 0.0, 1.0);

    // Young10 brand ramp: deep blue -> #384BFE -> light crest
    vec3 deep = vec3(0.125, 0.170, 0.720);
    vec3 mid  = vec3(0.220, 0.294, 0.996);
    vec3 hi   = vec3(0.600, 0.650, 1.000);

    vec3 col = mix(deep, mid, smoothstep(0.05, 0.60, h));
    col = mix(col, hi, smoothstep(0.60, 1.0, h) * 0.85);
    col += vec3(0.06, 0.08, 0.18) * smoothstep(0.78, 1.0, h);

    // Soft radial + vertical falloff so the ribbon melts into the page tint
    float d = distance(vUv, vec2(0.5, 0.45));
    float edge = smoothstep(0.58, 0.04, d);
    float topFade = smoothstep(0.0, 0.30, vUv.y);

    float a = uOpacity * edge * (0.35 + 0.65 * topFade);
    gl_FragColor = vec4(col, a);
  }
`;

export default function HeroCanvas3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    let cleanup: (() => void) | null = null;

    (async () => {
      const THREE = await import('three');
      if (disposed || !canvas.isConnected) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        });
      } catch {
        return; // No WebGL — CSS fallback layers carry the hero
      }

      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      const scene = new THREE.Scene();

      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
      const CAM_BASE_Y = 4.4;
      camera.position.set(0, CAM_BASE_Y, 10.8);
      camera.lookAt(0, 0.2, 0);

      const geometry = new THREE.PlaneGeometry(30, 16, 200, 110);
      const material = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: {
          uTime: { value: 0 },
          uOpacity: { value: 0.52 },
        },
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI / 2.35;
      mesh.position.set(0, -0.6, 0);
      scene.add(mesh);

      /* ------------------------------ sizing ------------------------------ */
      const host = canvas.parentElement;
      const setSize = () => {
        if (!host) return;
        const w = Math.max(host.clientWidth, 1);
        const h = Math.max(host.clientHeight, 1);
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      const resizeObserver = host ? new ResizeObserver(setSize) : null;
      if (host && resizeObserver) resizeObserver.observe(host);
      setSize();

      /* --------------------------- mouse parallax -------------------------- */
      const pointer = { x: 0, y: 0 };
      const onPointerMove = (event: PointerEvent) => {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
      };
      window.addEventListener('pointermove', onPointerMove, { passive: true });

      /* ----------------------- visibility / viewport ----------------------- */
      let tabVisible = !document.hidden;
      let inView = true;
      const onVisibilityChange = () => {
        tabVisible = !document.hidden;
      };
      document.addEventListener('visibilitychange', onVisibilityChange);

      const viewObserver = new IntersectionObserver(
        ([entry]) => {
          inView = entry.isIntersecting;
        },
        { threshold: 0 },
      );
      viewObserver.observe(canvas);

      /* ------------------------------- loop -------------------------------- */
      const clock = new THREE.Clock();
      let raf = 0;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const renderFrame = (time: number) => {
        material.uniforms.uTime.value = time;
        camera.position.x += (pointer.x * 0.7 - camera.position.x) * 0.045;
        camera.position.y += (CAM_BASE_Y - pointer.y * 0.35 - camera.position.y) * 0.045;
        camera.lookAt(0, 0.2, 0);
        renderer.render(scene, camera);
      };

      if (reducedMotion) {
        // Static, fully-formed wave — no animation loop
        renderFrame(1.5);
      } else {
        const tick = () => {
          raf = requestAnimationFrame(tick);
          if (!tabVisible || !inView) return;
          renderFrame(clock.getElapsedTime());
        };
        tick();
      }

      /* ------------------------------ cleanup ------------------------------ */
      cleanup = () => {
        cancelAnimationFrame(raf);
        resizeObserver?.disconnect();
        viewObserver.disconnect();
        window.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('visibilitychange', onVisibilityChange);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        try {
          renderer.forceContextLoss();
        } catch {
          // no-op — some browsers throw on forced context loss
        }
      };
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}
