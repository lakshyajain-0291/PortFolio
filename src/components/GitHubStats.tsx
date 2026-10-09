import { useLayoutEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { SECTION_NUMBERS } from '@/config/env';
import { useGitHubDataset } from '../../shared/github/useGitHubDataset';
import SectionHeading from './t1/SectionHeading';
import { align } from './t1/layout';
import { languageColor } from './t1/palette';
import { sceneState } from './t1/sceneStore';
import { ScrollTrigger } from './t1/gsap';
import { useSectionChoreography } from './t1/useSectionChoreography';

const LEGEND_SIZE = 8;

const GitHubStats = () => {
  const { dataset, isLoading } = useGitHubDataset();
  const sectionRef = useRef<HTMLElement>(null);
  const n = SECTION_NUMBERS.GITHUB_STATS;
  const a = align(n);

  useSectionChoreography(sectionRef, !isLoading, [dataset.repos.length]);

  // Camera dolly: focus peaks while the section is centred in the viewport.
  useLayoutEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        sceneState.focus = Math.min(1, Math.max(0, (1 - Math.abs(self.progress - 0.5) * 2) * 1.7));
      },
      onLeave: () => (sceneState.focus = 0),
      onLeaveBack: () => (sceneState.focus = 0),
    });
    return () => {
      trigger.kill();
      sceneState.focus = 0;
    };
  }, [isLoading]);

  const { totals, languages, repos, contributions } = dataset;
  const legend = repos.slice(0, LEGEND_SIZE);
  const maxCommits = Math.max(1, ...legend.map((r) => r.commits));
  const maxDay = Math.max(1, ...contributions.map((c) => c.count));

  const highlight = (name: string | null) => () => {
    sceneState.highlighted = name;
  };

  const stats = [
    { label: 'repositories', value: totals.repos, display: String(totals.repos) },
    { label: 'stars', value: totals.stars, display: String(totals.stars) },
    { label: 'forks', value: totals.forks, display: String(totals.forks) },
    { label: 'commits', value: totals.commits, display: totals.commitsLabel },
  ];

  return (
    <section
      id="github-stats"
      ref={sectionRef}
      className="relative pb-[30vh] pt-28"
      data-section-number={n !== 0 ? n : 0}
    >
      <div className="container relative z-[1] mx-auto px-4">
        <div className={`w-full md:w-4/5 ${a.block}`}>
          <SectionHeading
            n={n}
            slug="github"
            title="Commit Topology"
            description="Public GitHub activity, rendered three ways across this site. Here: as a field of repositories."
          />

          {isLoading ? (
            <p className="t1-label animate-pulse">fetching repository graph…</p>
          ) : !dataset.hasData ? (
            <div className="t1-panel p-6 text-darktech-muted">No GitHub statistics available yet.</div>
          ) : (
            <div className={`t1-panel w-full p-6 sm:p-8 lg:w-[min(36rem,60%)] ${a.push}`} data-reveal-group>
              {/* Totals */}
              <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[2px] bg-darktech-border sm:grid-cols-4" data-reveal>
                {stats.map((s) => (
                  <div key={s.label} className="bg-darktech-card px-4 py-4">
                    <dt className="t1-label">{s.label}</dt>
                    <dd
                      className="t1-num mt-2 text-3xl font-medium text-darktech-text"
                      data-count={/^\d+$/.test(s.display) ? s.value : undefined}
                    >
                      {s.display}
                    </dd>
                  </div>
                ))}
              </dl>

              {/* Language share — stacked bar, 2px surface gaps, labelled legend */}
              {languages.length > 0 && (
                <div className="mt-8" data-reveal>
                  <p className="t1-label mb-3">languages · share of repositories</p>
                  <div className="flex h-2 w-full gap-[2px]" role="img" aria-label={languages.map((l) => `${l.name} ${l.percent}%`).join(', ')}>
                    {languages.map((l) => (
                      <span
                        key={l.name}
                        className="h-full first:rounded-l-[2px] last:rounded-r-[2px]"
                        style={{ width: `${l.percent}%`, backgroundColor: languageColor(l.name) }}
                      />
                    ))}
                  </div>
                  <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
                    {languages.map((l) => (
                      <li key={l.name} className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-[1px]" style={{ backgroundColor: languageColor(l.name) }} />
                        <span className="text-darktech-text">{l.name}</span>
                        <span className="t1-num text-darktech-muted">{l.percent}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Repo legend — hovering a row lights its column in the scene */}
              {legend.length > 0 && (
                <div className="mt-8" data-reveal>
                  <p className="t1-label mb-3">top repositories · by commits</p>
                  <ul className="-mx-2" onMouseLeave={highlight(null)}>
                    {legend.map((repo) => (
                      <li key={repo.name}>
                        <a
                          href={repo.url || undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          onMouseEnter={highlight(repo.name)}
                          onFocus={highlight(repo.name)}
                          onBlur={highlight(null)}
                          className="group grid grid-cols-[0.5rem_minmax(0,9rem)_1fr_auto] items-center gap-3 rounded-[2px] px-2 py-1.5 text-sm transition-colors hover:bg-darktech-lighter/60 focus-visible:bg-darktech-lighter/60"
                        >
                          <span className="h-2 w-2 rounded-[1px]" style={{ backgroundColor: languageColor(repo.language) }} />
                          <span className="truncate text-darktech-text group-hover:text-darktech-neon-green">{repo.name}</span>
                          <span className="h-[3px] rounded-r-[2px] bg-darktech-border">
                            <span
                              className="block h-full rounded-r-[2px] transition-[filter] group-hover:brightness-150"
                              style={{ width: `${(repo.commits / maxCommits) * 100}%`, backgroundColor: languageColor(repo.language) }}
                            />
                          </span>
                          <span className="t1-num w-12 text-right text-xs text-darktech-muted">{repo.commits}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 90-day activity strip */}
              {contributions.length > 0 && (
                <div className="mt-8" data-reveal>
                  <p className="t1-label mb-3">last {contributions.length} days</p>
                  <svg
                    viewBox={`0 0 ${contributions.length * 4} 28`}
                    preserveAspectRatio="none"
                    className="h-10 w-full"
                    role="img"
                    aria-label={`${dataset.contributionTotal} contributions over ${contributions.length} days`}
                  >
                    <line x1="0" x2={contributions.length * 4} y1="27.5" y2="27.5" stroke="rgb(var(--t1-line))" strokeWidth="1" />
                    {contributions.map((c, i) => {
                      const h = c.count > 0 ? 4 + (c.count / maxDay) * 22 : 0;
                      return h > 0 ? (
                        <rect key={c.date} x={i * 4 + 0.5} y={27 - h} width="3" height={h} rx="1" fill="rgb(var(--t1-signal))">
                          <title>{`${c.date}: ${c.count} contribution${c.count === 1 ? '' : 's'}`}</title>
                        </rect>
                      ) : null;
                    })}
                  </svg>
                  <p className="t1-num mt-2 text-xs text-darktech-muted">
                    {dataset.contributionTotal} contributions · {dataset.activeDays} active days · longest streak {dataset.longestStreak}d
                  </p>
                </div>
              )}

              {dataset.profileUrl && (
                <a
                  href={dataset.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="t1-link mt-8 inline-flex items-center gap-1.5 font-jetbrains text-sm"
                  data-reveal
                >
                  github.com/{dataset.username} <ArrowUpRight size={14} />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default GitHubStats;
