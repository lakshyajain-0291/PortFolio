import { createContext, useContext, useId, type ReactNode } from 'react';
import type { PortfolioContent, Source } from '../../shared/content';

export interface Reference {
  n: number;
  source: Source;
}

const RefsContext = createContext<Map<string, Reference>>(new Map());

/** Numbers sources in the order a reader first meets them: metrics first, then each study's sources. */
export function orderReferences(content: PortfolioContent): Reference[] {
  const order: string[] = [];
  const add = (id: string) => {
    if (!order.includes(id) && content.sources[id]) order.push(id);
  };
  content.caseStudies.forEach((c) => {
    c.outcomes.forEach((m) => add(m.source));
    c.sources.forEach(add);
  });
  Object.values(content.diagrams).forEach((d) => d.sources.forEach(add));
  return order.map((id, i) => ({ n: i + 1, source: content.sources[id] }));
}

export function RefsProvider({ refs, children }: { refs: Reference[]; children: ReactNode }) {
  return <RefsContext.Provider value={new Map(refs.map((r) => [r.source.id, r]))}>{children}</RefsContext.Provider>;
}

/** [n] marker linking to the reference list, with a preview on hover and focus. */
export function Cite({ ids }: { ids: string[] }) {
  const refs = useContext(RefsContext);
  const found = ids
    .map((id) => refs.get(id))
    .filter((r): r is Reference => Boolean(r))
    .sort((a, b) => a.n - b.n);
  if (!found.length) return null;
  return (
    <>
      {found.map((r) => (
        <CiteMark key={r.n} reference={r} />
      ))}
    </>
  );
}

function CiteMark({ reference: r }: { reference: Reference }) {
  const id = useId();
  return (
    <span className="p-cite">
      <a href={`#ref-${r.n}`} aria-describedby={id}>
        [{r.n}]
      </a>
      <span className="p-cite-preview" role="tooltip" id={id}>
        {r.source.label}
        {r.source.url && <span>{r.source.url.replace(/^https?:\/\//, '')}</span>}
      </span>
    </span>
  );
}
