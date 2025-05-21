import React from 'react';
import './App.css';
import Header from './components/Header';
import Hero from './components/Hero';
import Projects from './components/Projects';
import GitHubStats from './components/GitHubStats';
import TechStack from './components/TechStack';
import Experience from './components/Experience';
import Education from './components/Education';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ParticleBackground from './components/ParticleBackground';
import BackgroundEffect from './components/BackgroundEffect';
import { PortfolioProvider } from './hooks/PortfolioContext';
import { Toaster } from '@/components/ui/toaster';
import { SECTION_NUMBERS } from '@/config/env';
import TemplateSwitcher from './components/TemplateSwitcher';

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
    <PortfolioProvider>
      {/* Background elements are placed first to ensure they're behind everything */}
      <BackgroundEffect />
      <ParticleBackground />
      <div className="min-h-screen bg-darktech-background text-darktech-text relative z-10 bg-transparent">
        <Header />
        {/* Render sections in the order specified in env.ts */}
        {sortedSections.map((section, index) => (
          <React.Fragment key={index}>
            {section.component}
          </React.Fragment>
        ))}
        <Footer />
        <Toaster />
        <TemplateSwitcher />
      </div>
    </PortfolioProvider>
  );
};

export default App;
