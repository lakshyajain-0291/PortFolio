import React from 'react';
import { ThemeProvider } from './components/theme-provider';
import { PortfolioProvider } from '../src/hooks/PortfolioContext';
import { Toaster } from '../src/components/ui/toaster';
import { SECTION_NUMBERS } from '../src/config/env';
import './template2.css';
import TemplateSwitcher from '../src/components/TemplateSwitcher';

// Import all components from template 2
import Header from './components/Header';
import Hero from './components/Hero';
import Footer from './components/Footer';
import BackgroundEffect from './components/BackgroundEffect';
import Projects from './components/Projects';
import TechStack from './components/TechStack';
import Experience from './components/Experience';
import Education from './components/Education';
import Contact from './components/Contact';
import GitHubStats from './components/GitHubStats';

const App = () => {
  // Create an array of section components with their order numbers
  const sections = [
    { component: <Hero />, order: SECTION_NUMBERS.HERO },
    { component: <Experience />, order: SECTION_NUMBERS.EXPERIENCE },
    { component: <Projects />, order: SECTION_NUMBERS.PROJECTS },
    { component: <GitHubStats />, order: SECTION_NUMBERS.GITHUB_STATS },
    { component: <TechStack />, order: SECTION_NUMBERS.TECH_STACK },
    { component: <Education />, order: SECTION_NUMBERS.EDUCATION },
    { component: <Contact />, order: SECTION_NUMBERS.CONTACT }
  ];

  // Sort sections by their order number
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <ThemeProvider defaultTheme="system">
      <PortfolioProvider>
        <div className="min-h-screen bg-background text-foreground">
          <BackgroundEffect />
          <div className="min-h-screen relative z-10 bg-transparent">

          <Header />
          
          {/* Render sections in the order specified in env.ts */}
          {sortedSections.map((section, index) => (
            <div key={index}>
              {section.component}
            </div>
          ))}
          
          <Footer />
          <Toaster />
          <TemplateSwitcher />
        </div>
        </div>
      </PortfolioProvider>
    </ThemeProvider>
  );
};

export default App;