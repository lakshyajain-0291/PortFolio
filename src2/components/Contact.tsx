import React, { useState } from 'react';
import { Mail, Github, Linkedin, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePortfolio } from '@/hooks/PortfolioContext';
import { DEFAULT_USER, DEFAULT_SOCIAL } from '@/config/env';
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const { portfolio } = usePortfolio();
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Contact information
  const contactEmail = DEFAULT_USER.EMAIL;
  const githubUsername = (portfolio?.socialLinks?.github?.match(/github\.com\/([^\/]+)/) || [])[1] || DEFAULT_SOCIAL.GITHUB_USERNAME;
  const linkedinUsername = (portfolio?.socialLinks?.linkedin?.match(/linkedin\.com\/in\/([^\/]+)/) || [])[1] || DEFAULT_SOCIAL.LINKEDIN_USERNAME;
  const githubUrl = portfolio?.socialLinks?.github || DEFAULT_SOCIAL.GITHUB_URL;
  const linkedinUrl = portfolio?.socialLinks?.linkedin || DEFAULT_SOCIAL.LINKEDIN_URL;
  
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
    <section id="contact" className="py-20">
      <div className="container mx-auto px-4">
      <div className="mx-auto px-4 relative w-4/5">

        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold mb-4">Get In Touch</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Have a project in mind or want to discuss potential opportunities? Feel free to reach out.
            </p>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-card/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Your name"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-card/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Your email"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-card/50 focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[150px]"
                  placeholder="Your message"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary-foreground"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="p-8 rounded-xl border border-border bg-card/50">
              <h3 className="text-2xl font-bold mb-6">Contact Info</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium">Email</h4>
                    <a href={`mailto:${contactEmail}`} className="text-muted-foreground hover:text-primary transition-colors">
                      {contactEmail}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/10 text-blue-500">
                    <Linkedin size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium">LinkedIn</h4>
                    <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-blue-500 transition-colors">
                      linkedin.com/in/{linkedinUsername}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/10 text-gray-300">
                    <Github size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium">GitHub</h4>
                    <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-gray-300 transition-colors">
                      github.com/{githubUsername}
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-card/50 border border-border rounded-xl p-8 mt-6">
              <h3 className="text-2xl font-bold mb-4">Let's Connect</h3>
              <p className="text-muted-foreground mb-6">
                Interested in collaborating or have a project in mind? I'm always open to discussing new opportunities and ideas.
              </p>
              <div className="flex gap-4">
                <a 
                  href={linkedinUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-card text-muted-foreground hover:text-blue-500 hover:bg-card/70 transition-colors"
                >
                  <Linkedin size={24} />
                </a>
                <a 
                  href={githubUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-card text-muted-foreground hover:text-gray-300 hover:bg-card/70 transition-colors"
                >
                  <Github size={24} />
                </a>
                <a 
                  href={`mailto:${contactEmail}`}
                  className="p-3 rounded-full bg-card text-muted-foreground hover:text-primary hover:bg-card/70 transition-colors"
                >
                  <Mail size={24} />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      </div>
    </section>
  );
};

export default Contact;