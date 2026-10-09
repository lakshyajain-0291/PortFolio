/**
 * Repo → column geometry, shared by the live WebGL scene (RepoScene) and its
 * static SVG fallback (PosterColumns). Kept free of three.js so the fallback
 * doesn't pull the 3D chunk.
 *
 *   height    ← log(commits)
 *   footprint ← forks
 *   cap glow  ← stars
 *   colour    ← primary language
 */
import type { RepoStat } from '../../../shared/github/githubDataset';
import { languageColor } from './palette';

export interface ColumnLayout {
  repo: RepoStat;
  x: number;
  z: number;
  height: number;
  width: number;
  color: string;
  capGlow: number;
  delay: number;
}

export const MAX_COLUMNS = 24;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/** Deterministic 0–1 value from a string, for stable jitter. */
const hash01 = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return ((h >>> 0) % 10_000) / 10_000;
};

/** Loose phyllotaxis cluster: busiest repositories near the centre. */
export function layoutColumns(repos: RepoStat[]): ColumnLayout[] {
  return repos.slice(0, MAX_COLUMNS).map((repo, i) => {
    const jitter = hash01(repo.name);
    const radius = 1.7 * Math.sqrt(i + 0.55) + (jitter - 0.5) * 0.5;
    const angle = i * GOLDEN_ANGLE + (jitter - 0.5) * 0.35;
    return {
      repo,
      x: Math.cos(angle) * radius,
      z: Math.sin(angle) * radius,
      height: 0.45 + Math.log2(repo.commits + 1) * 0.6,
      width: 0.5 + Math.min(0.55, Math.sqrt(repo.forks) * 0.2),
      color: languageColor(repo.language),
      capGlow: 0.55 + Math.min(2.1, Math.sqrt(repo.stars) * 0.6),
      delay: 0.25 + i * 0.07,
    };
  });
}
