import { ArrowUpRight } from 'lucide-react';
import { usePortfolio } from '@/hooks/PortfolioContext';
import { SECTION_NUMBERS } from '@/config/env';
import { formatDateRange } from '../../shared/format';
import SectionHeading from './t1/SectionHeading';
import { align } from './t1/layout';

/** Short and sourced: the first few entries of portfolio.achievements. */
const RECOGNITION_COUNT = 5;

const linkLabel = (url: string) =>
  /play\.google\.com/.test(url) ? 'Play Store' : /github\.com/.test(url) ? 'Repository' : 'Website';

const Experience = () => {
  const { portfolio, isLoading } = usePortfolio();
  const items = portfolio?.experience ?? [];
  const recognition: string[] = (portfolio?.achievements ?? []).slice(0, RECOGNITION_COUNT);
  const a = align(SECTION_NUMBERS.EXPERIENCE);

  return (
    <section
      id="experience"
      className="relative py-28"
      data-section-number={SECTION_NUMBERS.EXPERIENCE !== 0 ? SECTION_NUMBERS.EXPERIENCE : 0}
    >
      <div className="container relative z-[1] mx-auto px-4">
        <div className={`w-full md:w-4/5 ${a.block}`}>
          <SectionHeading
            n={SECTION_NUMBERS.EXPERIENCE}
            title="Experience"
            description="Where I've shipped, and what changed because of it."
          />

          {isLoading ? (
            <p className="animate-pulse text-sm text-darktech-muted">Loading experience…</p>
          ) : items.length === 0 ? (
            <p className="text-darktech-muted">No professional experience to display yet.</p>
          ) : (
            <ol className="border-t border-darktech-border text-left">
              {items.map((exp, index) => {
                const role = exp.title || exp.role;
                const range = exp.dates || exp.duration;
                const links = [exp.link, exp.github].filter(
                  (url, i, all): url is string => typeof url === 'string' && url.length > 0 && all.indexOf(url) === i,
                );
                return (
                  <li
                    key={`${exp.company}-${index}`}
                    className="grid gap-x-8 gap-y-2 border-b border-darktech-border py-8 md:grid-cols-[10rem_1fr]"
                  >
                    <div className="md:pt-1.5">
                      <p className="t1-num text-sm text-darktech-text/80">{formatDateRange(range)}</p>
                      {exp.location && <p className="mt-1 text-sm text-darktech-muted">{exp.location}</p>}
                    </div>
                    <div>
                      <h3 className="text-2xl leading-tight sm:text-3xl">{role}</h3>
                      <p className="mt-1 text-darktech-holo-cyan">{exp.company}</p>

                      {exp.achievements?.length ? (
                        <ul className="mt-4 max-w-3xl list-disc space-y-2.5 pl-5 leading-relaxed text-darktech-text/80 marker:text-darktech-neon-green/70">
                          {exp.achievements.map((achievement: string, i: number) => (
                            <li key={i}>{achievement}</li>
                          ))}
                        </ul>
                      ) : null}

                      {exp.description && <p className="mt-4 text-sm text-darktech-muted">{exp.description}</p>}

                      {links.length > 0 && (
                        <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                          {links.map((url) => (
                            <a
                              key={url}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="t1-link inline-flex items-center gap-1"
                            >
                              {linkLabel(url)}
                              <span className="sr-only">: {exp.company}</span>
                              <ArrowUpRight size={14} aria-hidden="true" />
                            </a>
                          ))}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          {recognition.length > 0 && (
            <div className="mt-16 grid gap-x-8 gap-y-4 text-left md:grid-cols-[10rem_1fr]">
              <h3 className="text-2xl leading-tight">Recognition</h3>
              <ul className="max-w-3xl list-disc space-y-2 pl-5 leading-relaxed text-darktech-text/80 marker:text-darktech-neon-green/70">
                {recognition.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Experience;
