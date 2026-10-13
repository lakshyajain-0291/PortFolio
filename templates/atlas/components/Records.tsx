import { dashRange } from '../../../shared/format';
import type { CaseStudy, PortfolioContent, Source } from '../../../shared/content';
import { formatCompact } from '../../../shared/github/githubDataset';
import { DimensionSchedule, LinkButtons } from './SystemSheet';

const period = (p: { start: string; end: string }) => (p.start ? `${p.start} to ${p.end}` : '');

/** Supporting work: smaller detail drawings side by side, numbers as dimensions. */
export function SupportingDetails({ studies, sources }: { studies: CaseStudy[]; sources: Record<string, Source> }) {
  return (
    <div className="a-details">
      {studies.map((s) => (
        <article className="a-detail" key={s.slug} aria-labelledby={`d-${s.slug}`}>
          <h3 id={`d-${s.slug}`}>{s.title}</h3>
          <p style={{ margin: 0 }}>{s.summary}</p>
          <dl className="a-byline">
            <dt className="a-label">ROLE</dt>
            <dd>{s.role}</dd>
            {s.period && (
              <>
                <dt className="a-label">PERIOD</dt>
                <dd>{s.period}</dd>
              </>
            )}
            {s.context && (
              <>
                <dt className="a-label">CONTEXT</dt>
                <dd>{s.context}</dd>
              </>
            )}
            <dt className="a-label">STACK</dt>
            <dd>{s.stack.join(', ')}</dd>
          </dl>
          <ul className="a-general" style={{ listStyle: 'none' }}>
            {s.approach.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
          <DimensionSchedule metrics={s.outcomes} sources={sources} title="Figures" />
          <LinkButtons links={s.links} />
        </article>
      ))}
    </div>
  );
}

/** Experience as a schedule: one row per role, newest first. */
export function ExperienceSchedule({ roles }: { roles: PortfolioContent['experience'] }) {
  return (
    <ol className="a-schedule">
      {roles.map((r, i) => (
        <li className="a-row" key={`${r.org}-${r.title}`}>
          <span className="a-row-mark a-mono">E{String(i + 1).padStart(2, '0')}</span>
          <div className="a-row-head">
            <h3>{r.title}</h3>
            <p>
              {r.org}
              {r.location && `, ${r.location}`}
            </p>
            <p className="a-mono" style={{ fontSize: '0.75rem', marginTop: '0.35rem' }}>
              {period(r.period)}
            </p>
          </div>
          <div className="a-row-body">
            <ul>
              {r.points.slice(0, 3).map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            {r.points.length > 3 && (
              <details className="a-more">
                <summary>{r.points.length - 3} more</summary>
                <ul>
                  {r.points.slice(3).map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </details>
            )}
            <LinkButtons links={r.links} />
          </div>
        </li>
      ))}
    </ol>
  );
}

export function ProjectSchedule({ projects }: { projects: PortfolioContent['otherProjects'] }) {
  return (
    <ol className="a-schedule">
      {projects.map((p, i) => (
        <li className="a-row" key={p.slug}>
          <span className="a-row-mark a-mono">P{String(i + 1).padStart(2, '0')}</span>
          <div className="a-row-head">
            <h3>{p.title}</h3>
            {p.role && <p>{p.role}</p>}
          </div>
          <div className="a-row-body">
            <p>{p.summary}</p>
            <p className="a-tags">{p.stack.join(' · ')}</p>
            {p.status === 'offline' && <p className="a-tags">No longer online.</p>}
            <LinkButtons links={p.links} />
          </div>
        </li>
      ))}
    </ol>
  );
}

export function RecognitionSheet({ recognition }: { recognition: PortfolioContent['recognition'] }) {
  return (
    <div className="a-two">
      <div>
        <h3 className="a-block-h">Recognition</h3>
        <ul className="a-general" style={{ listStyle: 'none' }}>
          {recognition.awards.map((a) => (
            <li key={a}>{a}.</li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="a-block-h">Leadership at IIT Jodhpur</h3>
        <table className="a-table">
          <thead>
            <tr>
              <th scope="col">Role</th>
              <th scope="col">Organisation</th>
              <th scope="col" className="a-num">
                Period
              </th>
            </tr>
          </thead>
          <tbody>
            {recognition.leadership.map((l) => (
              <tr key={`${l.org}-${l.role}`}>
                <td>
                  <strong style={{ fontWeight: 650 }}>{l.role}</strong>
                  {l.description && <div style={{ color: 'var(--a-ink-2)', fontSize: '0.8125rem' }}>{l.description}</div>}
                </td>
                <td>{l.org.replace(/,\s*IIT Jodhpur$/, '')}</td>
                <td className="a-num">{dashRange(l.period)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CodeSheet({ code }: { code: PortfolioContent['code'] }) {
  const { dataset, contributions } = code;
  const repos = dataset.repos.slice(0, 8);
  const max = Math.max(1, ...repos.map((r) => r.commits));
  return (
    <div className="a-two">
      <div>
        <p style={{ marginTop: 0, color: 'var(--a-ink-2)' }}>
          {dataset.totals.repos} public repositories, {dataset.totals.stars} stars, {dataset.totals.forks} forks.
          {contributions &&
            ` ${contributions.total.toLocaleString('en')} contributions since ${contributions.since}, ${contributions.commits.toLocaleString('en')} of them commits (as of ${contributions.asOf}).`}
        </p>
        <h3 className="a-block-h a-code-h" id="commits-h">
          Commits per repository, all contributors
        </h3>
        <ul className="a-bars" aria-labelledby="commits-h">
          {repos.map((r) => (
            <li key={r.name}>
              <a href={r.url} target="_blank" rel="noreferrer">
                {r.name}
              </a>
              <span className="a-bar-track" aria-hidden="true">
                <span className="a-bar-fill" style={{ width: `${(r.commits / max) * 100}%` }} />
              </span>
              <span className="a-num a-mono" style={{ fontSize: '0.8125rem', textAlign: 'right' }}>
                {formatCompact(r.commits)}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="a-block-h">Primary language, by repository count</h3>
        <table className="a-table">
          <thead>
            <tr>
              <th scope="col">Language</th>
              <th scope="col" className="a-num">
                Repos
              </th>
              <th scope="col" className="a-num">
                Share
              </th>
            </tr>
          </thead>
          <tbody>
            {dataset.languages.map((l) => (
              <tr key={l.name}>
                <td>{l.name}</td>
                <td className="a-num">{l.repoCount}</td>
                <td className="a-num">{l.percent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        {dataset.profileUrl && (
          <p style={{ marginBottom: 0 }}>
            <a className="a-btn a-btn-small" href={dataset.profileUrl} target="_blank" rel="noreferrer">
              GitHub profile
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

export function EducationSheet({ education, skills }: { education: PortfolioContent['education']; skills: PortfolioContent['skills'] }) {
  const [degree, ...schools] = education;
  return (
    <div className="a-two">
      <div>
        {degree && (
          <>
            <h3 className="a-block-h">{degree.degree}</h3>
            <p style={{ marginTop: 0 }}>
              {degree.institution}
              {degree.grade && `, CGPA ${degree.grade}`}
              <span className="a-mono" style={{ fontSize: '0.75rem', color: 'var(--a-ink-2)' }}>
                {' '}
                · {dashRange(degree.period)}
              </span>
            </p>
            {degree.courses.length > 0 && (
              <ul className="a-courses" aria-label="Selected courses">
                {degree.courses.map((c) => (
                  <li key={c.name}>
                    <span>{c.name}</span>
                    {c.grade && <span className="a-mono" style={{ fontSize: '0.75rem' }}>{c.grade}</span>}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        {schools.map((s) => (
          <p key={s.institution} style={{ color: 'var(--a-ink-2)', marginBottom: 0 }}>
            {s.degree}, {s.institution}
            {s.grade && `, ${s.grade}`} <span className="a-mono" style={{ fontSize: '0.75rem' }}>({dashRange(s.period)})</span>
          </p>
        ))}
      </div>
      <div>
        <h3 className="a-block-h">Skills, grouped by where they were used</h3>
        <dl className="a-skills">
          {skills.map((g) => (
            <div key={g.name}>
              <dt>{g.name}</dt>
              <dd>{g.items.join(', ')}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
