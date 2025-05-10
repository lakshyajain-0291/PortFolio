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
import { PortfolioProvider } from './hooks/PortfolioContext';
import { Toaster } from '@/components/ui/toaster';

const App = () => {
  return (
    <PortfolioProvider>
      <div className="min-h-screen bg-darktech-background text-darktech-text">
        <ParticleBackground />
        <Header />
        <Hero />
        <Projects />
        <GitHubStats />
        <TechStack />
        <Experience />
        <Education />
        <Contact />
        <Footer />
        <Toaster />
      </div>
    </PortfolioProvider>
  );
};

export default App;
