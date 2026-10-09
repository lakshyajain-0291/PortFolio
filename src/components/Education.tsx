import { useRef, type FC } from 'react';
import { usePortfolio } from '@/hooks/PortfolioContext';
import { SECTION_NUMBERS } from '@/config/env';
import { formatDateRange } from '../../shared/format';
import SectionHeading from './t1/SectionHeading';
import { align } from './t1/layout';
import { useSectionChoreography } from './t1/useSectionChoreography';

const Education: FC = () => {
  const { portfolio, isLoading } = usePortfolio();
  const sectionRef = useRef<HTMLElement>(null);
  const items = portfolio?.education ?? [];
  const a = align(SECTION_NUMBERS.EDUCATION);

  useSectionChoreography(sectionRef, !isLoading, [items.length]);

  return (
    <section
      id="education"
      ref={sectionRef}
      className="relative py-28"
      data-section-number={SECTION_NUMBERS.EDUCATION !== 0 ? SECTION_NUMBERS.EDUCATION : 0}
    >
      <div className="container relative z-[1] mx-auto px-4">
        <div className={`w-full md:w-4/5 ${a.block}`}>
          <SectionHeading n={SECTION_NUMBERS.EDUCATION} slug="education" title="Education" />

          {items.length === 0 ? (
            <p className="text-darktech-muted">{isLoading ? 'Loading…' : 'Education information not available.'}</p>
          ) : (
            <ul className="border-t border-darktech-border" data-reveal-group>
              {items.map((edu, index) => (
                <li
                  key={`${edu.institution}-${index}`}
                  data-reveal={a.from === 'up' ? 'up' : a.from}
                  className="group grid gap-x-8 gap-y-2 border-b border-darktech-border py-7 transition-colors hover:bg-darktech-card/40 md:grid-cols-[10rem_1fr_auto] md:px-4"
                >
                  <p className="t1-label pt-1.5">{formatDateRange(edu.dates || edu.duration)}</p>
                  <div>
                    <h3 className="text-2xl leading-tight transition-colors group-hover:text-darktech-neon-green">{edu.degree}</h3>
                    <p className="mt-1 text-darktech-muted">{edu.institution}</p>
                    {edu.description && <p className="mt-3 text-sm text-darktech-muted">{edu.description}</p>}
                  </div>
                  {edu.cgpa && (
                    <p className="t1-num self-start text-sm text-darktech-text md:pt-1.5">
                      <span className="t1-label mr-2">grade</span>
                      {edu.cgpa}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};

export default Education;
