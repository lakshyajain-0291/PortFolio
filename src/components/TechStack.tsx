import { useMemo } from 'react';
import { usePortfolio } from '@/hooks/PortfolioContext';
import { SECTION_NUMBERS } from '@/config/env';
import SectionHeading from './t1/SectionHeading';
import { align } from './t1/layout';

const CATEGORY_PRIORITY: Record<string, number> = {
  Backend: 1, Systems: 2, Cloud: 3, Architecture: 4, Frontend: 5, Mobile: 6, AI: 7,
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

const TechStack = () => {
  const { portfolio, isLoading } = usePortfolio();
  const a = align(SECTION_NUMBERS.TECH_STACK);

  const topSkills = useMemo(() => portfolio?.insights?.topSkills ?? [], [portfolio]);
  const techStack = (portfolio?.techStack ?? []);

  const categories = useMemo(() => {
    const groups = new Map<string, typeof topSkills>();
    topSkills.forEach((s) => groups.set(s.category, [...(groups.get(s.category) ?? []), s]));
    return [...groups.entries()].sort(
      ([x], [y]) => (CATEGORY_PRIORITY[x] ?? 99) - (CATEGORY_PRIORITY[y] ?? 99) || x.localeCompare(y),
    );
  }, [topSkills]);

  return (
    <section
      id="tech-stack"
      className="relative py-28"
      data-section-number={SECTION_NUMBERS.TECH_STACK !== 0 ? SECTION_NUMBERS.TECH_STACK : 0}
    >
      <div className="container relative z-[1] mx-auto px-4">
        <div className={`w-full md:w-4/5 ${a.block}`}>
          <SectionHeading n={SECTION_NUMBERS.TECH_STACK} title="Tech Stack" description="Each skill, and where I used it." />

          {isLoading ? (
            <p className="animate-pulse text-sm text-darktech-muted">Loading skills…</p>
          ) : categories.length === 0 && techStack.length === 0 ? (
            <p className="text-darktech-muted">No technical skills data available yet.</p>
          ) : (
            <div className="text-left">
              {categories.length > 0 && (
                <div className="border-t border-darktech-border">
                  {categories.map(([category, skills]) => (
                    <section
                      key={category}
                      aria-labelledby={`skills-${slug(category)}`}
                      className="grid gap-x-8 gap-y-4 border-b border-darktech-border py-8 md:grid-cols-[10rem_1fr]"
                    >
                      <h3 id={`skills-${slug(category)}`} className="text-2xl leading-tight md:pt-0.5">
                        {category}
                      </h3>
                      <dl className="grid gap-x-10 gap-y-5 md:grid-cols-2">
                        {skills.map((skill) => (
                          <div key={skill.name}>
                            <dt className="font-medium text-darktech-text">{skill.name}</dt>
                            {skill.justification && (
                              <dd className="mt-1 text-sm leading-relaxed text-darktech-muted">{skill.justification}</dd>
                            )}
                          </div>
                        ))}
                      </dl>
                    </section>
                  ))}
                </div>
              )}

              {techStack.length > 0 && (
                <details className="group mt-10">
                  <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-[3px] border border-darktech-border bg-darktech-background/50 px-5 py-3 text-sm font-medium backdrop-blur transition-colors hover:border-darktech-neon-green/60 [&::-webkit-details-marker]:hidden">
                    <span className="group-open:hidden">All {techStack.length} tools</span>
                    <span className="hidden group-open:inline">Hide tools</span>
                  </summary>
                  <ul className="mt-5 flex max-w-3xl flex-wrap gap-x-2 gap-y-2">
                    {techStack.map((tech, i) => (
                      <li
                        key={`${tech.name}-${i}`}
                        className="rounded-[3px] border border-darktech-border bg-darktech-card/60 px-2.5 py-1 text-sm text-darktech-text/85"
                      >
                        {tech.name}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TechStack;
