import { useRef } from 'react';
import { Briefcase } from 'lucide-react';
import { usePortfolio } from '@/hooks/PortfolioContext';
import { SECTION_NUMBERS } from '@/config/env';
import { formatDateRange, splitDateRange } from '../../shared/format';
import SectionHeading from './t1/SectionHeading';
import { align } from './t1/layout';
import { useSectionChoreography } from './t1/useSectionChoreography';

const Experience = () => {
  const { portfolio, isLoading } = usePortfolio();
  const sectionRef = useRef<HTMLElement>(null);
  const items = portfolio?.experience ?? [];
  const a = align(SECTION_NUMBERS.EXPERIENCE);

  useSectionChoreography(sectionRef, !isLoading, [items.length]);

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="relative py-28"
      data-section-number={SECTION_NUMBERS.EXPERIENCE !== 0 ? SECTION_NUMBERS.EXPERIENCE : 0}
    >
      <div className="container relative z-[1] mx-auto px-4">
        <div className={`w-full md:w-4/5 ${a.block}`}>
          <SectionHeading
            n={SECTION_NUMBERS.EXPERIENCE}
            slug="experience"
            title="Professional Experience"
            description="Where I've shipped, and what changed because of it."
          />

          {isLoading ? (
            <p className="t1-label animate-pulse">loading experience…</p>
          ) : items.length === 0 ? (
            <div className="t1-panel p-8 text-center">
              <Briefcase className="mx-auto mb-4 h-10 w-10 text-darktech-muted" />
              <p>No professional experience to display yet.</p>
            </div>
          ) : (
            <ol className="relative" data-reveal-group>
              {/* Spine — drawn as the reader scrolls through the section */}
              <span
                data-draw="y"
                aria-hidden="true"
                className="absolute bottom-0 left-[7px] top-0 w-px bg-gradient-to-b from-darktech-neon-green via-darktech-neon-green/40 to-transparent md:left-1/2"
              />

              {items.map((exp, index) => {
                const role = exp.title || exp.role;
                const range = exp.dates || exp.duration;
                const { isCurrent } = splitDateRange(range);
                const onLeft = index % 2 === 0;
                return (
                  <li
                    key={`${exp.company}-${index}`}
                    data-reveal={onLeft ? 'left' : 'right'}
                    className={`relative mb-12 pl-10 last:mb-0 md:w-1/2 md:pl-0 ${
                      onLeft ? 'md:pr-14 md:text-right' : 'md:ml-auto md:pl-14'
                    }`}
                  >
                    {/* Node on the spine */}
                    <span
                      aria-hidden="true"
                      className={`absolute left-0 top-2 flex h-[15px] w-[15px] items-center justify-center border border-darktech-neon-green bg-darktech-background md:top-2 ${
                        onLeft ? 'md:left-auto md:-right-[7px]' : 'md:-left-[8px]'
                      }`}
                    >
                      {isCurrent && <span className="h-[5px] w-[5px] bg-darktech-neon-green" />}
                    </span>

                    <p className="t1-label mb-2 text-darktech-neon-green">
                      {formatDateRange(range)}
                      {exp.location ? <span className="text-darktech-muted"> · {exp.location}</span> : null}
                    </p>
                    <h3 className="text-2xl leading-tight sm:text-3xl">{role}</h3>
                    <p className="mt-1 text-darktech-holo-cyan">{exp.company}</p>

                    {exp.achievements?.length ? (
                      <ul className="t1-panel mt-5 space-y-3 p-5 text-left text-sm leading-relaxed text-darktech-text/80">
                        {exp.achievements.map((achievement: string, i: number) => (
                          <li key={i} className="grid grid-cols-[auto_1fr] gap-3">
                            <span className="t1-num pt-px text-xs text-darktech-neon-green/80">{String(i + 1).padStart(2, '0')}</span>
                            <span>{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    {exp.description && (
                      <p className="mt-4 text-left text-sm text-darktech-muted">{exp.description}</p>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
};

export default Experience;
