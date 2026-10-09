import { motion } from 'framer-motion';
import { usePortfolio } from '../../src/hooks/PortfolioContext';
import { DEFAULT_USER } from '../../src/config/env';
import Section from './Section';
import { ink, leading, onScroll } from '../motion';

const About = () => {
  const { portfolio } = usePortfolio();
  const summary = portfolio?.personalInfo?.summary || DEFAULT_USER.BIO;
  const trajectory = portfolio?.insights?.careerTrajectory as string | undefined;
  const stack: string[] = portfolio?.insights?.technicalProfile?.primaryStack ?? [];

  return (
    <Section id="about" label="About">
      <motion.div variants={leading(0.12)} {...onScroll} className="t2-prose space-y-5 text-muted-foreground">
        <motion.p variants={ink} className="text-foreground/90">{summary}</motion.p>
        {trajectory && <motion.p variants={ink}>{trajectory}</motion.p>}
        {stack.length > 0 && (
          <motion.p variants={ink}>
            Most days that means{' '}
            {stack.map((item, i) => (
              <span key={item}>
                <span className="text-foreground">{item}</span>
                {i < stack.length - 2 ? ', ' : i === stack.length - 2 ? ' and ' : '.'}
              </span>
            ))}
          </motion.p>
        )}
      </motion.div>
    </Section>
  );
};

export default About;
