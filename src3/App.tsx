import React, { useEffect } from 'react';
import { PortfolioProvider } from '../src/hooks/PortfolioContext';
import { Toaster } from '../src/components/ui/toaster';
import Terminal from '../src3/components/Terminal';
import { ThemeProvider } from '@/components/theme-provider';
import TemplateSwitcher from '../src/components/TemplateSwitcher';
import './styles/terminal.css';
import '../src/index.css';

const App = () => {
  // Set dark theme on load
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.style.setProperty('color-scheme', 'dark');
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="portfolio-theme">
      <PortfolioProvider>
        <div className="min-h-screen bg-black terminal-container">
          <Terminal />
          <Toaster />
          <TemplateSwitcher />
        </div>
      </PortfolioProvider>
    </ThemeProvider>
  );
};

export default App;