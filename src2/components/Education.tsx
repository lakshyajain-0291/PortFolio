import { motion } from 'framer-motion';
import { usePortfolio } from '../../src/hooks/PortfolioContext';
import { formatDateRange } from '../../shared/format';
import Section from './Section';
import { leading, onScroll, typeset } from '../motion';

const Education = () => {
  const { portfolio, isLoading } = usePortfolio();
  const items = portfolio?.education ?? [];
  const coursework: Array<{ course?: string; grade?: string }> = portfolio?.coursework ?? [];

  return (
    <Section id="education" label="Education">
      {items.length === 0 ? (
        <p className="text-muted-foreground">{isLoading ? 'Loading…' : 'Education information not available.'}</p>
      ) : (
        <motion.ol variants={leading(0.1)} {...onScroll} className="group/list space-y-10">
          {items.map((edu, index) => (
            <motion.li
              key={`${edu.institution}-${index}`}
              variants={typeset}
              className="grid gap-2 transition-opacity duration-300 sm:grid-cols-8 sm:gap-4 lg:group-hover/list:opacity-45 lg:hover:!opacity-100"
            >
              <p className="t2-meta mt-1 uppercase sm:col-span-2">{formatDateRange(edu.dates || edu.duration)}</p>
              <div className="sm:col-span-6">
                <h3 className="font-medium leading-snug text-foreground">{edu.degree}</h3>
                <p className="t2-serif italic text-muted-foreground">{edu.institution}</p>
                {edu.cgpa && (
                  <p className="t2-meta mt-2">
                    Grade <span className="text-foreground">{edu.cgpa}</span>
                  </p>
                )}
                {edu.description && <p className="mt-2 text-[0.95rem] text-muted-foreground">{edu.description}</p>}
              </div>
            </motion.li>
          ))}
        </motion.ol>
      )}

      {coursework.length > 0 && (
        <details className="group mt-12 border-t border-border pt-6">
          <summary className="t2-meta flex cursor-pointer list-none items-center gap-2 uppercase tracking-[0.12em] hover:text-foreground">
            <span className="inline-block transition-transform group-open:rotate-90">›</span>
            Selected coursework ({coursework.length})
          </summary>
          <ul className="mt-5 grid gap-x-8 gap-y-2 text-[0.95rem] sm:grid-cols-2">
            {coursework.map((c, i) => (
              <li key={`${c.course}-${i}`} className="flex items-baseline justify-between gap-4 border-b border-border/60 pb-2">
                <span>{c.course}</span>
                {c.grade && <span className="t2-meta">{c.grade}</span>}
              </li>
            ))}
          </ul>
        </details>
      )}
    </Section>
  );
};

export default Education;
