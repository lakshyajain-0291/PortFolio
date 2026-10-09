import { useMemo } from 'react';
import type { RepoStat } from '../../../shared/github/githubDataset';
import { layoutColumns } from './columnLayout';

const COS30 = Math.cos(Math.PI / 6);
const SIN30 = 0.5;
const SCALE = 26;

/**
 * Static isometric rendering of the repo field — shown instead of the WebGL
 * scene under prefers-reduced-motion, without WebGL, or on low-end devices.
 * Same layout and encoding as RepoScene, so the identity survives the fallback.
 */
const PosterColumns = ({ repos }: { repos: RepoStat[] }) => {
  const shapes = useMemo(() => {
    const iso = (x: number, y: number, z: number): [number, number] => [(x - z) * COS30 * SCALE, ((x + z) * SIN30 - y) * SCALE];
    const pts = (list: Array<[number, number]>) => list.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(' ');

    return layoutColumns(repos)
      .sort((a, b) => a.x + a.z - (b.x + b.z)) // paint back to front
      .map((c) => {
        const w = c.width / 2;
        const [x0, x1, z0, z1, h] = [c.x - w, c.x + w, c.z - w, c.z + w, c.height];
        return {
          key: c.repo.name,
          color: c.color,
          glow: Math.min(1, 0.35 + c.capGlow / 3),
          top: pts([iso(x0, h, z0), iso(x1, h, z0), iso(x1, h, z1), iso(x0, h, z1)]),
          left: pts([iso(x0, 0, z1), iso(x1, 0, z1), iso(x1, h, z1), iso(x0, h, z1)]),
          right: pts([iso(x1, 0, z0), iso(x1, 0, z1), iso(x1, h, z1), iso(x1, h, z0)]),
        };
      });
  }, [repos]);

  return (
    <svg
      className="absolute right-[-6vw] top-1/2 h-[80vh] w-[min(70vw,900px)] -translate-y-1/2 opacity-70 md:right-[2vw]"
      viewBox="-260 -230 520 420"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {shapes.map((s) => (
        <g key={s.key} strokeWidth={0.8} strokeLinejoin="round">
          <polygon points={s.left} fill="#0c1113" stroke={s.color} strokeOpacity={0.75} />
          <polygon points={s.right} fill="#0a0e10" stroke={s.color} strokeOpacity={0.55} />
          <polygon points={s.top} fill={s.color} fillOpacity={s.glow} stroke={s.color} />
        </g>
      ))}
    </svg>
  );
};

export default PosterColumns;
