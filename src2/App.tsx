import React, { useLayoutEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import { ThemeProvider } from './components/theme-provider';
import { PortfolioProvider } from '../src/hooks/PortfolioContext';
import { Toaster } from '../src/components/ui/toaster';
import './template2.css';
import TemplateSwitcher from '../src/components/TemplateSwitcher';
import { T2_SECTIONS } from './sections';

// Import all components from template 2
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Footer from './components/Footer';
import Projects from './components/Projects';
import TechStack from './components/TechStack';
import Experience from './components/Experience';
import Education from './components/Education';
import Contact from './components/Contact';
import GitHubStats from './components/GitHubStats';

const SECTION_COMPONENTS: Record<string, React.ComponentType> = {
  experience: Experience,
  projects: Projects,
  'github-stats': GitHubStats,
  'tech-stack': TechStack,
  education: Education,
  contact: Contact,
};

const App = () => {
  useLayoutEffect(() => {
    document.documentElement.classList.add('t2');
    return () => document.documentElement.classList.remove('t2');
  }, []);

  return (
    <ThemeProvider defaultTheme="system">
      <PortfolioProvider>
        <MotionConfig reducedMotion="user">
          <a
            href="#content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
          >
            Skip to content
          </a>
          <Header />
          <div className="relative z-[1] mx-auto min-h-screen max-w-screen-xl px-6 pb-12 pt-20 font-inter md:px-12 md:py-20 lg:px-24 lg:py-0">
            <div className="lg:flex lg:justify-between lg:gap-12">
              {/* Sticky identity column */}
              <Hero />

              {/* Reading column — sections in the order set by SECTION_NUMBERS */}
              <main id="content" className="pt-20 lg:w-[54%] lg:py-24">
                <About />
                {T2_SECTIONS.map(({ id }) => {
                  const Component = SECTION_COMPONENTS[id];
                  return <Component key={id} />;
                })}
                <Footer />
              </main>
            </div>
          </div>
          <Toaster />
          <TemplateSwitcher />
        </MotionConfig>
      </PortfolioProvider>
    </ThemeProvider>
  );
};

export default App;
