import React, { useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Github, Search, Star, GitFork, GitCommitHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { usePortfolio } from '@/hooks/PortfolioContext';
import { DEFAULT_ASSETS, SECTION_NUMBERS } from '@/config/env';
import SectionHeading from './t1/SectionHeading';
import { align } from './t1/layout';
import { useSectionChoreography } from './t1/useSectionChoreography';

const INITIAL_COUNT = 4;
const FILTER_PREVIEW = 8;

// GitHub's social preview image for a repository URL
const getRepoImageUrl = (githubUrl?: string) => {
  const match = githubUrl?.match(/github\.com\/([^/]+)\/([^/?#]+)/);
  return match ? `https://opengraph.githubassets.com/1/${match[1]}/${match[2]}` : DEFAULT_ASSETS.PROJECT_IMAGE;
};

const Projects = () => {
  const { portfolio, isLoading } = usePortfolio();
  const sectionRef = useRef<HTMLElement>(null);
  const [query, setQuery] = useState('');
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [showAllTech, setShowAllTech] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const a = align(SECTION_NUMBERS.PROJECTS);

  const projects = useMemo(() => portfolio?.projects ?? [], [portfolio]);

  const availableTech = useMemo(() => {
    const counts = new Map<string, number>();
    projects.forEach((p) => p.technologies?.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
    return [...counts.entries()].sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0])).map(([t]) => t);
  }, [projects]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter(
      (p) =>
        (!q || p.title?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)) &&
        (selectedTech.length === 0 || p.technologies?.some((t) => selectedTech.includes(t))),
    );
  }, [projects, query, selectedTech]);

  const visible = showAll ? filtered : filtered.slice(0, INITIAL_COUNT);
  const visibleKey = visible.map((p, i) => p.id ?? i).join('|');

  useSectionChoreography(sectionRef, !isLoading, [visibleKey]);

  const toggleTech = (tech: string) =>
    setSelectedTech((prev) => (prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]));

  const onImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = DEFAULT_ASSETS.PROJECT_IMAGE;
  };

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative py-28"
      data-section-number={SECTION_NUMBERS.PROJECTS !== 0 ? SECTION_NUMBERS.PROJECTS : 0}
    >
      <div className="container relative z-[1] mx-auto px-4">
        <div className={`w-full md:w-4/5 ${a.block}`}>
          <SectionHeading
            n={SECTION_NUMBERS.PROJECTS}
            slug="projects"
            title="Selected Work"
            description="Distributed systems, developer tooling and applied AI — most of it open source."
          />

          {isLoading ? (
            <p className="t1-label animate-pulse">indexing projects…</p>
          ) : projects.length === 0 ? (
            <div className="t1-panel p-6 text-darktech-muted">No projects found yet.</div>
          ) : (
            <>
              {/* Search + filters */}
              <div className={`mb-12 flex flex-col gap-5 ${a.items}`}>
                <label className="relative w-full max-w-md">
                  <span className="sr-only">Search projects</span>
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-darktech-muted" />
                  <Input
                    type="search"
                    placeholder="grep projects…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="rounded-[3px] border-darktech-border bg-darktech-card/70 pl-9 font-jetbrains text-sm backdrop-blur focus-visible:ring-darktech-neon-green"
                  />
                </label>

                {availableTech.length > 0 && (
                  <div className={`flex max-w-3xl flex-wrap gap-2 ${a.justify}`} role="group" aria-label="Filter by technology">
                    {availableTech.slice(0, showAllTech ? undefined : FILTER_PREVIEW).map((tech) => {
                      const on = selectedTech.includes(tech);
                      return (
                        <button
                          key={tech}
                          type="button"
                          aria-pressed={on}
                          onClick={() => toggleTech(tech)}
                          className={`rounded-[3px] border px-2.5 py-1 font-jetbrains text-xs transition-colors ${
                            on
                              ? 'border-darktech-neon-green bg-darktech-neon-green text-darktech-background'
                              : 'border-darktech-border bg-darktech-card/60 text-darktech-muted hover:border-darktech-neon-green/50 hover:text-darktech-text'
                          }`}
                        >
                          {tech}
                        </button>
                      );
                    })}
                    {availableTech.length > FILTER_PREVIEW && (
                      <button
                        type="button"
                        onClick={() => setShowAllTech((v) => !v)}
                        className="t1-link px-2 py-1 font-jetbrains text-xs"
                      >
                        {showAllTech ? 'fewer' : `+${availableTech.length - FILTER_PREVIEW} more`}
                      </button>
                    )}
                    {selectedTech.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedTech([])}
                        className="px-2 py-1 font-jetbrains text-xs text-darktech-muted underline underline-offset-4 hover:text-darktech-text"
                      >
                        clear
                      </button>
                    )}
                  </div>
                )}
              </div>

              {filtered.length === 0 ? (
                <div className="t1-panel p-6 text-darktech-muted">No projects match — try a different filter.</div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2" data-reveal-group>
                  {visible.map((project, index) => {
                    const hasStats = project.stars !== undefined || project.commits !== undefined;
                    return (
                      <article
                        key={project.id ?? index}
                        data-reveal={index % 2 === 0 ? 'left' : 'right'}
                        className="t1-panel group flex flex-col overflow-hidden"
                        data-interactive
                      >
                        <div className="t1-duotone aspect-[1200/600] w-full">
                          <img
                            src={project.image || getRepoImageUrl(project.github)}
                            alt=""
                            className="h-full w-full object-cover"
                            loading="lazy"
                            onError={onImageError}
                          />
                          <div className="absolute left-3 top-3 z-[1] flex gap-2">
                            {project.featured && (
                              <span className="t1-label rounded-[2px] bg-darktech-background/85 px-2 py-1 !text-darktech-neon-green">
                                featured
                              </span>
                            )}
                            {project.source && (
                              <span className="t1-label rounded-[2px] bg-darktech-background/85 px-2 py-1">
                                {project.source === 'github' ? 'github' : 'resume'}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-1 flex-col p-6">
                          <h3 className="text-2xl leading-tight transition-colors group-hover:text-darktech-neon-green">
                            {project.title}
                          </h3>
                          <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-darktech-muted">
                            {project.description || 'No description available.'}
                          </p>

                          {project.technologies?.length ? (
                            <p className="mt-4 font-jetbrains text-xs text-darktech-text/70">
                              {project.technologies.slice(0, 5).join(' · ')}
                              {project.technologies.length > 5 && ` · +${project.technologies.length - 5}`}
                            </p>
                          ) : null}

                          <div className="mt-5 flex items-center justify-between border-t border-darktech-border pt-4">
                            {hasStats ? (
                              <p className="t1-num flex gap-4 text-xs text-darktech-muted">
                                <span className="inline-flex items-center gap-1" title="Stars">
                                  <Star size={13} /> {project.stars ?? 0}
                                </span>
                                <span className="inline-flex items-center gap-1" title="Forks">
                                  <GitFork size={13} /> {project.forks ?? 0}
                                </span>
                                <span className="inline-flex items-center gap-1" title="Commits">
                                  <GitCommitHorizontal size={13} /> {project.commits ?? 0}
                                </span>
                              </p>
                            ) : (
                              <span />
                            )}
                            <div className="flex items-center gap-4 text-sm">
                              {project.github && (
                                <a
                                  href={project.github}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-darktech-text transition-colors hover:text-darktech-neon-green"
                                  aria-label={`${project.title} source on GitHub`}
                                >
                                  <Github size={15} /> Source
                                </a>
                              )}
                              {project.demo && (
                                <a
                                  href={project.demo}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="t1-link inline-flex items-center gap-1"
                                  aria-label={`${project.title} live demo`}
                                >
                                  Demo <ArrowUpRight size={14} />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {filtered.length > INITIAL_COUNT && (
                <div className="mt-12 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowAll((v) => !v)}
                    className="rounded-[3px] border border-darktech-border bg-darktech-background/50 px-6 py-3 font-jetbrains text-sm backdrop-blur transition-colors hover:border-darktech-neon-green/60"
                  >
                    {showAll ? 'show less' : `show ${filtered.length - INITIAL_COUNT} more`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Projects;
