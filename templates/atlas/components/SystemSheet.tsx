import { Suspense, lazy, useEffect, useRef, useState, type ComponentType, type LazyExoticComponent } from 'react';
import type { ArchitectureSpec, CaseStudy, Link as ContentLink, Metric, MetricKind, Source } from '../../../shared/content';
import { useDiagramSelection } from '../../../shared/content/diagram/hooks';
import { usePrefersReducedMotion } from '../../../shared/hooks/usePrefersReducedMotion';
import { SceneErrorBoundary, sceneUnavailableReason } from '../../../shared/three/guards';
import type { AtlasTheme, SceneProps } from '../../../shared/three/scenes/kit';
import { BlueprintDrawing, FlowStepper, KIND_LABEL, type DrawnDimension, type StepRef } from './Drawing';
import { Icon } from './Icon';
import { Sheet } from './Sheet';

/** Each model is its own chunk with three.js, fetched only when its sheet asks for it. */
const SCENES: Record<string, LazyExoticComponent<ComponentType<SceneProps>>> = {
  libr: lazy(() => import('../../../shared/three/scenes/libr')),
  'mini-k8ts': lazy(() => import('../../../shared/three/scenes/miniK8ts')),
  filenest: lazy(() => import('../../../shared/three/scenes/fileNest')),
};

const KIND_TEXT: Record<MetricKind, string> = {
  measured: 'measured',
  target: 'design target',
  projected: 'projected',
  'self-reported': 'self-reported',
  count: 'count',
};

export function LinkButtons({ links }: { links: ContentLink[] }) {
  if (!links.length) return null;
  return (
    <ul className="a-links">
      {links.map((l) => (
        <li key={l.url}>
          <a className="a-btn a-btn-small" href={l.url} target={l.url.startsWith('/') ? undefined : '_blank'} rel="noreferrer">
            {l.kind === 'repo' ? 'Repository' : l.kind === 'demo' ? 'Demo' : l.kind === 'store' ? 'Play Store' : l.label}
          </a>
          {l.status === 'unchecked' && <span className="a-unverified">not verified</span>}
        </li>
      ))}
    </ul>
  );
}

/** A source's name short enough for a dimension note. */
export function shortSource(s: Source | undefined): string | undefined {
  if (!s) return undefined;
  if (s.kind === 'paper') return `${s.label.split(':')[0]} paper`;
  return s.label.split('. ')[0].replace(/ \(.*\)$/, '');
}

/**
 * Where each number sits on its drawing. A metric listed here is drawn as a
 * dimension on that component, group or connection; the rest stay in the schedule.
 */
const DIM_ANCHORS: Record<string, DrawnDimension['target']> = {
  'k8ts-throughput': { node: 'scheduler' },
  'k8ts-detect': { edge: 'sync' },
  'k8ts-recover': { edge: 'schedule' },
  'fn-index': { edge: 'index' },
  'fn-query': { edge: 'query' },
  'fn-users': { node: 'querier' },
};

const valueText = (m: Metric) => `${m.value}${m.unit ? ` ${m.unit}` : ''}`;

/** Drawn dimensions for a sheet, keyed D1, D2... in schedule order. */
export function drawnDimensions(metrics: Metric[]): { dims: DrawnDimension[]; keys: Map<string, string> } {
  const keys = new Map<string, string>();
  const dims: DrawnDimension[] = [];
  metrics.forEach((m) => {
    const target = DIM_ANCHORS[m.id];
    if (!target) return;
    const key = `D${dims.length + 1}`;
    keys.set(m.id, key);
    dims.push({ key, text: valueText(m), dashed: m.kind === 'target' || m.kind === 'projected', target });
  });
  return { dims, keys };
}

/** Every number on the sheet with its kind and source; keys tie rows to the drawing. */
export function DimensionSchedule({
  metrics,
  sources,
  keys,
  title = 'Dimension schedule',
}: {
  metrics: Metric[];
  sources: Record<string, Source>;
  keys?: Map<string, string>;
  title?: string;
}) {
  if (!metrics.length) return null;
  const keyed = Boolean(keys?.size);
  return (
    <div className="a-dims">
      <h3 className="a-block-h">{title}</h3>
      <table className="a-table a-dim-table">
        <thead>
          <tr>
            {keyed && <th scope="col">Key</th>}
            <th scope="col" className="a-num">
              Value
            </th>
            <th scope="col">Measure</th>
            <th scope="col">Kind</th>
            <th scope="col">Source</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((m) => (
            <tr key={m.id}>
              {keyed && <td className="a-mono a-dim-key">{keys?.get(m.id) ?? ''}</td>}
              <td className="a-num a-dim-value">{valueText(m)}</td>
              <td>
                {m.label}
                {m.method && m.method.toLowerCase() !== KIND_TEXT[m.kind] && <div className="a-dim-meta">{m.method}</div>}
              </td>
              <td data-label="Kind">
                <span className="a-kind" data-kind={m.kind}>
                  {KIND_TEXT[m.kind]}
                </span>
              </td>
              <td data-label="Source" className="a-dim-meta">
                {shortSource(sources[m.source]) ?? m.source}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Model({ spec, theme, step }: { spec: ArchitectureSpec; theme: AtlasTheme; step: StepRef | null }) {
  const reduced = usePrefersReducedMotion();
  const [failed, setFailed] = useState(false);
  const [reason] = useState(sceneUnavailableReason);
  const Scene = SCENES[spec.id];
  const flow = step ? spec.flows[step.flow] : null;
  const s = flow && step ? flow.steps[step.step] : null;

  if (!Scene || reason || failed) {
    return (
      <p className="a-model-note">
        {failed ? 'The 3D model stopped working in this browser.' : (reason ?? 'There is no 3D model for this system.')} The drawing shows the
        same system, and the flows below step through it in text.
      </p>
    );
  }
  return (
    <div className="a-model">
      <SceneErrorBoundary onError={() => setFailed(true)}>
        <Suspense fallback={<p className="a-model-note">Loading the 3D model.</p>}>
          <Scene
            theme={theme}
            litNodes={new Set(s?.nodes ?? [])}
            litEdges={new Set(s?.edges ?? [])}
            flowId={flow?.id ?? null}
            stepId={s?.id ?? null}
            reducedMotion={reduced}
          />
        </Suspense>
      </SceneErrorBoundary>
      <span className="a-model-hint a-label">Drag to turn. Use the flows below to step through.</span>
    </div>
  );
}

export function SystemSheet({
  study,
  spec,
  no,
  theme,
  sources,
}: {
  study: CaseStudy;
  spec: ArchitectureSpec;
  no: string;
  theme: AtlasTheme;
  sources: Record<string, Source>;
}) {
  const selection = useDiagramSelection(spec);
  const [step, setStep] = useState<StepRef | null>(null);
  const [view, setView] = useState<'drawing' | 'model'>('drawing');
  const reduced = usePrefersReducedMotion();
  const drawingRef = useRef<HTMLDivElement>(null);

  // On phones the step panel sticks to the bottom of the screen; keep the parts a step lights above it.
  useEffect(() => {
    if (!step || view !== 'drawing' || !window.matchMedia('(max-width: 860px)').matches) return;
    const frame = requestAnimationFrame(() => {
      const root = drawingRef.current;
      const panel = root?.querySelector<HTMLElement>('.a-flows');
      const lit = [...(root?.querySelectorAll<SVGGraphicsElement>('.a-diagram [data-lit="true"]') ?? [])];
      if (!panel || !lit.length) return;
      const top = Math.min(...lit.map((el) => el.getBoundingClientRect().top));
      const bottom = Math.max(...lit.map((el) => el.getBoundingClientRect().bottom));
      const limit = panel.getBoundingClientRect().top - 16;
      const head = 72;
      let dy = 0;
      if (bottom > limit) dy = Math.min(bottom - limit, top - head);
      else if (top < head) dy = top - head;
      if (Math.abs(dy) > 4) window.scrollBy({ top: dy, behavior: reduced ? 'auto' : 'smooth' });
    });
    return () => cancelAnimationFrame(frame);
  }, [step, view, reduced]);
  const flowStep = step ? spec.flows[step.flow].steps[step.step] : null;
  const lit = flowStep ? { nodes: new Set(flowStep.nodes), edges: new Set(flowStep.edges) } : selection.lit;
  const selected = flowStep ? null : selection.selected;
  const select = (id: string) => {
    setStep(null);
    selection.select(id);
  };
  const nodeById = new Map(spec.nodes.map((n) => [n.id, n]));
  const sorted = [...spec.nodes].sort((a, b) => a.tier - b.tier || a.lane - b.lane);
  const has3d = Boolean(SCENES[spec.id]);
  const { dims, keys } = drawnDimensions(study.outcomes);
  const sourceNames = study.sources
    .map((id) => sources[id])
    .filter((s): s is Source => Boolean(s) && s.kind !== 'owner')
    .map((s) => s.label.split('. ')[0].replace(/ \(.*\)$/, ''));

  return (
    <Sheet
      sheet={{
        id: study.slug,
        no,
        title: study.title,
        meta: (
          <>
            <span>System drawing</span>
            <span>{study.period ?? ''}</span>
          </>
        ),
      }}
    >
      <div className="a-system">
        <div className="a-notes">
          <p className="a-lede">{study.summary}</p>
          <dl className="a-byline">
            <dt className="a-label">ROLE</dt>
            <dd>{study.role}</dd>
            {study.context && (
              <>
                <dt className="a-label">CONTEXT</dt>
                <dd>{study.context}</dd>
              </>
            )}
            <dt className="a-label">STACK</dt>
            <dd>{study.stack.join(', ')}</dd>
            {study.repoFacts && study.repoFacts.stars + study.repoFacts.forks > 0 && (
              <>
                <dt className="a-label">REPO</dt>
                <dd>
                  {study.repoFacts.stars} stars, {study.repoFacts.forks} forks
                </dd>
              </>
            )}
          </dl>
          <div>
            <h3 className="a-block-h">Problem</h3>
            <p>{study.problem}</p>
          </div>
          <div>
            <h3 className="a-block-h">How it works</h3>
            <ol className="a-general">
              {study.approach.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ol>
          </div>
          <LinkButtons links={study.links} />
          <p style={{ fontSize: '0.8125rem', color: 'var(--a-ink-3)' }}>Drawn from {sourceNames.join(', ')}.</p>
        </div>

        <div className="a-system-drawing" ref={drawingRef}>
          <div className="a-toolbar">
            <span className="a-toolbar-label a-label">{spec.title.split(':')[1]?.trim().toUpperCase() ?? 'ARCHITECTURE'}</span>
            {has3d && (
              <span className="a-seg" role="group" aria-label={`${study.title} view`}>
                <button type="button" className="a-btn" aria-pressed={view === 'drawing'} onClick={() => setView('drawing')}>
                  <Icon name="drawing" />
                  Drawing
                </button>
                <button type="button" className="a-btn" aria-pressed={view === 'model'} onClick={() => setView('model')}>
                  <Icon name="cube" />
                  3D model
                </button>
              </span>
            )}
          </div>
          {view === 'model' ? (
            <Model spec={spec} theme={theme} step={step} />
          ) : (
            <div className="a-canvas">
              <BlueprintDrawing spec={spec} lit={lit} selected={selected} onSelect={select} dims={dims} />
            </div>
          )}
          <p className="a-figcaption">{spec.caption}</p>
          <FlowStepper spec={spec} at={step} onChange={setStep} />
          <DimensionSchedule metrics={study.outcomes} sources={sources} keys={keys} />
          <div className="a-parts">
            <div>
              <h3 className="a-block-h" id={`parts-${spec.id}`}>
                Components
              </h3>
              <ul className="a-part-list" aria-labelledby={`parts-${spec.id}`}>
                {sorted.map((node, i) => {
                  const props = selection.itemProps(node.id);
                  return (
                    <li key={node.id}>
                      <button type="button" className="a-part" {...props} aria-pressed={selected === node.id} onClick={() => select(node.id)}>
                        <span className="a-part-mark">{String.fromCharCode(65 + i)}</span>
                        <span>
                          <strong>{node.label}</strong>{' '}
                          <span className="a-part-kind">{node.status === 'planned' ? 'planned' : KIND_LABEL[node.kind]}</span>
                        </span>
                        {selected === node.id && <span className="a-part-detail">{node.description}</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div>
              <h3 className="a-block-h" id={`conn-${spec.id}`}>
                Connections
              </h3>
              <ol className="a-conn" aria-labelledby={`conn-${spec.id}`}>
                {spec.edges.map((e, i) => (
                  <li key={e.id} data-lit={lit.edges.has(e.id)}>
                    <span className="a-conn-n">{i + 1}</span>
                    <span>
                      {nodeById.get(e.from)?.label} to {nodeById.get(e.to)?.label}
                      {e.label && `: ${e.label}`}
                      {e.protocol && ` (${e.protocol})`}
                      {e.sync === false && ', asynchronous'}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </Sheet>
  );
}
