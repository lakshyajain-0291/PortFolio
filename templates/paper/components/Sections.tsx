import { dashRange } from '../../../shared/format';
import type { ReactNode } from 'react';
import type { PortfolioContent } from '../../../shared/content';
import { formatCompact } from '../../../shared/github/githubDataset';
import type { Reference } from '../refs';
import { Cite } from '../refs';
import { LinkList } from './CaseStudy';

export function Section({ id, number, title, children }: { id: string; number?: string; title: string; children: ReactNode }) {
  return (
    <section className="p-section" id={id} aria-labelledby={`${id}-h`} data-section>
      <h2 className="p-h2" id={`${id}-h`}>
        {number && <span className="p-num">{number}</span>}
        <span>{title}</span>
      </h2>
      {children}
    </section>
  );
}

const period = (p: { start: string; end: string }) => (p.start ? `${p.start} – ${p.end}` : '');

export function Experience({ roles }: { roles: PortfolioContent['experience'] }) {
  return (
    <>
      <p className="p-note">
        Figures in this section are self-reported, computed and simulated on systems and taken from the one-page resume
        <Cite ids={['resume']} />; costs marked projected are estimates, not measured savings.
      </p>
      {roles.map((r) => (
        <div className="p-entry" key={`${r.org}-${r.title}`}>
          <div className="p-entry-head">
            <h3>{r.title}</h3>
            <span className="p-mono">{period(r.period)}</span>
          </div>
          <p className="p-org">
            {r.org}
            {r.location && `, ${r.location}`}
          </p>
          <ul className="p-list">
            {r.points.slice(0, 2).map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          {r.points.length > 2 && (
            <details className="p-more">
              <summary>{r.points.length - 2} more</summary>
              <ul className="p-list">
                {r.points.slice(2).map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </details>
          )}
          <LinkList links={r.links} />
        </div>
      ))}
    </>
  );
}

export function OtherProjects({ projects }: { projects: PortfolioContent['otherProjects'] }) {
  return (
    <>
      <p className="p-note">
        Smaller builds and coursework. Figures are self-reported, from the resume
        <Cite ids={['resume']} />.
      </p>
      {projects.map((p) => (
        <div className="p-entry" key={p.slug}>
          <div className="p-entry-head">
            <h3>{p.title}</h3>
            {p.role && <span className="p-note">{p.role}</span>}
          </div>
          <p style={{ margin: '0.3rem 0 0.35rem' }}>{p.summary}</p>
          <p className="p-tags" style={{ margin: 0 }}>
            {p.stack.join(', ')}
          </p>
          {p.status === 'offline' && <p className="p-offline" style={{ margin: '0.25rem 0 0' }}>No longer online.</p>}
          <LinkList links={p.links} />
        </div>
      ))}
    </>
  );
}

export function Recognition({ recognition }: { recognition: PortfolioContent['recognition'] }) {
  return (
    <>
      <p className="p-note">
        As listed on the resume
        <Cite ids={['resume']} />.
      </p>
      <ul className="p-list">
        {recognition.awards.map((a) => (
          <li key={a}>{a}.</li>
        ))}
      </ul>
      <div className="p-table-wrap">
        <table className="p-table p-stack">
          <caption className="p-caption">
            <strong>Leadership.</strong> Roles at IIT Jodhpur.
          </caption>
          <thead>
            <tr>
              <th scope="col">Role</th>
              <th scope="col">Organisation</th>
              <th scope="col">Period</th>
            </tr>
          </thead>
          <tbody>
            {recognition.leadership.map((l) => (
              <tr key={`${l.org}-${l.role}`}>
                <td>
                  <strong style={{ fontWeight: 600 }}>{l.role}</strong>
                  {l.description && <div className="p-note">{l.description}</div>}
                </td>
                <td data-label="Organisation">{l.org.replace(/,\s*IIT Jodhpur$/, '')}</td>
                <td data-label="Period" className="p-mono">
                  {dashRange(l.period)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function CodeRecord({ code, figure, table }: { code: PortfolioContent['code']; figure: number; table: number }) {
  const { dataset, contributions } = code;
  const repos = dataset.repos.slice(0, 8);
  const max = Math.max(1, ...repos.map((r) => r.commits));
  return (
    <>
      <p>
        {dataset.totals.repos} public repositories with {dataset.totals.stars} stars and {dataset.totals.forks} forks.
        {contributions &&
          ` ${contributions.total.toLocaleString('en')} GitHub contributions since ${contributions.since}, ${contributions.commits.toLocaleString('en')} of them commits (as of ${contributions.asOf}).`}
      </p>
      <figure className="p-figure">
        <div className="p-figure-frame">
          <ul className="p-bars" aria-label="Commits per repository">
            {repos.map((r) => (
              <li key={r.name}>
                <a href={r.url} target="_blank" rel="noreferrer">
                  {r.name}
                </a>
                <span className="p-bar" style={{ width: `${(r.commits / max) * 100}%` }} aria-hidden="true" />
                <span className="p-num-cell">{formatCompact(r.commits)}</span>
              </li>
            ))}
          </ul>
        </div>
        <figcaption className="p-figcaption">
          <strong>Figure {figure}.</strong> Commits per repository for the featured repositories, all contributors included.
        </figcaption>
      </figure>
      <div className="p-table-wrap">
        <table className="p-table">
          <caption className="p-caption">
            <strong>Table {table}.</strong> Primary language of the featured repositories, by repository count.
          </caption>
          <thead>
            <tr>
              <th scope="col">Language</th>
              <th scope="col" className="p-num-cell">Repositories</th>
              <th scope="col" className="p-num-cell">Share</th>
            </tr>
          </thead>
          <tbody>
            {dataset.languages.map((l) => (
              <tr key={l.name}>
                <td>{l.name}</td>
                <td className="p-num-cell">{l.repoCount}</td>
                <td className="p-num-cell">{l.percent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {dataset.profileUrl && (
        <p className="p-links">
          <a href={dataset.profileUrl} target="_blank" rel="noreferrer">
            GitHub profile
          </a>
        </p>
      )}
    </>
  );
}

export function Education({ education }: { education: PortfolioContent['education'] }) {
  const [degree, ...schools] = education;
  return (
    <>
      {degree && (
        <div className="p-entry">
          <div className="p-entry-head">
            <h3>{degree.degree}</h3>
            <span className="p-mono">{dashRange(degree.period)}</span>
          </div>
          <p className="p-org">
            {degree.institution}
            {degree.grade && `. CGPA ${degree.grade}`}
          </p>
          {degree.courses.length > 0 && (
            <>
              <p className="p-runin" style={{ margin: '0.75rem 0 0.35rem' }}>
                Selected courses
              </p>
              <ul className="p-list p-two">
                {degree.courses.map((c) => (
                  <li key={c.name}>
                    {c.name}
                    {c.grade && <span className="p-mono"> ({c.grade})</span>}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
      {schools.map((s) => (
        <p key={s.institution} style={{ margin: '0 0 0.4rem' }}>
          {s.degree}, {s.institution}
          {s.grade && `, ${s.grade}`} <span className="p-mono">({dashRange(s.period)})</span>
        </p>
      ))}
    </>
  );
}

export function Skills({ skills }: { skills: PortfolioContent['skills'] }) {
  return (
    <dl style={{ margin: 0 }}>
      {skills.map((g) => (
        <div key={g.name} style={{ marginBottom: '0.75rem' }}>
          <dt className="p-runin">{g.name}</dt>
          <dd style={{ margin: 0 }}>{g.items.join(', ')}</dd>
        </div>
      ))}
    </dl>
  );
}

export function References({ refs }: { refs: Reference[] }) {
  return (
    <ol className="p-refs">
      {refs.map((r) => (
        <li key={r.source.id} id={`ref-${r.n}`}>
          <span className="p-num">[{r.n}]</span>
          <span>
            {r.source.label}.{' '}
            {r.source.url && (
              <a href={r.source.url} target={r.source.url.startsWith('/') ? undefined : '_blank'} rel="noreferrer">
                {r.source.url.replace(/^https?:\/\//, '')}
              </a>
            )}
          </span>
        </li>
      ))}
    </ol>
  );
}
