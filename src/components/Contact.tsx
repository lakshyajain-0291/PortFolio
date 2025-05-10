import React, { useState } from 'react';
import { Mail, Github, Linkedin, Send } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { usePortfolio } from '@/hooks/PortfolioContext';
import { DEFAULT_USER, DEFAULT_SOCIAL } from '@/config/env';

const Contact = () => {
  const { toast } = useToast();
  const { portfolio, isLoading } = usePortfolio();
  
  // Extract social links from portfolio data
  const email = portfolio?.email || DEFAULT_USER.EMAIL;
  const linkedinUrl = portfolio?.socialLinks?.linkedin || DEFAULT_SOCIAL.LINKEDIN_URL;
  const githubUrl = portfolio?.socialLinks?.github || DEFAULT_SOCIAL.GITHUB_URL;
  
  // Extract username from GitHub URL
  const githubUsername = githubUrl.split('/').pop() || DEFAULT_SOCIAL.GITHUB_USERNAME;
  
  // Extract username from LinkedIn URL
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message sent!",
        description: "Thank you for reaching out. I'll get back to you soon.",
      });
      setFormData({ name: '', email: '', message: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <section id="contact" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Get In Touch</h2>
          <p className="text-darktech-muted max-w-2xl mx-auto">
            Have a question or want to work together? Feel free to reach out!
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact Form */}
          <div className="glass-panel p-8 rounded-xl order-2 lg:order-1">
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
          </div>
          
          {/* Contact Info */}
          <div className="flex flex-col gap-6 order-1 lg:order-2">
            <div className="glass-panel p-8 rounded-xl">
              <h3 className="text-2xl font-bold mb-6 text-left">Contact Info</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-darktech-card text-darktech-neon-green">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-left">Email</h4>
                    <a href={`mailto:${email}`} className="text-darktech-muted hover:text-darktech-neon-green transition-colors">
                      {email}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-darktech-card text-darktech-holo-cyan">
                    <Linkedin size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-left">LinkedIn</h4>
                    <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-darktech-muted hover:text-darktech-holo-cyan transition-colors">
                      linkedin.com/in/{linkedinUsername}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-darktech-card text-darktech-cyber-pink">
                    <Github size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-left">GitHub</h4>
                    <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="text-darktech-muted hover:text-darktech-cyber-pink transition-colors">
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
