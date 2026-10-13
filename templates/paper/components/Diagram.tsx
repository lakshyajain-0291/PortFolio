import { Suspense, lazy, useEffect, useRef, useState, type ComponentType, type LazyExoticComponent } from 'react';
import type { ArchitectureSpec, ArchNodeKind, FlowStep } from '../../../shared/content';
import { useFlowPlayer } from '../../../shared/content/diagram/flowPlayer';
import { useDiagramSelection, useElementWidth } from '../../../shared/content/diagram/hooks';
import { layoutDiagram, roundedPath, type LayoutEdge, type LayoutNode } from '../../../shared/content/diagram/layout';
import { usePrefersReducedMotion } from '../../../shared/hooks/usePrefersReducedMotion';
import { SceneErrorBoundary, sceneUnavailableReason } from '../../../shared/three/guards';
import type { SceneProps, SceneTheme } from '../../../shared/three/scenes/kit';

/** Each model is its own chunk with three.js, fetched only when a reader opens it. */
const SCENES: Record<string, LazyExoticComponent<ComponentType<SceneProps>>> = {
  libr: lazy(() => import('../../../shared/three/scenes/libr')),
  'mini-k8ts': lazy(() => import('../../../shared/three/scenes/miniK8ts')),
  filenest: lazy(() => import('../../../shared/three/scenes/fileNest')),
};

export const hasModel = (id: string) => Boolean(SCENES[id]);

const KIND_LABEL: Record<ArchNodeKind, string> = {
  client: 'client',
  service: 'service',
  worker: 'worker',
  store: 'store',
  queue: 'queue',
  external: 'external service',
  cluster: 'node cluster',
};

export interface Lit {
  nodes: Set<string>;
  edges: Set<string>;
}

const NONE: Lit = { nodes: new Set(), edges: new Set() };
export const litFor = (step: FlowStep | null | undefined): Lit => (step ? { nodes: new Set(step.nodes), edges: new Set(step.edges) } : NONE);

const LABEL_CHAR_PX = 7.7;

/** Splits a label into at most two lines that fit the box. */
function wrapLabel(label: string, width: number): string[] {
  if (label.length * LABEL_CHAR_PX <= width) return [label];
  const words = label.split(' ');
  let best: [string, string] = [label, ''];
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' ');
    const b = words.slice(i).join(' ');
    const diff = Math.abs(a.length - b.length);
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
        <rect className="n-box" {...common} x={x + 6} y={y - 6} width={w - 6} height={h} />
        <rect className="n-box" {...common} x={x} y={y} width={w - 6} height={h} />
      </>
    );
  }
  if (node.kind === 'store' || node.kind === 'client') {
    // Stores carry a lid rule, clients a title-bar rule.
    const r = node.kind === 'store' ? 8 : 5;
    return (
      <>
        <rect className="n-box" {...common} x={x} y={y} width={w} height={h} />
        <path className="n-box" {...common} d={`M ${x} ${y + r} H ${x + w}`} style={{ fill: 'none' }} />
      </>
    );
  }
  return <rect className="n-box" {...common} x={x} y={y} width={w} height={h} />;
}

function Arrowhead({ e }: { e: LayoutEdge }) {
  const pts = e.points;
  if (pts.length < 2) return null;
  const tip = pts[pts.length - 1];
  const prev = pts[pts.length - 2];
  const angle = Math.atan2(tip.y - prev.y, tip.x - prev.x);
  const size = 7;
  const p = (a: number) => `${tip.x - size * Math.cos(angle + a)},${tip.y - size * Math.sin(angle + a)}`;
  return <polygon className="e-head" points={`${tip.x},${tip.y} ${p(0.42)} ${p(-0.42)}`} />;
}

/** The figure itself: an SVG drawn at true pixel width from the shared layout. */
export function DiagramSvg({
  spec,
  lit,
  onSelect,
  pulse = false,
  stepNumber,
}: {
  spec: ArchitectureSpec;
  lit: Lit;
  onSelect?: (id: string) => void;
  /** Send a marker along the lit connections. */
  pulse?: boolean;
  /**
   * While a flow step plays, its connections carry the step's number and the
   * rest carry none, so the figure never shows a number the step counter doesn't.
   */
  stepNumber?: number;
}) {
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const reduced = usePrefersReducedMotion();
  const layout = width >= 240 ? layoutDiagram(spec, width) : null;
  const active = lit.nodes.size > 0 || lit.edges.size > 0;
  const summary = `${spec.title}. ${spec.nodes.length} components and ${spec.edges.length} connections, listed in the text.`;

  return (
    <div className="p-figure-frame" ref={ref}>
      {layout && (
        <svg className="p-diagram" width={layout.width} height={layout.height} viewBox={`0 0 ${layout.width} ${layout.height}`} role="img" aria-label={summary}>
          {layout.groups.map((g) => (
            <g key={g.id}>
              <rect className="g-box" x={g.x} y={g.y} width={g.w} height={g.h} />
              <text className="g-label" x={g.x + 10} y={g.y + 16}>
                {g.label}
              </text>
            </g>
          ))}
          {layout.edges.map((e) => {
            const on = lit.edges.has(e.id);
            const d = roundedPath(e.points);
            return (
              <g key={e.id} data-lit={on} data-dim={active && !on}>
                <path className="e-line" data-async={e.edge.sync === false} d={d} />
                <Arrowhead e={e} />
                {on && pulse && !reduced && (
                  <circle className="e-pulse" r={3.5}>
                    <animateMotion dur="1.6s" repeatCount="indefinite" path={d} />
                  </circle>
                )}
              </g>
            );
          })}
          {layout.edges.map((e) => {
            const on = lit.edges.has(e.id);
            if (stepNumber !== undefined && !on) return null;
            return (
              <g key={`m-${e.id}`} data-lit={on} data-dim={active && !on}>
                <rect className="e-mark" x={e.marker.x - 10} y={e.marker.y - 10} width={20} height={20} />
                <text className="e-mark-n" x={e.marker.x} y={e.marker.y + 4.2} textAnchor="middle">
                  {stepNumber ?? e.index}
                </text>
              </g>
            );
          })}
          {layout.nodes.map((n) => {
            const lines = wrapLabel(n.node.label, n.w - 24);
            const kind = n.node.status === 'planned' ? 'planned' : KIND_LABEL[n.node.kind];
            return (
              <g key={n.id} data-lit={lit.nodes.has(n.id)} data-dim={active && !lit.nodes.has(n.id)}>
                <NodeShape n={n} />
                {lines.map((line, i) => (
                  <text key={line} className="n-label" x={n.x + 12} y={n.y + (lines.length > 1 ? 23 + i * 17 : 28)}>
                    {line}
                  </text>
                ))}
                {lines.length === 1 && (
                  <text className="n-kind" x={n.x + 12} y={n.y + 46}>
                    {kind}
                  </text>
                )}
                {onSelect && <rect className="n-hit" x={n.x} y={n.y} width={n.w} height={n.h} onClick={() => onSelect(n.id)} aria-hidden="true" />}
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}

/** Segmented timeline: one segment per step, the current one filling over the step's time. */
function Timeline({
  steps,
  index,
  running,
  interval,
  onJump,
  label,
}: {
  steps: FlowStep[];
  index: number;
  running: boolean;
  interval: number;
  onJump: (i: number) => void;
  label: string;
}) {
  return (
    <ol className="p-timeline" aria-label={label}>
      {steps.map((s, i) => (
        <li key={s.id}>
          <button type="button" onClick={() => onJump(i)} aria-current={i === index ? 'step' : undefined} aria-label={`Step ${i + 1}: ${s.title}`}>
            <span className="p-seg" data-state={i < index ? 'done' : i === index ? 'now' : 'todo'}>
              {i === index && (
                <span key={`${index}-${running}`} className="p-seg-fill" data-running={running} style={{ animationDuration: `${interval}ms` }} />
              )}
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}

const STEP_MS = 3800;

/**
 * A figure that walks through one of its flows on a loop. Used on the home
 * page: no buttons to learn, it simply plays; the timeline jumps and Pause stops.
 */
export function LoopingFigure({ spec, figure, caption }: { spec: ArchitectureSpec; figure: number; caption?: string }) {
  const [flowIndex, setFlowIndex] = useState(0);
  const flow = spec.flows[flowIndex];
  const player = useFlowPlayer<HTMLElement>(flow?.steps.length ?? 0, STEP_MS);
  const step = flow?.steps[player.index];

  return (
    <figure className="p-figure p-loop" ref={player.ref} {...player.holdProps} aria-labelledby={`lf-${spec.id}`}>
      <DiagramSvg spec={spec} lit={litFor(step)} pulse={player.running} stepNumber={step ? player.index + 1 : undefined} />
      {flow && (
        <div className="p-player">
          <div className="p-player-head">
            <button
              type="button"
              className="p-play"
              onClick={() => player.setPlaying(!player.playing)}
              aria-label={player.playing ? `Pause the ${flow.title.toLowerCase()} walkthrough` : `Play the ${flow.title.toLowerCase()} walkthrough`}
            >
              <svg viewBox="0 0 12 12" aria-hidden="true">
                {player.playing ? <path d="M3 2v8M9 2v8" /> : <path d="M3 1.5v9l7.5-4.5z" />}
              </svg>
            </button>
            {spec.flows.length > 1 ? (
              <span className="p-flow-pick" role="group" aria-label="Flow">
                {spec.flows.map((f, i) => (
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={i === flowIndex}
                    onClick={() => {
                      setFlowIndex(i);
                      player.jump(0);
                    }}
                  >
                    {f.title}
                  </button>
                ))}
              </span>
            ) : (
              <span className="p-flow-name">{flow.title}</span>
            )}
          </div>
          <Timeline steps={flow.steps} index={player.index} running={player.running} interval={STEP_MS} onJump={player.jump} label={`${flow.title}, steps`} />
          <p className="p-step-now" aria-live={player.running ? 'off' : 'polite'}>
            <span className="p-mono p-step-n">
              {player.index + 1}/{flow.steps.length}
            </span>{' '}
            <strong>{step?.title}.</strong> {step?.text}
          </p>
        </div>
      )}
      <figcaption className="p-figcaption" id={`lf-${spec.id}`}>
        <strong>Figure {figure}.</strong> {caption ?? spec.caption}
      </figcaption>
    </figure>
  );
}

function themeForScene(): SceneTheme {
  const root = document.documentElement;
  const forced = root.getAttribute('data-theme');
  if (forced === 'dark') return 'paper-dark';
  if (forced === 'light') return 'paper';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'paper-dark' : 'paper';
}

function Model({ spec, step }: { spec: ArchitectureSpec; step: { flowId: string; step: FlowStep } | null }) {
  const reduced = usePrefersReducedMotion();
  const [failed, setFailed] = useState(false);
  const [reason] = useState(sceneUnavailableReason);
  const [theme] = useState(themeForScene);
  const Scene = SCENES[spec.id];
  if (!Scene || reason || failed) {
    return (
      <p className="p-note p-model-note">
        {failed ? 'The 3D model stopped working in this browser.' : (reason ?? 'There is no 3D model for this system.')} The drawing shows the same
        system.
      </p>
    );
  }
  return (
    <div className="p-model">
      <SceneErrorBoundary onError={() => setFailed(true)}>
        <Suspense fallback={<p className="p-note p-model-note">Loading the 3D model.</p>}>
          <Scene
            theme={theme}
            litNodes={new Set(step?.step.nodes ?? [])}
            litEdges={new Set(step?.step.edges ?? [])}
            flowId={step?.flowId ?? null}
            stepId={step?.step.id ?? null}
            reducedMotion={reduced}
          />
        </Suspense>
      </SceneErrorBoundary>
      <span className="p-model-hint">Drag to turn the model.</span>
    </div>
  );
}

/** Flat list of every step across a system's flows, for the scroll story. */
function allSteps(spec: ArchitectureSpec) {
  return spec.flows.flatMap((f, fi) => f.steps.map((s, si) => ({ flowIndex: fi, flowId: f.id, flowTitle: f.title, index: si, count: f.steps.length, step: s })));
}

type Selection = ReturnType<typeof useDiagramSelection>;

/**
 * The case-study figure. Desktop: the figure stays pinned at the top while the
 * reader scrolls the flows beneath it, and each step lights the figure as it
 * passes the reading line. Phones: the same figure plays the flows on a loop.
 * Either way the reader can switch the figure to a 3D model.
 */
export function StoryFigure({ spec, figure, selection }: { spec: ArchitectureSpec; figure: number; selection: Selection }) {
  const steps = allSteps(spec);
  const [active, setActive] = useState<number | null>(null);
  const [view, setView] = useState<'drawing' | 'model'>('drawing');
  const [wide, setWide] = useState(() => window.matchMedia('(min-width: 64rem)').matches);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const clearSelection = useRef(selection.select);
  clearSelection.current = selection.select;

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 64rem)');
    const on = () => setWide(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  useEffect(() => {
    if (!wide) return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) {
          setActive(Number((hit.target as HTMLElement).dataset.i));
          clearSelection.current(null);
        }
      },
      { rootMargin: '-58% 0px -28% 0px' },
    );
    stepRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [wide, spec]);

  // Picking a component takes over from the scroll position until the next step scrolls in.
  useEffect(() => {
    if (selection.selected) setActive(null);
  }, [selection.selected]);
  const current = active !== null ? steps[active] : null;
  const lit = current ? litFor(current.step) : selection.lit;
  const modelStep = current ? { flowId: current.flowId, step: current.step } : null;

  const toggle = hasModel(spec.id) && (
    <span className="p-view" role="group" aria-label="Figure view">
      <button type="button" aria-pressed={view === 'drawing'} onClick={() => setView('drawing')}>
        Drawing
      </button>
      <button type="button" aria-pressed={view === 'model'} onClick={() => setView('model')}>
        3D model
      </button>
    </span>
  );

  if (!wide) {
    return (
      <div className="p-story-narrow p-wide">
        {toggle && <div className="p-view-row">{toggle}</div>}
        {view === 'model' ? (
          <figure className="p-figure">
            <Model spec={spec} step={null} />
            <figcaption className="p-figcaption">
              <strong>Figure {figure}.</strong> {spec.caption}
            </figcaption>
          </figure>
        ) : (
          <LoopingFigure spec={spec} figure={figure} />
        )}
      </div>
    );
  }

  return (
    <div className="p-story p-wide">
      <div className="p-story-figure">
        <figure className="p-figure" aria-labelledby={`sf-${spec.id}`}>
          {toggle && <div className="p-view-row">{toggle}</div>}
          {view === 'model' ? <Model spec={spec} step={modelStep} /> : <DiagramSvg spec={spec} lit={lit} onSelect={selection.select} pulse stepNumber={current ? current.index + 1 : undefined} />}
          <figcaption className="p-figcaption" id={`sf-${spec.id}`}>
            <strong>Figure {figure}.</strong> {current ? (
              <>
                {current.flowTitle}, <span className="p-mono">{current.index + 1}/{current.count}</span> {current.step.title}.
              </>
            ) : (
              spec.caption
            )}
          </figcaption>
        </figure>
      </div>
      <div className="p-story-steps">
        {spec.flows.map((f, fi) => (
          <section key={f.id} className="p-story-flow" aria-labelledby={`flow-${spec.id}-${f.id}`}>
            <h3 className="p-h4" id={`flow-${spec.id}-${f.id}`}>
              {f.title}
            </h3>
            <ol className="p-steps">
              {f.steps.map((s) => {
                const i = steps.findIndex((x) => x.flowIndex === fi && x.step === s);
                return (
                  <li
                    key={s.id}
                    data-i={i}
                    ref={(el) => {
                      stepRefs.current[i] = el;
                    }}
                    data-active={i === active}
                  >
                    <strong>{s.title}.</strong> {s.text}
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}

/** Components and connections as text: the figure's accessible equivalent. */
export function Parts({ spec, selection }: { spec: ArchitectureSpec; selection: Selection }) {
  const nodeById = new Map(spec.nodes.map((n) => [n.id, n]));
  return (
    <div className="p-parts p-parts-grid p-wide">
      <div>
        <h4 id={`parts-${spec.id}`}>Components</h4>
        <ul aria-labelledby={`parts-${spec.id}`} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {[...spec.nodes]
            .sort((a, b) => a.tier - b.tier || a.lane - b.lane)
            .map((node) => (
              <li key={node.id}>
                <button type="button" className="p-part" {...selection.itemProps(node.id)}>
                  <strong>{node.label}</strong>
                  {node.status === 'planned' && <em> (planned)</em>}
                  <span className="p-detail">{node.description}</span>
                </button>
              </li>
            ))}
        </ul>
      </div>
      <div>
        <h4 id={`conn-${spec.id}`}>Connections</h4>
        <ol className="p-conn" aria-labelledby={`conn-${spec.id}`}>
          {spec.edges.map((e, i) => (
            <li key={e.id} data-lit={selection.lit.edges.has(e.id)}>
              <span className="p-conn-n">{i + 1}</span>
              {nodeById.get(e.from)?.label} to {nodeById.get(e.to)?.label}
              {e.label && `: ${e.label}`}
              {e.protocol && ` (${e.protocol})`}
              {e.sync === false && ', asynchronous'}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
