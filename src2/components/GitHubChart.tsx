/**
 * Template 2's rendering of the shared GitHub dataset: hand-drawn SVG, one
 * accent, hairline axes, values at the bar tips, and an inline readout in
 * place of floating tooltips. Every chart has a table twin in GitHubStats.
 */
import { useEffect, useId, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import type { ContributionPoint, LanguageShare, RepoStat } from '../../shared/github/githubDataset';
import { formatMonthYear } from '../../shared/github/githubDataset';
import { EASE_PAPER } from '../motion';

const ACCENT = 'hsl(var(--primary))';
const INK_SOFT = 'hsl(var(--foreground) / 0.22)';
const RULE = 'hsl(var(--border))';

/** Tracks an element's content width so SVG text stays at true pixel size. */
function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

const inView = { once: true, margin: '0px 0px -10% 0px' } as const;

/* ── Commits by repository ─────────────────────────────────────────────── */

const ROW = 30;
const BAR = 10;

export function CommitsByRepo({ repos }: { repos: RepoStat[] }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...repos.map((r) => r.commits));
  const labelW = width < 420 ? 104 : 136;
  const valueW = 44;
  const plotW = Math.max(0, width - labelW - valueW);
  const height = repos.length * ROW;
  const shown = repos[active ?? 0];
  // Observe the chart, not each bar: a zero-width clipped bar never "intersects".
  const seen = useInView(ref, inView);
  const clipId = `bars${useId().replace(/:/g, '')}`;

  return (
    <figure>
      <figcaption className="mb-4 flex items-baseline justify-between gap-4">
        <span className="font-medium text-foreground">Commits by repository</span>
        <span className="t2-meta">top {repos.length}</span>
      </figcaption>
      <div ref={ref} className="w-full" onMouseLeave={() => setActive(null)}>
        {width > 0 && (
          <svg width={width} height={height} role="list" aria-label="Commits per repository">
            {/* Clips each bar's left rounding so it sits square on the baseline */}
            <defs>
              <clipPath id={clipId}>
                <rect x={labelW + 1} y={0} width={width} height={height} />
              </clipPath>
            </defs>
            <line x1={labelW + 0.5} x2={labelW + 0.5} y1={0} y2={height} stroke={RULE} strokeWidth={1} />
            {repos.map((repo, i) => {
              const w = Math.max(2, (repo.commits / max) * plotW);
              const isActive = active === null ? i === 0 : active === i;
              const fill = isActive ? ACCENT : INK_SOFT;
              const y = (ROW - BAR) / 2;
              return (
                <g
                  key={repo.name}
                  transform={`translate(0, ${i * ROW})`}
                  role="listitem"
                  tabIndex={0}
                  aria-label={`${repo.name}: ${repo.commits} commits, ${repo.stars} stars, ${repo.language}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  className="cursor-default outline-none"
                >
                  {/* Full-row hit target, wider than the mark */}
                  <rect x={0} y={0} width={width} height={ROW} fill={active === i ? 'hsl(var(--t2-highlight))' : 'transparent'} rx={2} />
                  <text
                    x={labelW - 12}
                    y={ROW / 2}
                    dominantBaseline="central"
                    textAnchor="end"
                    className="font-plex-mono text-[11px]"
                    fill={isActive ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))'}
                  >
                    {repo.name.length > 16 ? `${repo.name.slice(0, 15)}…` : repo.name}
                  </text>
                  {/* 4px rounded data-end, square at the baseline (left rounding clipped) */}
                  <g clipPath={`url(#${clipId})`}>
                    <motion.rect
                      x={labelW - 3}
                      y={y}
                      height={BAR}
                      rx={4}
                      fill={fill}
                      initial={{ width: 0 }}
                      animate={{ width: seen ? w + 4 : 0 }}
                      transition={{ duration: 1.1, delay: 0.05 * i, ease: EASE_PAPER }}
                      style={{ transition: 'fill 200ms ease' }}
                    />
                  </g>
                  <motion.text
                    x={labelW + 1 + w + 8}
                    y={ROW / 2}
                    dominantBaseline="central"
                    className="text-[12px] tabular-nums"
                    fill={isActive ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: seen ? 1 : 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + 0.05 * i }}
                  >
                    {repo.commits}
                  </motion.text>
                </g>
              );
            })}
          </svg>
        )}
      </div>
      {shown && (
        <p className="t2-meta mt-4 min-h-[1.25rem]" aria-live="polite">
          <span className="text-foreground">{shown.name}</span> · {shown.language} · {shown.stars} stars · {shown.forks} forks
          {shown.updatedAt && <> · updated {formatMonthYear(shown.updatedAt)}</>}
        </p>
      )}
    </figure>
  );
}

/* ── Language share ────────────────────────────────────────────────────── */

export function LanguageRanks({ languages }: { languages: LanguageShare[] }) {
  const max = Math.max(1, ...languages.map((l) => l.percent));
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref, inView);
  return (
    <figure ref={ref}>
      <figcaption className="mb-4 flex items-baseline justify-between gap-4">
        <span className="font-medium text-foreground">Languages</span>
        <span className="t2-meta">share of repositories</span>
      </figcaption>
      <ul className="space-y-3">
        {languages.map((l, i) => (
          <li key={l.name} className="grid grid-cols-[6.5rem_1fr_3rem] items-center gap-3 text-sm">
            <span className={i === 0 ? 'text-foreground' : 'text-muted-foreground'}>{l.name}</span>
            <span className="h-[2px] bg-border">
              <motion.span
                className="block h-full origin-left"
                style={{ width: `${(l.percent / max) * 100}%`, backgroundColor: i === 0 ? ACCENT : 'hsl(var(--foreground) / 0.35)' }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: seen ? 1 : 0 }}
                transition={{ duration: 1, delay: 0.06 * i, ease: EASE_PAPER }}
              />
            </span>
            <span className="t2-meta text-right tabular-nums">{l.percent}%</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

/* ── 90-day activity ───────────────────────────────────────────────────── */

const STRIP_H = 64;
const fmtDay = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export function ActivityStrip({ points }: { points: ContributionPoint[] }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...points.map((p) => p.count));
  const slot = points.length ? width / points.length : 0;
  const colW = Math.max(1.5, slot - 2);
  const total = points.reduce((a, p) => a + p.count, 0);
  const focus = active !== null ? points[active] : null;
  const seen = useInView(ref, inView);

  if (!points.length) return null;

  return (
    <figure>
      <figcaption className="mb-4 flex items-baseline justify-between gap-4">
        <span className="font-medium text-foreground">Last {points.length} days</span>
        <span className="t2-meta" aria-live="polite">
          {focus ? (
            <>
              {fmtDay(focus.date)} · <span className="text-foreground">{focus.count}</span> contribution{focus.count === 1 ? '' : 's'}
            </>
          ) : (
            <>{total} contributions</>
          )}
        </span>
      </figcaption>
      <div ref={ref} className="w-full" onMouseLeave={() => setActive(null)}>
        {width > 0 && (
          <svg width={width} height={STRIP_H + 1} aria-hidden="true">
            <line x1={0} x2={width} y1={STRIP_H + 0.5} y2={STRIP_H + 0.5} stroke={RULE} strokeWidth={1} />
            {points.map((p, i) => {
              const h = p.count > 0 ? 6 + (p.count / max) * (STRIP_H - 8) : 2;
              const x = i * slot + (slot - colW) / 2;
              return (
                <g key={p.date} onMouseEnter={() => setActive(i)}>
                  <rect x={i * slot} y={0} width={slot} height={STRIP_H} fill="transparent" />
                  <motion.rect
                    x={x}
                    width={colW}
                    rx={Math.min(2, colW / 2)}
                    fill={p.count > 0 ? (active === i ? 'hsl(var(--foreground))' : ACCENT) : 'hsl(var(--foreground) / 0.12)'}
                    initial={{ height: 0, y: STRIP_H }}
                    animate={seen ? { height: h, y: STRIP_H - h } : { height: 0, y: STRIP_H }}
                    transition={{ duration: 0.8, delay: i * 0.006, ease: EASE_PAPER }}
                  />
                </g>
              );
            })}
          </svg>
        )}
      </div>
      <div className="t2-meta mt-2 flex justify-between">
        <span>{fmtDay(points[0].date)}</span>
        <span>{fmtDay(points[points.length - 1].date)}</span>
      </div>
    </figure>
  );
}
