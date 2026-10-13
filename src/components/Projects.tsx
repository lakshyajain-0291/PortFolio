import { ArrowUpRight, GitCommitHorizontal, GitFork, Github, Star } from 'lucide-react';
import { usePortfolio } from '@/hooks/PortfolioContext';
import { SECTION_NUMBERS } from '@/config/env';
import type { PortfolioData } from '@/lib/portfolioStorage';
import SectionHeading from './t1/SectionHeading';
import { align } from './t1/layout';

type Project = NonNullable<PortfolioData['projects']>[number];

/** Projects above the fold of the list; the rest sit in a native <details>. */
const INITIAL_COUNT = 6;

/** First sentence only. Breaks where a capital follows, so "1.5 weeks" stays whole. */
const firstSentence = (text?: string) => (text ? text.split(/(?<=[.!?])\s+(?=[A-Z])/)[0].trim() : '');

const ProjectRow = ({ project }: { project: Project }) => {
  const role: string | undefined = project.role;
  const offline = project.status === 'offline';
  const counts = [
    { icon: Star, label: 'Stars', value: project.stars },
    { icon: GitFork, label: 'Forks', value: project.forks },
    { icon: GitCommitHorizontal, label: 'Commits', value: project.commits },
  ].filter((c): c is typeof c & { value: number } => typeof c.value === 'number' && c.value > 0);

  return (
    <li className="grid gap-x-10 gap-y-3 border-b border-darktech-border py-8 text-left md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
      <div>
        <h3 className="text-2xl leading-tight sm:text-3xl">{project.title}</h3>
        {role && <p className="mt-1.5 text-sm text-darktech-holo-cyan">{role}</p>}
        {offline && <p className="mt-1.5 text-sm text-darktech-muted">No longer online</p>}
      </div>

      <div>
        <p className="leading-relaxed text-darktech-text/85">{firstSentence(project.description) || 'No description available.'}</p>

        {project.technologies?.length ? (
          <p className="mt-3 text-sm text-darktech-muted">{project.technologies.join(' · ')}</p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-darktech-text transition-colors hover:text-darktech-neon-green"
              aria-label={`${project.title} source on GitHub`}
            >
              <Github size={15} aria-hidden="true" /> Source
            </a>
          )}
          {project.demo && !offline && (
            <a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="t1-link inline-flex items-center gap-1"
              aria-label={`${project.title} live demo`}
            >
              Demo <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          )}
          {counts.length > 0 && (
            <span className="t1-num flex gap-4 text-xs text-darktech-muted">
              {counts.map(({ icon: Icon, label, value }) => (
                <span key={label} className="inline-flex items-center gap-1" title={label}>
                  <Icon size={13} aria-hidden="true" />
                  <span className="sr-only">{label}:</span> {value}
                </span>
              ))}
            </span>
          )}
        </div>
      </div>
    </li>
  );
};

const Projects = () => {
  const { portfolio, isLoading } = usePortfolio();
  const a = align(SECTION_NUMBERS.PROJECTS);
  const projects = portfolio?.projects ?? [];
  const lead = projects.slice(0, INITIAL_COUNT);
  const more = projects.slice(INITIAL_COUNT);

  return (
    <section
      id="projects"
      className="relative py-28"
      data-section-number={SECTION_NUMBERS.PROJECTS !== 0 ? SECTION_NUMBERS.PROJECTS : 0}
    >
      <div className="container relative z-[1] mx-auto px-4">
        <div className={`w-full md:w-4/5 ${a.block}`}>
          <SectionHeading
            n={SECTION_NUMBERS.PROJECTS}
            title="Projects"
            description="Distributed systems, developer tooling and applied AI — most of it open source."
          />

          {isLoading ? (
            <p className="animate-pulse text-sm text-darktech-muted">Loading projects…</p>
          ) : projects.length === 0 ? (
            <p className="text-darktech-muted">No projects found yet.</p>
          ) : (
            <>
              <ol className="border-t border-darktech-border">
                {lead.map((project, index) => (
                  <ProjectRow key={project.id ?? index} project={project} />
                ))}
              </ol>

              {more.length > 0 && (
                <details className="group mt-10 text-left">
                  <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-[3px] border border-darktech-border bg-darktech-background/50 px-5 py-3 text-sm font-medium backdrop-blur transition-colors hover:border-darktech-neon-green/60 [&::-webkit-details-marker]:hidden">
                    <span className="group-open:hidden">Show {more.length} more projects</span>
                    <span className="hidden group-open:inline">Show fewer projects</span>
                  </summary>
                  <ol className="mt-6 border-t border-darktech-border" start={INITIAL_COUNT + 1}>
                    {more.map((project, index) => (
                      <ProjectRow key={project.id ?? INITIAL_COUNT + index} project={project} />
                    ))}
                  </ol>
                </details>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Projects;
