import { PROFILE, type PortfolioContent } from '../../../shared/content';
import { Icon } from './Icon';
import { Sheet, type SheetInfo } from './Sheet';

export interface RegisterEntry extends SheetInfo {
  note: string;
  group: 'Systems' | 'Record';
}

const ISSUED = '2026-10-13';

function TitleBlock({ content, sheets }: { content: PortfolioContent | null; sheets: number }) {
  const p = content?.profile;
  const links = p?.links;
  return (
    <div className="a-title-block">
      <h1 className="a-tb-name">{p?.name ?? PROFILE.name}</h1>
      <span className="a-tb-label a-label">Role</span>
      <p className="a-tb-value a-tb-role">{p?.role ?? PROFILE.role}</p>
      <span className="a-tb-label a-label">School</span>
      <p className="a-tb-value">
        {PROFILE.institution}, B.Tech CSE, class of {p?.graduationYear ?? PROFILE.graduationYear}
      </p>
      <span className="a-tb-label a-label">Status</span>
      <p className="a-tb-value">{p?.availability ?? '\u00a0'}</p>
      <div className="a-tb-actions">
        <a className="a-btn a-btn-primary" href={links?.resume.url ?? PROFILE.resumeUrl}>
          <Icon name="download" />
          Resume (PDF)
        </a>
        {p?.email && (
          <a className="a-btn" href={`mailto:${p.email}`}>
            <Icon name="mail" />
            Email
          </a>
        )}
        {links?.github && (
          <a className="a-btn" href={links.github.url} target="_blank" rel="noreferrer">
            GitHub
          </a>
        )}
        {links?.linkedin && (
          <a className="a-btn" href={links.linkedin.url} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        )}
      </div>
      <div className="a-tb-foot a-mono">
        <span>SHEET 00 / {String(sheets).padStart(2, '0')}</span>
        <span>NOT TO SCALE</span>
        <span>{ISSUED}</span>
      </div>
    </div>
  );
}

function Legend() {
  const line = (dash?: string) => (
    <svg viewBox="0 0 52 16" aria-hidden="true">
      <path d="M2 8 H44" stroke="var(--a-line)" strokeWidth="1.25" strokeDasharray={dash} fill="none" />
      <path d="M44 4 L50 8 L44 12 Z" fill="var(--a-line)" />
    </svg>
  );
  return (
    <ul className="a-legend">
      <li>
        {line()}
        Synchronous call
      </li>
      <li>
        {line('5 4')}
        Asynchronous or background
      </li>
      <li>
        <svg viewBox="0 0 52 16" aria-hidden="true">
          <rect x="2" y="2" width="48" height="12" fill="none" stroke="var(--a-line)" strokeDasharray="6 4" />
        </svg>
        External service
      </li>
      <li>
        <svg viewBox="0 0 52 16" aria-hidden="true">
          <rect x="2" y="2" width="48" height="12" fill="none" stroke="var(--a-line-2)" strokeDasharray="2 4" />
        </svg>
        Planned, not built
      </li>
      <li>
        <svg viewBox="0 0 52 16" aria-hidden="true">
          <path d="M2 8 H50" stroke="var(--a-rev)" strokeWidth="2" fill="none" />
        </svg>
        Your current selection
      </li>
    </ul>
  );
}

export function Cover({ content, register }: { content: PortfolioContent | null; register: RegisterEntry[] }) {
  const groups: RegisterEntry['group'][] = ['Systems', 'Record'];
  return (
    <Sheet sheet={{ id: 'cover', no: '00', title: `${content?.profile.name ?? PROFILE.name}, drawing register` }} header={false}>
      <div className="a-cover">
        <TitleBlock content={content} sheets={register.length} />
        <nav className="a-cover-register" aria-labelledby="register-h">
          <h2 id="register-h">Drawing register</h2>
          {register.length === 0 ? (
            <p className="a-register-note a-register-loading">Loading the sheet list.</p>
          ) : (
            groups.map((g) => (
              <div key={g} className="a-register-group" style={{ flexGrow: register.filter((r) => r.group === g).length }}>
                <p className="a-register-tier a-label">{g === 'Systems' ? 'System drawings' : 'Record sheets'}</p>
                <ol className="a-register">
                  {register
                    .filter((r) => r.group === g)
                    .map((r) => (
                      <li key={r.id}>
                        <a href={`#${r.id}`} aria-label={`Sheet ${r.no}, ${r.title}: ${r.note}`}>
                          <span className="a-register-no a-mono">{r.no}</span>
                          <span className="a-register-title">{r.title}</span>
                          <span className="a-register-note">{r.note}</span>
                        </a>
                      </li>
                    ))}
                </ol>
              </div>
            ))
          )}
        </nav>
        <div className="a-cover-notes">
          <h2>General notes</h2>
          <p>{content?.profile.summary ?? 'Backend and distributed systems work, drawn as a set of sheets.'}</p>
          <p>
            Each system is drawn from its code, report or paper. Select a component to trace its connections, or step through a flow. Every
            number states its kind and source.
          </p>
          <h2 className="a-cover-legend-h">Legend</h2>
          <Legend />
        </div>
      </div>
    </Sheet>
  );
}
