import { Edges, Html, Line, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import * as THREE from 'three';

/**
 * Shared kit for the Atlas 3D models: an orthographic, linework-only world in
 * the sheet's own colours. No postprocessing, no lighting; the frame loop runs
 * only while something moves and the model is on screen.
 */

/** Atlas blueprint and whiteprint, and Paper's light and dark pages. */
export type SceneTheme = 'blue' | 'white' | 'paper' | 'paper-dark';
/** @deprecated kept for the Atlas imports; same as SceneTheme. */
export type AtlasTheme = SceneTheme;

export interface ScenePalette {
  ground: string;
  line: string;
  dim: string;
  rev: string;
  fill: string;
}

export const PALETTES: Record<SceneTheme, ScenePalette> = {
  blue: { ground: '#0c2c4c', line: '#e8f1fa', dim: '#5d7d9c', rev: '#ff7a1f', fill: '#123a61' },
  white: { ground: '#eef3f8', line: '#0e3a66', dim: '#9fb4c9', rev: '#d9560a', fill: '#dbe6f0' },
  paper: { ground: '#fdfdfc', line: '#16181d', dim: '#b9bec8', rev: '#1f4bb8', fill: '#f2f3f5' },
  'paper-dark': { ground: '#121418', line: '#e7e8eb', dim: '#4c525e', rev: '#93b2ff', fill: '#1b1e24' },
};

export interface SceneProps {
  theme: SceneTheme;
  /** Components and connections the current step uses; empty means nothing is singled out. */
  litNodes: Set<string>;
  litEdges: Set<string>;
  flowId: string | null;
  stepId: string | null;
  reducedMotion: boolean;
}

export type V3 = [number, number, number];

/** Whether a component reads as lit, dimmed or plain in the current step. */
export function tone(id: string, lit: Set<string>): 'lit' | 'dim' | 'plain' {
  if (lit.size === 0) return 'plain';
  return lit.has(id) ? 'lit' : 'dim';
}

export function colorFor(t: 'lit' | 'dim' | 'plain', p: ScenePalette) {
  return t === 'lit' ? p.rev : t === 'dim' ? p.dim : p.line;
}

/** A wireframe box: faint fill, hard edges. */
export function WireBox({
  at,
  size,
  color,
  fill,
  dashed = false,
}: {
  at: V3;
  size: V3;
  color: string;
  fill: string;
  dashed?: boolean;
}) {
  return (
    <mesh position={at}>
      <boxGeometry args={size} />
      <meshBasicMaterial color={fill} transparent opacity={dashed ? 0.15 : 0.55} depthWrite={false} />
      <Edges color={color} threshold={1} />
    </mesh>
  );
}

/** A wireframe cylinder for stores. */
export function WireDrum({ at, radius, height, color, fill }: { at: V3; radius: number; height: number; color: string; fill: string }) {
  return (
    <mesh position={at}>
      <cylinderGeometry args={[radius, radius, height, 28, 1]} />
      <meshBasicMaterial color={fill} transparent opacity={0.55} depthWrite={false} />
      <Edges color={color} threshold={20} />
    </mesh>
  );
}

/** A connection between points; dashed when asynchronous. */
export function Link({ points, color, dashed = false, width = 1.25 }: { points: V3[]; color: string; dashed?: boolean; width?: number }) {
  return <Line points={points} color={color} lineWidth={width} dashed={dashed} dashSize={0.18} gapSize={0.12} />;
}

/** A small marker that travels along a path while a step is active. */
export function Pulse({ points, color, speed = 0.45, offset = 0 }: { points: V3[]; color: string; speed?: number; offset?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), false, 'catmullrom', 0), [points]);
  useFrame(({ clock }) => {
    const t = (clock.getElapsedTime() * speed + offset) % 1;
    ref.current?.position.copy(curve.getPointAt(t));
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.07, 12, 12]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

/** A label pinned to a point, set in the drawing's mono face. */
export function Label({ at, text, state }: { at: V3; text: string; state: 'lit' | 'dim' | 'plain' }) {
  return (
    <Html position={at} center zIndexRange={[5, 0]}>
      <span className="scene-label" data-lit={state === 'lit'} data-dim={state === 'dim'}>
        {text}
      </span>
    </Html>
  );
}

/** A flat grid on the floor, like the drawing ground. */
export function FloorGrid({ size, color }: { size: number; color: string }) {
  return <gridHelper args={[size, size * 2, color, color]} position={[0, -0.01, 0]} material-transparent material-opacity={0.22} />;
}

/** Scales the orthographic zoom down on narrow canvases so the whole model stays in frame. */
function FitZoom({ zoom }: { zoom: number }) {
  const { camera, size, invalidate } = useThree();
  useEffect(() => {
    camera.zoom = zoom * Math.min(1, size.width / 880);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, size.width, zoom, invalidate]);
  return null;
}

/** Pauses rendering while the model is off screen. */
function useOnScreen<T extends Element>() {
  const ref = useRef<T>(null);
  const [on, setOn] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, on };
}

/**
 * The stage every model sits on: orthographic camera at a fixed isometric
 * angle, drag to orbit (no zoom, so page scroll still works), capped DPR.
 */
export function Stage({
  theme,
  animating,
  zoom = 62,
  target = [0, 0, 0],
  children,
}: {
  theme: SceneTheme;
  animating: boolean;
  zoom?: number;
  target?: V3;
  children: ReactNode;
}) {
  const screen = useOnScreen<HTMLDivElement>();
  const frameloop = !screen.on ? 'never' : animating ? 'always' : 'demand';
  const p = PALETTES[theme];
  return (
    <div ref={screen.ref} style={{ position: 'absolute', inset: 0 }}>
      <Canvas
        orthographic
        frameloop={frameloop}
        dpr={[1, 1.75]}
        camera={{ position: [9, 8, 11], zoom, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        aria-hidden="true"
      >
        <color attach="background" args={[p.ground]} />
        <FitZoom zoom={zoom} />
        <OrbitControls
          target={target}
          enableZoom={false}
          enablePan={false}
          minPolarAngle={0.35}
          maxPolarAngle={1.35}
          rotateSpeed={0.6}
        />
        {children}
      </Canvas>
    </div>
  );
}
