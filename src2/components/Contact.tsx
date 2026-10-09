import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { usePortfolio } from '@/hooks/PortfolioContext';
import { DEFAULT_USER } from '@/config/env';
import { useToast } from '@/hooks/use-toast';
import Section from './Section';
import { ink, leading, onScroll, typeset } from '../motion';

const fieldClass =
  'peer w-full border-0 border-b border-border bg-transparent px-0 pb-2 pt-1 text-foreground placeholder:text-transparent transition-colors focus:border-primary focus:outline-none focus:ring-0';
const labelClass =
  't2-meta pointer-events-none absolute left-0 top-1 origin-left transition-all duration-200 peer-focus:-translate-y-5 peer-focus:scale-90 peer-focus:text-primary peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:scale-90';

const Contact = () => {
  const { toast } = useToast();
  const { portfolio } = usePortfolio();

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactEmail = portfolio?.socialLinks?.email || portfolio?.personalInfo?.email || DEFAULT_USER.EMAIL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate sending the form
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Message Sent",
        description: "Thanks for reaching out! I'll get back to you soon.",
      });

      // Reset form
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Section id="contact" label="Contact">
      <motion.div variants={leading(0.1)} {...onScroll}>
        <motion.p variants={typeset} className="t2-eyebrow">What's next?</motion.p>
        <motion.h3 variants={typeset} className="t2-display mt-3 text-4xl text-foreground sm:text-5xl">
          Get in touch
        </motion.h3>
        <motion.p variants={ink} className="mt-5 max-w-md text-muted-foreground">
          My inbox is open — whether it's a role, a hard systems problem, or a project you'd like a second pair of eyes on.
        </motion.p>

        <motion.a
          variants={ink}
          href={`mailto:${contactEmail}`}
          className="group mt-8 inline-flex items-center gap-2 rounded-[2px] border border-primary px-6 py-3.5 font-plex-mono text-sm text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          Say hello
          <ArrowUpRight size={15} className="t2-arrow" aria-hidden="true" />
        </motion.a>

        <motion.form variants={ink} onSubmit={handleSubmit} className="mt-16 space-y-10 border-t border-border pt-10" noValidate>
          <p className="t2-meta uppercase">Or leave a note</p>
          <div className="grid gap-10 sm:grid-cols-2">
            <div className="relative">
              <input id="t2-name" type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} />
              <label htmlFor="t2-name" className={labelClass}>Name</label>
            </div>
            <div className="relative">
              <input id="t2-email" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClass} />
              <label htmlFor="t2-email" className={labelClass}>Email</label>
            </div>
          </div>
          <div className="relative">
            <textarea id="t2-message" rows={4} placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} className={`${fieldClass} resize-none`} />
            <label htmlFor="t2-message" className={labelClass}>Message</label>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="group inline-flex items-center gap-2 font-medium text-foreground transition-colors hover:text-primary disabled:opacity-50"
          >
            <span className="border-b border-foreground/30 pb-px transition-colors group-hover:border-primary">
              {isSubmitting ? 'Sending…' : 'Send message'}
            </span>
            <ArrowUpRight size={15} className="t2-arrow" aria-hidden="true" />
          </button>
        </motion.form>
      </motion.div>
    </Section>
  );
};

export default Contact;
