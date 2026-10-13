import React, { useEffect, useState } from 'react';
import { ArrowUpRight, Check, Copy, Github, Linkedin, Mail, Send } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { usePortfolio } from '@/hooks/PortfolioContext';
import { DEFAULT_USER, DEFAULT_SOCIAL, SECTION_NUMBERS, FORM_SETTINGS } from '@/config/env';
import SectionHeading from './t1/SectionHeading';
import { align } from './t1/layout';

const fieldClass =
  'w-full rounded-[3px] border border-darktech-border bg-darktech-background/60 px-4 py-3 text-darktech-text placeholder:text-darktech-muted transition-colors focus:border-darktech-neon-green focus:outline-none';

const Contact = () => {
  const { toast } = useToast();
  const { portfolio } = usePortfolio();
  const a = align(SECTION_NUMBERS.CONTACT);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(id);
  }, [copied]);

  const email = portfolio?.socialLinks?.email || portfolio?.personalInfo?.email || DEFAULT_USER.EMAIL;
  const collegeEmail = portfolio?.socialLinks?.collegeEmail || portfolio?.personalInfo?.collegeEmail;
  const linkedinUrl = portfolio?.socialLinks?.linkedin || DEFAULT_SOCIAL.LINKEDIN_URL;
  const githubUrl = portfolio?.socialLinks?.github || DEFAULT_SOCIAL.GITHUB_URL;

  const githubUsername = githubUrl.replace(/\/$/, '').split('/').pop() || DEFAULT_SOCIAL.GITHUB_USERNAME;
  const linkedinUsername = linkedinUrl.replace(/\/$/, '').split('/').pop() || DEFAULT_SOCIAL.LINKEDIN_USERNAME;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
    } catch {
      toast({ title: "Couldn't copy", description: `Select the address instead: ${email}` });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!FORM_SETTINGS.GOOGLE_FORM_URL || !FORM_SETTINGS.GOOGLE_FORM_URL.includes('docs.google.com/forms')) {
        console.warn('Google Form URL is not properly configured:', FORM_SETTINGS.GOOGLE_FORM_URL);
        if (import.meta.env.DEV) {
          console.info('DEV MODE: Simulating successful form submission');
          toast({
            title: "Sent. If you don't hear back, email me directly.",
            description: "Development mode: the submission was simulated.",
          });
          setFormData({ name: '', email: '', message: '' });
          setIsSubmitting(false);
          return;
        }
        throw new Error('Google Form URL is not properly configured');
      }

      const formUrlEncoded = new URLSearchParams();
      formUrlEncoded.append(FORM_SETTINGS.GOOGLE_FORM_NAME_FIELD, formData.name);
      formUrlEncoded.append(FORM_SETTINGS.GOOGLE_FORM_EMAIL_FIELD, formData.email);
      formUrlEncoded.append(FORM_SETTINGS.GOOGLE_FORM_MESSAGE_FIELD, formData.message);
      
      await fetch(FORM_SETTINGS.GOOGLE_FORM_URL, {
        method: 'POST',
        body: formUrlEncoded,
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      toast({ title: "Sent. If you don't hear back, email me directly." });
      
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Message failed to send",
        description: `Please email me directly at ${email}.`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const channels = [
    ...(collegeEmail ? [{ icon: Mail, label: 'Academic email', value: collegeEmail, href: `mailto:${collegeEmail}` }] : []),
    { icon: Linkedin, label: 'LinkedIn', value: `in/${linkedinUsername}`, href: linkedinUrl },
    { icon: Github, label: 'GitHub', value: githubUsername, href: githubUrl },
  ];

  return (
    <section
      id="contact"
      className="relative py-28"
      data-section-number={SECTION_NUMBERS.CONTACT !== 0 ? SECTION_NUMBERS.CONTACT : 0}
    >
      <div className="container relative z-[1] mx-auto px-4">
        <div className={`w-full md:w-4/5 ${a.block}`}>
          <SectionHeading
            n={SECTION_NUMBERS.CONTACT}
            title="Contact"
            description="Have a system that needs building, or a problem worth arguing about? I read everything."
          />

          <div className={`mb-12 flex flex-wrap items-center gap-x-5 gap-y-3 ${a.justify}`}>
            <a
              href={`mailto:${email}`}
              className="font-rajdhani text-[clamp(1.75rem,6vw,3.25rem)] font-semibold leading-none text-darktech-text underline decoration-darktech-neon-green/40 decoration-2 underline-offset-[0.2em] transition-colors [overflow-wrap:anywhere] hover:decoration-darktech-neon-green"
            >
              {email}
            </a>
            <button
              type="button"
              onClick={copyEmail}
              className="inline-flex h-11 items-center gap-2 rounded-[3px] border border-darktech-border px-4 text-sm font-medium transition-colors hover:border-darktech-neon-green/60"
            >
              {copied ? <Check size={15} className="text-darktech-neon-green" aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
              <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="grid gap-8 text-left lg:grid-cols-[1.4fr_1fr]">
            <form onSubmit={handleSubmit} className="t1-panel space-y-5 p-6 sm:p-8">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-darktech-text/85">Name</span>
                  <input name="name" type="text" value={formData.name} onChange={handleChange} required className={fieldClass} placeholder="Ada Lovelace" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-darktech-text/85">Email</span>
                  <input name="email" type="email" value={formData.email} onChange={handleChange} required className={fieldClass} placeholder="ada@example.com" />
                </label>
              </div>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-darktech-text/85">Message</span>
                <textarea name="message" value={formData.message} onChange={handleChange} required rows={6} className={`${fieldClass} resize-none`} placeholder="What are we building?" />
              </label>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group inline-flex w-full items-center justify-center gap-3 rounded-[3px] bg-darktech-neon-green px-6 py-3.5 font-semibold text-darktech-background transition-colors hover:bg-darktech-neon-green/90 disabled:opacity-60 sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-darktech-background border-t-transparent" aria-hidden="true" />
                    Sending…
                  </>
                ) : (
                  <>
                    Send message <Send size={16} className="transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            <ul className="t1-panel divide-y divide-darktech-border self-start">
              {channels.map(({ icon: Icon, label, value, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    target={href.startsWith('mailto:') ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 px-6 py-5 transition-colors hover:bg-darktech-lighter/50"
                  >
                    <Icon size={18} className="shrink-0 text-darktech-muted transition-colors group-hover:text-darktech-neon-green" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs text-darktech-muted">{label}</span>
                      <span className="block truncate text-darktech-text">{value}</span>
                    </span>
                    <ArrowUpRight size={16} className="shrink-0 text-darktech-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-darktech-holo-cyan" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
