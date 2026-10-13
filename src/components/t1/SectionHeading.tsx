import { align } from './layout';

interface SectionHeadingProps {
  /** SECTION_NUMBERS value — drives alignment */
  n: number;
  title: string;
  description?: string;
}

const SectionHeading = ({ n, title, description }: SectionHeadingProps) => {
  const a = align(n);
  return (
    <header className={`mb-14 ${a.text}`}>
      <h2 className="text-4xl leading-[0.95] sm:text-5xl md:text-6xl">{title}</h2>
      {description && <p className={`mt-5 max-w-xl text-darktech-muted ${a.push}`}>{description}</p>}
    </header>
  );
};

export default SectionHeading;
