import type { ArchitectureSpec, CaseStudy as Study, Link, Metric, MetricKind } from '../../../shared/content';
import { useDiagramSelection } from '../../../shared/content/diagram/hooks';
import { Cite } from '../refs';
import { LoopingFigure, Parts, StoryFigure } from './Diagram';
import { projectHref, type Navigate } from '../route';

const KIND_TEXT: Record<MetricKind, string> = {
  measured: 'measured',
  target: 'target',
  projected: 'projected',
  'self-reported': 'self-reported',
  count: 'count',
};

export function LinkList({ links }: { links: Link[] }) {
  if (!links.length) return null;
  return (
    <ul className="p-links">
      {links.map((l) => (
        <li key={l.url}>
          <a href={l.url} target={l.url.startsWith('/') ? undefined : '_blank'} rel="noreferrer">
            {l.kind === 'repo' ? 'Repository' : l.kind === 'demo' ? 'Demo' : l.kind === 'store' ? 'Play Store' : l.label}
          </a>
          {l.status === 'unchecked' && <span className="p-note"> (not verified)</span>}
        </li>
      ))}
    </ul>
  );
}

function EvidenceTable({ study, table }: { study: Study; table: number }) {
  if (!study.outcomes.length) return null;
  return (
    <div className="p-table-wrap p-wide">
      <table className="p-table p-stack">
        <caption className="p-caption">
          <strong>Table {table}.</strong> Evidence for {study.title}.
        </caption>
        <thead>
          <tr>
            <th scope="col" className="p-num-cell">Value</th>
            <th scope="col">Measure</th>
            <th scope="col">Kind</th>
            <th scope="col">Source</th>
          </tr>
        </thead>
        <tbody>
          {study.outcomes.map((m) => (
            <tr key={m.id}>
              <td className="p-num-cell">
                {m.value}
                {m.unit && ` ${m.unit}`}
              </td>
              <td>
                {m.label}
                {m.method && <div className="p-note">{m.method}</div>}
              </td>
              <td data-label="Kind">
                <span className="p-kind" data-kind={m.kind}>
                  {KIND_TEXT[m.kind]}
                </span>
              </td>
              <td data-label="Source">
                <Cite ids={[m.source]} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Two numbers to carry on the home page: the first measured or counted ones. */
function headline(study: Study): Metric[] {
  const rank = (m: Metric) => (m.kind === 'measured' || m.kind === 'count' ? 0 : m.kind === 'self-reported' ? 1 : 2);
  return [...study.outcomes].sort((a, b) => rank(a) - rank(b)).slice(0, 2);
}

/**
 * A selected project on the home page: what it is, the reader's role, two
 * numbers with their kind, the system figure playing its main flow, and a way
 * into the full case study.
 */
export function WorkEntry({
  study,
  diagram,
  figure,
  navigate,
}: {
  study: Study;
  diagram?: ArchitectureSpec;
  figure: number;
  navigate: Navigate;
}) {
  const byline = [study.role, study.context, study.period].filter(Boolean).join(' · ');
  const href = projectHref(study.slug);
  return (
    <article className="p-work" aria-labelledby={`w-${study.slug}`}>
      <div className="p-work-head">
        <h3 className="p-work-title" id={`w-${study.slug}`}>
          <a href={href} onClick={(e) => navigate(e, study.slug)}>
            {study.title}
          </a>
        </h3>
        <p className="p-byline">{byline}</p>
      </div>
      <p className="p-work-summary">{study.summary}</p>
      {study.outcomes.length > 0 && (
        <ul className="p-facts">
          {headline(study).map((m) => (
            <li key={m.id}>
              <span className="p-fact-v">
                {m.value}
                {m.unit && ` ${m.unit}`}
              </span>{' '}
              {m.label} <span className="p-kind-inline">({KIND_TEXT[m.kind]})</span>
            </li>
          ))}
        </ul>
      )}
      {diagram && (
        <div className="p-work-figure">
          <LoopingFigure spec={diagram} figure={figure} />
        </div>
      )}
      <p className="p-work-links">
        <a className="p-read" href={href} onClick={(e) => navigate(e, study.slug)}>
          Read the case study<span aria-hidden="true"> →</span>
        </a>
        {study.links.slice(0, 2).map((l) => (
          <a key={l.url} href={l.url} target="_blank" rel="noreferrer">
            {l.kind === 'repo' ? 'Repository' : l.kind === 'demo' ? 'Demo' : l.label}
          </a>
        ))}
      </p>
    </article>
  );
}

/** The full case study, on its own page. */
export function ProjectPage({
  study,
  diagram,
  goHome,
}: {
  study: Study;
  diagram?: ArchitectureSpec;
  goHome: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  const repo = study.repoFacts;
  return (
    <article className="p-case-page" aria-labelledby="case-title">
      <p className="p-back">
        <a href="./" onClick={goHome}>
          <span aria-hidden="true">← </span>Lakshya Jain, portfolio
        </a>
      </p>
      <header className="p-case-head">
        <h1 className="p-title p-case-title" id="case-title">
          {study.title}
        </h1>
        <p className="p-lede">{study.summary}</p>
        <dl className="p-case-meta">
          <div>
            <dt>Role</dt>
            <dd>{study.role}</dd>
          </div>
          {study.context && (
            <div>
              <dt>Context</dt>
              <dd>{study.context}</dd>
            </div>
          )}
          {study.period && (
            <div>
              <dt>Period</dt>
              <dd>{study.period}</dd>
            </div>
          )}
          <div>
            <dt>Stack</dt>
            <dd>{study.stack.join(', ')}</dd>
          </div>
          {repo && repo.stars + repo.forks > 0 && (
            <div>
              <dt>Repository</dt>
              <dd>
                {repo.stars} stars, {repo.forks} forks
              </dd>
            </div>
          )}
          <div>
            <dt>Sources</dt>
            <dd>
              <Cite ids={study.sources} />
            </dd>
          </div>
        </dl>
        <LinkList links={study.links} />
      </header>

      <section className="p-section" aria-labelledby="problem-h">
        <h2 className="p-h2" id="problem-h">
          <span className="p-num">1</span>
          <span>Problem</span>
        </h2>
        <p className="p-measure">{study.problem}</p>
      </section>

      <section className="p-section" aria-labelledby="approach-h">
        <h2 className="p-h2" id="approach-h">
          <span className="p-num">2</span>
          <span>How it works</span>
        </h2>
        <ul className="p-list p-measure">
          {study.approach.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </section>

      {diagram && <SystemSection spec={diagram} />}

      {study.outcomes.length > 0 && (
        <section className="p-section" aria-labelledby="evidence-h">
          <h2 className="p-h2" id="evidence-h">
            <span className="p-num">{diagram ? 4 : 3}</span>
            <span>Evidence</span>
          </h2>
          <EvidenceTable study={study} table={1} />
        </section>
      )}
    </article>
  );
}

function SystemSection({ spec }: { spec: ArchitectureSpec }) {
  const selection = useDiagramSelection(spec);
  return (
    <section className="p-section" aria-labelledby="system-h">
      <h2 className="p-h2" id="system-h">
        <span className="p-num">3</span>
        <span>The system</span>
      </h2>
      <p className="p-measure p-note-lead">
        Each flow lights the parts of the figure it uses, one step at a time. Select a component to trace its connections, or switch the figure
        to a 3D model.
      </p>
      <StoryFigure spec={spec} figure={1} selection={selection} />
      <Parts spec={spec} selection={selection} />
    </section>
  );
}
