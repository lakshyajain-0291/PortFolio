import { useEffect, useLayoutEffect, useState } from 'react';
import './paper.css';
import { ContentProvider, PROFILE, usePortfolioContent, type PortfolioContent } from '../../shared/content';
import { ProjectPage, WorkEntry } from './components/CaseStudy';
import { CodeRecord, Education, Experience, OtherProjects, Recognition, References, Section, Skills } from './components/Sections';
import { Colophon, useKonami } from './editions';
import { RefsProvider, orderReferences, type Reference } from './refs';
import { useProjectRoute, type Navigate } from './route';

type Theme = 'auto' | 'light' | 'dark';
const THEME_KEY = 'paper-theme';

function readTheme(): Theme {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === 'light' || v === 'dark' ? v : 'auto';
  } catch {
    return 'auto';
  }
}

function useTheme() {
  const [theme, setTheme] = useState<Theme>(readTheme);
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (theme === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
    try {
      if (theme === 'auto') localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* storage unavailable: the choice lasts for this visit only */
    }
  }, [theme]);
  return [theme, setTheme] as const;
}

interface Planned {
  id: string;
  number: string;
  title: string;
}

/** The portfolio's sections, in the order a recruiter reads them. Empty ones drop out. */
function plan(content: PortfolioContent): Planned[] {
  const list: [string, string, boolean][] = [
    ['experience', 'Experience', content.experience.length > 0],
    ['work', 'Selected work', content.caseStudies.length > 0],
    ['projects', 'Other projects', content.otherProjects.length > 0],
    ['recognition', 'Recognition and leadership', content.recognition.awards.length + content.recognition.leadership.length > 0],
    ['skills', 'Skills', content.skills.length > 0],
    ['education', 'Education', content.education.length > 0],
    ['code', 'Code record', content.code.dataset.hasData],
  ];
  return list.filter(([, , show]) => show).map(([id, title], i) => ({ id, title, number: String(i + 1) }));
}

/** Id of the section the reader is in, for the running head and the contents. */
function useCurrentSection(key: string) {
  const [current, setCurrent] = useState<string | null>(null);
  useEffect(() => {
    setCurrent(null);
    const sections = [...document.querySelectorAll<HTMLElement>('[data-section]')];
    if (!sections.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setCurrent(top.target.id);
      },
      { rootMargin: '-56px 0px -75% 0px' },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [key]);
  return current;
}

function TitleBlock({ content }: { content: PortfolioContent | null }) {
  const p = content?.profile;
  const links = p?.links;
  return (
    <header className="p-head">
      <h1 className="p-title">{p?.name ?? PROFILE.name}</h1>
      <p className="p-author">
        <strong>{p?.role ?? PROFILE.role}</strong>
        <br />
        {PROFILE.institution}, class of {p?.graduationYear ?? PROFILE.graduationYear}
        {p?.location && `, ${p.location}`}
      </p>
      <p className="p-availability">{p?.availability ?? '\u00a0'}</p>
      <ul className="p-actions" aria-label="Contact and documents">
        <li>
          <a className="p-primary" href={links?.resume.url ?? PROFILE.resumeUrl}>
            Resume (PDF)
          </a>
        </li>
        {p?.email && (
          <li>
            <a href={`mailto:${p.email}`}>{p.email}</a>
          </li>
        )}
        {links?.github && (
          <li>
            <a href={links.github.url} target="_blank" rel="noreferrer">
              GitHub
            </a>
          </li>
        )}
        {links?.linkedin && (
          <li>
            <a href={links.linkedin.url} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </li>
        )}
      </ul>
      <div className="p-abstract">
        <p>
          <span className="p-runin">About.</span> {p?.about}
        </p>
      </div>
    </header>
  );
}

/** The margin beside the title: the facts a recruiter looks for first, then the contents. */
function Margin({ content, sections, current }: { content: PortfolioContent | null; sections: Planned[]; current: string | null }) {
  const recent = content?.experience[0];
  const degree = content?.education[0];
  const award = content?.recognition.awards[0];
  return (
    <aside className="p-contents" aria-label="At a glance and contents">
      {content && (
        <dl className="p-glance">
          {recent && (
            <div>
              <dt>Most recent</dt>
              <dd>
                {recent.title}, {recent.org}
                {recent.period.start && (
                  <span className="p-glance-sub">
                    {recent.period.start} – {recent.period.end}
                  </span>
                )}
              </dd>
            </div>
          )}
          {degree && (
            <div>
              <dt>Education</dt>
              <dd>
                {degree.degree.replace('Computer Science and Engineering', 'CSE')}, {PROFILE.institution}
                <span className="p-glance-sub">
                  {degree.grade && `CGPA ${degree.grade.replace('/10', '')}, `}class of {PROFILE.graduationYear}
                </span>
              </dd>
            </div>
          )}
          {award && (
            <div>
              <dt>Recognition</dt>
              <dd>{award}</dd>
            </div>
          )}
        </dl>
      )}
      {sections.length > 0 && (
        <nav aria-labelledby="contents-h">
          <h2 id="contents-h">Contents</h2>
          <ol>
            {sections.map((s) => (
              <li key={s.id}>
                <span className="p-num p-mono">{s.number}</span>
                <a href={`#${s.id}`} aria-current={current === s.id ? 'true' : undefined}>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}
    </aside>
  );
}

function Home({ content, sections, navigate }: { content: PortfolioContent; sections: Planned[]; navigate: Navigate }) {
  const refs = orderReferences(content);
  const num = new Map(sections.map((s) => [s.id, s.number]));
  const studies = [...content.caseStudies].sort((a, b) => (a.tier === b.tier ? 0 : a.tier === 'system' ? -1 : 1));
  let figure = 0;

  return (
    <RefsProvider refs={refs}>
      <main id="main" className="p-main">
        <Section id="experience" number={num.get('experience')} title="Experience">
          <Experience roles={content.experience} />
        </Section>
        <Section id="work" number={num.get('work')} title="Selected work">
          <p className="p-measure">
            Systems I designed or led. Each one opens into a full case study with its architecture, a 3D model, its flows and the evidence behind
            its numbers.
          </p>
          {studies.map((c) => {
            const diagram = c.diagramId ? content.diagrams[c.diagramId] : undefined;
            return <WorkEntry key={c.slug} study={c} diagram={diagram} figure={diagram ? ++figure : figure} navigate={navigate} />;
          })}
        </Section>
        <Section id="projects" number={num.get('projects')} title="Other projects">
          <OtherProjects projects={content.otherProjects} />
        </Section>
        <Section id="recognition" number={num.get('recognition')} title="Recognition and leadership">
          <Recognition recognition={content.recognition} />
        </Section>
        <Section id="skills" number={num.get('skills')} title="Skills">
          <Skills skills={content.skills} />
        </Section>
        <Section id="education" number={num.get('education')} title="Education">
          <Education education={content.education} />
        </Section>
        {content.code.dataset.hasData && (
          <Section id="code" number={num.get('code')} title="Code record">
            <CodeRecord code={content.code} figure={++figure} table={1} />
          </Section>
        )}
        <Section id="references" title="References">
          <References refs={refs} />
        </Section>
        <Colophon />
      </main>
    </RefsProvider>
  );
}

function CaseStudyRoute({ content, slug, navigate }: { content: PortfolioContent; slug: string; navigate: Navigate }) {
  const study = content.caseStudies.find((c) => c.slug === slug);
  const refs = orderReferences(content);
  if (!study) {
    return (
      <main id="main" className="p-main">
        <h1 className="p-title">Not found</h1>
        <p className="p-measure">
          There is no case study called “{slug}”.{' '}
          <a href="./" onClick={(e) => navigate(e, null)}>
            Back to the portfolio
          </a>
          .
        </p>
      </main>
    );
  }
  const diagram = study.diagramId ? content.diagrams[study.diagramId] : undefined;
  const cited = new Set([...study.sources, ...study.outcomes.map((m) => m.source), ...(diagram?.sources ?? [])]);
  const local: Reference[] = refs.filter((r) => cited.has(r.source.id));
  return (
    <RefsProvider refs={refs}>
      <main id="main" className="p-main">
        <ProjectPage study={study} diagram={diagram} goHome={(e) => navigate(e, null)} />
        <Section id="references" title="References">
          <References refs={local} />
        </Section>
        <Colophon />
      </main>
    </RefsProvider>
  );
}

function Paper() {
  const state = usePortfolioContent();
  const [theme, setTheme] = useTheme();
  const { project, navigate } = useProjectRoute();
  useKonami();
  const content = state.status === 'ready' ? state.content : null;
  const sections = content && !project ? plan(content) : [];
  const current = useCurrentSection(`${state.status}-${project ?? 'home'}`);
  const study = project ? content?.caseStudies.find((c) => c.slug === project) : undefined;
  const here = current === 'references' ? { number: '', title: 'References' } : sections.find((s) => s.id === current);

  useEffect(() => {
    document.title = study ? `${study.title}: a case study by Lakshya Jain` : 'Lakshya Jain: Backend and Distributed Systems Engineer';
  }, [study]);

  return (
    <>
      <a className="p-skip" href="#main">
        Skip to content
      </a>
      <div className="p-page">
        <div className="p-layout" data-page={project ? 'case' : 'home'}>
          <div className="p-topbar">
            <span className="p-runhead" aria-live="off">
              {project ? (
                <a href="./" onClick={(e) => navigate(e, null)} style={{ color: 'inherit' }}>
                  {content?.profile.name ?? PROFILE.name}
                  {study && <span className="p-runhead-sub"> · {study.title}</span>}
                </a>
              ) : here ? (
                <a href="#top" style={{ color: 'inherit' }}>
                  {here.number && <span className="p-num">{here.number}</span>}
                  {here.title}
                </a>
              ) : (
                <span>{content?.profile.name ?? PROFILE.name}</span>
              )}
            </span>
            <span className="p-topbar-right">
              <a href={content?.profile.links.resume.url ?? PROFILE.resumeUrl}>Resume</a>
              {content?.profile.email && <a href={`mailto:${content.profile.email}`}>Email</a>}
            </span>
          </div>
          {!project && (
            <>
              <div className="p-title-cell" id="top">
                <TitleBlock content={content} />
              </div>
              <Margin content={content} sections={sections} current={current} />
            </>
          )}
          {state.status === 'ready' &&
            (project ? (
              <CaseStudyRoute content={state.content} slug={project} navigate={navigate} />
            ) : (
              <Home content={state.content} sections={sections} navigate={navigate} />
            ))}
          {state.status === 'loading' && (
            <div style={{ gridColumn: 1 }} aria-busy="true" aria-live="polite">
              <p className="p-loading">Loading the rest of the page.</p>
              <span className="p-skeleton" style={{ width: '92%' }} />
              <span className="p-skeleton" style={{ width: '84%' }} />
              <span className="p-skeleton" style={{ width: '61%' }} />
            </div>
          )}
          {state.status === 'error' && (
            <div style={{ gridColumn: 1 }} role="alert">
              <p className="p-loading">{state.message} The resume above has the full details.</p>
              <button type="button" className="p-segment" onClick={() => window.location.reload()}>
                Try again
              </button>
            </div>
          )}
        </div>
        <footer className="p-footer">
          <span>
            {content?.profile.name ?? PROFILE.name}, {PROFILE.institution}.
          </span>
          <span className="p-segment" role="group" aria-label="Appearance">
            Appearance:
            {(['auto', 'light', 'dark'] as const).map((t) => (
              <button key={t} type="button" aria-pressed={theme === t} onClick={() => setTheme(t)}>
                {t === 'auto' ? 'Auto' : t === 'light' ? 'Light' : 'Dark'}
              </button>
            ))}
          </span>
        </footer>
      </div>
    </>
  );
}

const App = () => {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.add('paper');
    return () => root.classList.remove('paper');
  }, []);

  return (
    <ContentProvider>
      <Paper />
    </ContentProvider>
  );
};

export default App;
