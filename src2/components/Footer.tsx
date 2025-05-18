import React from 'react';
import { Github, Linkedin, ExternalLink, ArrowUp } from 'lucide-react';
import { usePortfolio } from '../../src/hooks/PortfolioContext';
import { APP_SETTINGS, DEFAULT_USER, DEFAULT_SOCIAL } from '../../src/config/env';

const Footer = () => {
  const { portfolio } = usePortfolio();
  
  // Get social links from portfolio or fall back to defaults
  const githubUrl = portfolio?.socialLinks?.github || DEFAULT_SOCIAL.GITHUB_URL;
  const linkedinUrl = portfolio?.socialLinks?.linkedin || DEFAULT_SOCIAL.LINKEDIN_URL;
  const websiteUrl = portfolio?.socialLinks?.website || DEFAULT_SOCIAL.WEBSITE_URL;
  
  // Get user name from portfolio or fall back to default
  const name = portfolio?.name || DEFAULT_USER.NAME;
  
  // Current year for copyright
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="border-t border-border py-6">
      <div className="container mx-auto px-4">
        {/* Main Footer Content - Redesigned for compact layout */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          {/* Brand and Links - Combined section */}
          <div className="flex flex-col sm:flex-row gap-6 w-full md:w-2/3">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base font-semibold bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                  {APP_SETTINGS.APP_NAME}
                </span>
              </div>
              <p className="text-xs text-foreground/70 max-w-xs mb-2">
                A dynamic tech portfolio that adapts to your professional journey.
              </p>
            </div>
            
            {/* Navigation Links - Updated to display in a simple line */}
            <div className="flex items-center">
              <nav className="flex space-x-6">
                <a href="#home" className="text-xs text-foreground/70 hover:text-primary transition-colors hover:translate-y-[-1px] inline-block">Home</a>
                <a href="#projects" className="text-xs text-foreground/70 hover:text-primary transition-colors hover:translate-y-[-1px] inline-block">Projects</a>
                <a href="#tech-stack" className="text-xs text-foreground/70 hover:text-primary transition-colors hover:translate-y-[-1px] inline-block">Tech Stack</a>
                <a href="#experience" className="text-xs text-foreground/70 hover:text-primary transition-colors hover:translate-y-[-1px] inline-block">Experience</a>
                <a href="#education" className="text-xs text-foreground/70 hover:text-primary transition-colors hover:translate-y-[-1px] inline-block">Education</a>
                <a href="#contact" className="text-xs text-foreground/70 hover:text-primary transition-colors hover:translate-y-[-1px] inline-block">Contact</a>
              </nav>
            </div>
          </div>
          
          {/* Connect - Social Icons */}
            <div className="w-full md:w-1/3 flex flex-col sm:flex-row sm:justify-end items-start sm:items-center gap-4">
            <a 
              href={githubUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="group flex items-center gap-1.5 text-xs text-foreground/70 hover:text-primary transition-colors"
              aria-label="GitHub"
            >
              <Github size={18} className="text-foreground/70 group-hover:text-primary transition-colors group-hover:rotate-12" />
              <span className="sm:hidden">GitHub</span>
            </a>
            
            <a 
              href={linkedinUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="group flex items-center gap-1.5 text-xs text-foreground/70 hover:text-primary transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin size={18} className="text-foreground/70 group-hover:text-primary transition-colors group-hover:rotate-12" />
              <span className="sm:hidden">LinkedIn</span>
            </a>
            
            {websiteUrl && (
              <a 
              href={websiteUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="group flex items-center gap-1.5 text-xs text-foreground/70 hover:text-primary transition-colors"
              aria-label="Website"
              >
              <ExternalLink size={18} className="text-foreground/70 group-hover:text-primary transition-colors group-hover:rotate-12" />
              <span className="sm:hidden">Website</span>
              </a>
            )}
            
            <a 
              href={`mailto:${portfolio?.email || 'contact@example.com'}`}
              className="group flex items-center gap-1.5 text-xs text-foreground/70 hover:text-primary transition-colors"
              aria-label="Email"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground/70 group-hover:text-primary transition-colors group-hover:rotate-12">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <span className="sm:hidden">Email</span>
            </a>
            
            <button 
              onClick={scrollToTop}
              className="ml-2 p-3 bg-background border border-border hover:border-primary hover:text-primary transition-colors flex items-center justify-center"
              aria-label="Scroll to top"
            >
              <ArrowUp size={20} />
            </button>
          </div>
        </div>
        
        {/* Copyright - Minimized */}
        <div className="mt-4 pt-2 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center">
          <div className="text-xs text-foreground/50">© {currentYear} {name}</div>
          <div className="text-xs text-foreground/50">
            <span className="relative group">
              Powered by <span className="text-primary font-mono">LiveInsight</span>
              <span className="absolute left-0 bottom-[-18px] w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
