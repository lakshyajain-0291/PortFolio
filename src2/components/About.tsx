import { usePortfolio } from '../../src/hooks/PortfolioContext';
import Section from './Section';

/**
 * No entrance motion: the text mounts when the JSON arrives, and a variant
 * child of an already-fired parent would stay invisible. The block reserves
 * its height so the arrival does not shift the page.
 */
const About = () => {
  const { portfolio } = usePortfolio();
  return (
    <Section id="about" label="About">
      <div className="t2-prose min-h-[9lh]">
        <p className="text-foreground/90">{portfolio?.personalInfo?.about}</p>
      </div>
    </Section>
  );
};

export default About;
