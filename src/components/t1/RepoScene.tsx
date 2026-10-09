/**
 * GitHub-data-driven WebGL scene (Template 1 only — lazy-loaded chunk).
 *
 * Each repository is a column in a loose phyllotaxis cluster:
 *   height    ← log(commits)
 *   footprint ← forks
 *   cap glow  ← stars (bright enough to bloom)
 *   colour    ← primary language (palette.ts)
 * Repos that share a language are joined by faint traces on the ground plane.
 * Camera orbit is driven by page scroll, dollies in while the GitHub section is
 * centred, and drifts with the pointer. All of that is read from sceneStore.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Grid, Html, PerformanceMonitor } from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import type { RepoStat } from '../../../shared/github/githubDataset';
import { layoutColumns, type ColumnLayout } from './columnLayout';
import { sceneState } from './sceneStore';

const BG = '#090b0c';
const BODY = '#0c1113';
const OVERDRIVE = new THREE.Color('#ff2e88');

interface ColumnNode extends Omit<ColumnLayout, 'color'> {
  color: THREE.Color;
}

const damp = THREE.MathUtils.damp;

function Column({ node, box, edges }: { node: ColumnNode; box: THREE.BoxGeometry; edges: THREE.EdgesGeometry }) {
  const grow = useRef<THREE.Group>(null);
  const bodyMat = useRef<THREE.MeshStandardMaterial>(null);
  const edgeMat = useRef<THREE.LineBasicMaterial>(null);
  const capMat = useRef<THREE.MeshBasicMaterial>(null);
  const progress = useRef(0);
  const highlight = useRef(0);
  const base = useMemo(() => new THREE.Color(), []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    progress.current = t > node.delay ? damp(progress.current, 1, 2.6, delta) : 0;

    const active = sceneState.highlighted;
    const isMe = active === node.repo.name;
    highlight.current = damp(highlight.current, isMe ? 1 : 0, 9, delta);
    const dim = active && !isMe ? 0.32 : 1;

    base.copy(sceneState.overdrive ? OVERDRIVE : node.color);
    const breathe = 1 + Math.sin(t * 0.9 + node.delay * 7) * 0.06;

    if (grow.current) grow.current.scale.y = Math.max(0.0001, progress.current * (1 + highlight.current * 0.1));
    if (bodyMat.current) bodyMat.current.emissive.copy(base).multiplyScalar((0.07 + highlight.current * 0.22) * dim);
    if (edgeMat.current) edgeMat.current.color.copy(base).multiplyScalar((0.9 + highlight.current * 1.6) * dim);
    if (capMat.current)
      capMat.current.color.copy(base).multiplyScalar(node.capGlow * breathe * (1 + highlight.current * 1.4) * dim);
  });

  const { width, height } = node;

  return (
    <group position={[node.x, 0, node.z]}>
      <group ref={grow}>
        <mesh geometry={box} position={[0, height / 2, 0]} scale={[width, height, width]}>
          <meshStandardMaterial ref={bodyMat} color={BODY} roughness={0.5} metalness={0.4} />
        </mesh>
        <lineSegments geometry={edges} position={[0, height / 2, 0]} scale={[width, height, width]}>
          <lineBasicMaterial ref={edgeMat} toneMapped={false} />
        </lineSegments>
        <mesh geometry={box} position={[0, height + 0.035, 0]} scale={[width * 0.86, 0.07, width * 0.86]}>
          <meshBasicMaterial ref={capMat} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/** Faint ground traces linking repositories that share a language. */
function Traces({ nodes }: { nodes: ColumnNode[] }) {
  const groups = useMemo(() => {
    const byLang = new Map<string, ColumnNode[]>();
    nodes.forEach((n) => byLang.set(n.repo.language, [...(byLang.get(n.repo.language) ?? []), n]));
    return [...byLang.values()]
      .filter((g) => g.length > 1)
      .map((g) => {
        const points: number[] = [];
        for (let i = 1; i < g.length; i++) {
          const a = g[i - 1];
          const b = g[i];
          // Right-angle "circuit" routing: along x, then along z.
          points.push(a.x, 0.015, a.z, b.x, 0.015, a.z, b.x, 0.015, a.z, b.x, 0.015, b.z);
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
        return { geometry, color: g[0].color };
      });
  }, [nodes]);

  useEffect(() => () => groups.forEach((g) => g.geometry.dispose()), [groups]);

  return (
    <>
      {groups.map((g, i) => (
        <lineSegments key={i} geometry={g.geometry}>
          <lineBasicMaterial color={g.color} transparent opacity={0.45} toneMapped={false} />
        </lineSegments>
      ))}
    </>
  );
}

/** DOM label above the highlighted column (driven from the DOM legend). */
function HighlightLabel({ nodes }: { nodes: ColumnNode[] }) {
  const [current, setCurrent] = useState<ColumnNode | null>(null);
  const last = useRef<string | null>(null);

  useFrame(() => {
    if (sceneState.highlighted === last.current) return;
    last.current = sceneState.highlighted;
    setCurrent(nodes.find((n) => n.repo.name === last.current) ?? null);
  });

  if (!current) return null;
  return (
    <Html position={[current.x, current.height + 0.7, current.z]} center zIndexRange={[5, 0]}>
      <div className="t1-label whitespace-nowrap rounded-sm border border-darktech-border bg-darktech-background/85 px-2 py-1 !text-darktech-text backdrop-blur">
        {current.repo.name} · {current.repo.commits} commits · ★{current.repo.stars}
      </div>
    </Html>
  );
}

function CameraRig({ heroSide, statsSide }: { heroSide: number; statsSide: number }) {
  const { camera, size } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);
  const right = useMemo(() => new THREE.Vector3(), []);
  const s = useRef({ az: 0.7, radius: 19, height: 9, shift: 0 });

  useFrame((_, delta) => {
    const { scroll, focus, pointer } = sceneState;
    const narrow = size.width < 768;

    const goalAz = 0.7 + scroll * Math.PI * 1.15 + pointer.x * 0.14;
    const goalRadius = THREE.MathUtils.lerp(19, 15, focus) * (narrow ? 1.45 : 1);
    const goalHeight = THREE.MathUtils.lerp(9, 6.5, focus) + pointer.y * 0.7;
    // Push the cluster away from whichever side the text occupies.
    const goalShift = narrow ? 0 : THREE.MathUtils.lerp(heroSide, statsSide, focus) * 3.4;

    const st = s.current;
    st.az = damp(st.az, goalAz, 3, delta);
    st.radius = damp(st.radius, goalRadius, 2.5, delta);
    st.height = damp(st.height, goalHeight, 2.5, delta);
    st.shift = damp(st.shift, goalShift, 2.5, delta);

    // Camera-right vector for an orbit looking at the origin.
    right.set(Math.sin(st.az), 0, -Math.cos(st.az)).multiplyScalar(st.shift);
    target.set(0, 1.5, 0).add(right);
    camera.position.set(Math.cos(st.az) * st.radius + right.x, st.height, Math.sin(st.az) * st.radius + right.z);
    camera.lookAt(target);
  });

  return null;
}

export interface RepoSceneProps {
  repos: RepoStat[];
  /** Render loop runs only while true (section visible, tab visible). */
  active: boolean;
  /** -1 text on the left, 1 text on the right, 0 centred */
  heroSide: number;
  statsSide: number;
  /** Called if the device can't keep up — parent swaps to the static poster. */
  onFallback: () => void;
}

const RepoScene = ({ repos, active, heroSide, statsSide, onFallback }: RepoSceneProps) => {
  const maxDpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.25 : 1.5) : 1;
  const [dpr, setDpr] = useState(maxDpr);
  const nodes = useMemo<ColumnNode[]>(
    () => layoutColumns(repos).map((c) => ({ ...c, color: new THREE.Color(c.color) })),
    [repos],
  );
  const box = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const edges = useMemo(() => new THREE.EdgesGeometry(box), [box]);

  useEffect(
    () => () => {
      box.dispose();
      edges.dispose();
    },
    [box, edges],
  );

  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={dpr}
      camera={{ fov: 34, near: 0.1, far: 90, position: [14, 9, 12] }}
      gl={{ antialias: false, alpha: false, stencil: false, powerPreference: 'high-performance' }}
    >
      <PerformanceMonitor
        flipflops={3}
        onDecline={() => setDpr(1)}
        onIncline={() => setDpr(maxDpr)}
        onFallback={onFallback}
      />
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 16, 40]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[-6, 12, 5]} intensity={1.2} color="#d6ecff" />
      <directionalLight position={[8, 4, -6]} intensity={0.35} color="#45e39c" />

      <Grid
        args={[80, 80]}
        cellSize={0.8}
        cellThickness={0.6}
        cellColor="#172022"
        sectionSize={4}
        sectionThickness={1}
        sectionColor="#1f3a31"
        fadeDistance={34}
        fadeStrength={1.6}
        infiniteGrid
      />

      <Traces nodes={nodes} />
      {nodes.map((node) => (
        <Column key={node.repo.name} node={node} box={box} edges={edges} />
      ))}
      <HighlightLabel nodes={nodes} />
      <CameraRig heroSide={heroSide} statsSide={statsSide} />

      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur intensity={0.9} luminanceThreshold={0.6} luminanceSmoothing={0.2} radius={0.72} />
      </EffectComposer>
    </Canvas>
  );
};

export default RepoScene;
