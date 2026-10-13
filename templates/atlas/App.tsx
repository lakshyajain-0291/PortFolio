import { useEffect, useLayoutEffect, useState, type ReactNode } from 'react';
import './atlas.css';
import { ContentProvider, PROFILE, usePortfolioContent, type PortfolioContent } from '../../shared/content';
import { Cover, type RegisterEntry } from './components/Cover';
import { Icon } from './components/Icon';
import { CodeSheet, EducationSheet, ExperienceSchedule, ProjectSchedule, RecognitionSheet, SupportingDetails } from './components/Records';
import { Sheet } from './components/Sheet';
import { SystemSheet } from './components/SystemSheet';
import type { AtlasTheme } from '../../shared/three/scenes/kit';

const THEME_KEY = 'atlas-theme';

// Scope the page and apply a saved whiteprint choice before the first paint, not after it.
document.documentElement.classList.add('atlas');
try {
  if (localStorage.getItem(THEME_KEY) === 'white') document.documentElement.setAttribute('data-theme', 'white');
} catch {
  /* storage unavailable */
}

function readTheme(): AtlasTheme {
  try {
    return localStorage.getItem(THEME_KEY) === 'white' ? 'white' : 'blue';
  } catch {
    return 'blue';
  }
}

function useTheme() {
  const [theme, setTheme] = useState<AtlasTheme>(readTheme);
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (theme === 'white') root.setAttribute('data-theme', 'white');
    else root.removeAttribute('data-theme');
    try {
      if (theme === 'white') localStorage.setItem(THEME_KEY, 'white');
      else localStorage.removeItem(THEME_KEY);
    } catch {
      /* storage unavailable: the choice lasts for this visit only */
    }
  }, [theme]);
  return [theme, setTheme] as const;
}

interface Planned extends RegisterEntry {
  render: () => ReactNode;
}

const no = (n: number) => `A-${String(n).padStart(2, '0')}`;

function plan(content: PortfolioContent, theme: AtlasTheme): Planned[] {
  const out: Planned[] = [];
  const push = (e: Omit<Planned, 'no'>) => out.push({ ...e, no: no(out.length + 1) });
  const sources = content.sources;

  content.caseStudies
    .filter((c) => c.tier === 'system')
    .forEach((c) => {
      const spec = c.diagramId ? content.diagrams[c.diagramId] : undefined;
      if (!spec) return;
      push({
        id: c.slug,
        title: c.title,
        note: c.summary,
        group: 'Systems',
        render: () => <SystemSheet key={c.slug} study={c} spec={spec} no={no(out.findIndex((p) => p.id === c.slug) + 1)} theme={theme} sources={sources} />,
      });
    });

  const supporting = content.caseStudies.filter((c) => c.tier === 'supporting' || (c.tier === 'system' && !(c.diagramId && content.diagrams[c.diagramId])));
  const record = (id: string, title: string, note: string, show: boolean, body: () => ReactNode, meta: string) => {
    if (!show) return;
    push({
      id,
      title,
      note,
      group: 'Record',
      render: () => {
        const sheetNo = no(out.findIndex((p) => p.id === id) + 1);
        return (
          <Sheet key={id} sheet={{ id, no: sheetNo, title, meta: <span>{meta}</span> }}>
            {body()}
          </Sheet>
        );
      },
    });
  };

  record('supporting', 'Detail notes', supporting.map((s) => s.title.split(',')[0]).join(', '), supporting.length > 0, () => <SupportingDetails studies={supporting} sources={sources} />, 'Details');
  record('experience', 'Experience', content.experience.map((r) => r.org.split(',')[0]).slice(0, 3).join(', '), content.experience.length > 0, () => <ExperienceSchedule roles={content.experience} />, 'Schedule');
  record('projects', 'Other projects', `${content.otherProjects.length} smaller builds and coursework`, content.otherProjects.length > 0, () => <ProjectSchedule projects={content.otherProjects} />, 'Schedule');
  record(
    'recognition',
    'Recognition and leadership',
    `${content.recognition.awards.length} awards, ${content.recognition.leadership.length} roles`,
    content.recognition.awards.length + content.recognition.leadership.length > 0,
    () => <RecognitionSheet recognition={content.recognition} />,
    'Record',
  );
  record(
    'code',
    'Code record',
    content.code.contributions ? `${content.code.contributions.total.toLocaleString('en')} GitHub contributions since ${content.code.contributions.since}` : 'GitHub repositories',
    content.code.dataset.hasData,
    () => <CodeSheet code={content.code} />,
    'From GitHub',
  );
  record(
    'education',
    'Education and skills',
    content.education[0] ? `${content.education[0].institution}${content.education[0].grade ? `, CGPA ${content.education[0].grade}` : ''}` : 'Courses and skills',
    content.education.length + content.skills.length > 0,
    () => <EducationSheet education={content.education} skills={content.skills} />,
    'Record',
  );
  return out;
}

/** The sheet currently under the running bar, for the bar's sheet readout. */
function useCurrentSheet(deps: unknown) {
  const [current, setCurrent] = useState<string | null>(null);
  useEffect(() => {
    const sheets = [...document.querySelectorAll<HTMLElement>('[data-sheet]')];
    if (!sheets.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setCurrent((top.target as HTMLElement).id);
      },
      { rootMargin: '-64px 0px -70% 0px' },
    );
    sheets.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [deps]);
  return current;
}

function Atlas() {
  const state = usePortfolioContent();
  const [theme, setTheme] = useTheme();
  const content = state.status === 'ready' ? state.content : null;
  const sheets = content ? plan(content, theme) : [];
  const current = useCurrentSheet(sheets.length);
  const currentSheet = sheets.find((s) => s.id === current);
  const resume = content?.profile.links.resume.url ?? PROFILE.resumeUrl;

  return (
    <>
      <a className="a-skip" href="#sheets">
        Skip to the drawings
      </a>
      <header className="a-bar">
        <a className="a-bar-name" href="#cover">
          {content?.profile.name ?? PROFILE.name}
        </a>
        <span className="a-bar-sheet a-label" aria-live="off">
          {currentSheet ? `${currentSheet.no}  ${currentSheet.title.toUpperCase()}` : 'A-00  DRAWING REGISTER'}
        </span>
        <span className="a-bar-actions">
          <a className="a-btn a-btn-small a-btn-primary" href={resume}>
            <Icon name="download" />
            Resume
          </a>
          {content?.profile.email && (
            <a className="a-btn a-btn-small a-bar-hide-sm" href={`mailto:${content.profile.email}`}>
              Email
            </a>
          )}
          <button
            type="button"
            className="a-btn a-btn-small"
            aria-pressed={theme === 'white'}
            onClick={() => setTheme(theme === 'white' ? 'blue' : 'white')}
            title={theme === 'white' ? 'Switch to blueprint' : 'Switch to whiteprint'}
          >
            <Icon name={theme === 'white' ? 'moon' : 'sun'} />
            <span className="a-bar-hide-sm">Whiteprint</span>
            <span className="a-visually-hidden"> sheets</span>
          </button>
        </span>
      </header>

      <main className="a-set">
        <Cover content={content} register={sheets} />
        <div id="sheets" style={{ display: 'grid', gap: 'inherit' }}>
          {state.status === 'ready' && sheets.map((s) => s.render())}
          {state.status === 'loading' && (
            <div className="a-state" aria-busy="true" aria-live="polite">
              <p>Loading the drawing set.</p>
              <span className="a-skeleton" style={{ width: '70%' }} />
              <span className="a-skeleton" style={{ width: '52%' }} />
            </div>
          )}
          {state.status === 'error' && (
            <div className="a-state" role="alert">
              <p>{state.message} The resume has the full details.</p>
              <button type="button" className="a-btn" onClick={() => window.location.reload()}>
                Try again
              </button>
            </div>
          )}
        </div>
        <footer className="a-sheet" style={{ display: 'block' }}>
          <div className="a-revisions">
            <p>
              Issued 13 October 2026. Drawings are checked against each project’s code, report or paper. The same content is also available as the{' '}
              <a href="?template=paper">Systems Paper</a>.
            </p>
            <a className="a-btn a-btn-small" href="#cover">
              Back to the register
            </a>
          </div>
        </footer>
      </main>
    </>
  );
}

const App = () => {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.add('atlas');
    document.title = 'Lakshya Jain: Engineering Atlas';
    return () => root.classList.remove('atlas');
  }, []);

  return (
    <ContentProvider>
      <Atlas />
    </ContentProvider>
  );
};

export default App;
