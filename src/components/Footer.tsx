import { APP_SETTINGS, DEFAULT_USER } from '@/config/env';
import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-10 border-t border-darktech-border relative z-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <a href="#home" className="text-xl font-rajdhani font-bold text-gradient">{APP_SETTINGS.APP_NAME}</a>
          </div>
          
          <div className="text-darktech-muted text-sm">
            © {currentYear} {DEFAULT_USER.NAME}. All rights reserved
          </div>
          
          <div className="mt-4 md:mt-0">
            <nav className="flex space-x-6">
              <a href="#home" className="text-darktech-muted hover:text-darktech-neon-green transition-colors text-sm">Home</a>
              <a href="#projects" className="text-darktech-muted hover:text-darktech-neon-green transition-colors text-sm">Projects</a>
              <a href="#experience" className="text-darktech-muted hover:text-darktech-neon-green transition-colors text-sm">Experience</a>
              <a href="#contact" className="text-darktech-muted hover:text-darktech-neon-green transition-colors text-sm">Contact</a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
