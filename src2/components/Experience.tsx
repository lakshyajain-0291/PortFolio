import { motion } from 'framer-motion';
import { usePortfolio } from '../../src/hooks/PortfolioContext';
import { formatDateRange } from '../../shared/format';
import Section from './Section';
import { ink, leading, onScroll, rule } from '../motion';

const Experience = () => {
  const { portfolio, isLoading } = usePortfolio();
  const items = portfolio?.experience ?? [];

  return (
    <Section id="experience" label="Experience">
      {isLoading ? (
        <p className="t2-meta">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground">No professional experience to display yet.</p>
      ) : (
        <motion.ol variants={leading(0.1)} {...onScroll} className="group/list">
          {items.map((exp, index) => (
            <motion.li key={`${exp.company}-${index}`} variants={ink} className="mb-12 last:mb-0">
              <div className="group relative grid gap-2 pb-1 transition-opacity duration-300 sm:grid-cols-8 sm:gap-8 md:gap-4 lg:group-hover/list:opacity-45 lg:hover:!opacity-100">
                {/* Hover plate — extends past the text block so the row reads as one object */}
                <span
                  aria-hidden="true"
                  className="absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-[2px] transition-colors duration-300 lg:-inset-x-6 lg:block lg:group-hover:bg-card lg:group-hover:shadow-[0_1px_0_hsl(var(--border)),0_18px_40px_-28px_hsl(var(--t2-shadow))]"
                />
                <p className="t2-meta relative z-10 mb-1 mt-1 uppercase sm:col-span-2" aria-label={exp.dates || exp.duration}>
                  {formatDateRange(exp.dates || exp.duration)}
                </p>
                <div className="relative z-10 sm:col-span-6">
                  <h3 className="font-medium leading-snug text-foreground">
                    <span className="transition-colors group-hover:text-primary">
                      {exp.title || exp.role}
                    </span>
                    <span className="text-muted-foreground"> · </span>
                    <span className="t2-serif italic">{exp.company}</span>
                  </h3>
                  {exp.location && <p className="t2-meta mt-1">{exp.location}</p>}
                  {exp.achievements?.length ? (
                    <ul className="mt-3 space-y-2 text-[0.95rem] leading-relaxed text-muted-foreground">
                      {exp.achievements.map((a: string, i: number) => (
                        <li key={i} className="relative pl-4 before:absolute before:left-0 before:top-[0.7em] before:h-px before:w-2 before:bg-primary/60">
                          {a}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {exp.description && <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">{exp.description}</p>}
                </div>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      )}
      <motion.span variants={rule} {...onScroll} aria-hidden="true" className="mt-14 block h-px w-full origin-left bg-border" />
    </Section>
  );
};

export default Experience;
