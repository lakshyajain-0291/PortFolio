import React, { useState, useEffect } from 'react';
import { Mail, Github, Linkedin, Send } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { motion, useAnimation } from 'framer-motion';
import { useToast } from "@/hooks/use-toast";
import { usePortfolio } from '@/hooks/PortfolioContext';
import { DEFAULT_USER, DEFAULT_SOCIAL, SECTION_NUMBERS, FORM_SETTINGS } from '@/config/env';

const Contact = () => {
  const { toast } = useToast();
  const { portfolio, isLoading } = usePortfolio();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  const controls = useAnimation();

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  const email = portfolio?.email || DEFAULT_USER.EMAIL;
  const linkedinUrl = portfolio?.socialLinks?.linkedin || DEFAULT_SOCIAL.LINKEDIN_URL;
  const githubUrl = portfolio?.socialLinks?.github || DEFAULT_SOCIAL.GITHUB_URL;
  
  const githubUsername = githubUrl.split('/').pop() || DEFAULT_SOCIAL.GITHUB_USERNAME;
  const linkedinUsername = linkedinUrl.split('/').pop() || DEFAULT_SOCIAL.LINKEDIN_USERNAME;
  
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

  return (
    <motion.section
      id="contact"
      className="py-20 relative"
      data-section-number={SECTION_NUMBERS.CONTACT !== 0 ? SECTION_NUMBERS.CONTACT : 0}
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={containerVariants}
    >
      <div className="container mx-auto px-4">
        <div className={`w-4/5 ${SECTION_NUMBERS.CONTACT === 0 ? 'mx-auto' : SECTION_NUMBERS.CONTACT % 2 === 0 ? 'ml-auto mr-0' : 'mr-auto ml-0'}`}>
          <motion.div
            className={`${SECTION_NUMBERS.CONTACT === 0 ? 'text-center' : (SECTION_NUMBERS.CONTACT % 2 === 0 ? 'text-right' : 'text-left')} mb-16`}
            variants={itemVariants}
          >
            <h2 className="text-4xl font-bold mb-4">Get In Touch</h2>
            <p className={`text-darktech-muted max-w-2xl ${SECTION_NUMBERS.CONTACT === 0 ? 'mx-auto' : (SECTION_NUMBERS.CONTACT % 2 === 0 ? 'ml-auto' : 'mr-auto')}`}>
              Have a question or want to work together? Feel free to reach out!
            </p>
          </motion.div>
        
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-10  ''}`}>
            <motion.div
              className="glass-panel p-8 rounded-xl order-2 lg:order-1"
              variants={itemVariants}
            >
              <h3 className="text-2xl font-bold mb-6 text-left">Send a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2 text-left pl-2">
                  Your Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                    className="w-full px-4 py-3 bg-darktech-card border border-darktech-border rounded-lg focus:outline-none focus:ring-2 focus:ring-darktech-neon-green/50 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2 text-left pl-2">
                    Your Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-darktech-card border border-darktech-border rounded-lg focus:outline-none focus:ring-2 focus:ring-darktech-neon-green/50 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2 text-left pl-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-darktech-card border border-darktech-border rounded-lg focus:outline-none focus:ring-2 focus:ring-darktech-neon-green/50 focus:border-transparent resize-none"
                    placeholder="Your message here..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-6 flex items-center justify-center gap-2 bg-gradient-to-r from-darktech-neon-green to-darktech-holo-cyan text-darktech-background font-medium rounded-lg transition-transform duration-300 hover:scale-[1.02] disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <div className="h-5 w-5 border-2 border-darktech-background border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send size={18} /> Send Message
                    </>
                  )}
                </button>
              </form>
            </motion.div>
            
            <motion.div
              className="flex flex-col gap-6 order-1 lg:order-2"
              variants={itemVariants}
            >
              <div className="glass-panel p-8 rounded-xl">
                <h3 className="text-2xl font-bold mb-6 text-left">Contact Info</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-darktech-card text-darktech-neon-green shrink-0">
                      <Mail size={24} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-lg font-medium text-left">Email</h4>
                      <a href={`mailto:${email}`} className="text-darktech-muted hover:text-darktech-neon-green transition-colors break-all">
                        {email}
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-darktech-card text-darktech-holo-cyan shrink-0">
                      <Linkedin size={24} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-lg font-medium text-left">LinkedIn</h4>
                      <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-darktech-muted hover:text-darktech-holo-cyan transition-colors break-words">
                        linkedin.com/in/{linkedinUsername}
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-darktech-card text-darktech-cyber-pink shrink-0">
                      <Github size={24} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-lg font-medium text-left">GitHub</h4>
                      <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="text-darktech-muted hover:text-darktech-cyber-pink transition-colors break-words">
                        github.com/{githubUsername}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="glass-panel p-8 rounded-xl">
                <h3 className="text-2xl font-bold mb-4 text-left">Let's Connect</h3>
                <p className="text-darktech-muted mb-6 text-left">
                  Interested in collaborating or have a project in mind? I'm always open to discussing new opportunities and ideas.
                </p>
                <div className="flex gap-4">
                  <a 
                    href={linkedinUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-darktech-card text-darktech-muted hover:text-darktech-holo-cyan hover:bg-darktech-card/70 transition-colors"
                  >
                    <Linkedin size={24} />
                  </a>
                  <a 
                    href={githubUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-darktech-card text-darktech-muted hover:text-darktech-cyber-pink hover:bg-darktech-card/70 transition-colors"
                  >
                    <Github size={24} />
                  </a>
                  <a 
                    href={`mailto:${email}`}
                    className="p-3 rounded-full bg-darktech-card text-darktech-muted hover:text-darktech-neon-green hover:bg-darktech-card/70 transition-colors"
                  >
                    <Mail size={24} />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default Contact;
