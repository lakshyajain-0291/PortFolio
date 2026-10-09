import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { usePortfolio } from '../../src/hooks/PortfolioContext';
import { DEFAULT_ASSETS } from '../../src/config/env';
import type { PortfolioData } from '../../src/lib/portfolioStorage';
import Section from './Section';
import { EASE_PAPER, ink, leading, onScroll } from '../motion';

const FEATURED_COUNT = 5;

type Project = NonNullable<PortfolioData['projects']>[number];

const repoImage = (githubUrl?: string) => {
  const match = githubUrl?.match(/github\.com\/([^/]+)\/([^/?#]+)/);
  return match ? `https://opengraph.githubassets.com/1/${match[1]}/${match[2]}` : DEFAULT_ASSETS.PROJECT_IMAGE;
};

const primaryLink = (p: Project) => p.demo || p.github || undefined;
const yearOf = (p: Project) => (p.timeline?.created_at ? new Date(p.timeline.created_at).getFullYear() : null);

const onImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = DEFAULT_ASSETS.PROJECT_IMAGE;
};

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

  const featured = useMemo(
    () => [...projects].filter((p) => p.featured).sort((a, b) => (b.commits ?? 0) - (a.commits ?? 0)).slice(0, FEATURED_COUNT),
    [projects],
  );
  const archive = useMemo(
    () => [...projects].sort((a, b) => (yearOf(b) ?? 0) - (yearOf(a) ?? 0)),
    [projects],
  );

  return (
    <Section id="projects" label="Projects">
      {isLoading ? (
        <p className="t2-meta">Loading…</p>
      ) : projects.length === 0 ? (
        <p className="text-muted-foreground">No projects to show yet.</p>
      ) : (
        <>
          <motion.ul variants={leading(0.09)} {...onScroll} className="group/list space-y-12">
            {(featured.length ? featured : projects.slice(0, FEATURED_COUNT)).map((project, i) => (
              <motion.li key={project.id ?? i} variants={ink}>
                <div className="group relative grid gap-4 pb-1 transition-opacity duration-300 sm:grid-cols-8 sm:gap-8 md:gap-4 lg:group-hover/list:opacity-45 lg:hover:!opacity-100 lg:focus-within:!opacity-100">
                  <span
                    aria-hidden="true"
                    className="absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-[2px] transition-colors duration-300 lg:-inset-x-6 lg:block lg:group-hover:bg-card lg:group-hover:shadow-[0_1px_0_hsl(var(--border)),0_18px_40px_-28px_hsl(var(--t2-shadow))] lg:group-focus-within:bg-card"
                  />
                  <div className="relative z-10 sm:order-2 sm:col-span-6">
                    <h3>
                      <ProjectTitle project={project} />
                    </h3>
                    <p className="mt-2 text-[0.95rem] leading-relaxed text-muted-foreground">{project.description}</p>
                    {(project.stars !== undefined || project.commits !== undefined) && (
                      <p className="t2-meta mt-3">
                        {project.commits ?? 0} commits
                        {project.stars ? <> · {project.stars} stars</> : null}
                        {project.forks ? <> · {project.forks} forks</> : null}
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
                  <div className="relative z-10 self-start overflow-hidden rounded-[2px] border border-border sm:order-1 sm:col-span-2 sm:mt-1">
                    <img
                      src={project.image || repoImage(project.github)}
                      alt=""
                      loading="lazy"
                      onError={onImageError}
                      className="aspect-[2/1] w-full object-cover saturate-[0.85] transition duration-500 ease-out group-hover:saturate-100"
                    />
                  </div>
                </div>
              </motion.li>
            ))}
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
                            <td className="t2-meta py-4 pr-6 align-top tabular-nums">{yearOf(p) ?? '—'}</td>
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
