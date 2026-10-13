import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { usePortfolio } from '../../src/hooks/PortfolioContext';
import type { PortfolioData } from '../../src/lib/portfolioStorage';
import type { MetricKind } from '../../shared/content/types';
import Section, { SectionPending } from './Section';
import { EASE_PAPER, ink, leading, onScroll } from '../motion';

const FEATURED_COUNT = 5;

type Project = NonNullable<PortfolioData['projects']>[number];

const primaryLink = (p: Project) => p.demo || p.github || undefined;
const yearOf = (p: Project) => (p.timeline?.created_at ? new Date(p.timeline.created_at).getFullYear() : null);

/** The headline metric a case study carries in portfolio.json. */
type Metric = { value: string; unit?: string; label: string; kind: MetricKind; method?: string };

const KIND_WORDS: Record<MetricKind, string> = {
  measured: 'measured',
  target: 'design target',
  projected: 'modelled',
  'self-reported': 'self-reported',
  count: 'counted',
};

const ProjectMetric = ({ metric }: { metric: Metric }) => (
  <p className="leading-snug" title={metric.method}>
    <span className="t2-display block text-balance text-2xl text-foreground">
      {metric.value}
      {metric.unit && <span className="text-lg"> {metric.unit}</span>}
    </span>
    <span className="mt-1 block text-sm text-muted-foreground">
      {metric.label} · {KIND_WORDS[metric.kind]}
    </span>
  </p>
);

const ProjectTitle = ({ project }: { project: Project }) => {
  const href = primaryLink(project);
  const content = (
    <>
      {project.title}
      {href && <ArrowUpRight size={15} className="t2-arrow ml-1 inline-block align-[-2px]" aria-hidden="true" />}
    </>
  );
  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium leading-snug text-foreground transition-colors hover:text-primary focus-visible:text-primary"
    >
      {/* Stretched link: the whole row is the hit target */}
      <span className="absolute -inset-x-4 -inset-y-4 z-20 hidden lg:-inset-x-6 lg:block" aria-hidden="true" />
      {content}
    </a>
  ) : (
    <span className="font-medium leading-snug text-foreground">{content}</span>
  );
};

const Projects = () => {
  const { portfolio, isLoading } = usePortfolio();
  const [archiveOpen, setArchiveOpen] = useState(false);
  const projects = useMemo(() => portfolio?.projects ?? [], [portfolio]);

  // The JSON order is the owner's order; featured: false opts a project out.
  const featured = useMemo(() => projects.filter((p) => p.featured !== false).slice(0, FEATURED_COUNT), [projects]);
  const archive = useMemo(
    () => [...projects].sort((a, b) => (yearOf(b) ?? 0) - (yearOf(a) ?? 0)),
    [projects],
  );

  return (
    <Section id="projects" label="Projects">
      {isLoading ? (
        <SectionPending />
      ) : projects.length === 0 ? (
        <p className="text-muted-foreground">No projects to show yet.</p>
      ) : (
        <>
          <motion.ul variants={leading(0.09)} {...onScroll} className="space-y-12">
            {featured.map((project, i) => {
              const metric = (project as { headline?: Metric }).headline;
              const role = project.role;
              return (
                <motion.li key={project.id ?? i} variants={ink}>
                  <div className="group relative grid gap-4 pb-1 sm:grid-cols-8 sm:gap-8 md:gap-4">
                    <span
                      aria-hidden="true"
                      className="absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-[2px] transition-colors duration-300 lg:-inset-x-6 lg:block lg:group-hover:bg-card lg:group-hover:shadow-[0_1px_0_hsl(var(--border)),0_18px_40px_-28px_hsl(var(--t2-shadow))] lg:group-focus-within:bg-card"
                    />
                    <div className="relative z-10 sm:order-2 sm:col-span-6 sm:col-start-3">
                      <h3>
                        <ProjectTitle project={project} />
                      </h3>
                      <p className="mt-2 text-[0.95rem] leading-relaxed text-muted-foreground">{project.description}</p>
                      {(role || project.commits !== undefined || project.stars) && (
                        <p className="t2-meta mt-3">
                          {[
                            role,
                            project.commits !== undefined && <><span className="t2-num">{project.commits}</span> commits</>,
                            project.stars ? <><span className="t2-num">{project.stars}</span> stars</> : null,
                            project.forks ? <><span className="t2-num">{project.forks}</span> forks</> : null,
                          ]
                            .filter(Boolean)
                            .map((part, k) => (
                              <span key={k}>
                                {k > 0 && ' · '}
                                {part}
                              </span>
                            ))}
                        </p>
                      )}
                      {project.technologies?.length ? (
                        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Technologies used">
                          {project.technologies.slice(0, 6).map((t) => (
                            <li key={t} className="t2-tag">
                              {t}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                    {metric && (
                      <div className="relative z-10 self-start sm:order-1 sm:col-span-2 sm:mt-0.5">
                        <ProjectMetric metric={metric} />
                      </div>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>

          <button
            type="button"
            onClick={() => setArchiveOpen((v) => !v)}
            aria-expanded={archiveOpen}
            aria-controls="project-archive"
            className="group mt-14 inline-flex items-center gap-2 font-medium text-foreground"
          >
            <span className="border-b border-transparent pb-px transition-colors group-hover:border-primary group-hover:text-primary">
              {archiveOpen ? 'Hide the full archive' : `View full project archive (${archive.length})`}
            </span>
            <ArrowUpRight size={15} className={`t2-arrow transition-transform ${archiveOpen ? 'rotate-90' : ''}`} aria-hidden="true" />
          </button>

          <AnimatePresence initial={false}>
            {archiveOpen && (
              <motion.div
                id="project-archive"
                key="archive"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.6, ease: EASE_PAPER }}
                className="overflow-hidden"
              >
                <div className="overflow-x-auto pt-8">
                  <table className="w-full border-collapse text-left">
                    <thead className="t2-meta uppercase">
                      <tr className="border-b border-border">
                        <th scope="col" className="py-3 pr-6 font-medium">Year</th>
                        <th scope="col" className="py-3 pr-6 font-medium">Project</th>
                        <th scope="col" className="hidden py-3 pr-6 font-medium md:table-cell">Built with</th>
                        <th scope="col" className="py-3 text-right font-medium">Link</th>
                      </tr>
                    </thead>
                    <tbody>
                      {archive.map((p, i) => {
                        const href = primaryLink(p);
                        return (
                          <tr key={p.id ?? i} className="border-b border-border/70 last:border-none">
                            <td className="t2-meta t2-num py-4 pr-6 align-top">{yearOf(p) ?? '—'}</td>
                            <td className="py-4 pr-6 align-top font-medium leading-snug">{p.title}</td>
                            <td className="hidden py-4 pr-6 align-top text-sm text-muted-foreground md:table-cell">
                              {p.technologies?.slice(0, 4).join(' · ')}
                            </td>
                            <td className="py-4 text-right align-top">
                              {href ? (
                                <a href={href} target="_blank" rel="noopener noreferrer" className="group t2-meta inline-flex items-center gap-1 hover:text-primary">
                                  {p.demo ? 'demo' : 'source'}
                                  <ArrowUpRight size={13} className="t2-arrow" aria-hidden="true" />
                                </a>
                              ) : (
                                <span className="t2-meta">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </Section>
  );
};

export default Projects;
