import React, { useEffect, useLayoutEffect } from 'react';
import './template1.css';
import Header from './components/Header';
import Hero from './components/Hero';
import Projects from './components/Projects';
import GitHubStats from './components/GitHubStats';
import TechStack from './components/TechStack';
import Experience from './components/Experience';
import Education from './components/Education';
import Contact from './components/Contact';
import Footer from './components/Footer';
import SceneBackdrop from './components/t1/SceneBackdrop';
import SmoothScroll from './components/t1/SmoothScroll';
import CustomCursor from './components/t1/CustomCursor';
import { ScrollTrigger } from './components/t1/gsap';
import { useOverdrive } from './components/t1/useOverdrive';
import { PortfolioProvider, usePortfolio } from './hooks/PortfolioContext';
import { Toaster } from '@/components/ui/toaster';
import { SECTION_NUMBERS } from '@/config/env';
import TemplateSwitcher from './components/TemplateSwitcher';

/** Re-measure scroll-linked animations once data and fonts have settled. */
const LayoutSync = () => {
  const { isLoading, portfolio } = usePortfolio();
  useEffect(() => {
    if (isLoading) return;
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [isLoading, portfolio]);
  return null;
};

const App = () => {
  useLayoutEffect(() => {
    document.documentElement.classList.add('t1');
    return () => document.documentElement.classList.remove('t1');
  }, []);
  useOverdrive();

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
      {/* Fixed stage (poster + lazy WebGL scene) sits behind everything */}
      <SceneBackdrop />
      <SmoothScroll />
      <LayoutSync />
      <div className="relative z-10 min-h-screen text-darktech-text">
        <Header />
        <main>
          {/* Render sections in the order specified in env.ts */}
          {sortedSections.map((section, index) => (
            <React.Fragment key={index}>
              {section.component}
            </React.Fragment>
          ))}
        </main>
        <Footer />
        <Toaster />
        <TemplateSwitcher />
      </div>
      <div className="t1-grain" aria-hidden="true" />
      <CustomCursor />
    </PortfolioProvider>
  );
};

export default App;
