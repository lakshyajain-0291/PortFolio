import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { usePortfolio } from '@/hooks/PortfolioContext';
import { DEFAULT_USER } from '@/config/env';
import Section from './Section';
import { ink, leading, onScroll, typeset } from '../motion';

const Contact = () => {
  const { portfolio } = usePortfolio();
  const contactEmail = portfolio?.socialLinks?.email || portfolio?.personalInfo?.email || DEFAULT_USER.EMAIL;

  return (
    <Section id="contact" label="Contact">
      <motion.div variants={leading(0.1)} {...onScroll}>
        <motion.h3 variants={typeset} className="t2-display text-4xl text-foreground sm:text-5xl">
          Get in touch
        </motion.h3>
        <motion.p variants={ink} className="mt-5 max-w-md text-muted-foreground">
          My inbox is open — whether it's a role, a hard systems problem, or a project you'd like a second pair of eyes on.
        </motion.p>

        <motion.a
          variants={ink}
          href={`mailto:${contactEmail}`}
          className="group mt-8 inline-flex items-center gap-2 rounded-[2px] border border-primary px-6 py-3.5 font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          Say hello
          <ArrowUpRight size={15} className="t2-arrow" aria-hidden="true" />
        </motion.a>
        <motion.p variants={ink} className="t2-meta mt-4 break-all">
          {contactEmail}
        </motion.p>
      </motion.div>
    </Section>
  );
};

export default Contact;
