import { useMemo, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { usePortfolio } from '../../src/hooks/PortfolioContext';
import { getTechStackWithIcons } from '../../src/lib/portfolioReader';
import Section from './Section';
import { EASE_PAPER, ink, leading, onScroll } from '../motion';

/** Hairline proficiency rule; observes its track (a scaled-to-zero fill never intersects). */
const SkillRule = ({ value }: { value: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  return (
    <div ref={ref} className="mt-1.5 h-px bg-border">
      <motion.div
        className="h-px origin-left bg-foreground/60 transition-colors group-hover:bg-primary"
        style={{ width: `${value}%` }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: seen ? 1 : 0 }}
        transition={{ duration: 1.1, ease: EASE_PAPER }}
      />
    </div>
  );
};

const TechStack = () => {
  const { portfolio, isLoading } = usePortfolio();
  const topSkills = useMemo(() => portfolio?.insights?.topSkills ?? [], [portfolio]);
  const tools = getTechStackWithIcons(portfolio);

  const categories = useMemo(() => {
    const groups = new Map<string, typeof topSkills>();
    topSkills.forEach((s) => groups.set(s.category, [...(groups.get(s.category) ?? []), s]));
    return [...groups.entries()].sort((a, b) => Math.max(...b[1].map((s) => s.proficiency)) - Math.max(...a[1].map((s) => s.proficiency)));
  }, [topSkills]);

  return (
    <Section id="tech-stack" label="Stack">
      {isLoading ? (
        <p className="t2-meta">Loading…</p>
      ) : categories.length === 0 && tools.length === 0 ? (
        <p className="text-muted-foreground">No skills data yet.</p>
      ) : (
        <motion.div variants={leading(0.08)} {...onScroll}>
          <motion.p variants={ink} className="text-muted-foreground">
            Scored from shipped work across my repositories — the number is confidence, not a badge.
          </motion.p>

          <dl className="mt-10 space-y-8">
            {categories.map(([category, skills]) => (
              <motion.div key={category} variants={ink} className="grid gap-3 sm:grid-cols-8 sm:gap-4">
                <dt className="t2-meta mt-0.5 uppercase sm:col-span-2">{category}</dt>
                <dd className="space-y-3 sm:col-span-6">
                  {skills.map((skill) => (
                    <div key={skill.name} className="group" title={skill.justification}>
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="text-foreground">{skill.name}</span>
                        <span className="t2-meta tabular-nums transition-colors group-hover:text-primary">{Math.round(skill.proficiency)}</span>
                      </div>
                      <SkillRule value={skill.proficiency} />
                    </div>
                  ))}
                </dd>
              </motion.div>
            ))}
          </dl>

          {tools.length > 0 && (
            <motion.div variants={ink} className="mt-12 border-t border-border pt-6">
              <p className="t2-meta mb-3 uppercase">Also in the toolbox</p>
              <p className="t2-serif text-lg leading-relaxed text-foreground/85">
                {tools.map((t, i) => (
                  <span key={`${t.name}-${i}`}>
                    {t.name}
                    {i < tools.length - 1 && <span className="mx-2 text-primary/70">·</span>}
                  </span>
                ))}
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
    </Section>
  );
};

export default TechStack;
