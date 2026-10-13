import { useEffect, useRef, useState } from 'react';
import type { ArchitectureSpec, ArchNodeKind } from '../../../shared/content';
import { layoutDiagram, roundedPath, type LayoutEdge, type LayoutNode } from '../../../shared/content/diagram/layout';
import { useElementWidth } from '../../../shared/content/diagram/hooks';
import { usePrefersReducedMotion } from '../../../shared/hooks/usePrefersReducedMotion';
import { Icon } from './Icon';

export const KIND_LABEL: Record<ArchNodeKind, string> = {
  client: 'client',
  service: 'service',
  worker: 'worker',
  store: 'store',
  queue: 'queue',
  external: 'external service',
  cluster: 'node cluster',
};

/** A number drawn on the sheet: a dimension line under a box, or a leader from a connection. */
export interface DrawnDimension {
  key: string;
  text: string;
  dashed: boolean;
  target: { node?: string; edge?: string };
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const overlap = (a: Rect, b: Rect) =>
  Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));

/** One placed dimension: the drafting line, the leader if any, and the label box. */
interface PlacedDimension {
  d: DrawnDimension;
  path: string;
  label: Rect;
  anchor: 'start' | 'end';
  /** Only the key fits clear of the drawing; the value is in the schedule. */
  keyOnly?: boolean;
}

const LABEL_H = 15;
const labelText = (d: DrawnDimension, keyOnly = false) => (keyOnly ? d.key : `${d.key}  ${d.text}`);
const labelWidth = (d: DrawnDimension, keyOnly = false) => labelText(d, keyOnly).length * 7.3 + 10;

/**
 * Places every dimension where its label covers the least: node boxes and group
 * labels are hard obstacles, connection lines and markers soft ones. A box
 * dimension runs along the box's bottom or top edge; a connection gets a leader
 * from its numbered marker in one of six directions.
 */
function placeDimensions(dims: DrawnDimension[], layout: ReturnType<typeof layoutDiagram>, height: number): PlacedDimension[] {
  const hard: Rect[] = [
    ...layout.nodes.map((n) => ({ x: n.x - 3, y: n.y - 9, w: n.w + 6, h: n.h + 12 })),
    ...layout.groups.map((g) => ({ x: g.x, y: g.y, w: Math.min(g.w, 24 + g.label.length * 7.6), h: 22 })),
  ];
  const soft: Rect[] = [
    ...layout.edges.map((e) => ({ x: e.marker.x - 12, y: e.marker.y - 12, w: 24, h: 24 })),
    ...layout.edges.flatMap((e) =>
      e.points.slice(1).map((b, i) => {
        const a = e.points[i];
        return { x: Math.min(a.x, b.x) - 2, y: Math.min(a.y, b.y) - 2, w: Math.abs(a.x - b.x) + 4, h: Math.abs(a.y - b.y) + 4 };
      }),
    ),
  ];
  const placed: PlacedDimension[] = [];
  const score = (r: Rect) => {
    if (r.x < 2 || r.y < 2 || r.x + r.w > layout.width - 2 || r.y + r.h > height - 2) return 1e9;
    return (
      hard.reduce((t, o) => t + overlap(r, o) * 50, 0) +
      placed.reduce((t, o) => t + overlap(r, o.label) * 50, 0) +
      soft.reduce((t, o) => t + overlap(r, o), 0)
    );
  };

  const optionsFor = (d: DrawnDimension, keyOnly: boolean): PlacedDimension[] => {
    const tw = labelWidth(d, keyOnly);
    const options: PlacedDimension[] = [];
    if (d.target.edge) {
      const e = layout.edges.find((x) => x.id === d.target.edge);
      if (!e) return [];
      const { x, y } = e.marker;
      for (const [sx, sy] of [[1, -1], [-1, -1], [1, 1], [-1, 1]] as const) {
        const ex = x + sx * 26;
        const ey = y + sy * 24;
        const shelf = ex + sx * tw;
        options.push({
          d,
          path: `M ${x + sx * 8} ${y + sy * 8} L ${ex} ${ey} H ${shelf}`,
          label: { x: Math.min(ex, shelf), y: ey - LABEL_H - 1, w: tw, h: LABEL_H },
          anchor: sx > 0 ? 'start' : 'end',
        });
      }
      for (const sx of [1, -1] as const) {
        const ex = x + sx * 16;
        options.push({
          d,
          path: `M ${x + sx * 11} ${y} H ${ex + sx * tw}`,
          label: { x: sx > 0 ? ex : ex - tw, y: y - LABEL_H - 2, w: tw, h: LABEL_H },
          anchor: sx > 0 ? 'start' : 'end',
        });
      }
    } else {
      const n = layout.nodes.find((x) => x.id === d.target.node);
      if (!n) return [];
      const w = n.w - (n.node.kind === 'cluster' ? 7 : 0);
      for (const ly of [n.y + n.h + 12, n.y - 14]) {
        for (const at of [0.04, 0.5, 0.96]) {
          const lx = Math.max(n.x, Math.min(n.x + w - tw, n.x + w * at - tw * at));
          options.push({
            d,
            path: `M ${n.x} ${ly} H ${n.x + w} M ${n.x} ${ly - 5} V ${ly + 5} M ${n.x + w} ${ly - 5} V ${ly + 5}`,
            label: { x: lx, y: ly - LABEL_H / 2, w: tw, h: LABEL_H },
            anchor: 'start',
          });
        }
      }
    }
    return options.map((o) => ({ ...o, keyOnly }));
  };

  dims.forEach((d) => {
    const pick = (opts: PlacedDimension[]) => opts.reduce((a, b) => (score(b.label) < score(a.label) ? b : a));
    const full = optionsFor(d, false);
    if (!full.length) return;
    let best = pick(full);
    // Covering a component or a label is worse than shortening the note to its key.
    if (score(best.label) >= 50) {
      const short = pick(optionsFor(d, true));
      if (score(short.label) < score(best.label)) best = short;
    }
    placed.push(best);
  });
  return placed;
}

function Dimension({ p }: { p: PlacedDimension }) {
  const { label } = p;
  return (
    <g className="d-dim" data-dashed={p.d.dashed}>
      <path className="d-line" d={p.path} />
      <rect className="d-bg" x={label.x} y={label.y} width={label.w} height={label.h} />
      <text className="d-text" x={p.anchor === 'start' ? label.x + 5 : label.x + label.w - 5} y={label.y + 11} textAnchor={p.anchor}>
        {labelText(p.d, p.keyOnly)}
      </text>
    </g>
  );
}

export interface Lit {
  nodes: Set<string>;
  edges: Set<string>;
}

/** Condensed caps run about 8.6px per character at 15px. */
const LABEL_CHAR_PX = 8.6;

function wrapLabel(label: string, width: number): string[] {
  if (label.length * LABEL_CHAR_PX <= width) return [label];
  const words = label.split(' ');
  let best: [string, string] = [label, ''];
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' ');
    const b = words.slice(i).join(' ');
    const diff = Math.max(a.length, b.length);
    if (diff < bestDiff) {
      best = [a, b];
      bestDiff = diff;
    }
  }
  return best[1] ? best : [label];
}

function NodeShape({ n }: { n: LayoutNode }) {
  const { x, y, w, h, node } = n;
  const common = { 'data-kind': node.kind, 'data-status': node.status } as const;
  if (node.kind === 'cluster') {
    return (
      <>
        <rect className="n-box" {...common} x={x + 7} y={y - 7} width={w - 7} height={h} />
        <rect className="n-box" {...common} x={x + 3.5} y={y - 3.5} width={w - 7} height={h} />
        <rect className="n-box" {...common} x={x} y={y} width={w - 7} height={h} />
      </>
    );
  }
  if (node.kind === 'store') {
    return (
      <>
        <rect className="n-box" {...common} x={x} y={y} width={w} height={h} rx={4} />
        <path className="n-box" {...common} d={`M ${x} ${y + 9} H ${x + w} M ${x} ${y + 14} H ${x + w}`} style={{ fill: 'none' }} />
      </>
    );
  }
  return <rect className="n-box" {...common} x={x} y={y} width={w} height={h} rx={node.kind === 'client' ? 10 : 0} />;
}

/** Orange corner ticks: the revision mark on the selected component. */
function Ticks({ n }: { n: LayoutNode }) {
  const { x, y, w, h } = n;
  const t = 9;
  const o = 4;
  const d = [
    `M ${x - o} ${y - o + t} V ${y - o} H ${x - o + t}`,
    `M ${x + w + o - t} ${y - o} H ${x + w + o} V ${y - o + t}`,
    `M ${x + w + o} ${y + h + o - t} V ${y + h + o} H ${x + w + o - t}`,
    `M ${x - o + t} ${y + h + o} H ${x - o} V ${y + h + o - t}`,
  ].join(' ');
  return <path className="n-tick" d={d} />;
}

function Arrowhead({ e }: { e: LayoutEdge }) {
  const pts = e.points;
  if (pts.length < 2) return null;
  const tip = pts[pts.length - 1];
  const prev = pts[pts.length - 2];
  const angle = Math.atan2(tip.y - prev.y, tip.x - prev.x);
  const size = 8;
  const p = (a: number) => `${tip.x - size * Math.cos(angle + a)},${tip.y - size * Math.sin(angle + a)}`;
  return <polygon className="e-head" points={`${tip.x},${tip.y} ${p(0.36)} ${p(-0.36)}`} />;
}

/** True once the element has been on screen; the line draw runs then, once. */
function useSeenOnce<T extends Element>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -15% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);
  return { ref, seen };
}

export function BlueprintDrawing({
  spec,
  lit,
  selected,
  onSelect,
  dims = [],
}: {
  spec: ArchitectureSpec;
  lit: Lit;
  selected: string | null;
  onSelect: (id: string) => void;
  dims?: DrawnDimension[];
}) {
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const seen = useSeenOnce<HTMLDivElement>();
  const reduced = usePrefersReducedMotion();
  const layout = width >= 240 ? layoutDiagram(spec, width, { nodeHeight: 64 }) : null;
  const active = lit.nodes.size > 0;
  // Room below the last row for dimension lines.
  const height = layout ? layout.height + (dims.length ? 24 : 0) : 0;
  const summary = `${spec.title}. ${spec.nodes.length} components and ${spec.edges.length} connections, listed below the drawing.`;

  return (
    <div
      ref={(el) => {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
        (seen.ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
      }}
    >
      {layout && (
        <svg
          className="a-diagram"
          width={layout.width}
          height={height}
          viewBox={`0 0 ${layout.width} ${height}`}
          role="img"
          aria-label={summary}
          data-drawn={seen.seen || reduced}
        >
          {layout.groups.map((g) => (
            <g key={g.id}>
              <rect className="g-box" x={g.x} y={g.y} width={g.w} height={g.h} />
              <text className="g-label" x={g.x + 10} y={g.y + 16}>
                {g.label.toUpperCase()}
              </text>
            </g>
          ))}
          {layout.edges.map((e) => {
            const on = lit.edges.has(e.id);
            const d = roundedPath(e.points);
            return (
              <g key={e.id} data-lit={on} data-dim={active && !on}>
                <path className="e-line" data-async={e.edge.sync === false} d={d} />
                <path className="e-draw" data-async={e.edge.sync === false} d={d} pathLength={1} style={{ opacity: on ? 0 : undefined }} />
                <Arrowhead e={e} />
              </g>
            );
          })}
          {layout.edges.map((e) => {
            const on = lit.edges.has(e.id);
            return (
              <g key={`m-${e.id}`} data-lit={on} data-dim={active && !on}>
                <circle className="e-mark" cx={e.marker.x} cy={e.marker.y} r={11} />
                <text className="e-mark-n" x={e.marker.x} y={e.marker.y + 4.2} textAnchor="middle">
                  {e.index}
                </text>
              </g>
            );
          })}
          {layout.nodes.map((n) => {
            const lines = wrapLabel(n.node.label.toUpperCase(), n.w - 30);
            const kind = n.node.status === 'planned' ? 'planned' : KIND_LABEL[n.node.kind];
            const on = lit.nodes.has(n.id);
            const inset = n.node.kind === 'cluster' ? 7 : 0;
            return (
              <g key={n.id} data-lit={on} data-dim={active && !on} data-selected={selected === n.id}>
                <NodeShape n={n} />
                <Ticks n={{ ...n, w: n.w - inset }} />
                {lines.map((line, i) => (
                  <text key={line} className="n-label" x={n.x + 14} y={n.y + (lines.length > 1 ? 24 + i * 17 : 28)}>
                    {line}
                  </text>
                ))}
                {lines.length === 1 && (
                  <text className="n-kind" x={n.x + 14} y={n.y + 48}>
                    {kind}
                  </text>
                )}
                <rect className="n-hit" x={n.x} y={n.y} width={n.w} height={n.h} onClick={() => onSelect(n.id)} aria-hidden="true" />
              </g>
            );
          })}
          {placeDimensions(dims, layout, height).map((p) => (
            <Dimension key={p.d.key} p={p} />
          ))}
        </svg>
      )}
    </div>
  );
}

export interface StepRef {
  flow: number;
  step: number;
}

/** Steps through a system's flows; the same step drives the drawing and the 3D model. */
export function FlowStepper({
  spec,
  at,
  onChange,
}: {
  spec: ArchitectureSpec;
  at: StepRef | null;
  onChange: (at: StepRef | null) => void;
}) {
  if (!spec.flows.length) return null;
  const flowIndex = at?.flow ?? 0;
  const flow = spec.flows[flowIndex];
  const step = at ? flow.steps[at.step] : null;
  const go = (i: number) => onChange({ flow: flowIndex, step: Math.max(0, Math.min(flow.steps.length - 1, i)) });

  return (
    <div className="a-flows" data-active={Boolean(step)}>
      <h3 className="a-block-h" id={`flows-${spec.id}`}>
        Flows
      </h3>
      <div className="a-flow-tabs" role="group" aria-labelledby={`flows-${spec.id}`}>
        {spec.flows.map((f, i) => (
          <button
            key={f.id}
            type="button"
            className="a-btn a-btn-small"
            aria-pressed={at?.flow === i}
            onClick={() => onChange(at?.flow === i ? null : { flow: i, step: 0 })}
          >
            {f.title}
          </button>
        ))}
      </div>
      <div className="a-step" aria-live="polite">
        {step ? (
          <>
            <span className="a-step-count a-mono">
              {String((at?.step ?? 0) + 1).padStart(2, '0')} / {String(flow.steps.length).padStart(2, '0')}
            </span>
            <p className="a-step-title">{step.title}</p>
            <p className="a-step-text">{step.text}</p>
          </>
        ) : (
          <p className="a-step-text" style={{ gridColumn: '1 / -1' }}>
            Pick a flow to walk through it one step at a time. Each step lights the parts of the drawing it uses.
          </p>
        )}
      </div>
      {at && (
        <div className="a-step-controls">
          <button type="button" className="a-btn a-btn-small" onClick={() => go(at.step - 1)} disabled={at.step === 0}>
            <Icon name="prev" />
            Previous
          </button>
          <button type="button" className="a-btn a-btn-small" onClick={() => go(at.step + 1)} disabled={at.step === flow.steps.length - 1}>
            Next
            <Icon name="next" />
          </button>
          <button type="button" className="a-btn a-btn-small" onClick={() => onChange(null)}>
            Clear
          </button>
          <span className="a-pips" aria-hidden="true">
            {flow.steps.map((s, i) => (
              <span key={s.id} data-on={i <= at.step} />
            ))}
          </span>
        </div>
      )}
    </div>
  );
}
