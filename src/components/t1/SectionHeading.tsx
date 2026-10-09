import { align, pad2 } from './layout';

interface SectionHeadingProps {
  /** SECTION_NUMBERS value — drives alignment and the mono index */
  n: number;
  /** Short mono slug, e.g. "experience" */
  slug: string;
  title: string;
  description?: string;
}

const SectionHeading = ({ n, slug, title, description }: SectionHeadingProps) => {
  const a = align(n);
  return (
    <header className={`mb-14 ${a.text}`}>
      <p className={`t1-label mb-4 flex items-center gap-3 ${a.justify}`}>
        {n !== 0 && <span className="text-darktech-neon-green">{pad2(n)}</span>}
        <span data-draw="x" className="inline-block h-px w-10 bg-darktech-neon-green/50" />
        <span>{slug}</span>
      </p>
      <h2 data-split className="text-4xl leading-[0.95] sm:text-5xl md:text-6xl">
        {title}
      </h2>
      {description && (
        <p className={`mt-5 max-w-xl text-darktech-muted ${a.push}`}>{description}</p>
      )}
    </header>
  );
};

export default SectionHeading;
