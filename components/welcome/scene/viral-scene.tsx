"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { sceneState } from "./scene-state";

// The landing page's 3D scene: the Viral mark — three ascending bars —
// standing on a floor of smaller bars. Scrolling pulls the camera back
// and around while the floor rises in a wave from the mark outward:
// reach spreading from one post. Colours are the four brand inks only.

const OFF_BLACK = new THREE.Color("#101010");
const CONCRETE = new THREE.Color("#55534E");
const CHALK = new THREE.Color("#F1EFEA");
const SIGNAL = new THREE.Color("#FF4D00");
// The floor's resting tone: Off-Black lifted along the warm axis, the
// same derivation globals.css uses for --card.
const FLOOR = new THREE.Color("#1d1c1a");

const GRID = 34;
const SPACING = 1.15;
const BAR = 0.86;

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function Field({ animate }: { animate: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null);

  const cells = useMemo(() => {
    const out: { x: number; z: number; d: number; phase: number; jitter: number }[] = [];
    const half = (GRID - 1) / 2;
    for (let i = 0; i < GRID; i++) {
      for (let j = 0; j < GRID; j++) {
        const x = (i - half) * SPACING;
        const z = (j - half) * SPACING;
        // Leave a clearing for the mark itself.
        if (Math.abs(x) < 3 && Math.abs(z) < 1.4) continue;
        const d = Math.hypot(x, z);
        // Deterministic pseudo-random so SSR-free renders still match
        // between visits — the skyline should look the same every time.
        const r = Math.abs(Math.sin(i * 12.9898 + j * 78.233) * 43758.5453) % 1;
        out.push({ x, z, d, phase: r * Math.PI * 2, jitter: r });
      }
    }
    return out;
  }, []);

  const geometry = useMemo(() => {
    const g = new THREE.BoxGeometry(BAR, 1, BAR);
    g.translate(0, 0.5, 0); // grow from the floor, not the middle
    return g;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  const maxD = useMemo(() => Math.max(...cells.map((c) => c.d)), [cells]);

  useFrame(({ clock }) => {
    const m = mesh.current;
    if (!m) return;
    const t = animate ? clock.elapsedTime : 0;
    const p = sceneState.progress;

    // Wave front: starts at the mark and reaches the edge of the field
    // by ~60% of the page.
    const front = smooth(0.02, 0.6, p) * (maxD + 6);

    for (let k = 0; k < cells.length; k++) {
      const c = cells[k];
      const grown = smooth(front, front - 7, c.d);
      const falloff = Math.exp(-c.d * 0.075);
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.7 + c.phase + c.d * 0.45);
      const idle = 0.06 + 0.05 * (0.5 + 0.5 * Math.sin(t * 0.9 + c.phase));
      const h = idle + grown * (0.25 + 3.4 * falloff) * (0.35 + 0.65 * pulse) * (0.6 + 0.4 * c.jitter);

      dummy.position.set(c.x, 0, c.z);
      dummy.scale.set(1, h, 1);
      dummy.updateMatrix();
      m.setMatrixAt(k, dummy.matrix);

      // Height ramps Floor → Concrete → Chalk; only the tallest few
      // light up in Signal, so the accent stays an accent.
      const norm = Math.min(1, h / 3.4);
      if (h > 1.9 && c.jitter > 0.86) {
        color.copy(SIGNAL);
      } else if (norm < 0.5) {
        color.copy(FLOOR).lerp(CONCRETE, norm * 2);
      } else {
        color.copy(CONCRETE).lerp(CHALK, (norm - 0.5) * 1.1);
      }
      m.setColorAt(k, color);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[geometry, undefined, cells.length]} frustumCulled={false}>
      <meshStandardMaterial roughness={0.42} metalness={0.15} />
    </instancedMesh>
  );
}

function Mark({ animate }: { animate: boolean }) {
  const group = useRef<THREE.Group>(null);
  const bars = useRef<(THREE.Mesh | null)[]>([]);
  const start = useRef<number | null>(null);

  const geometry = useMemo(() => {
    const g = new RoundedBoxGeometry(1.25, 1, 1.25, 4, 0.1);
    g.translate(0, 0.5, 0);
    return g;
  }, []);

  // Heights in the logo's 7 : 12 : 17 ratio.
  const spec = useMemo(
    () => [
      { x: -1.75, h: 7 * 0.28, color: CONCRETE, emissive: 0 },
      { x: 0, h: 12 * 0.28, color: CHALK, emissive: 0 },
      { x: 1.75, h: 17 * 0.28, color: SIGNAL, emissive: 0.55 },
    ],
    [],
  );

  useFrame(({ clock }) => {
    if (start.current === null) start.current = clock.elapsedTime;
    const since = animate ? clock.elapsedTime - start.current : 10;
    spec.forEach((s, i) => {
      const b = bars.current[i];
      if (!b) return;
      // Staggered rise on first paint, then a slow breathing.
      const rise = smooth(0.15 + i * 0.18, 1.5 + i * 0.18, since);
      const breathe = animate ? 1 + 0.03 * Math.sin(clock.elapsedTime * 1.1 + i) : 1;
      b.scale.y = Math.max(0.001, s.h * rise * breathe);
    });
    if (group.current) {
      const target = animate ? Math.sin(clock.elapsedTime * 0.18) * 0.25 + sceneState.pointerX * 0.25 : -0.25;
      group.current.rotation.y += (target - group.current.rotation.y) * 0.05;
    }
  });

  return (
    <group ref={group}>
      {spec.map((s, i) => (
        <mesh
          key={i}
          ref={(el) => {
            bars.current[i] = el;
          }}
          geometry={geometry}
          position={[s.x, 0, 0]}
          scale={[1, 0.001, 1]}
        >
          <meshPhysicalMaterial
            color={s.color}
            emissive={s.color}
            emissiveIntensity={s.emissive}
            roughness={0.28}
            metalness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.2}
          />
        </mesh>
      ))}
      <Glow />
    </group>
  );
}

// A soft Signal pool of light on the floor under the mark. A radial
// gradient on an additive plane reads as bloom without a post-processing
// pass.
function Glow() {
  const texture = useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,77,0,0.9)");
    g.addColorStop(0.35, "rgba(255,77,0,0.28)");
    g.addColorStop(1, "rgba(255,77,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1, 0.02, 0]}>
      <planeGeometry args={[9, 9]} />
      <meshBasicMaterial map={texture} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}

// Drifting motes rising off the field — impressions going up.
function Motes({ animate }: { animate: boolean }) {
  const points = useRef<THREE.Points>(null);
  const COUNT = 700;

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const speeds = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const r = (n: number) => Math.abs(Math.sin(i * 91.7 + n * 13.1) * 9301.7) % 1;
      positions[i * 3] = (r(1) - 0.5) * 40;
      positions[i * 3 + 1] = r(2) * 16;
      positions[i * 3 + 2] = (r(3) - 0.5) * 40;
      speeds[i] = 0.15 + r(4) * 0.5;
    }
    return { positions, speeds };
  }, []);

  useFrame((_, delta) => {
    if (!animate || !points.current) return;
    const attr = points.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const dt = Math.min(delta, 0.05);
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3 + 1] += speeds[i] * dt;
      if (arr[i * 3 + 1] > 16) arr[i * 3 + 1] = 0;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color={CHALK}
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Camera rides a spline through four framings as the page scrolls:
// close on the mark → up and back over the field → round the far side
// → high overhead looking down on the whole skyline.
function CameraRig({ animate }: { animate: boolean }) {
  const { camera, size } = useThree();
  const look = useRef(new THREE.Vector3(0, 7.4, 0));

  const { path, targets } = useMemo(() => {
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 6.2, 20),
      new THREE.Vector3(10, 8.5, 14),
      new THREE.Vector3(-13, 11, 9),
      new THREE.Vector3(-2, 24, 9),
    ]);
    const targets = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 7.4, 0),
      new THREE.Vector3(0, 2.2, 0),
      new THREE.Vector3(0, 1.5, 0),
      new THREE.Vector3(0, 0, 0),
    ]);
    return { path, targets };
  }, []);

  const pos = useMemo(() => new THREE.Vector3(), []);
  const tgt = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const p = Math.min(1, Math.max(0, sceneState.progress));
    path.getPoint(p, pos);
    targets.getPoint(p, tgt);

    // Portrait screens see less width; back off so the mark still fits.
    const aspect = size.width / size.height;
    if (aspect < 1) pos.multiplyScalar(1 + (1 - aspect) * 0.9);

    if (animate) {
      pos.x += sceneState.pointerX * 0.8;
      pos.y += sceneState.pointerY * 0.5;
    }

    const k = animate ? 0.06 : 1;
    camera.position.lerp(pos, k);
    look.current.lerp(tgt, k);
    camera.lookAt(look.current);
  });

  return null;
}

export default function ViralScene({
  animate,
  onReady,
}: {
  animate: boolean;
  onReady?: () => void;
}) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ fov: 42, near: 0.1, far: 120, position: [0, 6.2, 20] }}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
      frameloop={animate ? "always" : "demand"}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        scene.background = OFF_BLACK;
        scene.fog = new THREE.Fog(OFF_BLACK, 16, 46);
        onReady?.();
      }}
    >
      <hemisphereLight args={[CHALK, OFF_BLACK, 0.55]} />
      <directionalLight position={[8, 14, 10]} intensity={1.7} color={CHALK} />
      <directionalLight position={[-10, 6, -8]} intensity={0.5} color={CONCRETE} />
      <pointLight position={[2.4, 7.5, 2.5]} intensity={16} distance={14} decay={1.8} color={SIGNAL} />
      <Field animate={animate} />
      <Mark animate={animate} />
      <Motes animate={animate} />
      <CameraRig animate={animate} />
      {!animate && <StaticKick />}
    </Canvas>
  );
}

// With frameloop="demand" the scene only draws when asked. Ask on
// scroll so reduced-motion visitors still see the camera follow the
// page — just without the idle animation.
function StaticKick() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const on = () => invalidate();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    // A few frames to let the mark settle at full height.
    const id = window.setInterval(on, 100);
    const stop = window.setTimeout(() => window.clearInterval(id), 600);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      window.clearInterval(id);
      window.clearTimeout(stop);
    };
  }, [invalidate]);
  return null;
}
