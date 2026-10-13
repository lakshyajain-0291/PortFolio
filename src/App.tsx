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
import { ScrollTrigger } from './components/t1/gsap';
import { useOverdrive } from './components/t1/useOverdrive';
import { PortfolioProvider, usePortfolio } from './hooks/PortfolioContext';
import { Toaster } from '@/components/ui/toaster';
import { SECTION_NUMBERS } from '@/config/env';
import TemplateSwitcher from './components/TemplateSwitcher';

/**
 * Start fetching the hero's faces as soon as this chunk evaluates, ahead of the
 * first render. Templates 0/1 only, so this can't be a static tag in index.html.
 */
const PRELOAD_FONTS = ['/fonts/t1/rajdhani-700-latin.woff2', '/fonts/t1/inter-latin-var.woff2'];
if (typeof document !== 'undefined') {
  for (const href of PRELOAD_FONTS) {
    if (document.head.querySelector(`link[rel="preload"][href="${href}"]`)) continue;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.href = href;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }
}

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
      <div className="relative z-10 min-h-screen overflow-x-clip text-darktech-text">
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
        {/* Floats on sm+; below 640px the footer carries an inline copy so nothing is covered. */}
        <TemplateSwitcher className="hidden sm:block" />
      </div>
      <div className="t1-grain" aria-hidden="true" />
    </PortfolioProvider>
  );
};

export default App;
