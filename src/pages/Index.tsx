import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Projects from '@/components/Projects';
import TechStack from '@/components/TechStack';
import Experience from '@/components/Experience';
import Education from '@/components/Education';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <ParticleBackground />
      <Header />
      
      <main className="flex-grow">
        <Hero />
        <Projects />
        <TechStack />
        <Experience />
        <Education />
        <Contact />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
