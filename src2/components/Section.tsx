import type { ReactNode } from 'react';

interface SectionProps {
  id: string;
  label: string;
  children: ReactNode;
  className?: string;
}

/**
 * A section in the reading column. On small screens its label becomes a sticky
 * running head; on large screens the sticky side navigation does that job.
 */
const Section = ({ id, label, children, className = '' }: SectionProps) => (
  <section id={id} aria-label={label} className={`mb-24 scroll-mt-16 md:mb-32 lg:mb-36 lg:scroll-mt-24 ${className}`}>
    <div className="sticky top-0 z-20 -mx-6 mb-6 bg-background/85 px-6 py-4 backdrop-blur md:-mx-12 md:px-12 lg:sr-only">
      <h2 className="t2-eyebrow !text-foreground">{label}</h2>
    </div>
    {children}
  </section>
);

export default Section;

/**
 * Stand-in while portfolio.json loads. Reserves a screen of height rather than
 * printing "Loading…", so the sections below are already out of view when the
 * content lands and nothing on screen is pushed down.
 */
export const SectionPending = () => <div aria-busy="true" className="min-h-screen" />;
