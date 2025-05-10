import React, { useEffect } from 'react';
import { ArrowRight, FileText } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { motion, useAnimation } from 'framer-motion';
import { usePortfolio } from '@/hooks/PortfolioContext';
import { DEFAULT_USER, SECTION_NUMBERS } from '@/config/env';

const Hero = () => {
  const { portfolio, isLoading } = usePortfolio();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  const controls = useAnimation();

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const name = portfolio?.personalInfo?.name || DEFAULT_USER.NAME;
  const title = portfolio?.personalInfo?.title || DEFAULT_USER.TITLE;
  const bio = portfolio?.personalInfo?.summary || DEFAULT_USER.BIO;
  const resumeUrl = portfolio?.resumeUrl || '/resume/resume.pdf';
  
  return (
    <section id="home" className="py-20 relative flex items-center justify-center pt-16" data-section-number={SECTION_NUMBERS.HERO !== 0 ? SECTION_NUMBERS.HERO : 0}>
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className={`w-4/5 ${SECTION_NUMBERS.HERO === 0 ? 'mx-auto' : SECTION_NUMBERS.HERO % 2 === 0 ? 'ml-auto mr-0' : 'mr-auto ml-0'}`}>
          <motion.div 
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={controls}
            className={`flex flex-col ${SECTION_NUMBERS.HERO === 0 ? 'items-center text-center' : SECTION_NUMBERS.HERO % 2 === 0 ? 'items-end text-right' : 'items-start text-left'} max-w-3xl ${SECTION_NUMBERS.HERO === 0 ? 'mx-auto' : SECTION_NUMBERS.HERO % 2 === 0 ? 'ml-auto' : 'mr-auto'}`}
          >
            <motion.div variants={itemVariants} className="mb-6">
              <div className="inline-block rounded-full bg-darktech-neon-green/10 px-4 py-1.5 text-sm font-medium text-darktech-neon-green mb-4">
                {title}
              </div>
            </motion.div>
          
            <motion.h1 
              variants={itemVariants}
              className={`text-4xl sm:text-5xl md:text-7xl font-extrabold mb-4 leading-tight ${SECTION_NUMBERS.HERO === 0 ? 'text-center' : SECTION_NUMBERS.HERO % 2 === 0 ? 'text-right' : 'text-left'}`}
            >
              <span className="text-sm md:text-2xl text-darktech-muted block mb-2">Heya 👋, I'm</span>
              <span className="text-gradient">{name}</span>
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold block mt-4 text-darktech-muted/90">
                Building the Future with Dev and AI
              </span>
            </motion.h1>
          
            <motion.div 
              variants={itemVariants}
              className={`bg-darktech-lighter/20 border border-darktech-border/40 rounded-lg p-6 mb-8 max-w-2xl ${SECTION_NUMBERS.HERO === 0 ? 'mx-auto' : SECTION_NUMBERS.HERO % 2 === 0 ? 'ml-auto' : 'mr-auto'}`}
            >
              <h2 className={`text-xl font-semibold text-darktech-holo-cyan mb-3 flex items-center ${SECTION_NUMBERS.HERO === 0 ? 'justify-center' : SECTION_NUMBERS.HERO % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                <span className="bg-darktech-holo-cyan/20 rounded-full p-1 mr-2">
                  <span className="block w-2 h-2 bg-darktech-holo-cyan rounded-full"></span>
                </span>
                About Me
              </h2>
              <p className={`text-lg text-darktech-muted/90 leading-relaxed ${SECTION_NUMBERS.HERO === 0 ? 'text-center' : SECTION_NUMBERS.HERO % 2 === 0 ? 'text-right' : 'text-left'}`}>
                {bio}
              </p>
            </motion.div>
                      
            <motion.div 
              variants={itemVariants}
              className={`flex flex-wrap gap-4 ${SECTION_NUMBERS.HERO === 0 ? 'justify-center' : SECTION_NUMBERS.HERO % 2 === 0 ? 'justify-end' : 'justify-start'}`}
            >
              <a 
                href="#projects" 
                className="group relative px-8 py-4 overflow-hidden rounded-lg bg-darktech-lighter border border-darktech-border hover:border-darktech-neon-green/50 transition-colors duration-300"
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  <span className="font-medium">View Projects</span>
                  <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                </div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-darktech-neon-green blur-sm"></div>
              </a>
              
              <a 
                href="#contact" 
                className="group relative px-8 py-4 overflow-hidden rounded-lg bg-gradient-to-r from-darktech-neon-green via-darktech-holo-cyan to-darktech-cyber-pink text-darktech-background font-medium"
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <span className="relative z-10">Contact Me</span>
              </a>
              
              <a 
                href={resumeUrl}
                download
                className="group relative px-8 py-4 overflow-hidden rounded-lg bg-darktech-lighter border border-darktech-border hover:border-darktech-holo-cyan/50 transition-colors duration-300"
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  <FileText size={18} className="text-darktech-holo-cyan" />
                  <span className="font-medium">Resume</span>
                </div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-darktech-holo-cyan blur-sm"></div>
              </a>
            </motion.div>
            
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 animate-bounce mb-6 ">
              <div className="w-6 h-9 rounded-full border-2 border-darktech-muted flex justify-center">
                <div className="w-1 h-2 bg-darktech-muted rounded-full mt-1 animate-pulse"></div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Decorative Circles */}
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-darktech-cyber-pink/5 blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 rounded-full bg-darktech-neon-green/5 blur-3xl"></div>
      </div>
    </section>
  );
};

export default Hero;
