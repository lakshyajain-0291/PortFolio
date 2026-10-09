import React, { useRef, useState } from 'react';
import { ArrowUpRight, Github, Linkedin, Mail, Send } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { usePortfolio } from '@/hooks/PortfolioContext';
import { DEFAULT_USER, DEFAULT_SOCIAL, SECTION_NUMBERS, FORM_SETTINGS } from '@/config/env';
import SectionHeading from './t1/SectionHeading';
import { align } from './t1/layout';
import { useSectionChoreography } from './t1/useSectionChoreography';

const fieldClass =
  'w-full rounded-[3px] border border-darktech-border bg-darktech-background/60 px-4 py-3 text-darktech-text placeholder:text-darktech-muted/60 transition-colors focus:border-darktech-neon-green focus:outline-none';

const Contact = () => {
  const { toast } = useToast();
  const { portfolio, isLoading } = usePortfolio();
  const sectionRef = useRef<HTMLElement>(null);
  const a = align(SECTION_NUMBERS.CONTACT);

  useSectionChoreography(sectionRef, !isLoading);

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
            title: "Message sent! (DEV MODE)",
            description: "Form submission was simulated in development mode.",
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
      
      console.log('Form data:', formUrlEncoded.toString());
      console.log('Submitting to Google Form URL:', FORM_SETTINGS.GOOGLE_FORM_URL);
      console.log('Form fields:', {
        name: FORM_SETTINGS.GOOGLE_FORM_NAME_FIELD,
        email: FORM_SETTINGS.GOOGLE_FORM_EMAIL_FIELD,
        message: FORM_SETTINGS.GOOGLE_FORM_MESSAGE_FIELD
      });
      console.log('Form data:', formData);

      const response = await fetch(FORM_SETTINGS.GOOGLE_FORM_URL, {
        method: 'POST',
        body: formUrlEncoded,
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      console.log('Form submission response:', response);

      toast({
        title: "Message sent!",
        description: "Thank you for reaching out. I'll get back to you soon.",
      });
      
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Message failed to send",
        description: "There was a problem sending your message. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const channels = [
    { icon: Mail, label: 'email', value: email, href: `mailto:${email}` },
    ...(collegeEmail ? [{ icon: Mail, label: 'academic', value: collegeEmail, href: `mailto:${collegeEmail}` }] : []),
    { icon: Linkedin, label: 'linkedin', value: `in/${linkedinUsername}`, href: linkedinUrl },
    { icon: Github, label: 'github', value: githubUsername, href: githubUrl },
  ];

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative py-28"
      data-section-number={SECTION_NUMBERS.CONTACT !== 0 ? SECTION_NUMBERS.CONTACT : 0}
    >
      <div className="container relative z-[1] mx-auto px-4">
        <div className={`w-full md:w-4/5 ${a.block}`}>
          <SectionHeading
            n={SECTION_NUMBERS.CONTACT}
            slug="contact"
            title="Open a Channel"
            description="Have a system that needs building, or a problem worth arguing about? I read everything."
          />

          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]" data-reveal-group>
            <form onSubmit={handleSubmit} className="t1-panel space-y-5 p-6 sm:p-8" data-reveal="left">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="t1-label mb-2 block">name</span>
                  <input name="name" type="text" value={formData.name} onChange={handleChange} required className={fieldClass} placeholder="Ada Lovelace" />
                </label>
                <label className="block">
                  <span className="t1-label mb-2 block">email</span>
                  <input name="email" type="email" value={formData.email} onChange={handleChange} required className={fieldClass} placeholder="ada@example.com" />
                </label>
              </div>
              <label className="block">
                <span className="t1-label mb-2 block">message</span>
                <textarea name="message" value={formData.message} onChange={handleChange} required rows={6} className={`${fieldClass} resize-none`} placeholder="What are we building?" />
              </label>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group inline-flex w-full items-center justify-center gap-3 rounded-[3px] bg-darktech-neon-green px-6 py-3.5 font-semibold text-darktech-background transition-colors hover:bg-darktech-neon-green/90 disabled:opacity-60 sm:w-auto"
              >
                {isSubmitting ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-darktech-background border-t-transparent" />
                ) : (
                  <>
                    Transmit <Send size={16} className="transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            <ul className="t1-panel divide-y divide-darktech-border self-start" data-reveal="right">
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
                      <span className="t1-label block">{label}</span>
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
