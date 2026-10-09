import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Code2, X } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePortfolio } from '@/hooks/PortfolioContext';
import { getTechStackWithIcons } from '@/lib/portfolioReader';
import { SECTION_NUMBERS } from '@/config/env';
import SectionHeading from './t1/SectionHeading';
import { align } from './t1/layout';
import { useSectionChoreography } from './t1/useSectionChoreography';

const CATEGORY_PRIORITY: Record<string, number> = {
  Backend: 1, Systems: 2, Cloud: 3, Architecture: 4, Frontend: 5, Mobile: 6, AI: 7,
};

const proficiencyLabel = (p: number) =>
  p >= 85 ? 'expert' : p >= 70 ? 'advanced' : p >= 50 ? 'intermediate' : p >= 30 ? 'working' : 'novice';

const TechIcon = ({ name, icon }: { name?: string; icon?: string }) => {
  const [failed, setFailed] = useState(false);
  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-[3px] bg-darktech-text/95 p-2">
      {icon && !failed ? (
        <img src={icon} alt="" loading="lazy" className="max-h-full max-w-full object-contain" onError={() => setFailed(true)} />
      ) : (
        <Code2 className="h-5 w-5 text-darktech-background" aria-label={name} />
      )}
    </span>
  );
};

const TechStack = () => {
  const { portfolio, isLoading } = usePortfolio();
  const sectionRef = useRef<HTMLElement>(null);
  const a = align(SECTION_NUMBERS.TECH_STACK);

  const topSkills = useMemo(() => portfolio?.insights?.topSkills ?? [], [portfolio]);
  const techStack = getTechStackWithIcons(portfolio);

  const categories = useMemo(() => {
    const groups = new Map<string, typeof topSkills>();
    topSkills.forEach((s) => groups.set(s.category, [...(groups.get(s.category) ?? []), s]));
    return [...groups.entries()].sort(
      ([x], [y]) => (CATEGORY_PRIORITY[x] ?? 99) - (CATEGORY_PRIORITY[y] ?? 99) || x.localeCompare(y),
    );
  }, [topSkills]);

  const [selected, setSelected] = useState<string | null>(null);
  const active = selected ?? categories[0]?.[0] ?? null;
  const activeSkills = categories.find(([c]) => c === active)?.[1] ?? [];

  useSectionChoreography(sectionRef, !isLoading, [categories.length]);

  return (
    <section
      id="tech-stack"
      ref={sectionRef}
      className="relative py-28"
      data-section-number={SECTION_NUMBERS.TECH_STACK !== 0 ? SECTION_NUMBERS.TECH_STACK : 0}
    >
      <div className="container relative z-[1] mx-auto px-4">
        <div className={`w-full md:w-4/5 ${a.block}`}>
          <SectionHeading
            n={SECTION_NUMBERS.TECH_STACK}
            slug="stack"
            title="Tech Stack"
            description="Skills scored from what I've actually shipped across repositories, not a wish list."
          />

          {isLoading ? (
            <p className="t1-label animate-pulse">analysing tech profile…</p>
          ) : categories.length === 0 && techStack.length === 0 ? (
            <div className="t1-panel p-6 text-darktech-muted">No technical skills data available yet.</div>
          ) : (
            <div data-reveal-group>
              {categories.length > 0 && (
                <div className="t1-panel p-6 sm:p-8" data-reveal>
                  <div role="tablist" aria-label="Skill categories" className="mb-8 flex flex-wrap gap-x-6 gap-y-2 border-b border-darktech-border">
                    {categories.map(([category, skills]) => {
                      const isActive = category === active;
                      return (
                        <button
                          key={category}
                          role="tab"
                          aria-selected={isActive}
                          onClick={() => setSelected(category)}
                          className={`relative -mb-px pb-3 font-jetbrains text-xs uppercase tracking-[0.14em] transition-colors ${
                            isActive ? 'text-darktech-text' : 'text-darktech-muted hover:text-darktech-text'
                          }`}
                        >
                          {category}
                          <span className="ml-1.5 text-darktech-muted">{skills.length}</span>
                          {isActive && (
                            <motion.span
                              layoutId="t1-tab-underline"
                              className="absolute inset-x-0 bottom-0 h-px bg-darktech-neon-green"
                              transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <ul role="tabpanel" className="grid gap-x-10 gap-y-7 md:grid-cols-2">
                    {activeSkills.map((skill, i) => (
                      <li key={`${active}-${skill.name}`}>
                        <div className="flex items-baseline justify-between gap-4">
                          <span className="font-rajdhani text-xl font-semibold">{skill.name}</span>
                          <span className="t1-num text-xs text-darktech-muted">
                            {proficiencyLabel(skill.proficiency)} · <span className="text-darktech-text">{Math.round(skill.proficiency)}</span>
                          </span>
                        </div>
                        <div className="mt-2 h-[3px] w-full bg-darktech-border">
                          <motion.div
                            className="h-full bg-darktech-neon-green"
                            initial={{ width: 0 }}
                            animate={{ width: `${skill.proficiency}%` }}
                            transition={{ duration: 0.9, delay: 0.05 * i, ease: [0.2, 0.7, 0.1, 1] }}
                          />
                        </div>
                        {skill.justification && (
                          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-darktech-muted">{skill.justification}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {techStack.length > 0 && (
                <div className={`mt-8 flex flex-wrap items-center gap-4 ${a.justify}`} data-reveal>
                  <p className="t1-num text-sm text-darktech-muted">
                    {techStack.slice(0, 8).map((t) => t.name).join(' · ')}
                    {techStack.length > 8 && ' …'}
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-[3px] border border-darktech-neon-green/60 px-4 py-2 font-jetbrains text-xs uppercase tracking-[0.12em] text-darktech-neon-green transition-colors hover:bg-darktech-neon-green hover:text-darktech-background"
                      >
                        <Code2 size={14} /> all {techStack.length} tools
                      </button>
                    </DialogTrigger>
                    <DialogContent
                      data-lenis-prevent
                      className="flex max-h-[85vh] flex-col gap-0 overflow-hidden rounded-[3px] border-darktech-border bg-darktech-background p-0 sm:max-w-3xl [&>button]:hidden"
                    >
                      <DialogHeader className="flex-row items-center justify-between space-y-0 border-b border-darktech-border px-6 py-4 text-left">
                        <div>
                          <DialogTitle className="text-2xl">Complete Tech Stack</DialogTitle>
                          <DialogDescription className="t1-label mt-1">tools · frameworks · platforms</DialogDescription>
                        </div>
                        <DialogClose className="rounded-[3px] p-2 text-darktech-muted transition-colors hover:text-darktech-text" aria-label="Close">
                          <X size={18} />
                        </DialogClose>
                      </DialogHeader>
                      <ul className="custom-scrollbar grid grid-cols-2 gap-px overflow-y-auto bg-darktech-border sm:grid-cols-3 md:grid-cols-4">
                        {techStack.map((tech, i) => (
                          <li key={`${tech.name}-${i}`} className="flex items-center gap-3 bg-darktech-background p-4">
                            <TechIcon name={tech.name} icon={tech.icon} />
                            <span className="text-sm">{tech.name}</span>
                          </li>
                        ))}
                      </ul>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TechStack;
